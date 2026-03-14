import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, Integer, Boolean, Text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.db.base import Base


class FocusSession(Base):
    __tablename__ = "focus_sessions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    task_id = Column(UUID(as_uuid=True), ForeignKey("tasks.id", ondelete="SET NULL"), nullable=True, index=True)
    start_time = Column(DateTime(timezone=True), nullable=False)
    end_time = Column(DateTime(timezone=True), nullable=True)
    duration_minutes = Column(Integer, default=0, nullable=False)
    completed = Column(Boolean, default=False, nullable=False)
    interruptions = Column(Integer, default=0, nullable=False)
    notes = Column(Text, nullable=True)

    user = relationship("User", back_populates="focus_sessions")
    task = relationship("Task", back_populates="focus_sessions")

    def calculate_focus_score(self):
        if self.duration_minutes <= 0:
            return 0.0
        base = min(1.0, self.duration_minutes / 60.0)
        penalty = self.interruptions * 0.05
        return max(0.0, base - penalty)

    def end_session(self, end_time=None):
        from datetime import datetime, timezone
        self.end_time = end_time or datetime.now(timezone.utc)
        if self.start_time and self.end_time:
            delta = self.end_time - self.start_time
            self.duration_minutes = int(delta.total_seconds() / 60)
        self.completed = True
