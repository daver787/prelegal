import json
import tempfile
import os
from pathlib import Path
from unittest.mock import patch

import pytest


@pytest.fixture
def client(tmp_path):
    db_file = str(tmp_path / "test.db")
    with patch.dict(os.environ, {"DB_PATH": db_file}):
        import importlib
        import database
        import auth
        import main

        # Re-evaluate DB_PATH in the database module for this test
        importlib.reload(database)
        importlib.reload(auth)
        importlib.reload(main)

        database.init_db()

        from fastapi.testclient import TestClient
        yield TestClient(main.app)


def signup(client, email="test@example.com", password="password123"):
    return client.post("/api/auth/signup", json={"email": email, "password": password})


def auth_header(token):
    return {"Authorization": f"Bearer {token}"}


def test_signup_success(client):
    res = signup(client)
    assert res.status_code == 200
    data = res.json()
    assert "token" in data
    assert data["email"] == "test@example.com"


def test_signup_duplicate_email(client):
    signup(client)
    res = signup(client)
    assert res.status_code == 409


def test_signup_short_password(client):
    res = client.post("/api/auth/signup", json={"email": "a@b.com", "password": "short"})
    assert res.status_code == 422


def test_login_success(client):
    signup(client)
    res = client.post("/api/auth/login", json={"email": "test@example.com", "password": "password123"})
    assert res.status_code == 200
    assert "token" in res.json()


def test_login_wrong_password(client):
    signup(client)
    res = client.post("/api/auth/login", json={"email": "test@example.com", "password": "wrongpass"})
    assert res.status_code == 401


def test_login_unknown_email(client):
    res = client.post("/api/auth/login", json={"email": "nobody@x.com", "password": "password123"})
    assert res.status_code == 401


def test_chat_requires_auth(client):
    res = client.post("/api/chat", json={"messages": [], "currentData": {}})
    assert res.status_code in (401, 403)


def test_documents_requires_auth(client):
    assert client.get("/api/documents").status_code in (401, 403)
    assert client.post("/api/documents", json={}).status_code in (401, 403)


def test_documents_crud(client):
    token = signup(client).json()["token"]
    headers = auth_header(token)

    # initially empty
    res = client.get("/api/documents", headers=headers)
    assert res.status_code == 200
    assert res.json() == []

    # create
    doc_data = {"doc_type": "mutual_nda", "title": "Mutual NDA", "data_json": json.dumps({"documentType": "mutual_nda"})}
    res = client.post("/api/documents", json=doc_data, headers=headers)
    assert res.status_code == 201
    doc_id = res.json()["id"]

    # list
    docs = client.get("/api/documents", headers=headers).json()
    assert len(docs) == 1
    assert docs[0]["id"] == doc_id
    assert docs[0]["doc_type"] == "mutual_nda"

    # get
    doc = client.get(f"/api/documents/{doc_id}", headers=headers).json()
    assert doc["title"] == "Mutual NDA"
    assert "mutual_nda" in doc["data_json"]

    # update
    res = client.put(
        f"/api/documents/{doc_id}",
        json={"title": "Updated NDA", "data_json": json.dumps({"documentType": "mutual_nda", "purpose": "testing"})},
        headers=headers,
    )
    assert res.status_code == 200
    updated = client.get(f"/api/documents/{doc_id}", headers=headers).json()
    assert updated["title"] == "Updated NDA"


def test_document_isolation(client):
    """Users cannot access each other's documents."""
    t1 = signup(client, "user1@x.com").json()["token"]
    t2 = signup(client, "user2@x.com").json()["token"]

    doc_id = client.post(
        "/api/documents",
        json={"doc_type": "csa", "title": "CSA", "data_json": "{}"},
        headers=auth_header(t1),
    ).json()["id"]

    res = client.get(f"/api/documents/{doc_id}", headers=auth_header(t2))
    assert res.status_code == 404
