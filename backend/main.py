from datetime import date, datetime, timedelta

from fastapi import Depends, FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import func, or_, select, text
from sqlalchemy.orm import Session
from models import AdminNote, ChildrenMonthly, Staff, Task
from schemas import (
    ChildrenMonthlyCreate,
    ChildrenMonthlyUpdate,
    ChildrenMonthlyResponse,
)


from database import Base, engine, get_db
from models import AdminNote, Staff, Task
from schemas import (
    AdminNoteCreate,
    AdminNoteResponse,
    ChildrenMonthlyBulkSave,
    ChildrenMonthlyCreate,
    ChildrenMonthlyResponse,
    ChildrenMonthlySummary,
    ChildrenMonthlyUpdate,
    StaffCreate,
    StaffResponse,
    TaskCreate,
    TaskResponse,
)

Base.metadata.create_all(bind=engine)

# 既存の開発用DBをそのまま使えるよう、追加項目だけ安全に補います。
# 本番公開前にはAlembicへ移行する想定です。
with engine.begin() as connection:
    for statement in [
        "ALTER TABLE staff ADD COLUMN IF NOT EXISTS birth_date DATE",
        "ALTER TABLE staff ADD COLUMN IF NOT EXISTS position VARCHAR(100)",
        "ALTER TABLE staff ADD COLUMN IF NOT EXISTS corporation_hire_date DATE",
        "ALTER TABLE staff ADD COLUMN IF NOT EXISTS daily_hours NUMERIC(4,2)",
        "ALTER TABLE staff ADD COLUMN IF NOT EXISTS weekly_days NUMERIC(3,1)",
        "ALTER TABLE staff ADD COLUMN IF NOT EXISTS salary_type VARCHAR(30)",
        "ALTER TABLE staff ADD COLUMN IF NOT EXISTS notes TEXT",
        "ALTER TABLE staff ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP",
        "ALTER TABLE staff ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP",
    ]:
        connection.execute(text(statement))

