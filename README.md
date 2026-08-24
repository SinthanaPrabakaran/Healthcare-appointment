# Healthcare Appointment & Follow-up Manager

An end-to-end Healthcare Appointment & Follow-up Management Platform built with Node.js, Express.js, MongoDB, Mongoose, React, Vite, TailwindCSS, Google Gemini AI (`@google/genai`), Nodemailer, node-cron, and Google Calendar API (OAuth 2.0).

🌐 **Live Application URL:** [https://healthcare-appointment-six-pi.vercel.app/](https://healthcare-appointment-six-pi.vercel.app/)

---

## 📋 Table of Contents
1. [Project Overview](#-project-overview)
2. [Tech Stack](#-tech-stack)
3. [Setup & Installation Guide](#-setup--installation-guide)
4. [Environment Variables (.env.example)](#-environment-variables-envexample)
5. [Database Schema Architecture](#-database-schema-architecture)
6. [API Endpoint Documentation](#-api-endpoint-documentation)
7. [LLM Prompts & AI Integration](#-llm-prompts--ai-integration)
8. [Google Calendar API & OAuth 2.0 Setup](#-google-calendar-api--oauth-20-setup)
9. [System Design Write-Up](#-system-design-write-up)

---

## 🏥 Project Overview
Clinic appointment management requires more than a simple booking form. This platform solves key healthcare workflow challenges:
- **Patients** share symptoms prior to visits, receive pre-visit AI urgency triages, get post-visit patient-friendly summaries, automated medication reminders, email alerts, and Google Calendar event sync.
- **Doctors** inspect pre-visit AI symptom summaries, review chief complaints and suggested diagnostic questions before walking into the room, complete consultations with structured prescriptions, and issue plain-language patient summaries.
- **Admins** configure doctor profiles, specializations, consultation slot durations, working hours, and leave schedules.

---

## 🛠️ Tech Stack
- **Frontend:** React 19, Vite, Axios, React Router v7, TailwindCSS v4.
- **Backend:** Node.js, Express.js (ES Modules, MVC Architecture).
- **Database:** MongoDB Atlas, Mongoose.
- **Authentication:** Role-Based Access Control (RBAC) via JSON Web Tokens (JWT) & bcryptjs.
- **AI & LLM:** Google Gemini AI (`@google/genai`, `gemini-3.6-flash`).
- **Background Jobs & Email:** `node-cron`, Nodemailer (Gmail SMTP).
- **Calendar Integration:** Google APIs Client (`googleapis` OAuth 2.0).

---

## 🚀 Setup & Installation Guide

### Prerequisites
- Node.js (v18 or higher)
- npm (v9 or higher)
- MongoDB Connection String (Local or MongoDB Atlas)
- Google Gemini API Key
- Gmail Account & App Password (for Nodemailer)
- Google Cloud OAuth 2.0 Client Credentials

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/SinthanaPrabakaran/Healthcare-appointment.git
cd Healthcare-appointment

# Install Backend Dependencies
cd backend
npm install

# Install Frontend Dependencies
cd ../frontend
npm install
```

### 2. Configure Environment Variables
Create `.env` inside `backend/`:
```env
PORT=5000
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=1d
APPOINTMENT_HOLD_MINUTES=5

GEMINI_API_KEY=your_google_gemini_api_key
GEMINI_MODEL=gemini-3.6-flash

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_16_character_app_password
EMAIL_FROM=your_email@gmail.com

GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:5000/api/calendar/oauth/callback
```

Create `.env` inside `frontend/`:
```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Run Development Servers
```bash
# Terminal 1: Start Backend API Server
cd backend
npm run dev

# Terminal 2: Start Frontend Web Application
cd frontend
npm run dev
```
Open your browser at `http://localhost:5173`.

---

## 🔑 Environment Variables (.env.example)

| Variable | Required | Description |
|---|---|---|
| `PORT` | Yes | Express server port (default `5000`). |
| `MONGODB_URI` | Yes | MongoDB connection string. |
| `JWT_SECRET` | Yes | Secret key used to sign JWT tokens. |
| `JWT_EXPIRES_IN` | Yes | Token expiration time (e.g. `1d`). |
| `APPOINTMENT_HOLD_MINUTES` | Yes | Duration (in minutes) to hold a slot before auto-release. |
| `GEMINI_API_KEY` | Yes | Google Gemini API Key for AI summaries. |
| `GEMINI_MODEL` | Yes | Gemini model identifier (`gemini-3.6-flash`). |
| `EMAIL_USER` | Yes | SMTP email address for sending notifications. |
| `EMAIL_PASSWORD` | Yes | 16-character Google App Password for SMTP authentication. |
| `GOOGLE_CLIENT_ID` | Yes | OAuth 2.0 Web Client ID from Google Cloud Console. |
| `GOOGLE_CLIENT_SECRET` | Yes | OAuth 2.0 Web Client Secret from Google Cloud Console. |
| `GOOGLE_REDIRECT_URI` | Yes | OAuth callback endpoint (`http://localhost:5000/api/calendar/oauth/callback`). |
| `VITE_API_URL` | Yes | Frontend API endpoint URL (`http://localhost:5000/api`). |

---

## 🗄️ Database Schema Architecture

### 1. `User` Schema
- `name`: String (required)
- `email`: String (required, unique, indexed)
- `password`: String (hashed via bcryptjs)
- `role`: Enum `['PATIENT', 'DOCTOR', 'ADMIN']`

### 2. `Doctor` Schema
- `userId`: ObjectId (ref: `User`, unique)
- `specialization`: String (required)
- `slotDuration`: Number (default `30` mins)
- `workingHours`: Array of `{ day: String, start: String, end: String }`
- `leaveDates`: Array of Strings (`YYYY-MM-DD`)

### 3. `Appointment` Schema
- `patient`: ObjectId (ref: `User`, required)
- `doctor`: ObjectId (ref: `Doctor`, required)
- `date`: String (`YYYY-MM-DD`, required)
- `startTime`: String (`HH:mm`, required)
- `endTime`: String (`HH:mm`, required)
- `symptoms`: String (required)
- `status`: Enum `['HELD', 'BOOKED', 'CANCELLED', 'COMPLETED']`
- `holdExpiresAt`: Date
- `preVisitSummary`: `{ urgencyLevel: String, chiefComplaint: String, suggestedQuestions: [String], generatedAt: Date }`
- `postVisitNotes`: String
- `prescription`: Array of `{ medicine: String, dosage: String, frequency: String, duration: String, instructions: String }`
- `followUpInstructions`: String
- `postVisitSummary`: String
- `calendarEvents`: `{ patient: { eventId, calendarId }, doctor: { eventId, calendarId } }`
- `calendarSyncStatus`: Enum `['PENDING', 'SYNCED', 'PARTIAL', 'FAILED']`
- **Partial Unique Index:** `{ doctor: 1, date: 1, startTime: 1 }` where `status IN ['BOOKED', 'HELD']` (Prevents double-booking).

### 4. `MedicationReminder` Schema
- `patient`: ObjectId (ref: `User`)
- `appointment`: ObjectId (ref: `Appointment`)
- `medicine`, `dosage`, `frequency`, `instructions`: String
- `scheduledAt`: Date
- `status`: Enum `['PENDING', 'SENT', 'FAILED']`

### 5. `EmailNotification` Schema
- `recipient`: String
- `notificationType`: Enum `['BOOKING_CONFIRMATION', 'CANCELLATION', 'DOCTOR_LEAVE', 'MEDICATION_REMINDER']`
- `subject`, `text`, `html`: String
- `status`: Enum `['PENDING', 'SENT', 'FAILED']`
- `retryCount`: Number (max 3)

### 6. `GoogleCalendarConnection` Schema
- `user`: ObjectId (ref: `User`, unique)
- `googleEmail`: String
- `accessToken`: String
- `refreshToken`: String
- `tokenExpiry`: Date

---

## 📡 API Endpoint Documentation

### Authentication (`/api/auth`)
- `POST /api/auth/register` — Register a new patient/user. Returns JWT token & user object.
- `POST /api/auth/login` — Authenticate user and issue JWT token.

### Doctors (`/api/doctors`)
- `GET /api/doctors?specialization=&name=&page=1&limit=10` — Search doctors (Authenticated).
- `GET /api/doctors/:id` — Get single doctor profile.
- `POST /api/doctors` — Create doctor profile (Admin only).
- `PUT /api/doctors/:id` — Update doctor profile, working hours, or leave dates (Admin only).
- `DELETE /api/doctors/:id` — Delete doctor profile (Admin only).
- `GET /api/doctors/:doctorId/slots?date=YYYY-MM-DD` — Generate available consultation time slots.

### Appointments (`/api/appointments`)
- `POST /api/appointments/hold` — Hold an available slot for 5 minutes.
- `POST /api/appointments/:id/confirm` — Confirm a held slot and convert to `BOOKED`.
- `POST /api/appointments` — Direct appointment booking with symptoms.
- `GET /api/appointments/my` — Get logged-in patient's appointments.
- `GET /api/appointments/doctor` — Get logged-in doctor's patient queue.
- `GET /api/appointments/:id` — Get comprehensive appointment details.
- `PUT /api/appointments/:id/cancel` — Cancel appointment (Deletes calendar events).
- `POST /api/appointments/:id/previsit-summary` — Trigger Gemini AI Pre-Visit summary.
- `PUT /api/appointments/:id/complete` — Submit consultation notes & prescriptions (Doctor only).
- `POST /api/appointments/:id/postvisit-summary` — Trigger Gemini AI Post-Visit summary.

### Google Calendar (`/api/calendar`)
- `GET /api/calendar/connect` — Get Google OAuth authorization URL.
- `GET /api/calendar/oauth/callback` — OAuth 2.0 callback handler for token exchange.
- `GET /api/calendar/status` — Check user Google Calendar connection status.
- `DELETE /api/calendar/disconnect` — Unlink Google Calendar account.

---

## 🤖 LLM Prompts & AI Integration

The system uses `@google/genai` with `gemini-3.6-flash`. All AI calls feature fallback JSON parsers and graceful error handlers that ensure core healthcare operations never break if the LLM API is unavailable.

### 1. Pre-Visit Summary Prompt
```text
Analyse these symptoms and return: urgency level (Low / Medium / High), chief complaint, and three suggested questions for the doctor.
Symptoms: <symptoms>

Respond ONLY with valid JSON in this structure:
{
  "urgencyLevel": "Low" | "Medium" | "High",
  "chiefComplaint": "<summary string>",
  "suggestedQuestions": ["<q1>", "<q2>", "<q3>"]
}
```

### 2. Post-Visit Summary Prompt
```text
Convert these clinical notes into a patient-friendly summary with medication schedule and follow-up steps:
Clinical Notes: <notes>
Prescription: <prescription_json>
Follow-up Instructions: <followup>

Respond with clear, empathetic, non-technical plain language for the patient.
```

---

## 📅 Google Calendar API & OAuth 2.0 Setup

1. Open [Google Cloud Console](https://console.cloud.google.com/).
2. Create project: **`Healthcare Platform`**.
3. Enable **Google Calendar API** in Library.
4. Configure **OAuth Consent Screen** (User Type: External, Scopes: `https://www.googleapis.com/auth/calendar` and `userinfo.email`).
5. Under **Audience > Test Users**, add your test email (e.g. `your_email@gmail.com`).
6. Create **OAuth 2.0 Client ID Credentials** (Web Application).
7. Set **Authorized Redirect URI** to `http://localhost:5000/api/calendar/oauth/callback`.
8. Paste `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` into `backend/.env`.

---

## 📐 System Design Write-Up

### 1. Double-Booking Prevention & Concurrency Control
To prevent two patients from booking the exact same time slot simultaneously, the platform enforces concurrency safety at both the application level and the database level:
- **MongoDB Partial Unique Index:** An index `{ doctor: 1, date: 1, startTime: 1 }` is applied on the `Appointment` collection where `status IN ['BOOKED', 'HELD']`.
- **Atomic Operations:** If two requests attempt to book or hold the same slot at the exact same millisecond, MongoDB enforces the unique index constraint. One request succeeds while the second fails with a `11000 Duplicate Key Error`. The application catches this error and returns a clean `409 Conflict` response: *"This slot was just booked by another patient. Please select another slot."*

### 2. Doctor Leave Conflict Handling
When an admin marks a doctor on leave (`PUT /api/appointments/doctors/:id`):
- The system immediately queries all existing `BOOKED` or `HELD` appointments for that doctor on the affected leave dates.
- Affected appointments are automatically updated to `CANCELLED`.
- Background notification jobs create `DOCTOR_LEAVE` `EmailNotification` records for each affected patient, ensuring patients receive automated cancellation alerts via Nodemailer.
- Corresponding Google Calendar events are deleted via Google Calendar API worker.

### 3. Slot Hold Mechanism
To give patients time to enter their symptoms without being sniped by another user:
- `POST /api/appointments/hold` reserves the slot with `status = 'HELD'` and calculates `holdExpiresAt = Date.now() + 5 minutes`.
- When generating available slots (`GET /api/doctors/:id/slots`), any `HELD` slot whose `holdExpiresAt < Date.now()` is treated as expired and rendered available to other patients.
- Upon confirming booking, the status transitions atomically from `HELD` to `BOOKED`.

### 4. Notification & Integration Failure Handling
External integrations (Nodemailer SMTP, Google Calendar API, Google Gemini LLM) are decoupled from primary database operations:
- **Email Delivery:** Booking confirmations and reminders write `EmailNotification` records with status `PENDING`. An `emailRetryJob` worker runs every 60 seconds via `node-cron`, delivering emails asynchronously. If Nodemailer throws an error, `retryCount` is incremented without crashing Express or rolling back MongoDB bookings.
- **Google Calendar Sync:** Calendar event creation is non-blocking. If Google API returns `401`, `403`, or `500`, the appointment remains `BOOKED` in MongoDB, and `calendarSyncStatus` is marked `FAILED` for retry by `calendarRetryJob`.
