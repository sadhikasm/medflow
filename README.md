🏥 MedFlow – Hospital Inter-Department Workflow Automation System

MedFlow is a full-stack web application designed to automate and secure patient request routing across hospital departments using a structured workflow and strict role-based access control (RBAC).

The system eliminates paper-based miscommunication by enforcing a fixed department pipeline:

Reception → Lab → Billing → Completed

📌 Problem Statement

Hospitals often rely on manual processes to move patient requests between departments. This can lead to:

Delays in service
Miscommunication between departments
Lost paperwork
Lack of transparency
Poor patient tracking

MedFlow introduces a structured digital workflow to solve these problems efficiently and securely.

🚀 Key Features

Strict linear department workflow (cannot skip stages)
Role-Based Access Control (RBAC)
JWT-secured authentication
Department-level data isolation
Real-time request tracking
Complete request history timeline
Admin master dashboard
Staff-specific dashboards
Patient tracking portal
Secure API protection
Mandatory data validation before forwarding requests

🔄 Workflow Structure

Reception → Lab → Billing → Completed

🏥 Reception

Creates new patient requests
Must enter expected payment details before forwarding

🧪 Lab

Must enter lab results and report URL
Cannot forward without entering required data

💳 Billing

Confirms payment status
Marks request as completed
Each request maintains:
Current department status
Full transition history
Forwarding timestamps
Staff action logs

🧱 System Architecture

Frontend (React + Vite)
⬇
Axios (JWT-secured API calls)
⬇
FastAPI Backend
⬇
SQLAlchemy ORM
⬇
SQLite Database

All protected routes require valid JWT authentication.

🛠 Tech Stack
Frontend

React (Vite)
React Router
Axios
Custom CSS (Healthcare-themed UI)
Backend

FastAPI

SQLAlchemy ORM
SQLite (Development database)
JWT Authentication (python-jose)
Password Hashing (Passlib + bcrypt)

🔒 Security Features

JWT-based authentication
Role-based access control
Department-level data restriction
Password hashing using bcrypt
Protected API endpoints
Token validation on every request
Admin approval system for new users
Unauthorized access automatically redirected

👥 User Roles

🔐 System Admin

Approves new staff and patient accounts
Views all hospital requests
Accesses master dashboard statistics
Monitors department queues
Views complete request history

🏥 Staff

View requests only in their department
Create patient requests (Reception)
Forward requests to next department
Update request status
Cannot access other department data

🧑 Patient

View only their own requests
Track request progress
View full request timeline history

📂 Project Structure
Inter_hospital_workflow/
│
├── backend/
│   ├── main.py
│   ├── models.py
│   ├── schemas.py
│   ├── database.py
│   ├── auth.py
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── services/
│   │   ├── App.jsx
│   │   └── styles.css
│
├── README.md
└── .gitignore

⚙️ Installation & Setup

You must run both backend and frontend simultaneously in two separate terminals.

🔹 Step 1: Run Backend
cd backend
pip install -r requirements.txt
uvicorn main:app --reload

Backend runs at:
http://127.0.0.1:8000

Swagger API Docs:
http://127.0.0.1:8000/docs

🔹 Step 2: Run Frontend
cd frontend
npm install
npm run dev

Frontend runs at:
http://localhost:5173

🔑 Default Test Accounts
🔐 Admin

Email: admin@gmail.com
Password: admin123

🏥 Staff 

Reception → reception1@gmail.com
Password: reception_staff

Lab → lab1@gmail.com
Password: lab_staff

Billing → billing1@gmail.com
Password: billing_staff

🧪 API Endpoints Overview

Authentication

POST /register
POST /login
GET /profile

Requests

POST /requests
PUT /requests/{id}/forward
GET /department/requests
GET /requests/{id}/history
GET /my-requests

Admin

GET /dashboard/stats
GET /admin/requests
GET /patients
PUT /admin/approve-user

🎯 Project Objective

To automate hospital internal workflows by:

Reducing manual routing errors
Improving inter-department communication
Securing sensitive patient data
Enforcing structured operations
Providing real-time visibility into request movement

📈 Future Enhancements

Email notifications for workflow updates
File upload support for lab reports
Real-time updates using WebSockets
Cloud deployment (Render / AWS / Railway)
Multi-hospital support
Audit logs

PDF report generation

🏆 Project Status

✔ Backend architecture complete
✔ Workflow automation functional
✔ Security enforced
✔ Frontend integrated
✔ Admin approval system active
✔ Demo-ready

👩‍💻 Developed By

Dhivya R– Backend & System Architecture
Sadhika S M– Integration
Hamsavardhani D V-Frontend & UI Development