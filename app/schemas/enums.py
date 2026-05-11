from __future__ import annotations

from enum import Enum


class TaskCategory(str, Enum):
    ASSIGNMENT = "Assignment"
    EXAM = "Exam"
    PROJECT = "Project"
    READING = "Reading"


class TaskStatus(str, Enum):
    TO_DO = "To Do"
    IN_PROGRESS = "In Progress"
    DONE = "Done"


class InteractionEventType(str, Enum):
    PAGE_VIEW = "page_view"
    CLICK = "click"
    SCROLL = "scroll"
    HESITATION = "hesitation"
    OVERLOAD = "overload"
    IDLE = "idle"


class AdaptiveTriggerType(str, Enum):
    HESITATION = "hesitation"
    OVERLOAD = "overload"
    INACTIVITY = "inactivity"

