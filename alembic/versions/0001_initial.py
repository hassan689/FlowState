from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = "0001_initial"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # UUID generation for server-side defaults in Postgres.
    # README suggests pgcrypto; this ensures gen_random_uuid() exists.
    op.execute('CREATE EXTENSION IF NOT EXISTS "pgcrypto";')

    op.create_table(
        "users",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("email", sa.String(length=255), nullable=False, unique=True),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("password_hash", sa.String(length=255), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("last_active", sa.DateTime(timezone=True), nullable=True),
        sa.Column("study_preferences", postgresql.JSONB, nullable=False, server_default=sa.text("'{}'::jsonb")),
    )
    op.create_index("ix_users_email", "users", ["email"], unique=True)

    op.create_table(
        "tasks",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column(
            "user_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("title", sa.String(length=500), nullable=False),
        sa.Column("description", sa.Text, nullable=True),
        sa.Column("deadline", sa.DateTime(timezone=True), nullable=True),
        sa.Column("category", sa.String(length=50), nullable=False),
        sa.Column("priority_score", sa.Float, nullable=False, server_default=sa.text("0.0")),
        sa.Column("status", sa.String(length=20), nullable=False, server_default=sa.text("'To Do'")),
        sa.Column("estimated_effort", sa.Integer, nullable=False, server_default=sa.text("0")),
        sa.Column("actual_time_spent", sa.Integer, nullable=False, server_default=sa.text("0")),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("order_index", sa.Integer, nullable=False, server_default=sa.text("0")),
        sa.Column("tags", postgresql.ARRAY(sa.String()), nullable=False, server_default=sa.text("ARRAY[]::varchar[]")),
    )
    op.create_index("ix_tasks_user_id", "tasks", ["user_id"], unique=False)

    op.create_table(
        "interaction_logs",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column(
            "user_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("session_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("event_type", sa.String(length=50), nullable=False),
        sa.Column("timestamp", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("metadata", postgresql.JSONB, nullable=False, server_default=sa.text("'{}'::jsonb")),
        sa.Column("page_url", sa.String(length=2048), nullable=True),
        sa.Column("element_id", sa.String(length=255), nullable=True),
        sa.Column("time_spent_ms", sa.Integer, nullable=True),
    )
    op.create_index("ix_interaction_logs_user_id", "interaction_logs", ["user_id"], unique=False)
    op.create_index("ix_interaction_logs_session_id", "interaction_logs", ["session_id"], unique=False)

    op.create_table(
        "focus_sessions",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column(
            "user_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "task_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("tasks.id", ondelete="SET NULL"),
            nullable=True,
        ),
        sa.Column("start_time", sa.DateTime(timezone=True), nullable=False),
        sa.Column("end_time", sa.DateTime(timezone=True), nullable=True),
        sa.Column("duration_minutes", sa.Integer, nullable=False, server_default=sa.text("0")),
        sa.Column("completed", sa.Boolean, nullable=False, server_default=sa.text("false")),
        sa.Column("interruptions", sa.Integer, nullable=False, server_default=sa.text("0")),
        sa.Column("notes", sa.Text, nullable=True),
    )
    op.create_index("ix_focus_sessions_user_id", "focus_sessions", ["user_id"], unique=False)
    op.create_index("ix_focus_sessions_task_id", "focus_sessions", ["task_id"], unique=False)

    op.create_table(
        "adaptive_rules",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("rule_name", sa.String(length=255), nullable=False),
        sa.Column("trigger_type", sa.String(length=50), nullable=False),
        sa.Column("threshold_value", sa.Float, nullable=False),
        sa.Column("threshold_unit", sa.String(length=50), nullable=True),
        sa.Column("action_type", postgresql.JSONB, nullable=False, server_default=sa.text("'{}'::jsonb")),
        sa.Column("is_active", sa.Boolean, nullable=False, server_default=sa.text("true")),
        sa.Column("priority", sa.Integer, nullable=False, server_default=sa.text("0")),
    )

    op.create_table(
        "progress_trackers",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column(
            "user_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
            unique=True,
        ),
        sa.Column("completion_rate", sa.Float, nullable=False, server_default=sa.text("0.0")),
        sa.Column("streak_days", sa.Integer, nullable=False, server_default=sa.text("0")),
        sa.Column("longest_streak", sa.Integer, nullable=False, server_default=sa.text("0")),
        sa.Column("total_focus_hours", sa.Float, nullable=False, server_default=sa.text("0.0")),
        sa.Column("tasks_completed", sa.Integer, nullable=False, server_default=sa.text("0")),
        sa.Column("last_calculated", sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index("ix_progress_trackers_user_id", "progress_trackers", ["user_id"], unique=True)


def downgrade() -> None:
    op.drop_index("ix_progress_trackers_user_id", table_name="progress_trackers")
    op.drop_table("progress_trackers")
    op.drop_table("adaptive_rules")
    op.drop_index("ix_focus_sessions_task_id", table_name="focus_sessions")
    op.drop_index("ix_focus_sessions_user_id", table_name="focus_sessions")
    op.drop_table("focus_sessions")
    op.drop_index("ix_interaction_logs_session_id", table_name="interaction_logs")
    op.drop_index("ix_interaction_logs_user_id", table_name="interaction_logs")
    op.drop_table("interaction_logs")
    op.drop_index("ix_tasks_user_id", table_name="tasks")
    op.drop_table("tasks")
    op.drop_index("ix_users_email", table_name="users")
    op.drop_table("users")

