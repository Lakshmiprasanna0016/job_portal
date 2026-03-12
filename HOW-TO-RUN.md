# ▶️ How to Run Unizoy Job Board

## Prerequisites (install once)
- Node.js → https://nodejs.org  (download LTS)
- MySQL  → https://dev.mysql.com/downloads/installer/

---

## Step 1 — Setup Database

Open MySQL and run:

```sql
CREATE DATABASE unizoy_jobboard;
```

Then import the schema (run this in your terminal):

```bash
mysql -u root -p unizoy_jobboard < backend/schema.sql
```

---

## Step 2 — Configure Backend

```bash
cd backend
npm install
cp .env.example .env
```

Open `.env` and set your MySQL password:

```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=YOUR_MYSQL_PASSWORD
DB_NAME=unizoy_jobboard
DB_PORT=3306
PORT=5000
JWT_SECRET=unizoy_super_secret_key
FRONTEND_URL=http://localhost:3000
```

Then create the admin account:

```bash
node seed-admin.js
```

Start the backend:

```bash
npm run dev
```

✅ Backend running at http://localhost:5000

---

## Step 3 — Start Frontend

Open a NEW terminal:

```bash
cd frontend
npm install
npm start
```

✅ Frontend opens at http://localhost:3000

---

## Login

| | |
|---|---|
| URL | http://localhost:3000/admin/login |
| Email | admin@unizoy.com |
| Password | Admin@123 |

---

## Every time you want to run the project

**Terminal 1:**
```bash
cd backend && npm run dev
```

**Terminal 2:**
```bash
cd frontend && npm start
```
