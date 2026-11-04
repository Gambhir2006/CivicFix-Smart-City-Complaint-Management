from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import auth, complaints, admin, departments, staff, analytics, notifications, feedback
from app.database import engine, Base

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="CivicFix API",
    description="Smart City Complaint Management System",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/v1")
app.include_router(complaints.router, prefix="/api/v1")
app.include_router(admin.router, prefix="/api/v1")
app.include_router(departments.router, prefix="/api/v1")
app.include_router(staff.router, prefix="/api/v1")
app.include_router(analytics.router, prefix="/api/v1")
app.include_router(notifications.router, prefix="/api/v1")
app.include_router(feedback.router, prefix="/api/v1")


@app.get("/")
def home():
    return {
        "message": "Welcome to CivicFix API",
        "status": "Running"
    }


@app.get("/api/v1/health")
def health():
    return {
        "status": "healthy",
        "project": "CivicFix"
    }
