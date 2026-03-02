---

# Compliance Training App

A full-stack compliance training platform for B2B companies.
Admins can manage employees, assign trainings, and track completion; employees can view and complete their assigned trainings.

* **Backend:** Express.js + MongoDB (REST API, CommonJS)
* **Frontend:** React + Vite + Tailwind CSS
* **Infrastructure:** Docker + Docker Compose

The backend handles authentication, role-based access, companies, employees, trainings, and enrollments.
The frontend consumes the backend API and provides a responsive user interface.

---

## 📁 Project Structure

```text
project-root/
│
├─ server/                  # Backend (Express + MongoDB)
│  ├─ src/
│  │  ├─ db.js              # MongoDB connection
│  │  ├─ index.ts           # Express server entry
│  │  ├─ models/            # Mongoose models (User, Company, Training, Enrollment)
│  │  ├─ routes/            # API routes (auth, employees, trainings, enrollments)
│  │  └─ middleware/        # Auth middlewares
│  └─ package.json
│
├─ training-app/                # Frontend (React + Vite + Tailwind)
│  ├─ src/
│  ├─ index.html
│  ├─ package.json
│  └─ .env                  # Vite environment variables
│
└─ docker-compose.yml       # Docker setup for backend + MongoDB + frontend
```

---

## ⚙️ Environment Variables

### Backend `.env`

```env
PORT=4000
MONGO_URI=mongodb://mongo:27017/compliance_db
JWT_SECRET=supersecretkeyyugerhfd
```

> Note: In Docker, use `mongo` as the hostname for the MongoDB container. Locally, `localhost` works.

### Frontend `.env`

```env
VITE_PORT=5173
VITE_API_URL=http://localhost:4000/api
```

---

## 🖥️ Backend Setup (Express + MongoDB)

### 1. Install dependencies

```bash
cd server
npm install
```

### 2. Run locally

```bash
npm run dev
```

* Server will start on port `4000`
* MongoDB must be running (local or Docker)

### 3. Models & Collections

Mongoose automatically creates collections in MongoDB when you insert your first document:

* **User** – email, password, role (`admin` or `employee`), companyId
* **Company** – name
* **Training** – title, description, dueDate, companyId
* **Enrollment** – userId, trainingId, status (`assigned` | `completed`), completedAt

### 4. Routes

* **Auth** – `/api/auth/register`, `/api/auth/login`
* **Employees** – `/api/employees` (Admin only)
* **Trainings** – `/api/trainings` (Admin only, soft delete supported)
* **Enrollments** – `/api/enrollments` (Admin: assign trainings, Employee: view & complete)
* **Summary** – `/api/enrollments/summary` (Admin only)

---

## 🌐 Frontend Setup (React + Tailwind + Vite)

### 1. Install dependencies

```bash
cd training-app
npm install
```

### 2. Run dev server

```bash
npm run dev
```

* Runs on port `5173`
* Connects to backend via `VITE_API_URL`

### Features

* Shared login screen with JWT authentication
* Admin dashboard: manage employees, trainings, enrollments, summary stats
* Employee dashboard: view assigned trainings, mark as completed
* Responsive UI via Tailwind CSS
* Form validation: React Hook Form + Zod
* i18n: React-i18next (at least 2 languages)

---

## 🐳 Docker Setup (Frontend + Backend + MongoDB)

The Docker Compose setup runs all services in containers.

### 1. `docker-compose.yml`

```yaml
version: '3.9'

services:
  mongo:
    image: mongo:6
    container_name: compliance-mongo
    restart: unless-stopped
    ports:
      - "27017:27017"
    volumes:
      - mongo-data:/data/db

  backend:
    build: ./server
    container_name: compliance-backend
    restart: unless-stopped
    ports:
      - "4000:4000"
    environment:
      - PORT=4000
      - MONGO_URI=mongodb://mongo:27017/compliance_db
      - JWT_SECRET=supersecretkeyyugerhfd
    depends_on:
      - mongo

  frontend:
    build: ./training-app
    container_name: compliance-frontend
    restart: unless-stopped
    ports:
      - "5173:5173"
    environment:
      - VITE_PORT=5173
      - VITE_API_URL=http://localhost:4000/api
    depends_on:
      - backend

volumes:
  mongo-data:
```

### 2. Build and start containers

```bash
docker-compose up --build
```

* MongoDB: `mongodb://localhost:27017`
* Backend API: `http://localhost:4000/api`
* Frontend: `http://localhost:5173`

---

## 🔑 Usage

1. Register a company admin via `/api/auth/register`
2. Login as admin via `/api/auth/login`
3. Admin can:

   * Create employees
   * Create trainings
   * Assign trainings to employees
   * View summary statistics
4. Employees can:

   * View assigned trainings
   * Mark trainings as completed

---

## 📝 Notes

* Backend uses **CommonJS** modules (`require()` / `module.exports`)
* Frontend uses **ES Modules** (React + Vite)
* MongoDB collections are created automatically by Mongoose
* Use MongoDB Compass to view your database and collections
---
