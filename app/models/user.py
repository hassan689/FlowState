import uuid
from sqlalchemy import Column, String, DateTime, Text, select, func
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship

from app.db.base import Base


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    name = Column(String(255), nullable=False)
    password_hash = Column(String(255), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    last_active = Column(DateTime(timezone=True), nullable=True)
    study_preferences = Column(JSONB, default=dict, nullable=False)

    tasks = relationship("Task", back_populates="user", lazy="selectin")
    interaction_logs = relationship("InteractionLog", back_populates="user", lazy="selectin")
    focus_sessions = relationship("FocusSession", back_populates="user", lazy="selectin")
    progress_tracker = relationship("ProgressTracker", back_populates="user", uselist=False, lazy="selectin")

    async def get_active_tasks(self, session):
        from app.models.task import Task
        from sqlalchemy import select
        stmt = select(Task).where(
            Task.user_id == self.id,
            Task.status.in_(["To Do", "In Progress"])
        ).order_by(Task.order_index, Task.deadline)
        result = await session.execute(stmt)
        return list(result.scalars().all())

    async def get_focus_sessions(self, session, limit=50):
        from app.models.focus_session import FocusSession
        from sqlalchemy import select
        stmt = select(FocusSession).where(
            FocusSession.user_id == self.id
        ).order_by(FocusSession.start_time.desc()).limit(limit)
        result = await session.execute(stmt)
        return list(result.scalars().all())

    async def get_productivity_score(self, session):
        from app.models.progress_tracker import ProgressTracker
        from sqlalchemy import select
        stmt = select(ProgressTracker).where(ProgressTracker.user_id == self.id)
        result = await session.execute(stmt)
        pt = result.scalar_one_or_none()
        if not pt:
            return 0.0
        return pt.completion_rate or 0.0
