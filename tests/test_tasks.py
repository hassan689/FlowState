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


@pytest.mark.asyncio
async def test_mark_task_done_updates_progress(client: AsyncClient, test_user: User):
    token = create_access_token(test_user.id)
    created = await client.post(
        "/api/tasks",
        headers={"Authorization": f"Bearer {token}"},
        json={"title": "T1", "category": "Assignment"},
    )
    assert created.status_code == 201
    task_id = created.json()["id"]

    updated = await client.patch(
        f"/api/tasks/{task_id}",
        headers={"Authorization": f"Bearer {token}"},
        json={"status": "Done"},
    )
    assert updated.status_code == 200
    assert updated.json()["status"] == "Done"

    prog = await client.get(
        "/api/adaptation/progress",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert prog.status_code == 200
    assert prog.json()["tasks_completed"] >= 1
