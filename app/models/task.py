import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, Text, Integer, Float, ForeignKey, Enum, func
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from sqlalchemy.orm import relationship
import enum

from app.db.base import Base


class TaskCategory(str, enum.Enum):
    ASSIGNMENT = "Assignment"
    EXAM = "Exam"
    PROJECT = "Project"
    READING = "Reading"
    OTHER = "Other"


class TaskStatus(str, enum.Enum):
    TO_DO = "To Do"
    IN_PROGRESS = "In Progress"
    DONE = "Done"


class Task(Base):
    __tablename__ = "tasks"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(500), nullable=False)
    description = Column(Text, nullable=True)
    deadline = Column(DateTime(timezone=True), nullable=True)
    category = Column(String(50), nullable=False)  # Assignment/Exam/Project/Reading/Other
    priority = Column(String(20), default="medium", nullable=False)  # low / medium / high
    priority_score = Column(Float, default=0.0, nullable=False)
    time_estimate_minutes = Column(Integer, default=30, nullable=False)
    status = Column(String(20), default=TaskStatus.TO_DO.value, nullable=False)
    estimated_effort = Column(Integer, default=0, nullable=False)  # hours
    actual_time_spent = Column(Integer, default=0, nullable=False)  # minutes
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    order_index = Column(Integer, default=0, nullable=False)
    tags = Column(ARRAY(String), default=list, nullable=False)

    user = relationship("User", back_populates="tasks")
    focus_sessions = relationship("FocusSession", back_populates="task", lazy="selectin")

    def compute_priority_score(self):
        from datetime import datetime, timezone

        if not self.deadline:
            base = 0.5
        else:
            now = datetime.now(timezone.utc)
            delta = (self.deadline - now).total_seconds() / 3600  # hours
            if delta <= 0:
                base = 1.0
            elif delta < 24:
                base = 0.9
            elif delta < 72:
                base = 0.7
            else:
                base = max(0.3, 0.7 - (delta / 168) * 0.3)  # decay over weeks
        label = (self.priority or "medium").lower()
        adj = {"low": -0.08, "medium": 0.0, "high": 0.12}
        self.priority_score = min(1.0, max(0.05, base + adj.get(label, 0.0)))

    def time_until_deadline(self):
        if not self.deadline:
            return None
        from datetime import datetime, timezone
        return self.deadline - datetime.now(timezone.utc)

    def is_overdue(self):
        if not self.deadline or self.status == TaskStatus.DONE.value:
            return False
        from datetime import datetime, timezone
        return self.deadline < datetime.now(timezone.utc)

    def update_status(self, new_status: str):
        self.status = new_status
