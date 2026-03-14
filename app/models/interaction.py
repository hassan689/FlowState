import uuid
from sqlalchemy import Column, String, DateTime, Integer, ForeignKey, func
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship

from app.db.base import Base


class InteractionLog(Base):
    __tablename__ = "interaction_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    session_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    event_type = Column(String(50), nullable=False)  # page_view/click/scroll/hesitation/overload/idle
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    metadata_ = Column("metadata", JSONB, default=dict, nullable=False)
    page_url = Column(String(2048), nullable=True)
    element_id = Column(String(255), nullable=True)
    time_spent_ms = Column(Integer, nullable=True)

    user = relationship("User", back_populates="interaction_logs")

    def anonymize(self):
        self.user_id = None
        self.metadata_ = {}
        self.page_url = None
        self.element_id = None

    @classmethod
    def get_user_patterns(cls, session, user_id, limit=1000):
        from sqlalchemy import select, func
        stmt = (
            select(cls.event_type, func.count(cls.id).label("cnt"))
            .where(cls.user_id == user_id)
            .group_by(cls.event_type)
        )
        return session.execute(stmt).all()
