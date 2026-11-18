# Event Management System (EMS)
### Full-Stack College DBMS Mini Project

A complete, production-ready full-stack web application designed for college event management. Recreated with pixel-precise fidelity to the presentation slides, featuring a clean white-and-purple design language, 10 normalized MySQL tables, transactional seat management, automated waitlist promotions, simulated payments, attendance check-in, and feedback gating.

---

## 1. Technology Stack

- **Frontend:** React.js (Vite, modern hooks, responsive component architecture)
- **Styling:** Custom CSS with Plus Jakarta Sans typography, light lavender backgrounds, purple gradient accents, and rounded UI components matching the PPT screenshots
- **Backend:** Node.js & Express.js REST API
- **Database:** MySQL 8.0 with InnoDB engine, ACID transactions, and row-level locking (`SELECT ... FOR UPDATE`)
- **Authentication:** Password hashing via `bcrypt`, role-based authorization (Admin & Participant)

---

## 2. Relational Database Design (10 Normalized Tables)

The database schema (`schema.sql`) enforces full referential integrity and normalization across 10 tables:

1. **`Admin`**: Stores administrator credentials (single administrative entity).
2. **`User`**: Participant accounts with unique emails and hashed passwords.
3. **`Category`**: Event categories (e.g. Technical, Cultural, Seminar).
4. **`Venue`**: Campus venues with physical capacity limits.
5. **`Event`**: Events created by Admin with dates, registration closing deadlines, fees, and seat capacities.
6. **`Registration`**: Junction table resolving the User $\leftrightarrow$ Event many-to-many relationship (`confirmed`, `waitlisted`, `cancelled`).
7. **`Payment`**: 1:1 with Registration for simulated payment tracking.
8. **`Attendance`**: 1:1 with Registration, recorded by the Admin during event check-in.
9. **`Feedback`**: 1:1 with Registration, strictly gated on an existing `Attendance` record (ratings 1–5 + comments).
10. **`Notification`**: In-app notifications generated on confirmations, waitlists, promotions, payments, and cancellations.

---

## 3. UI Design System (Matching Presentation Slides)

The user interface matches the presentation slides:
- **Clean White & Page Background:** `#ffffff` card surfaces over `#fcfbfe` backdrop.
- **Vibrant Purple / Violet Accents:** Primary colors `#6d28d9` and `#7c3aed`.
- **Purple Date Blocks:** Gradient squarish blocks with bold white day number and month/year.
- **Light Lavender Elements:** `#f5f3ff` background with `#e9d5ff` border and `#6b21a8` text for category, closing time, and venue pills.
- **Purple Gradient Buttons:** `linear-gradient(135deg, #6d28d9 0%, #9333ea 100%)` with subtle drop shadows.
- **Slide 8 (Participant Actions):** Search bar, category filter, venue filter, live capacity progress bars, fee display, and dynamic "Register →" / "Join waitlist →" buttons.
- **Slide 9 (Admin Manage):** Sub-navigation pills (`Events`, `Venues`, `Categories`, `Registrations`), 4-column event creation form, and event list with deletion.
- **Slide 10 (Registrations and Attendance):** Event selection dropdown, "Show no-shows" toggle, participant table (`Name`, `Email`, `Status`, `Attendance`), and "Mark present" buttons.

---

## 4. Key Business Logic & Transactional Safety

- **Seat Availability & Overbooking Prevention:**
  Registration executes inside a MySQL transaction with `SELECT ... FOR UPDATE` locking on both `Event` and `Registration` tables to eliminate race conditions.
- **Automated Waitlist Promotion:**
  When an event is full, registrations are assigned `status = 'waitlisted'`. When any confirmed participant cancels their registration, the system automatically finds the oldest waitlisted participant, updates their status to `confirmed`, creates a pending payment record if required, and dispatches an in-app notification.
- **Registration Deadlines:**
  Users cannot register for events after the Admin's specified date and closing time.
- **Simulated Payments:**
  Paid events generate a transaction reference (e.g., `TXN...`), update payment status to `success`, and record payment date/time in MySQL.
- **Attendance & Feedback Gating:**
  Only participants with an `Attendance` record marked by the Admin are allowed to submit star ratings and feedback.
- **No-Show Tracking:**
  The Admin dashboard automatically identifies confirmed participants who did not attend as no-shows.

---

## 5. Quick Start Instructions

### Running the Application

1. **Option A — One-Click Launch (Recommended):**
   Double-click `start.bat`. This automatically starts the backend server on port 5000 (which serves both the Express API and the built React frontend) and opens `http://localhost:5000` in your browser.

2. **Option B — Development Mode:**
   Double-click `dev.bat` to launch backend on `http://localhost:5000` and Vite dev server on `http://localhost:5173` with hot module replacement.

3. **Option C — Command Line:**
   ```bash
   # In terminal 1 (Backend):
   cd backend
   node server.js

   # Open in browser:
   # http://localhost:5000
   ```

---

## 6. Demo Accounts (Preset for College Project Presentation)

| Role | Email | Password |
|---|---|---|
| **Admin** | `admin@uvce.edu` | `admin123` |
| **Participant (Manasa)** | `manasamanasa0630@gmail.com` | `password123` |
| **Participant (Chandramma)** | `Chandramma123@gmail.com` | `password123` |
| **Participant (Chandana)** | `chandana@gmail.com` | `password123` |

*New participants can also be registered instantly through the "New account" tab on the sign-in page.*
