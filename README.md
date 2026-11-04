# CivicFix - Smart City Complaint Management System

Phase 1, 2, 3 & 4: Foundation + Authentication + Complaint Management + Admin/Staff + AI & Analytics (Complete)

## Project Overview
CivicFix is a smart city complaint management platform where citizens can report real-world problems such as garbage accumulation, damaged roads, water leakage, drainage issues and broken streetlights. Government departments or municipal administrators can receive, assign, track and resolve complaints through a centralized dashboard.

## Tech Stack

### Frontend
- React.js + Vite
- Tailwind CSS
- React Router DOM
- Axios
- React Hot Toast
- React Leaflet + OpenStreetMap
- Recharts (for analytics charts)

### Backend
- Python + FastAPI
- SQLAlchemy
- Pydantic
- JWT (python-jose)
- Argon2 password hashing
- SQLite (for development, will migrate to PostgreSQL)
- Cloudinary SDK (for image storage)
- Rule-based AI classifier

## Phase 1 Features (Completed)

### Authentication System
- User registration with role selection (citizen, admin, staff)
- JWT-based authentication
- Password hashing with Argon2
- Role-based access control
- Protected routes for different user roles

### Database Models
- Users (citizens, admins, staff)
- Departments
- Complaints
- Assignments
- Complaint Updates
- Notifications
- Feedback

## Phase 2 Features (Completed)

### Complaint Management
- Complaint submission form with image upload
- GPS location capture with Leaflet map
- Interactive map for manual location selection
- Multiple image upload support
- Complaint categories (Garbage, Road Damage, Water Leakage, etc.)
- Priority levels (Low, Medium, High, Urgent)
- Complaint history for citizens
- Detailed complaint view with status timeline
- Complaint deletion (for Submitted status only)

## Phase 3 Features (Completed)

### Admin Features
- Dashboard with statistics (total, submitted, in progress, resolved)
- Complaint management interface
- Assign complaints to staff members
- Update complaint status (Submitted → Under Review → Assigned → Resolved → Closed)
- View all staff members
- Department management UI

### Staff Features
- View assigned tasks
- Accept assigned tasks
- Update task progress with remarks
- Mark tasks as resolved with resolution notes
- View task details

### Public Dashboard
- View all public complaints
- Filter by status (All, Submitted, In Progress, Resolved)
- Anonymous access (no login required)

## Phase 4 Features (Completed)

### AI & Analytics
- **Rule-based AI Classifier**: Automatic complaint categorization based on keywords
- **Priority Prediction**: AI suggests priority based on complaint content
- **Duplicate Detection**: Identifies potential duplicate complaints using Jaccard similarity
- **Analytics Dashboard**: Visual charts for status breakdown, category distribution, priority trends
- **Monthly Trends**: Track complaint volume over time
- **Public Analytics**: Anonymous access to basic statistics

### Notification System
- Automatic notifications when complaint status changes
- Staff notifications when assigned to new tasks
- Unread notification count
- Mark notifications as read
- Mark all notifications as read

### Feedback System
- Citizens can rate resolved complaints (1-5 stars)
- Add comments to feedback
- View feedback for specific complaints
- Only one feedback per complaint

### Backend API Endpoints

#### Authentication
- POST `/api/v1/auth/register` - Register new user
- POST `/api/v1/auth/login` - Login user
- GET `/api/v1/auth/me` - Get current user
- POST `/api/v1/auth/logout` - Logout user

#### Complaints
- POST `/api/v1/complaints/` - Create new complaint (with images)
- GET `/api/v1/complaints/my` - Get current user's complaints
- GET `/api/v1/complaints/public` - Get all public complaints
- GET `/api/v1/complaints/{id}` - Get specific complaint
- PATCH `/api/v1/complaints/{id}` - Update complaint
- DELETE `/api/v1/complaints/{id}` - Delete complaint

#### Admin
- GET `/api/v1/admin/dashboard` - Dashboard statistics
- GET `/api/v1/admin/complaints` - Get all complaints
- PATCH `/api/v1/admin/complaints/{id}/status` - Update complaint status
- GET `/api/v1/admin/complaints/{id}/history` - Get complaint history
- POST `/api/v1/admin/assign` - Assign complaint to staff
- GET `/api/v1/admin/staff` - Get all staff members
- POST `/api/v1/admin/classify` - AI classify complaint
- POST `/api/v1/admin/detect-duplicates` - Detect duplicate complaints

#### Staff
- GET `/api/v1/staff/tasks` - Get assigned tasks
- PATCH `/api/v1/staff/tasks/{id}/accept` - Accept assigned task
- PATCH `/api/v1/staff/tasks/{id}/progress` - Update task progress
- POST `/api/v1/staff/tasks/{id}/resolve` - Mark task as resolved

