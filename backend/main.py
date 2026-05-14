from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

from chat import chat as run_chat
from database import init_db

STATIC_DIR = Path(__file__).parent / "static"


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(lifespan=lifespan)

# All API routes must be registered on `app` BEFORE the static mount below.
# StaticFiles at "/" catches every request that doesn't match a prior route.


class Message(BaseModel):
    role: str
    content: str = Field(max_length=4000)


class ChatRequest(BaseModel):
    messages: list[Message] = Field(max_length=50)
    currentData: dict


@app.post("/api/chat")
async def api_chat(request: ChatRequest):
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