app = FastAPI(
    title="わかば学園ポータル API",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

FACILITIES = [
    "ひなの里幼稚園", "もりや幼保園", "みやぞの幼稚園",
    "もりり保育園", "名都借みらい保育園", "法人本部",
]
JOB_TYPES = [
    "園長", "副園長", "主任", "副主任", "保育教諭", "保育士", "幼稚園教諭",
    "看護師", "栄養士", "調理師", "調理補助", "事務", "バス運転手", "用務員",
    "保育補助", "子育て支援員", "預かり保育担当", "その他",
]
EMPLOYMENT_TYPES = ["正規職員", "パート", "契約職員", "嘱託職員", "派遣職員"]
STATUSES = ["在職", "試用期間", "産前産後休業", "育児休業", "退職"]


def calculate_age(birth_date: date | None) -> int | None:
    if not birth_date:
        return None
    today = date.today()
    return today.year - birth_date.year - ((today.month, today.day) < (birth_date.month, birth_date.day))


def calculate_service_years(start: date | None, end: date | None = None) -> float | None:
    if not start:
        return None
    finish = end or date.today()
    return round((finish - start).days / 365.2425, 1)


def to_staff_response(staff: Staff) -> StaffResponse:
    data = StaffResponse.model_validate(staff).model_dump()
    data["age"] = calculate_age(staff.birth_date)
    data["years_of_service"] = calculate_service_years(
        staff.corporation_hire_date or staff.hire_date,
        staff.retirement_date,
    )
    return StaffResponse(**data)


def next_staff_number(db: Session) -> str:
    numbers = db.scalars(select(Staff.staff_number).where(Staff.staff_number.like("WK%"))).all()
    max_number = 0
    for number in numbers:
        try:
            max_number = max(max_number, int(number[2:]))
        except (ValueError, TypeError):
            continue
    return f"WK{max_number + 1:05d}"


@app.get("/")
def root():
    return {"message": "わかば学園ポータル API"}


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/masters")
def get_masters():
    return {
        "facilities": FACILITIES,
        "job_types": JOB_TYPES,
        "employment_types": EMPLOYMENT_TYPES,
        "statuses": STATUSES,
    }


@app.get("/staff", response_model=list[StaffResponse])
def get_staff(
    keyword: str | None = None,
    facility: str | None = None,
    job_type: str | None = None,
    employment_type: str | None = None,
    status: str | None = None,
    sort_by: str = Query("staff_number", pattern="^(staff_number|name|hire_date|facility|birth_date)$"),
    order: str = Query("asc", pattern="^(asc|desc)$"),
    db: Session = Depends(get_db),
):
    statement = select(Staff)
    if keyword:
        term = f"%{keyword.strip()}%"
        statement = statement.where(or_(Staff.staff_number.ilike(term), Staff.name.ilike(term), Staff.kana.ilike(term)))
    if facility:
        statement = statement.where(Staff.facility == facility)
    if job_type:
        statement = statement.where(Staff.job_type == job_type)
    if employment_type:
        statement = statement.where(Staff.employment_type == employment_type)
    if status:
        statement = statement.where(Staff.status == status)
    sort_column = getattr(Staff, sort_by)
    statement = statement.order_by(sort_column.desc() if order == "desc" else sort_column.asc())
    return [to_staff_response(staff) for staff in db.scalars(statement).all()]


@app.get("/staff/{staff_id}", response_model=StaffResponse)
def get_staff_detail(staff_id: int, db: Session = Depends(get_db)):
    staff = db.get(Staff, staff_id)
    if not staff:
        raise HTTPException(404, "職員が見つかりません。")
    return to_staff_response(staff)


@app.post("/staff", response_model=StaffResponse, status_code=201)
def create_staff(staff_data: StaffCreate, db: Session = Depends(get_db)):
    staff = Staff(staff_number=next_staff_number(db), **staff_data.model_dump())
    db.add(staff)
    db.commit()
    db.refresh(staff)
    return to_staff_response(staff)


@app.get("/tasks", response_model=list[TaskResponse])
def get_tasks(status: str | None = None, db: Session = Depends(get_db)):
    statement = select(Task).order_by(Task.due_date, Task.id)
    if status:
        statement = statement.where(Task.status == status)
    tasks = db.scalars(statement).all()
    return [TaskResponse(**TaskResponse.model_validate(task).model_dump(), staff_name=task.staff.name if task.staff else None) for task in tasks]


@app.post("/tasks", response_model=TaskResponse, status_code=201)
def create_task(task_data: TaskCreate, db: Session = Depends(get_db)):
    if task_data.staff_id and not db.get(Staff, task_data.staff_id):
        raise HTTPException(404, "対象職員が見つかりません。")
    task = Task(**task_data.model_dump())
    db.add(task)
    db.commit()
    db.refresh(task)
    return TaskResponse(**TaskResponse.model_validate(task).model_dump(), staff_name=task.staff.name if task.staff else None)


@app.patch("/tasks/{task_id}/complete", response_model=TaskResponse)
def complete_task(task_id: int, db: Session = Depends(get_db)):
    task = db.get(Task, task_id)
    if not task:
        raise HTTPException(404, "タスクが見つかりません。")
    task.status = "完了"
    task.completed_at = datetime.utcnow()
    db.commit()
    db.refresh(task)
    return TaskResponse(**TaskResponse.model_validate(task).model_dump(), staff_name=task.staff.name if task.staff else None)


@app.get("/staff/{staff_id}/admin-notes", response_model=list[AdminNoteResponse])
def get_admin_notes(staff_id: int, db: Session = Depends(get_db)):
    if not db.get(Staff, staff_id):
        raise HTTPException(404, "職員が見つかりません。")
    statement = select(AdminNote).where(AdminNote.staff_id == staff_id, AdminNote.is_archived.is_(False)).order_by(AdminNote.created_at.desc())
    return db.scalars(statement).all()


@app.post("/staff/{staff_id}/admin-notes", response_model=AdminNoteResponse, status_code=201)
def create_admin_note(staff_id: int, note_data: AdminNoteCreate, db: Session = Depends(get_db)):
    if not db.get(Staff, staff_id):
        raise HTTPException(404, "職員が見つかりません。")
    note = AdminNote(staff_id=staff_id, **note_data.model_dump())
    db.add(note)
    db.commit()
    db.refresh(note)
    return note


@app.get("/dashboard")
def dashboard(db: Session = Depends(get_db)):
    today = date.today()
    active_statuses = ["在職", "試用期間", "産前産後休業", "育児休業"]
    staff = db.scalars(select(Staff)).all()
    active = [item for item in staff if item.status in active_statuses]
    facility_counts = {facility: sum(1 for item in active if item.facility == facility) for facility in FACILITIES}
    age_groups = {"20代以下": 0, "30代": 0, "40代": 0, "50代": 0, "60代以上": 0, "未登録": 0}
    for item in active:
        age = calculate_age(item.birth_date)
        if age is None: age_groups["未登録"] += 1
        elif age < 30: age_groups["20代以下"] += 1
        elif age < 40: age_groups["30代"] += 1
        elif age < 50: age_groups["40代"] += 1
        elif age < 60: age_groups["50代"] += 1
        else: age_groups["60代以上"] += 1
    birthdays = []
    retirement_alerts = []
    for item in active:
        if item.birth_date and item.birth_date.month == today.month:
            birthdays.append({"id": item.id, "name": item.name, "facility": item.facility, "date": item.birth_date.strftime("%m/%d")})
        age = calculate_age(item.birth_date)
        if age is not None and age >= 59:
            retirement_alerts.append({"id": item.id, "name": item.name, "facility": item.facility, "age": age})
    due_tasks = db.scalars(select(Task).where(Task.status == "未完了").order_by(Task.due_date)).all()
    task_items = [{"id": task.id, "title": task.title, "category": task.category, "due_date": task.due_date, "priority": task.priority, "staff_name": task.staff.name if task.staff else None, "overdue": task.due_date < today} for task in due_tasks]
    return {
        "active_staff_count": len(active),
        "facility_count": len(FACILITIES),
        "facility_counts": facility_counts,
        "age_groups": age_groups,
        "birthdays": sorted(birthdays, key=lambda item: item["date"]),
        "retirement_alerts": retirement_alerts,
        "tasks": task_items,
        "leave_count": sum(1 for item in active if item.status in ["産前産後休業", "育児休業"]),
        "retired_this_year": sum(1 for item in staff if item.retirement_date and item.retirement_date.year == today.year),
    }
@app.put("/staff/{staff_id}", response_model=StaffResponse)
def update_staff(
    staff_id: int,
    staff_data: StaffCreate,
    db: Session = Depends(get_db),
):
    staff = db.get(Staff, staff_id)

    if not staff:
        raise HTTPException(
            status_code=404,
            detail="職員が見つかりません。",
        )

    update_data = staff_data.model_dump()

    for key, value in update_data.items():
        setattr(staff, key, value)

    staff.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(staff)

    return to_staff_response(staff)

@app.patch("/staff/{staff_id}/retire", response_model=StaffResponse)
def retire_staff(
    staff_id: int,
    retirement_date: date = Query(...),
    db: Session = Depends(get_db),
):
    staff = db.get(Staff, staff_id)

    if not staff:
        raise HTTPException(
            status_code=404,
            detail="職員が見つかりません。",
        )

    staff.status = "退職"
    staff.retirement_date = retirement_date
    staff.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(staff)

    return to_staff_response(staff)
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


def validate_facility(facility: str) -> None:
    if facility not in FACILITIES:
        raise HTTPException(
            status_code=400,
            detail="指定された園は登録されていません。",
        )


def build_children_summary(
    facility: str,
    year: int,
    month: int,
    entries: list[ChildrenMonthly],
) -> ChildrenMonthlySummary:
    certification_totals = {
        certification: 0
        for certification in CERTIFICATIONS
    }
    age_totals = {
        age: 0
        for age in CHILD_AGES
    }

    for entry in entries:
        certification_totals[entry.certification] += (
            entry.children_count
        )
        age_totals[entry.age] += entry.children_count

    return ChildrenMonthlySummary(
        facility=facility,
        year=year,
        month=month,
        total=sum(
            entry.children_count
            for entry in entries
        ),
        certification_totals=certification_totals,
        age_totals=age_totals,
        entries=entries,
    )


@app.get(
    "/children",
    response_model=list[ChildrenMonthlyResponse],
)
def get_children(
    year: int = Query(..., ge=2020, le=2100),
    month: int = Query(..., ge=1, le=12),
    facility: str | None = None,
    db: Session = Depends(get_db),
):
    statement = (
        select(ChildrenMonthly)
        .where(
            ChildrenMonthly.year == year,
            ChildrenMonthly.month == month,
        )
        .order_by(
            ChildrenMonthly.facility,
            ChildrenMonthly.age,
            ChildrenMonthly.certification,
        )
    )

    if facility:
        validate_facility(facility)
        statement = statement.where(
            ChildrenMonthly.facility == facility
        )

    return db.scalars(statement).all()


@app.get(
    "/children/{facility}/{year}/{month}",
    response_model=ChildrenMonthlySummary,
)
def get_children_month(
    facility: str,
    year: int,
    month: int,
    db: Session = Depends(get_db),
):
    validate_facility(facility)

    if not 1 <= month <= 12:
        raise HTTPException(
            status_code=400,
            detail="月は1から12で指定してください。",
        )

    entries = db.scalars(
        select(ChildrenMonthly)
        .where(
            ChildrenMonthly.facility == facility,
            ChildrenMonthly.year == year,
            ChildrenMonthly.month == month,
        )
        .order_by(
            ChildrenMonthly.age,
            ChildrenMonthly.certification,
        )
    ).all()

    return build_children_summary(
        facility=facility,
        year=year,
        month=month,
        entries=entries,
    )


@app.post(
    "/children",
    response_model=ChildrenMonthlyResponse,
    status_code=201,
)
def create_children(
    children_data: ChildrenMonthlyCreate,
    db: Session = Depends(get_db),
):
    validate_facility(children_data.facility)

    existing = db.scalar(
        select(ChildrenMonthly).where(
            ChildrenMonthly.facility
            == children_data.facility,
            ChildrenMonthly.year
            == children_data.year,
            ChildrenMonthly.month
            == children_data.month,
            ChildrenMonthly.age
            == children_data.age,
            ChildrenMonthly.certification
            == children_data.certification,
        )
    )

    if existing:
        raise HTTPException(
            status_code=409,
            detail=(
                "同じ園・年月・年齢・認定区分の"
                "園児数がすでに登録されています。"
            ),
        )

    entry = ChildrenMonthly(
        **children_data.model_dump()
    )

    db.add(entry)
    db.commit()
    db.refresh(entry)

    return entry


@app.put(
    "/children/{children_id}",
    response_model=ChildrenMonthlyResponse,
)
def update_children(
    children_id: int,
    children_data: ChildrenMonthlyUpdate,
    db: Session = Depends(get_db),
):
    entry = db.get(
        ChildrenMonthly,
        children_id,
    )

    if not entry:
        raise HTTPException(
            status_code=404,
            detail="園児数データが見つかりません。",
        )

    entry.children_count = (
        children_data.children_count
    )
    entry.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(entry)

    return entry


@app.delete(
    "/children/{children_id}",
    status_code=204,
)
def delete_children(
    children_id: int,
    db: Session = Depends(get_db),
):
    entry = db.get(
        ChildrenMonthly,
        children_id,
    )

    if not entry:
        raise HTTPException(
            status_code=404,
            detail="園児数データが見つかりません。",
        )

    db.delete(entry)
    db.commit()

    return None


@app.put(
    "/children/bulk/save",
    response_model=ChildrenMonthlySummary,
)
def save_children_bulk(
    bulk_data: ChildrenMonthlyBulkSave,
    db: Session = Depends(get_db),
):
    validate_facility(bulk_data.facility)

    expected_keys = {
        (age, certification)
        for age in CHILD_AGES
        for certification in CERTIFICATIONS
    }

    received_keys = {
        (
            entry.age,
            entry.certification,
        )
        for entry in bulk_data.entries
    }

    if received_keys != expected_keys:
        raise HTTPException(
            status_code=400,
            detail=(
                "0歳から5歳までの年齢区分と、"
                "1号・2号・3号の全項目を送信してください。"
            ),
        )

    for entry_data in bulk_data.entries:
        if (
            entry_data.facility
            != bulk_data.facility
            or entry_data.year
            != bulk_data.year
            or entry_data.month
            != bulk_data.month
        ):
            raise HTTPException(
                status_code=400,
                detail=(
                    "一括保存データの園・年度・月が"
                    "一致していません。"
                ),
            )

        existing = db.scalar(
            select(ChildrenMonthly).where(
                ChildrenMonthly.facility
                == bulk_data.facility,
                ChildrenMonthly.year
                == bulk_data.year,
                ChildrenMonthly.month
                == bulk_data.month,
                ChildrenMonthly.age
                == entry_data.age,
                ChildrenMonthly.certification
                == entry_data.certification,
            )
        )

        if existing:
            existing.children_count = (
                entry_data.children_count
            )
            existing.updated_at = datetime.utcnow()
        else:
            db.add(
                ChildrenMonthly(
                    **entry_data.model_dump()
                )
            )

    db.commit()

    saved_entries = db.scalars(
        select(ChildrenMonthly)
        .where(
            ChildrenMonthly.facility
            == bulk_data.facility,
            ChildrenMonthly.year
            == bulk_data.year,
            ChildrenMonthly.month
            == bulk_data.month,
        )
        .order_by(
            ChildrenMonthly.age,
            ChildrenMonthly.certification,
        )
    ).all()

    return build_children_summary(
        facility=bulk_data.facility,
        year=bulk_data.year,
        month=bulk_data.month,
        entries=saved_entries,
    )