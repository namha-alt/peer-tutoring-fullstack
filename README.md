# ?? SlotSync — Peer-to-Peer Tutoring Slot Negotiator (Full-Stack)

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.21-black?logo=express)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose%208-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Postman](https://img.shields.io/badge/Postman-Verified%20Tests%20(21%2F21)-FF6C37?logo=postman&logoColor=white)](https://www.postman.com/)
[![Render](https://img.shields.io/badge/Deploy-Render%20Web%20Service-46E3B7?logo=render&logoColor=black)](https://render.com/)

A modern, full-stack educational platform enabling students and tutors to schedule, negotiate, and manage 1-on-1 and group peer tutoring slots with automated conflict detection, weekly limits, file attachments, and audit event tracking.

---

## ??? Project Repository Structure

```
peer-tutoring-fullstack/
+-- frontend/                     # Modern Web Client (HTML5, Vanilla CSS, JS)
¦   +-- css/                      # Curated themes & live traffic HUD styles
¦   ¦   +-- style.css
¦   ¦   +-- api-monitor.css
¦   +-- js/                       # Client controllers & API connector
¦   ¦   +-- api.js
¦   ¦   +-- auth.js
¦   ¦   +-- student.js
¦   ¦   +-- tutor.js
¦   ¦   +-- toast.js
¦   ¦   +-- api-monitor.js
¦   +-- index.html                # Landing page & system architecture overview
¦   +-- login.html                # Role-based authentication (Student/Tutor)
¦   +-- student.html              # Student dashboard, tutor discovery & booking
¦   +-- tutor.html                # Tutor dashboard, capacity & slot management
¦   +-- api-docs.html             # Interactive browser-based API tester
¦
+-- backend/                      # Production MVC REST API (Node.js + Express)
¦   +-- config/                   # Database & infrastructure configuration
¦   ¦   +-- db.js                 # Mongoose connection with error handling & masking
¦   +-- controllers/              # Business logic controllers
¦   ¦   +-- authController.js     # User registration, bcrypt login, profile
¦   ¦   +-- userController.js     # Tutor discovery, stats, capacity controls
¦   ¦   +-- slotController.js     # Slot publishing, calendar queries, deletion
¦   ¦   +-- bookingController.js  # Booking requests, approval, cancellation
¦   ¦   +-- systemController.js   # Health check, database stats, traffic HUD
¦   ¦   +-- fileController.js     # Multer uploads, Node Streams CSV, Buffers
¦   ¦   +-- internalController.js # Node V8 engine & async microtasks demo
¦   +-- middleware/               # Express request pipeline middlewares
¦   ¦   +-- auth.js               # JWT Bearer verification & role authorization
¦   ¦   +-- errorHandler.js       # Centralized JSON error response handler
¦   ¦   +-- apiLogger.js          # Real-time traffic logger & HUD streaming
¦   +-- model/                    # Mongoose Schemas & Models
¦   ¦   +-- User.js               # User accounts with bcrypt hashing hook
¦   ¦   +-- Slot.js               # Availability slots with compound unique indexes
¦   ¦   +-- Booking.js            # Booking records with status lifecycle
¦   +-- routes/                   # Clean Express router mapping
¦   ¦   +-- auth.js
¦   ¦   +-- users.js
¦   ¦   +-- slots.js
¦   ¦   +-- bookings.js
¦   ¦   +-- system.js
¦   ¦   +-- files.js
¦   ¦   +-- internals.js
¦   +-- events/                   # Asynchronous event-driven architecture
¦   ¦   +-- bookingEmitter.js     # Node EventEmitter audit event stream
¦   +-- public/uploads/           # Multer disk storage destination
¦   +-- index.js                  # Application entry point & server bootstrap
¦   +-- package.json              # NPM dependencies & lifecycle scripts
¦   +-- seed.js                   # Database populator (3 tutors, 2 students, slots)
¦   +-- SlotSync.postman_collection.json # Complete 21-step live presentation suite
¦   +-- SlotSync.postman_environment.json # Local environment config
¦   +-- SlotSync.postman_environment.render.json # Cloud Render environment config
¦
+-- .gitignore                    # Git exclusion rules (node_modules, .env, logs)
+-- render.yaml                   # 1-Click Render Cloud Deployment Blueprint
+-- README.md                     # Comprehensive documentation
```

---

## ? Quick Start (Local Run)

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure Environment
Create a `.env` file in the `backend/` folder (or use defaults from `.env.example`):
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/slotsync_db
JWT_SECRET=slotsync_super_secret_jwt_key_2026_express_mongo
NODE_ENV=development
```

### 3. Seed Sample Database
Populate pre-configured tutors, students, and calendar slots:
```bash
npm run seed
```

### 4. Start the Application
```bash
npm start
# Server boots at http://localhost:5000
# Web App: http://localhost:5000/
# Interactive API Docs: http://localhost:5000/api-docs.html
```

---

## ?? Postman Presentation (21 Automated Requests)

1. Open **Postman Desktop**.
2. Click **Import** and select:
   - `backend/SlotSync.postman_collection.json`
   - `backend/SlotSync.postman_environment.json`
3. Select **SlotSync Local Environment** (top right dropdown).
4. Run requests **01 through 21** consecutively.
   - Tokens, slot IDs, and booking IDs are **automatically extracted and saved** into Postman variables between steps!
   - You can also click **Run collection** to run all 21 automated test passes in sequence.

---

## ?? Deploy to Render (Free Tier)

1. Connect your repository to [Render.com](https://render.com).
2. Create a **New Web Service**:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Health Check Path**: `/api/system/health`
3. Add Environment Variables:
   - `MONGODB_URI` = Your free MongoDB Atlas connection string (`mongodb+srv://...`)
   - `JWT_SECRET` = Your secret key
   - `NODE_ENV` = `production`
4. Deploy and import `backend/SlotSync.postman_environment.render.json` into Postman to test live against your cloud URL!
