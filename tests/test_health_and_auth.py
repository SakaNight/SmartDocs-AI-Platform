import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_healthz():
    response = client.get("/healthz")
    assert response.status_code == 200
    assert response.json().get("status") in ["ok", "healthy"]

def test_login_returns_jwt():
    payload = {"username": "adminuser", "password": "yourpassword"}
    response = client.post("/login", data=payload)
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
