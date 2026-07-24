from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field


class StaffCreate(BaseModel):
    name: str
    kana: str
    birth_date: date | None = None
    facility: str
    job_type: str
    employment_type: str
    position: str | None = None
    corporation_hire_date: date | None = None
    hire_date: date
    retirement_date: date | None = None
    weekly_hours: float = Field(gt=0, le=80)
    daily_hours: float | None = Field(default=None, gt=0, le=24)
    weekly_days: float | None = Field(default=None, gt=0, le=7)
    salary_type: str | None = None
    status: str = "在職"
    notes: str | None = None


class StaffResponse(StaffCreate):
    model_config = ConfigDict(from_attributes=True)
    id: int
    staff_number: str
    age: int | None = None
    years_of_service: float | None = None


class TaskCreate(BaseModel):
    staff_id: int | None = None
    category: str = "その他"
    title: str
    due_date: date
    priority: str = "通常"
    notes: str | None = None


class TaskResponse(TaskCreate):
    model_config = ConfigDict(from_attributes=True)
    id: int
    status: str
    completed_at: datetime | None = None
    staff_name: str | None = None


class AdminNoteCreate(BaseModel):
    note_type: str = "管理者メモ"
    content: str
    visibility: str = "法人本部"


class AdminNoteResponse(AdminNoteCreate):
    model_config = ConfigDict(from_attributes=True)
    id: int
    staff_id: int
    is_archived: bool
    created_at: datetime
    updated_at: datetime
from pydantic import BaseModel
from datetime import datetime


class ChildrenMonthlyBase(BaseModel):
    facility: str
    year: int
    month: int
    age: str
    certification: str
    children_count: int


class ChildrenMonthlyCreate(ChildrenMonthlyBase):
    pass


class ChildrenMonthlyUpdate(ChildrenMonthlyBase):
    pass


class ChildrenMonthlyResponse(ChildrenMonthlyBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True