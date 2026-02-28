from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class UserCreate(BaseModel):
    name: str
    email: str
    password: str
    role: str
    department: Optional[str] = None


class UserLogin(BaseModel):
    email: str
    password: str


class RequestCreate(BaseModel):
    patient_id: Optional[int] = None
    type: str
    description: str
    priority: Optional[str] = "Normal"

class RequestForward(BaseModel):
    payment_details: Optional[str] = None
    lab_report: Optional[str] = None
    lab_result: Optional[str] = None
    payment_confirmed: Optional[bool] = None


class RequestHistoryResponse(BaseModel):
    department: str
    status: str
    timestamp: datetime

    class Config:
        orm_mode = True
class MyRequestResponse(BaseModel):
    id: int
    type: str
    description: str
    priority: str
    current_department: str
    status: str
    payment_details: Optional[str] = None
    lab_report: Optional[str] = None
    lab_result: Optional[str] = None
    payment_confirmed: Optional[bool] = None

    class Config:
        orm_mode = True
class DashboardStats(BaseModel):
    total_requests: int
    pending: int
    in_progress: int
    completed: int
    reception_queue: int
    lab_queue: int
    billing_queue: int