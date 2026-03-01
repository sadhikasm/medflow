from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from datetime import datetime

import models
import schemas
from database import engine, SessionLocal, Base
from auth import hash_password, verify_password, create_access_token, SECRET_KEY, ALGORITHM

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
    "https://magical-croissant-40cee7.netlify.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



Base.metadata.create_all(bind=engine)

security = HTTPBearer()

WORKFLOW = ["Reception", "Lab", "Billing"]


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    token = credentials.credentials

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("user_id")

        user = db.query(models.User).filter(models.User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=401, detail="User not found")

        return user

    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")


@app.get("/")
def home():
    return {"message": "Hospital Workflow API Running"}


@app.post("/register")
def register_user(user: schemas.UserCreate, db: Session = Depends(get_db)):

    existing_user = db.query(models.User).filter(models.User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_pwd = hash_password(user.password)

    approved_status = True if user.role == "Patient" else False

    new_user = models.User(
    name=user.name,
    email=user.email,
    password=hashed_pwd,
    role=user.role,
    department=user.department,
    is_approved=approved_status
)

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {"message": "User registered successfully"}


@app.post("/login")
def login_user(user: schemas.UserLogin, db: Session = Depends(get_db)):

    db_user = db.query(models.User).filter(models.User.email == user.email).first()

    if not db_user:
        raise HTTPException(status_code=400, detail="Invalid email")

    if not db_user.is_approved:
        raise HTTPException(status_code=403, detail="Your account is pending admin approval. Please wait to be approved.")

    if not verify_password(user.password, db_user.password):
        raise HTTPException(status_code=400, detail="Invalid password")

    access_token = create_access_token(
        data={"user_id": db_user.id, "role": db_user.role}
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": db_user.role,
        "department": db_user.department
    }


@app.get("/profile")
def get_profile(current_user: models.User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email,
        "role": current_user.role,
        "department": current_user.department
    }


# 🔥 Patient & Reception Creates Request
@app.post("/requests")
def create_request(
    request: schemas.RequestCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    if current_user.role == "Patient":
        patient_id = current_user.id
    elif current_user.role == "Staff" and current_user.department == "Reception":
        if not request.patient_id:
            raise HTTPException(status_code=400, detail="Must select a patient")
        patient_id = request.patient_id
    else:
        raise HTTPException(status_code=403, detail="Only patients and receptionists can create requests.")

    if current_user.role == "Staff":
        patient = db.query(models.User).filter(models.User.id == patient_id, models.User.role == "Patient").first()
        if not patient:
            raise HTTPException(status_code=404, detail="Patient not found")

    first_department = WORKFLOW[0]

    new_request = models.Request(
        patient_id=patient_id,
        type=request.type,
        description=request.description,
        priority=request.priority,
        current_department=first_department,
        status="Pending"
    )

    db.add(new_request)
    db.commit()
    db.refresh(new_request)

    history = models.RequestHistory(
        request_id=new_request.id,
        department=first_department,
        status="Pending",
        updated_by=current_user.id,
        timestamp=datetime.utcnow()
    )

    db.add(history)
    db.commit()

    return {
        "message": "Request created successfully",
        "request_id": new_request.id,
        "assigned_to": first_department
    }


# 🔥 Department views its requests
@app.get("/department/requests")
def view_department_requests(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    if current_user.role != "Staff":
        raise HTTPException(status_code=403, detail="Only staff can view department requests")

    requests = db.query(models.Request).filter(
        models.Request.current_department == current_user.department
    ).all()

    return requests


# 🔥 Forward request to next department with Extra Fields
@app.put("/requests/{request_id}/forward")
def forward_request(
    request_id: int,
    forward_data: schemas.RequestForward,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    if current_user.role != "Staff":
        raise HTTPException(status_code=403, detail="Only staff can forward requests")

    request = db.query(models.Request).filter(models.Request.id == request_id).first()

    if not request:
        raise HTTPException(status_code=404, detail="Request not found")

    if request.current_department != current_user.department:
        raise HTTPException(status_code=403, detail="Not your department's request")

    # Update Extra Fields if Present
    if forward_data.payment_details:
        request.payment_details = forward_data.payment_details
    if forward_data.lab_report:
        request.lab_report = forward_data.lab_report
    if forward_data.lab_result:
        request.lab_result = forward_data.lab_result
    if forward_data.payment_confirmed is not None:
        request.payment_confirmed = forward_data.payment_confirmed

    current_index = WORKFLOW.index(request.current_department)

    if current_index + 1 < len(WORKFLOW):
        next_department = WORKFLOW[current_index + 1]
        request.current_department = next_department
        request.status = "In Progress"
    else:
        request.status = "Completed"
        request.current_department = "Completed"

    db.commit()

    history = models.RequestHistory(
        request_id=request.id,
        department=request.current_department,
        status=request.status,
        updated_by=current_user.id,
        timestamp=datetime.utcnow()
    )

    db.add(history)
    db.commit()

    return {
        "message": "Request forwarded successfully",
        "current_department": request.current_department,
        "status": request.status
    }
@app.get("/requests/{request_id}/history", response_model=list[schemas.RequestHistoryResponse])
def get_request_history(
    request_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # Check if request exists
    request = db.query(models.Request).filter(models.Request.id == request_id).first()

    if not request:
        raise HTTPException(status_code=404, detail="Request not found")

    # Patient can only view their own requests
    if current_user.role == "Patient":
        if request.patient_id != current_user.id:
            raise HTTPException(status_code=403, detail="Not authorized")

    # Staff and Admin can view all for now
    history = (
        db.query(models.RequestHistory)
        .filter(models.RequestHistory.request_id == request_id)
        .order_by(models.RequestHistory.timestamp.asc())
        .all()
    )

    return history
@app.get("/my-requests", response_model=list[schemas.MyRequestResponse])
def get_my_requests(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "Patient":
        raise HTTPException(status_code=403, detail="Only patients can view their requests")

    requests = db.query(models.Request).filter(
        models.Request.patient_id == current_user.id
    ).all()

    return requests
@app.get("/dashboard/stats", response_model=schemas.DashboardStats)
def get_dashboard_stats(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role not in ["Staff", "Admin"]:
        raise HTTPException(status_code=403, detail="Only staff and admin can view dashboard")

    total_requests = db.query(models.Request).count()

    pending = db.query(models.Request).filter(
        models.Request.status == "Pending"
    ).count()

    in_progress = db.query(models.Request).filter(
        models.Request.status == "In Progress"
    ).count()

    completed = db.query(models.Request).filter(
        models.Request.status == "Completed"
    ).count()

    reception_queue = db.query(models.Request).filter(
        models.Request.current_department == "Reception"
    ).count()

    lab_queue = db.query(models.Request).filter(
        models.Request.current_department == "Lab"
    ).count()

    billing_queue = db.query(models.Request).filter(
        models.Request.current_department == "Billing"
    ).count()

    return {
        "total_requests": total_requests,
        "pending": pending,
        "in_progress": in_progress,
        "completed": completed,
        "reception_queue": reception_queue,
        "lab_queue": lab_queue,
        "billing_queue": billing_queue
    }


# 🔥 Admin views all requests
@app.get("/admin/requests")
def view_all_requests(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "Admin":
        raise HTTPException(status_code=403, detail="Only admin can view all requests")

    requests = db.query(models.Request).all()
    return requests

@app.get("/admin/users/pending")
def get_pending_users(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "Admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    users = db.query(models.User).filter(models.User.is_approved == False).all()
    return [{"id": u.id, "name": u.name, "email": u.email, "role": u.role, "department": u.department} for u in users]

@app.put("/admin/users/{user_id}/approve")
def approve_user(
    user_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "Admin":
        raise HTTPException(status_code=403, detail="Not authorized")
        
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    user.is_approved = True
    db.commit()
    return {"message": "User approved successfully"}

@app.get("/patients")
def get_patients(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role not in ["Staff", "Admin"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    patients = db.query(models.User).filter(models.User.role == "Patient").all()
    return [{"id": p.id, "name": p.name, "email": p.email} for p in patients]
