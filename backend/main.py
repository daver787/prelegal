import json
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

from auth import create_token, get_current_user, hash_password, verify_password
from chat import chat as run_chat
from database import get_conn, init_db

STATIC_DIR = Path(__file__).parent / "static"


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(lifespan=lifespan)

# All API routes must be registered on `app` BEFORE the static mount below.


# --- Auth ---

class SignupRequest(BaseModel):
    email: str = Field(max_length=254)
    password: str = Field(min_length=8, max_length=128)


class LoginRequest(BaseModel):
    email: str
    password: str


@app.post("/api/auth/signup")
def signup(req: SignupRequest):
    conn = get_conn()
    try:
        existing = conn.execute("SELECT id FROM users WHERE email = ?", (req.email,)).fetchone()
        if existing:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")
        hashed = hash_password(req.password)
        cur = conn.execute(
            "INSERT INTO users (email, password_hash) VALUES (?, ?)", (req.email, hashed)
        )
        conn.commit()
        token = create_token(cur.lastrowid, req.email)
        return {"token": token, "email": req.email}
    finally:
        conn.close()


@app.post("/api/auth/login")
def login(req: LoginRequest):
    conn = get_conn()
    try:
        row = conn.execute("SELECT id, email, password_hash FROM users WHERE email = ?", (req.email,)).fetchone()
        if not row or not verify_password(req.password, row["password_hash"]):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")
        token = create_token(row["id"], row["email"])
        return {"token": token, "email": row["email"]}
    finally:
        conn.close()


# --- Documents ---

class DocumentCreate(BaseModel):
    doc_type: str
    title: str
    data_json: str


class DocumentUpdate(BaseModel):
    title: str
    data_json: str


@app.get("/api/documents")
def list_documents(user: dict = Depends(get_current_user)):
    conn = get_conn()
    try:
        rows = conn.execute(
            "SELECT id, doc_type, title, updated_at FROM documents WHERE user_id = ? ORDER BY updated_at DESC",
            (user["id"],),
        ).fetchall()
        return [dict(r) for r in rows]
    finally:
        conn.close()


@app.post("/api/documents", status_code=201)
def create_document(req: DocumentCreate, user: dict = Depends(get_current_user)):
    conn = get_conn()
    try:
        cur = conn.execute(
            "INSERT INTO documents (user_id, doc_type, title, data_json) VALUES (?, ?, ?, ?)",
            (user["id"], req.doc_type, req.title, req.data_json),
        )
        conn.commit()
        return {"id": cur.lastrowid}
    finally:
        conn.close()


@app.put("/api/documents/{doc_id}")
def update_document(doc_id: int, req: DocumentUpdate, user: dict = Depends(get_current_user)):
    conn = get_conn()
    try:
        row = conn.execute("SELECT id FROM documents WHERE id = ? AND user_id = ?", (doc_id, user["id"])).fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Document not found")
        conn.execute(
            "UPDATE documents SET title = ?, data_json = ?, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ', 'now') WHERE id = ?",
            (req.title, req.data_json, doc_id),
        )
        conn.commit()
        return {"id": doc_id}
    finally:
        conn.close()


@app.get("/api/documents/{doc_id}")
def get_document(doc_id: int, user: dict = Depends(get_current_user)):
    conn = get_conn()
    try:
        row = conn.execute(
            "SELECT id, doc_type, title, data_json, updated_at FROM documents WHERE id = ? AND user_id = ?",
            (doc_id, user["id"]),
        ).fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Document not found")
        return dict(row)
    finally:
        conn.close()


# --- Chat ---

class Message(BaseModel):
    role: str
    content: str = Field(max_length=4000)


class ChatRequest(BaseModel):
    messages: list[Message] = Field(max_length=50)
    currentData: dict


@app.post("/api/chat")
async def api_chat(request: ChatRequest, user: dict = Depends(get_current_user)):
    try:
        ai = run_chat(
            messages=[m.model_dump() for m in request.messages],
            current_data=request.currentData,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    updates = ai.fields.model_dump(exclude_none=True)
    updated_data = dict(request.currentData)
    for field, value in updates.items():
        if field in ("party1", "party2", "provider", "customer", "partner", "company") and isinstance(value, dict):
            updated_data[field] = {**updated_data.get(field, {}), **value}
        else:
            updated_data[field] = value

    return {"message": ai.message, "updatedData": updated_data}


if STATIC_DIR.exists():
    app.mount("/", StaticFiles(directory=STATIC_DIR, html=True), name="static")
