import uuid
from sqlalchemy import Column, DateTime, func
from sqlalchemy.dialects.postgresql import UUID, JSONB, ARRAY, INTEGER
from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    pass


def uuid4_hex():
    return uuid.uuid4().hex


# PostgreSQL gen_random_uuid() can be used in raw SQL; for SQLAlchemy we use default=uuid.uuid4
def uuid_default():
    return uuid.uuid4()
