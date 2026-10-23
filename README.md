# 📚 SlotSync - Peer-to-Peer Tutoring Slot Negotiator (Full-Stack)

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.21-black?logo=express)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose%208-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Postman](https://img.shields.io/badge/Postman-Verified%20Tests%20(16%2F16)-FF6C37?logo=postman&logoColor=white)](https://www.postman.com/)
[![Render](https://img.shields.io/badge/Deploy-Render%20Web%20Service-46E3B7?logo=render&logoColor=black)](https://render.com/)

A clean, full-stack educational web application enabling students and tutors to schedule, negotiate, and manage peer tutoring slots with automated conflict detection, weekly limits, role-based JWT authentication, and persistent storage in MongoDB.

---

## 📂 Project Repository Structure

`
peer-tutoring-fullstack/
├── frontend/                     # Web Client (HTML5, Vanilla CSS, JS)
│   ├── css/
│   │   └── style.css             # Main styling, responsive layout & themes
│   ├── js/
│   │   ├── api.js                # REST API client (fetch)
│   │   ├── auth.js               # Client auth controller (login/register)
│   │   ├── student.js            # Student dashboard controller & calendar
│   │   ├── tutor.js              # Tutor dashboard controller & slot manager
│   │   └── toast.js              # Notification alerts
│   ├── index.html                # Landing page
│   ├── login.html                # Role-based authentication (Student/Tutor)
│   ├── student.html              # Student dashboard & booking interface
│   └── tutor.html                # Tutor dashboard & availability manager
│
├── backend/                      # REST API Server (Node.js + Express)
│   ├── config/
│   │   └── db.js                 # Mongoose connection with error handling
│   ├── controllers/
│   │   ├── authController.js     # User registration, bcrypt login, profile
│   │   ├── userController.js     # Tutor discovery, stats, capacity controls
│   │   ├── slotController.js     # Slot publishing, calendar queries, deletion
│   │   ├── bookingController.js  # Booking requests, approval, cancellation
│   │   └── systemController.js   # Health check & database seeding
│   ├── middleware/
│   │   ├── auth.js               # JWT Bearer verification & role authorization
│   │   └── errorHandler.js       # Centralized JSON error response handler
│   ├── model/
│   │   ├── User.js               # User accounts with bcrypt hashing hook
│   │   ├── Slot.js               # Availability slots with compound unique indexes
│   │   └── Booking.js            # Booking records with status lifecycle
│   ├── routes/
│   │   ├── auth.js               # /api/auth routes
│   │   ├── users.js              # /api/users routes
│   │   ├── slots.js              # /api/slots routes
│   │   ├── bookings.js           # /api/bookings routes
│   │   └── system.js             # /api/system routes
│   ├── index.js                  # Application entry point & server bootstrap
│   ├── package.json              # NPM dependencies & lifecycle scripts
│   ├── seed.js                   # Database populator (3 tutors, 2 students, slots)
│   ├── SlotSync.postman_collection.json # Complete 16-step Postman test suite
│   ├── SlotSync.postman_environment.json # Local environment config
│   ├── SlotSync.postman_environment.render.json # Cloud Render environment config
│   └── POSTMAN_PRESENTATION_GUIDE.md # Step-by-step Postman guide
│
├── .gitignore                    # Git exclusion rules (node_modules, .env)
├── render.yaml                   # Render Cloud Deployment Blueprint
└── README.md                     # Project documentation
`

---

## ⚡ Quick Start (Local Run)

### 1. Install Dependencies
`ash
cd backend
npm install
`

### 2. Configure Environment
Create a .env file in the ackend/ folder (or use defaults from .env.example):
`env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/slotsync_db
JWT_SECRET=slotsync_super_secret_jwt_key_2026_express_mongo
NODE_ENV=development
`

### 3. Seed Sample Database
Populate pre-configured tutors, students, and calendar slots:
`ash
npm run seed
`

### 4. Start Server
`ash
npm start
`
The application will be live at:
- Web App: http://localhost:5000
- API Health Check: http://localhost:5000/api/system/health

---

## 📮 Postman Testing (16 Endpoints)

Import into Postman:
1. ackend/SlotSync.postman_collection.json
2. ackend/SlotSync.postman_environment.json (or ackend/SlotSync.postman_environment.render.json)

Run all 16 requests sequentially or use the Postman Collection Runner for 100% automated green test passes.
See ackend/POSTMAN_PRESENTATION_GUIDE.md for full viva presentation notes.

---

## 🚀 Deployment (Render)

- **Live Deployed Backend:** https://peer-tutoring-fullstack.onrender.com
- **Health Check:** https://peer-tutoring-fullstack.onrender.com/api/system/health
- **Render Configuration:** Defined in ender.yaml (ootDir: backend, 
pm install, 
pm start).
