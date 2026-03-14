import pytest
from httpx import AsyncClient
from app.core.security import create_access_token
from app.models.user import User
from uuid import uuid4


@pytest.mark.asyncio
async def test_register(client: AsyncClient):
    r = await client.post(
        "/api/auth/register",
        json={"email": "new@example.com", "name": "New User", "password": "securepass123"},
    )
    assert r.status_code == 200
    data = r.json()
    assert data["email"] == "new@example.com"
    assert data["name"] == "New User"
    assert "id" in data
    assert "password" not in data


@pytest.mark.asyncio
async def test_register_duplicate_email(client: AsyncClient, test_user: User):
    r = await client.post(
        "/api/auth/register",
        json={"email": test_user.email, "name": "Other", "password": "pass"},
    )
    assert r.status_code == 400


@pytest.mark.asyncio
async def test_login(client: AsyncClient, test_user: User):
    r = await client.post(
        "/api/auth/login",
        json={"email": test_user.email, "password": "password123"},
    )
    assert r.status_code == 200
    data = r.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["token_type"] == "bearer"


@pytest.mark.asyncio
async def test_login_wrong_password(client: AsyncClient, test_user: User):
    r = await client.post(
        "/api/auth/login",
        json={"email": test_user.email, "password": "wrong"},
    )
    assert r.status_code == 401


@pytest.mark.asyncio
async def test_me(client: AsyncClient, test_user: User):
    token = create_access_token(test_user.id)
    r = await client.get(
        "/api/auth/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert r.status_code == 200
    assert r.json()["email"] == test_user.email
