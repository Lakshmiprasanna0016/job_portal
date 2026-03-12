# 🚀 Unizoy Job Board

A full-stack job board application built with **React.js**, **Node.js**, and **MySQL**.

---

## 📁 Project Structure

```
unizoy-jobboard/
├── backend/                 # Node.js + Express API
│   ├── config/
│   │   └── db.js            # MySQL connection pool
│   ├── middleware/
│   │   └── auth.js          # JWT auth middleware
│   ├── routes/
│   │   ├── auth.js          # Login, register, profile
│   │   ├── jobs.js          # CRUD for jobs
│   │   └── applications.js  # Application submission & management
│   ├── schema.sql           # Database setup script
│   ├── server.js            # Express app entry point
│   ├── .env.example         # Environment variables template
│   └── package.json
│
└── frontend/                # React.js app
    ├── public/
    │   └── index.html
    └── src/
        ├── context/
        │   └── AuthContext.js   # Auth state + Axios instance
        ├── components/
        │   ├── Navbar.js
        │   ├── JobCard.js
        │   └── ProtectedRoute.js
        ├── pages/
        │   ├── JobsPage.js          # Public job listings
        │   ├── JobDetailPage.js     # Job detail + apply form
        │   ├── AdminLogin.js        # Admin login
        │   ├── AdminDashboard.js    # Stats overview
        │   ├── AdminJobs.js         # Manage all jobs
        │   ├── PostJobPage.js       # Post / edit job
        │   └── AdminApplications.js # Review applicants
        ├── App.js                   # Routes setup
        ├── index.js
        └── index.css                # Global styles
```

---

## ⚙️ Prerequisites

- **Node.js** v16+
- **MySQL** 8.0+
- **npm** or **yarn**

---

## 🛠️ Setup Instructions

### 1. Database Setup

Open MySQL and run:

```sql
source /path/to/unizoy-jobboard/backend/schema.sql
```

Or copy-paste the contents of `backend/schema.sql` into your MySQL client.

This will:
- Create the `unizoy_jobboard` database
- Create `admins`, `jobs`, and `applications` tables
- Insert a default admin account
- Insert 3 sample job listings

---

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env with your MySQL credentials:
# DB_HOST=localhost
# DB_USER=root
# DB_PASSWORD=your_mysql_password
# DB_NAME=unizoy_jobboard
# JWT_SECRET=your_secret_key
# PORT=5000
# FRONTEND_URL=http://localhost:3000

# Create admin account (run once after DB setup)
node seed-admin.js

# Start the server
npm run dev       # development (with nodemon)
npm start         # production
```

The API will be available at `http://localhost:5000`

---

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start the dev server
npm start
```

The app will open at `http://localhost:3000`

> The frontend proxies API calls to `http://localhost:5000` via the `proxy` field in `package.json`.

---

## 🔐 Default Admin Credentials

```
Email:    admin@unizoy.com
Password: Admin@123
```

> Change this immediately in production by updating the password hash in the `admins` table.

---

## 🌐 Features

### Public (Candidates)
- Browse all active job listings
- Filter by department, job type, and experience level
- Search jobs by keyword
- View full job details (description, requirements, benefits)
- Apply with name, email, resume link, and optional cover letter
- Duplicate application prevention per email per job

### Admin
- Secure JWT-based login
- Dashboard with key stats and charts
- Post new jobs with full details
- Edit and update existing jobs
- Activate / deactivate job listings
- Delete jobs (cascades to applications)
- View all applications with filters
- Update application status (Pending → Reviewed → Shortlisted → Hired / Rejected)
- View cover letters and resume links inline

---

## 🔌 API Endpoints

### Auth
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/auth/login | No | Admin login |
| GET | /api/auth/me | Yes | Current admin |
| POST | /api/auth/register | Yes | Register new admin |

### Jobs
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /api/jobs | No | Get active jobs (with filters) |
| GET | /api/jobs/admin/all | Yes | Get all jobs including inactive |
| GET | /api/jobs/:id | No | Get single job |
| POST | /api/jobs | Yes | Create job |
| PUT | /api/jobs/:id | Yes | Update job |
| DELETE | /api/jobs/:id | Yes | Delete job |
| PATCH | /api/jobs/:id/toggle | Yes | Toggle active status |

### Applications
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/applications | No | Submit application |
| GET | /api/applications | Yes | Get all applications |
| GET | /api/applications/stats | Yes | Get dashboard stats |
| GET | /api/applications/:id | Yes | Get single application |
| PATCH | /api/applications/:id/status | Yes | Update status |
| DELETE | /api/applications/:id | Yes | Delete application |

---

## 🚀 Production Deployment

1. Build the React frontend:
   ```bash
   cd frontend && npm run build
   ```

2. Serve the `build` folder from Express or deploy to a static host (Vercel, Netlify)

3. Deploy backend to a Node.js host (Railway, Render, DigitalOcean)

4. Update `FRONTEND_URL` in backend `.env` to your production domain

---

## 🔒 Security Notes

- Passwords are hashed with **bcryptjs** (salt rounds: 10)
- JWT tokens expire after **24 hours**
- All admin routes are protected with JWT middleware
- SQL injection prevention via **parameterized queries** (mysql2)
- CORS configured to only allow your frontend origin

---

## 📦 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js 18, React Router v6, Axios |
| Backend | Node.js, Express.js |
| Database | MySQL 8, mysql2 driver |
| Auth | JWT (jsonwebtoken), bcryptjs |
| Styling | Custom CSS with CSS variables |
| Fonts | Syne (headings), DM Sans (body) |
