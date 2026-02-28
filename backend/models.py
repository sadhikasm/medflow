from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Boolean
from datetime import datetime
from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    password = Column(String, nullable=False)
    role = Column(String, nullable=False)
    department = Column(String)
    is_approved = Column(Boolean, default=False)


class Request(Base):
    __tablename__ = "requests"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("users.id"))
    type = Column(String, nullable=False)
    description = Column(String)
    priority = Column(String, default="Normal")
    current_department = Column(String)
    status = Column(String, default="Pending")
    payment_details = Column(String, nullable=True)
    lab_report = Column(String, nullable=True)
    lab_result = Column(String, nullable=True)
    payment_confirmed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class RequestHistory(Base):
    __tablename__ = "request_history"

    id = Column(Integer, primary_key=True, index=True)
    request_id = Column(Integer, ForeignKey("requests.id"))
    department = Column(String)
    status = Column(String)
    updated_by = Column(Integer)
    timestamp = Column(DateTime, default=datetime.utcnow)