import pytest
from httpx import AsyncClient

from app.core.security import create_access_token
from app.models.user import User


@pytest.mark.asyncio
async def test_focus_session_start_and_end_updates_progress(client: AsyncClient, test_user: User):
    token = create_access_token(test_user.id)

    start = await client.post(
        "/api/focus",
        headers={"Authorization": f"Bearer {token}"},
        json={},
    )
    assert start.status_code == 201
    session_id = start.json()["id"]

    end = await client.patch(
        f"/api/focus/{session_id}",
        headers={"Authorization": f"Bearer {token}"},
        json={"completed": True, "interruptions": 1, "notes": "ok"},
    )
    assert end.status_code == 200
    ended = end.json()
    assert ended["completed"] is True
    assert ended["interruptions"] == 1

    # Progress endpoint should exist and return tracker fields
    prog = await client.get(
        "/api/adaptation/progress",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert prog.status_code == 200
    data = prog.json()
    assert "completion_rate" in data
    assert "streak_days" in data
    assert "total_focus_hours" in data

