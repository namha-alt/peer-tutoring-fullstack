# 📮 Postman Live Presentation Guide (Step-by-Step)
### How to Present SlotSync REST APIs Live in Postman

This guide is designed for presenting your project directly inside the **Postman desktop app**. You do not need to open any separate browser tab for API testing.

---

## ⚡ 1. Initial Setup in Postman (30 Seconds)

1. **Open Postman**.
2. Click the **Import** button (top left).
3. Drag & drop or select these two files from your project folder:
   - [`SlotSync.postman_collection.json`](file:///c:/Users/namha/Desktop/Projects/peer-to-peer-tutoring-slot-negotiator/tutorslot-express-mongodb/SlotSync.postman_collection.json)
   - [`SlotSync.postman_environment.json`](file:///c:/Users/namha/Desktop/Projects/peer-to-peer-tutoring-slot-negotiator/tutorslot-express-mongodb/SlotSync.postman_environment.json)
4. In Postman's top-right corner, click the **Environment Dropdown** and select **`SlotSync Local Environment`**.
5. Ensure your backend server is running in terminal:
   ```powershell
   cd tutorslot-express-mongodb
   npm start
   ```

> [!TIP]
> **Zero Manual Copy-Pasting**: The collection includes automated test scripts. When you log in as a Tutor or Student, Postman **automatically extracts and saves the JWT token, slot ID, and booking ID** directly into your environment for subsequent requests!

---

## 🎬 2. Live Presentation Execution Sequence (Step 01 to 21)

Open the collection in Postman's sidebar. Simply run the numbered requests from top to bottom:

### 🔹 Section 1: System & Node.js Internals (Topics 31, 32)
1. **`01 - System Health & Database State`** (`GET /api/system/health`)
   - **What to say**: *"This confirms our Express server is live and actively connected to MongoDB (`slotsync_db`) at `127.0.0.1:27017`."*
2. **`02 - Node.js V8 Engine & Architecture`** (`GET /api/internals/system`)
   - **What to say**: *"Here we inspect Node.js internals: V8 engine version, Heap statistics using `v8.getHeapStatistics()`, process memory usage, and the 6 libuv event loop phases."*
3. **`03 - Callbacks vs Promises vs Async/Await Demo`** (`GET /api/internals/async-demo`)
   - **What to say**: *"Demonstrates non-blocking asynchronous execution resolving sequentially using JavaScript microtask queue and modern Async/Await."*

---

### 🔹 Section 2: Authentication & Security (Topics 36, 39)
4. **`04 - Register New Student`** (`POST /api/auth/register`)
   - **What to say**: *"Registers a new user in MongoDB. Password is encrypted using `bcrypt.hash()` with 10 salt rounds before storage."*
5. **`05 - Login as Tutor Sarah (Auto-sets Token)`** (`POST /api/auth/login`)
   - **What to say**: *"Authenticates Dr. Sarah Jenkins against MongoDB and generates a signed JWT token with a 7-day expiration. Notice the Postman test script automatically saved this token into `{{tutorToken}}`."*
6. **`06 - Verify Authenticated Profile`** (`GET /api/auth/me`)
   - **What to say**: *"Demonstrates our custom `protect` JWT middleware extracting the `Authorization: Bearer <token>` header to authenticate the user."*

---

### 🔹 Section 3: Tutor Slot Management (Topics 37, 38, 41)
7. **`07 - Update Tutor Slot Capacity`** (`PUT /api/users/tutor/capacity`)
   - **What to say**: *"Updates the tutor's maximum student capacity per slot in MongoDB to allow group tutoring sessions."*
8. **`08 - Tutor Publishes Availability Slot`** (`POST /api/slots/toggle`)
   - **What to say**: *"Tutor sets availability for a specific date and hour. Mongoose creates the slot document with a compound unique index to prevent duplicate entries."*
9. **`09 - Get Tutor My Slots`** (`GET /api/slots/my`)
   - **What to say**: *"Queries the tutor's published slots from MongoDB, including current active bookings count."*

---

### 🔹 Section 4: Student Discovery, Multer Upload, & Booking (Topics 27, 28, 40, 41)
10. **`10 - Login as Student John (Auto-sets Token)`** (`POST /api/auth/login`)
    - **What to say**: *"We switch to student John Doe. Postman automatically updates `{{studentToken}}`."*
11. **`11 - Browse Qualified Tutors`** (`GET /api/users/tutors`)
    - **What to say**: *"Returns tutors with subject specialties and calculates available open slot counts in real-time."*
12. **`12 - Browse Available Calendar Slots`** (`GET /api/slots/available`)
    - **What to say**: *"Populates tutor details and dynamically selects an open slot, automatically saving its `{{slotId}}` in Postman."*
13. **`13 - Upload Study Material via Multer`** (`POST /api/files/upload`)
    - **What to say**: *"Demonstrates Multer handling `multipart/form-data` file uploads with disk storage, mime-type verification, and a 5MB size limit. The uploaded URL is automatically saved into `{{attachmentUrl}}`."*
14. **`14 - Student Submits Booking Request`** (`POST /api/bookings`)
    - **What to say**: *"Creates a tutoring booking in MongoDB with status `pending`, topic, specifics, and attachment URL. Notice that an audit event is fired via Node's `EventEmitter`."*
15. **`15 - Conflict Validation: Duplicate Request`** (`POST /api/bookings`)
    - **What to say**: *"We re-send the same booking request. The server immediately returns a `400 Bad Request` with an error message because students cannot double-book or exceed their weekly limit of 3 requests."*
16. **`16 - Get Student Bookings`** (`GET /api/bookings/my`)
    - **What to say**: *"Demonstrates Mongoose `.populate('tutorId')` joining the tutor's profile into the booking response."*

---

### 🔹 Section 5: Tutor Approval & EventEmitter (Topics 34, 38, 41)
17. **`17 - Tutor Approves Booking Request`** (`PATCH /api/bookings/{{bookingId}}/status`)
    - **What to say**: *"The tutor accepts the student's request, updating the MongoDB booking status from `pending` to `confirmed`."*
18. **`18 - Verify EventEmitter Audit Event Log`** (`GET /api/files/events`)
    - **What to say**: *"Demonstrates Node.js native `EventEmitter`. Every lifecycle action (`BOOKING_REQUESTED`, `BOOKING_CONFIRMED`) is captured and appended to our log file using non-blocking `fs.appendFile`."*

---

### 🔹 Section 6: Node Streams, Buffers, & Database Stats (Topics 33, 34, 41)
19. **`19 - Stream Sessions Report as CSV`** (`GET /api/files/export/csv`)
    - **What to say**: *"Demonstrates Node.js Streams. Instead of buffering the entire dataset in RAM, documents are converted to binary chunks and piped directly to HTTP response headers using `stream.pipe(res)`."*
20. **`20 - Buffer Allocation & Binary Encoding Demo`** (`GET /api/files/buffer-demo`)
    - **What to say**: *"Shows raw binary data manipulation: `Buffer.from()`, byte values, and Hex and Base64 string conversions."*
21. **`21 - View MongoDB Collection Statistics`** (`GET /api/system/db-stats`)
    - **What to say**: *"Live summary of all MongoDB collections showing updated user counts, slot counts, and confirmed booking tallies."*

---

## 🏆 Presentation Pro-Tips
- **Collection Runner**: In Postman, you can also click the collection name and click **"Run collection"** to execute all 21 requests in automated sequence with all green test passes!
- **Terminal Visuals**: Keep your Node.js terminal window visible beside Postman so evaluators can see the colored request logs (`[API LIVE] 🟢 POST /api/bookings - 201 (18ms)`) firing in real-time.
