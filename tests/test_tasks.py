import pytest
from httpx import AsyncClient
from app.core.security import create_access_token
from app.models.user import User


@pytest.mark.asyncio
async def test_create_task(client: AsyncClient, test_user: User):
    token = create_access_token(test_user.id)
    r = await client.post(
        "/api/tasks",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "title": "Math assignment",
            "description": "Complete chapter 5",
            "category": "Assignment",
            "estimated_effort": 2,
            "tags": ["math"],
        },
    )
    assert r.status_code == 201
    data = r.json()
    assert data["title"] == "Math assignment"
    assert data["category"] == "Assignment"
    assert data["status"] == "To Do"


@pytest.mark.asyncio
async def test_list_tasks(client: AsyncClient, test_user: User):
    token = create_access_token(test_user.id)
    r = await client.get(
        "/api/tasks",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert r.status_code == 200
    assert isinstance(r.json(), list)