#### Departments
- POST `/api/v1/departments/` - Create department
- GET `/api/v1/departments/` - Get all departments
- GET `/api/v1/departments/{id}` - Get specific department
- PATCH `/api/v1/departments/{id}` - Update department
- DELETE `/api/v1/departments/{id}` - Delete department

#### Analytics
- GET `/api/v1/analytics/public` - Public analytics (no auth)
- GET `/api/v1/analytics/detailed` - Detailed analytics (admin only)

#### Notifications
- GET `/api/v1/notifications/` - Get user notifications
- GET `/api/v1/notifications/?unread_only=true` - Get unread only
- PATCH `/api/v1/notifications/{id}/read` - Mark as read
- PATCH `/api/v1/notifications/read-all` - Mark all as read
- GET `/api/v1/notifications/unread-count` - Get unread count

#### Feedback
- POST `/api/v1/feedback/` - Submit feedback for resolved complaint
- GET `/api/v1/feedback/complaint/{id}` - Get complaint feedback

#### System
- GET `/api/v1/health` - Health check

## Getting Started

### Prerequisites
- Node.js LTS
- Python 3.11+
- Git

### Backend Setup
```bash
cd backend
python -m venv .venv
.venv/Scripts/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Backend runs on: http://localhost:8000
API Documentation: http://localhost:8000/docs

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

Frontend runs on: http://localhost:5173

## Environment Variables

### Backend (.env)
```
DATABASE_URL=sqlite:///./civicfix.db
SECRET_KEY=your-super-secret-key-change-this-in-production
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:8000/api/v1
```

## Project Structure

```
CivicFix/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
├── backend/
│   ├── app/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── config.py
│   │   ├── database.py
│   │   └── main.py
│   ├── requirements.txt
│   └── .env
└── database/
```

## Complaint Status Lifecycle
1. **Submitted** - Initial status when citizen creates complaint
2. **Under Review** - Admin reviews the complaint
3. **Assigned** - Complaint assigned to a department/staff
4. **In Progress** - Staff is working on the issue
5. **Resolved** - Issue has been resolved
6. **Closed** - Complaint closed after resolution
7. **Rejected** - Complaint rejected (if invalid)

## User Workflows

### Citizen Workflow
1. Register/Login as citizen
2. Navigate to "Report an Issue"
3. Fill complaint details (title, description, category, priority)
4. Add location (GPS or map selection)
5. Upload images (optional)
6. Submit complaint
7. Track status in "My Complaints"
8. View detailed complaint with status timeline
9. Provide feedback for resolved complaints

### Admin Workflow
1. Register/Login as admin
2. View dashboard statistics
3. Navigate to "Manage Complaints"
4. Review submitted complaints
5. Use AI to classify and detect duplicates
6. Update status (Under Review → Assigned)
7. Assign complaints to staff members
8. Track complaint progress
9. View analytics dashboard
10. Manage departments
11. Close resolved complaints

### Staff Workflow
1. Register/Login as staff
2. View assigned tasks in dashboard
3. Accept assigned tasks
4. Update progress with remarks
5. Mark tasks as resolved with resolution notes
6. View task details
7. Receive notifications for new assignments

## AI Features

### Complaint Classification
The AI classifier uses rule-based keyword matching to suggest:
- **Category**: Garbage, Road Damage, Water Leakage, Streetlight, Drainage, Public Sanitation
- **Priority**: Urgent, High, Medium, Low based on severity keywords
- **Confidence Score**: Shows classification confidence percentage

### Duplicate Detection
Uses Jaccard similarity algorithm to detect potential duplicate complaints:
- Compares title and description
- Returns similarity percentage
- Lists similar complaints with codes

## Next Steps (Phase 5)
- ✅ Create heatmap visualization
- ✅ Final testing and bug fixes
- ✅ Create deployment documentation
- ✅ Generate requirements.txt
- ✅ Add production environment configuration
- ✅ Create deployment scripts
- Deploy backend to Render
- Deploy frontend to Vercel
- Migrate to PostgreSQL (Neon)
- Configure production environment
- Add proper Cloudinary configuration
- Add email notifications
- WebSocket for real-time updates

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions including:
- Setting up PostgreSQL (Neon/Render)
- Deploying backend to Render
- Deploying frontend to Vercel
- Configuring Cloudinary
- Environment variables setup
- Troubleshooting guide

## Scripts

- `deploy.sh` - Linux/Mac deployment helper script
- `deploy.bat` - Windows deployment helper script

## Project Status

✅ **MVP Complete** - CivicFix is ready for production deployment with all core features implemented.
