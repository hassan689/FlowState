import pytest
from httpx import AsyncClient

from app.core.security import create_access_token
from app.models.user import User


@pytest.mark.asyncio
async def test_interactions_create_list_and_patterns(client: AsyncClient, test_user: User):
    token = create_access_token(test_user.id)

    import uuid

    session_id = str(uuid.uuid4())

    r1 = await client.post(
        "/api/interactions",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "session_id": session_id,
            "event_type": "click",
            "metadata": {"x": 1},
            "time_spent_ms": 120,
        },
    )
    assert r1.status_code == 201

    r2 = await client.get(
        "/api/interactions",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert r2.status_code == 200
    assert isinstance(r2.json(), list)

    r3 = await client.get(
        "/api/interactions/patterns",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert r3.status_code == 200
    patterns = r3.json()
    assert any(p["event_type"] == "click" and p["count"] >= 1 for p in patterns)

