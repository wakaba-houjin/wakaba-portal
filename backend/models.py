from datetime import date, datetime

from sqlalchemy import (
    Boolean,
    CheckConstraint,
    Date,
    DateTime,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database import Base


class Staff(Base):
    __tablename__ = "staff"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    staff_number: Mapped[str] = mapped_column(
        String(20),
        unique=True,
        index=True,
    )
    name: Mapped[str] = mapped_column(String(100))
    kana: Mapped[str] = mapped_column(String(100))
    birth_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    facility: Mapped[str] = mapped_column(String(100), index=True)
    job_type: Mapped[str] = mapped_column(String(100), index=True)
    employment_type: Mapped[str] = mapped_column(String(100), index=True)
    position: Mapped[str | None] = mapped_column(String(100), nullable=True)
    corporation_hire_date: Mapped[date | None] = mapped_column(
        Date,
        nullable=True,
    )
    hire_date: Mapped[date] = mapped_column(Date)
    retirement_date: Mapped[date | None] = mapped_column(
        Date,
        nullable=True,
    )
    weekly_hours: Mapped[float] = mapped_column(
        Numeric(5, 2),
        default=40,
    )
    daily_hours: Mapped[float | None] = mapped_column(
        Numeric(4, 2),
        nullable=True,
    )
    weekly_days: Mapped[float | None] = mapped_column(
        Numeric(3, 1),
        nullable=True,
    )
    salary_type: Mapped[str | None] = mapped_column(
        String(30),
        nullable=True,
    )
    status: Mapped[str] = mapped_column(
        String(30),
        default="在職",
        index=True,
    )
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )

    tasks: Mapped[list["Task"]] = relationship(
        back_populates="staff",
        cascade="all, delete-orphan",
    )
    admin_notes: Mapped[list["AdminNote"]] = relationship(
        back_populates="staff",
        cascade="all, delete-orphan",
    )


class Task(Base):
    __tablename__ = "tasks"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    staff_id: Mapped[int | None] = mapped_column(
        ForeignKey("staff.id"),
        nullable=True,
        index=True,
    )
    category: Mapped[str] = mapped_column(
        String(50),
        default="その他",
    )
    title: Mapped[str] = mapped_column(String(200))
    due_date: Mapped[date] = mapped_column(Date, index=True)
    priority: Mapped[str] = mapped_column(
        String(20),
        default="通常",
    )
    status: Mapped[str] = mapped_column(
        String(20),
        default="未完了",
        index=True,
    )
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    completed_at: Mapped[datetime | None] = mapped_column(
        DateTime,
        nullable=True,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
    )

    staff: Mapped[Staff | None] = relationship(
        back_populates="tasks",
    )


class AdminNote(Base):
    __tablename__ = "admin_notes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    staff_id: Mapped[int] = mapped_column(
        ForeignKey("staff.id"),
        index=True,
    )
    note_type: Mapped[str] = mapped_column(
        String(50),
        default="管理者メモ",
    )
    content: Mapped[str] = mapped_column(Text)
    visibility: Mapped[str] = mapped_column(
        String(30),
        default="法人本部",
    )
    is_archived: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )

    staff: Mapped[Staff] = relationship(
        back_populates="admin_notes",
    )


class ChildrenMonthly(Base):
    __tablename__ = "children_monthly"

    __table_args__ = (
        UniqueConstraint(
            "facility",
            "year",
            "month",
            "age",
            "certification",
            name="uq_children_monthly_entry",
        ),
        CheckConstraint(
            "month >= 1 AND month <= 12",
            name="ck_children_monthly_month",
        ),
        CheckConstraint(
            "children_count >= 0",
            name="ck_children_monthly_count",
        ),
    )

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )
    facility: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        index=True,
    )
    year: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        index=True,
    )
    month: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        index=True,
    )
    age: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
    )
    certification: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
    )
    children_count: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )
    