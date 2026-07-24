from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator


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
    daily_hours: float | None = Field(
        default=None,
        gt=0,
        le=24,
    )
    weekly_days: float | None = Field(
        default=None,
        gt=0,
        le=7,
    )
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


CHILD_AGES = [
    "0歳",
    "1歳",
    "2歳",
    "満3歳",
    "3歳",
    "4歳",
    "5歳",
]

CERTIFICATIONS = [
    "1号",
    "2号",
    "3号",
]


class ChildrenMonthlyBase(BaseModel):
    facility: str = Field(min_length=1, max_length=100)
    year: int = Field(ge=2020, le=2100)
    month: int = Field(ge=1, le=12)
    age: str
    certification: str
    children_count: int = Field(ge=0, le=999)

    @field_validator("age")
    @classmethod
    def validate_age(cls, value: str) -> str:
        if value not in CHILD_AGES:
            raise ValueError("年齢区分が正しくありません。")
        return value

    @field_validator("certification")
    @classmethod
    def validate_certification(cls, value: str) -> str:
        if value not in CERTIFICATIONS:
            raise ValueError("認定区分が正しくありません。")
        return value


class ChildrenMonthlyCreate(ChildrenMonthlyBase):
    pass


class ChildrenMonthlyUpdate(BaseModel):
    children_count: int = Field(ge=0, le=999)


class ChildrenMonthlyResponse(ChildrenMonthlyBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
    updated_at: datetime


class ChildrenMonthlyBulkSave(BaseModel):
    facility: str = Field(min_length=1, max_length=100)
    year: int = Field(ge=2020, le=2100)
    month: int = Field(ge=1, le=12)
    entries: list[ChildrenMonthlyCreate]


class ChildrenMonthlySummary(BaseModel):
    facility: str
    year: int
    month: int
    total: int
    certification_totals: dict[str, int]
    age_totals: dict[str, int]
    entries: list[ChildrenMonthlyResponse]