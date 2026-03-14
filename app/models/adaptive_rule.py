from sqlalchemy import Column, String, Integer, Float, Boolean, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
import uuid

from app.db.base import Base


class AdaptiveRule(Base):
    __tablename__ = "adaptive_rules"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    rule_name = Column(String(255), nullable=False)
    trigger_type = Column(String(50), nullable=False)  # hesitation/overload/inactivity
    threshold_value = Column(Float, nullable=False)
    threshold_unit = Column(String(50), nullable=True)  # e.g. "count", "minutes"
    action_type = Column(JSONB, default=dict, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    priority = Column(Integer, default=0, nullable=False)

    def evaluate_condition(self, value: float, unit: str = None) -> bool:
        if unit and unit != self.threshold_unit:
            return False
        if self.trigger_type == "hesitation":
            return value >= self.threshold_value
        if self.trigger_type == "overload":
            return value >= self.threshold_value
        if self.trigger_type == "inactivity":
            return value >= self.threshold_value
        return False

    def execute_action(self):
        return self.action_type  # Return action payload for the frontend/worker to apply
