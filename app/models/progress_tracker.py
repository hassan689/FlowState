import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, Integer, Float, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship

from app.db.base import Base


class ProgressTracker(Base):
    __tablename__ = "progress_trackers"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    completion_rate = Column(Float, default=0.0, nullable=False)
    streak_days = Column(Integer, default=0, nullable=False)
    longest_streak = Column(Integer, default=0, nullable=False)
    total_focus_hours = Column(Float, default=0.0, nullable=False)
    tasks_completed = Column(Integer, default=0, nullable=False)
    last_calculated = Column(DateTime(timezone=True), nullable=True)

    user = relationship("User", back_populates="progress_tracker")

    def update_streak(self, session, completed_today: bool):
        from datetime import datetime, timezone, timedelta
        today = datetime.now(timezone.utc).date()
        if completed_today:
            if not self.last_calculated:
                self.streak_days = 1
            else:
                last = self.last_calculated.date() if self.last_calculated else today
                if (today - last).days == 1:
                    self.streak_days += 1
                elif (today - last).days > 1:
                    self.streak_days = 1
            self.longest_streak = max(self.longest_streak, self.streak_days)
        self.last_calculated = datetime.now(timezone.utc)

    def calculate_completion_rate(self, session, total_tasks: int, done_tasks: int):
        self.tasks_completed = done_tasks
        self.completion_rate = (done_tasks / total_tasks) if total_tasks else 0.0
        self.last_calculated = datetime.now(timezone.utc)

    def get_category_breakdown(self, session):
        from app.models.task import Task
        from sqlalchemy import select, func
        stmt = (
            select(Task.category, func.count(Task.id).label("count"))
            .where(Task.user_id == self.user_id, Task.status == "Done")
            .group_by(Task.category)
        )
        return session.execute(stmt).all()
