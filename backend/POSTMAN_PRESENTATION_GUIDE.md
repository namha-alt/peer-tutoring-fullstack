# 📮 Postman Live Presentation Guide (Step-by-Step)
### How to Present SlotSync REST APIs Live in Postman

This guide is designed for presenting your project directly inside the **Postman desktop app**.

---

## ⚡ 1. Initial Setup in Postman (30 Seconds)

1. **Open Postman**.
2. Click the **Import** button (top left).
3. Drag & drop or select these two files from your project folder:
   - `SlotSync.postman_collection.json`
   - `SlotSync.postman_environment.json` (or `SlotSync.postman_environment.render.json` for live cloud testing)
4. In Postman's top-right corner, click the **Environment Dropdown** and select **`SlotSync Local Environment`**.
5. Ensure your backend server is running in terminal:
   ```powershell
   cd backend
   npm start
   ```

> [!TIP]
> **Zero Manual Copy-Pasting**: The collection includes automated test scripts. When you log in as a Tutor or Student, Postman **automatically extracts and saves the JWT token, slot ID, and booking ID** directly into your environment for subsequent requests!

---

## 🎬 2. Live Presentation Execution Sequence (Step 01 to 16)

Open the collection in Postman's sidebar. Simply run the numbered requests from top to bottom:

### 🔹 Section 1: System Health
1. **`01 - System Health Check`** (`GET /api/system/health`)
   - **What to say**: *"This confirms our Express server is live and actively connected to MongoDB (`slotsync_db`)."*

---

### 🔹 Section 2: Authentication & Security
2. **`02 - Register Student`** (`POST /api/auth/register`)
   - **What to say**: *"Registers a new user in MongoDB. Password is encrypted using `bcrypt.hash()` with 10 salt rounds before storage."*
3. **`03 - Login as Tutor (Auto-sets Token)`** (`POST /api/auth/login`)
   - **What to say**: *"Authenticates tutor Dr. Sarah Jenkins against MongoDB and generates a signed JWT token. The Postman test script automatically saves this token into `{{tutorToken}}` and `{{authToken}}`."*
4. **`04 - Access Protected Profile`** (`GET /api/auth/me`)
   - **What to say**: *"Demonstrates our custom `protect` JWT middleware extracting the `Authorization: Bearer <token>` header to authenticate the user."*

---

### 🔹 Section 3: Tutor Slot Management
5. **`05 - Update Tutor Capacity`** (`PUT /api/users/tutor/capacity`)
   - **What to say**: *"Updates the tutor's maximum student capacity per slot in MongoDB."*
6. **`06 - Tutor Publishes Availability Slot`** (`POST /api/slots/toggle`)
   - **What to say**: *"Tutor sets availability for a specific date and hour. Mongoose creates the slot document with a compound unique index to prevent duplicate entries."*
7. **`07 - Get Tutor's Own Slots`** (`GET /api/slots/my`)
   - **What to say**: *"Queries the tutor's published slots from MongoDB, including active bookings count."*

---

### 🔹 Section 4: Student Discovery & Booking
8. **`08 - Login as Student (Auto-sets Token)`** (`POST /api/auth/login`)
   - **What to say**: *"We switch to student John Doe. Postman automatically updates `{{studentToken}}` and `{{authToken}}`."*
9. **`09 - Browse Qualified Tutors`** (`GET /api/users/tutors`)
   - **What to say**: *"Returns tutors with subject specialties and calculates open slot counts in real-time."*
10. **`10 - Browse Available Calendar Slots`** (`GET /api/slots/available`)
    - **What to say**: *"Populates tutor details and dynamically selects an open slot, automatically saving its `{{slotId}}` in Postman."*
11. **`11 - Student Submits Booking Request`** (`POST /api/bookings`)
    - **What to say**: *"Creates a tutoring booking in MongoDB with status `pending`, topic, and specifics, saving `{{bookingId}}`."*
12. **`12 - Conflict Validation: Duplicate Request`** (`POST /api/bookings`)
    - **What to say**: *"We re-send the booking request. The server immediately returns a `400 Bad Request` because students cannot double-book the same slot or overlap with existing sessions."*
13. **`13 - Get Student's Own Bookings`** (`GET /api/bookings/my`)
    - **What to say**: *"Queries student's bookings with populated tutor profile details."*

---

### 🔹 Section 5: Tutor Decision & Cancellation
14. **`14 - Tutor Approves Booking Request`** (`PATCH /api/bookings/{{bookingId}}/status`)
    - **What to say**: *"The tutor accepts the student's request, updating the MongoDB booking status from `pending` to `confirmed`."*
15. **`15 - Student Cancels Booking`** (`POST /api/bookings/{{bookingId}}/cancel`)
    - **What to say**: *"Demonstrates booking cancellation, freeing up the slot in MongoDB for other students."*
16. **`16 - Unauthorized Access Test (No Token)`** (`GET /api/auth/me`)
    - **What to say**: *"Tests that protected routes reject requests without a valid Bearer token with a 401 Unauthorized status."*

---

## 🏆 Presentation Pro-Tips
- **Collection Runner**: In Postman, click the collection name and click **"Run collection"** to execute all 16 requests in automated sequence with 100% green test passes!
- **Terminal Visuals**: Keep your Node.js terminal window visible beside Postman so evaluators can see the request logs firing in real-time.
