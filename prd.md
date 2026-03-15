# RaktSetu — Product Requirements Document
### Smart Healthcare & Donation Network

> **Version:** 1.0 — Hackathon MVP  
> **Stack:** React JS · Tailwind CSS · Flask · Firebase · Zustand · Motion · Lucide React  
> **Tagline:** RaktSetu — Smart Healthcare and Donation Network

---

## 1. USER ROLES

There are three roles in the system.

| Role | Description |
|---|---|
| **Hospital Admin** | Manages blood inventory, raises emergency requests, approves doctor registrations, monitors queue, searches organ donors. Created manually or seeded — no self-registration for admin in MVP. |
| **Doctor** | Registers with hospital details, waits for admin approval, then can log in and manage their patient queue. |
| **User** | Primarily a patient upon registration. Can book appointments and access healthcare services. Later, they can choose to register as a blood or organ donor from their dashboard. |

---

## 2. AUTHENTICATION & REGISTRATION FLOWS

### 2.1 User Registration

A single registration form for everyone who is not a doctor or admin.

**Fields:**
- Full name
- Email address
- Phone number (with country code, e.g. +91XXXXXXXXXX)
- Password
- City and Pincode
- Blood group (A+ / A- / B+ / B- / O+ / O- / AB+ / AB-)
- Date of birth (used to calculate age, relevant for senior priority in queue)

After registration, Firebase Auth creates the account. A document is written to `/users/{uid}` with all fields plus `role: "user"` and `created_at`. The user is immediately able to log in — no approval needed.

From their dashboard, the user sees two primary actions: **Book an Appointment** (Healthcare) and **Register as Donor** (Donation Network). This allows them to transition from a patient to a lifesaver when they choose.

---

### 2.2 Doctor Registration

**Personal details:**
- Full name
- Email address
- Phone number
- Password
- Specialisation (e.g. General Physician, Cardiologist, Orthopaedic)
- Medical registration number (text field)

**Hospital details:**
- Hospital name
- Hospital ID / Hospital code (admin shares this code, e.g. `AIIMS-DEL-001`)
- Department (OPD / Emergency / Cardiology etc.)

On submission, Firebase Auth creates the account but the Firestore document is written to `/pending_doctors/{uid}` with `status: "pending"` and the submitted `hospital_id`.

> **The doctor cannot log in yet.** If they try, the app checks their status field. If `pending`, they see: *"Your account is awaiting approval from your hospital administrator. You will receive an email once approved."* They are then signed out.

---

### 2.3 Admin Approval of Doctor

When a doctor submits registration, Flask sends an email notification to the admin of the matching hospital.

In the **Admin Dashboard → Pending Doctor Approvals**, the admin sees all documents from `/pending_doctors` where `hospital_id` matches and `status` is `pending`.

**On Approve:**
- Document moved from `/pending_doctors/{uid}` to `/users/{uid}` with `role: "doctor"` and `status: "approved"`
- Flask sends an approval email to the doctor

**On Reject:**
- Document status updated to `rejected`
- Flask sends a rejection email to the doctor
- Doctor sees *"Your registration was not approved"* on next login attempt

---

### 2.4 Login Flow Logic

After login, the app reads the user's Firestore document and routes based on `role`:

| Role / Status | Redirect |
|---|---|
| `role: "admin"` | Admin Dashboard |
| `role: "doctor"` | Doctor Queue Dashboard |
| `role: "user"` | User Dashboard |
| `status: "pending"` | Pending Approval Screen |
| `status: "rejected"` | Rejection Screen with contact info |

---

## 3. EMERGENCY BROADCAST SYSTEM

### 3.1 What Triggers a Broadcast

A broadcast fires when a Hospital Admin raises an Emergency Blood Request with urgency **Critical** or **High**. Medium urgency only shows on matching donors' dashboards — no mass broadcast.

---

### 3.2 Who Gets Notified

Flask queries `/users` and filters for:
- `blood_group` matches the requested blood group
- `city` matches the hospital's city
- If the user has a blood donor profile, `is_eligible` must be `true` (last donation > 90 days ago)
- Users without a donor profile are also included — they may know someone or choose to register

For Critical/High requests, notify all users in the city with matching blood group, regardless of formal donor registration.

---

### 3.3 Email Notification

Flask uses Flask-Mail (Gmail SMTP) or SendGrid free tier.

**Email format:**
- **Subject:** `URGENT — [Blood Group] Blood Needed at [Hospital Name]`
- **Body:**
  - Hospital name and address
  - Blood group and units needed
  - Urgency level
  - Hospital contact phone number
  - Message: *"If you are not able to donate, please share this with someone who can."*

Keep it simple and human — no platform login links in emergency emails.

---

### 3.4 SMS Notification

Flask uses Twilio (or mock for demo — log payload and show toast confirmation).

**SMS format (under 160 characters):**
```
URGENT: [Blood Group] blood needed at [Hospital], [City]. Units: [X]. Contact: [Phone]. Pls share. - RaktSetu
```

> For demo: print SMS payload to Flask console and show a frontend toast — *"Broadcast sent to X donors via Email & SMS."* Judges will accept this.

---

### 3.5 Organ Donor Notification

When admin sends a Contact Request to a matched organ donor, Flask sends an email and SMS **directly to that specific donor** (not a mass broadcast). The message informs them a hospital has identified them as a potential match and asks them to contact the hospital.

---

### 3.6 Flask Broadcast Endpoint

**`POST /api/emergency/broadcast`**

Receives: `hospital_id`, `blood_group`, `units_needed`, `urgency`, `hospital_name`, `hospital_phone`, `city`

Steps:
1. Save request to Firebase `/emergency_requests`
2. Query `/users` for matching users in that city with that blood group
3. Send email to each matched user
4. Send SMS to each matched user's phone number
5. Return count of users notified + list of matched donor names to admin

Frontend shows: *"Request raised. X users notified via Email and SMS."*

---

## 4. FEATURE 1 — BLOOD & ORGAN DONATION NETWORK

### 4.1 Blood Donor Profile (inside User Dashboard)

Optional step after registration. User fills in:
- Last donation date
- Willing to donate toggle

System auto-calculates `is_eligible` — true if last donation was more than 90 days ago. Shown as a green or red badge on their profile.

**Firebase collection:** `/blood_donor_profiles/{uid}`

---

### 4.2 Organ Donor Profile (inside User Dashboard)

Separate optional form. User selects which organs they consent to donate:
- Kidney, Liver, Heart, Cornea, Lungs (checkboxes)
- Digital consent checkbox (required before submit)
- Optional medical notes

A user can be both a blood and organ donor simultaneously.

**Firebase collection:** `/organ_donor_profiles/{uid}`

---

### 4.3 Emergency Blood Request (Admin only)

Admin fills a form:
- Blood group needed
- Units required
- Urgency (Critical / High / Medium)

On submit, Flask runs the broadcast flow (Section 3). Request status moves through:

`Pending → Donors Notified → Fulfilled`

**Firebase collection:** `/emergency_requests`

---

### 4.4 Organ Match Search (Admin only)

Admin selects organ type and blood group from dropdowns and clicks Search. Flask queries `/organ_donor_profiles` and returns compatible donors as cards showing:
- Donor name, organs consented, blood group, city
- "Send Contact Request" button

Clicking Send Contact Request saves a record to `/organ_requests` with `status: "pending"` and triggers an email + SMS to that donor.

**Flask endpoint:** `GET /api/organ-search?organ=kidney&blood_group=B+`

---

### 4.5 User Dashboard — Donation Sections

**Quick Actions** — Two prominent cards for primary engagement:
- **Book an Appointment** → Link to `/queue/book`
- **Register as Donor** → Opens the donation profile registration flow

**My Donor Profile** — Visible after donor registration:
- Blood Donor card: blood group, eligibility status, last donation date, Edit button
- Organ Donor card: organs consented, Edit button

**Active Emergency Requests in My City** — Live feed of open blood requests matching user's blood group and city. Each card shows:
- Hospital name, urgency badge (colour-coded), units needed
- "I Can Help" button → marks user as respondent, reveals hospital contact number

---

### 4.6 Pages & Components — Feature 1

**Pages:**
- `/dashboard` — unified user dashboard (all sections)
- `/admin/blood-request` — raise new emergency request
- `/admin/requests` — list of all requests with status
- `/admin/requests/:id` — detail view with matched donor cards
- `/admin/organ-search` — search organ donors
- `/admin/doctors/pending` — pending doctor approvals

**Key reusable components:**
- `BloodGroupBadge` — coloured pill for blood group
- `UrgencyBadge` — red / orange / yellow for Critical / High / Medium
- `DonorCard` — shows donor info in search results
- `EligibilityStatus` — green / red pill for donation eligibility
- `RequestCard` — active blood request card on user dashboard

---

## 5. FEATURE 2 — SMART QUEUE MANAGEMENT SYSTEM

### 5.1 How the Queue Works

Each department runs its own queue. Tokens are served in order unless a priority flag is set — priority tokens jump ahead of normal ones.

**Token status states:** `Waiting → Serving → Done → Skipped`

---

### 5.2 Token Booking (User)

User selects a department and doctor, enters name and phone. Flask assigns the next token number and saves with status `Waiting`. Confirmation screen shows:
- Token number
- Current token being served
- Estimated wait time (tokens ahead × 7 minutes average)

**Flask endpoint:** `POST /api/queue/book`

**Firebase collection:** `/queue_tokens`

---

### 5.3 Priority Queue

When booking, user selects priority:

| Priority | Colour Flag |
|---|---|
| Normal | Grey |
| Emergency | Red |
| Senior Citizen (60+) | Orange |
| Pregnant | Pink |

Non-Normal priority tokens are inserted ahead of all Normal-priority waiting tokens. Priority tokens are ordered among themselves by booking time.

---

### 5.4 Live Queue Status (User Dashboard Integration)

If the user has an appointment booked for today, their User Dashboard should conditionally render a **Live Queue Status** banner at the very top.

**Banner Design:**
- Large coral/red gradient background.
- Left side: Circular display showing the **Currently Being Treated** token number.
- Right side: 
  - The patient's **Token Number** (e.g. A-18).
  - Calculated **Estimated Wait Time** (e.g., "Your turn is in 10 minutes", "5 Patients Ahead").
  - An informational card showing their specific Queue Position vs Total (e.g. "6 of 20"), Department, Doctor Name, and Token Status (e.g. "Status: WAITING").
- Real-time updates via WebSocket/Firebase listener responding to the Doctor's Queue Dashboard actions.

### 5.5 Live Queue Board (Public View)

Accessible without login — intended for waiting area screens.

- Shows current token being served per department
- Shows next tokens in queue
- Shows estimated wait time
- Updates live via Firebase `onSnapshot` — no page refresh needed

> **Demo moment:** Open this on one screen, Doctor Dashboard on another. Mark a token done — board updates instantly.

**Page:** `/queue/live`

---

### 5.5 Doctor Dashboard

Sorted by priority first, then token number. Each row shows:
- Token number, patient name, priority flag, status
- Current token highlighted
- "Mark Done" button → updates Firebase → live board updates instantly
- "Skip" button for no-show patients

Summary row at top: Tokens remaining · Average wait time · Tokens served today

**Flask endpoint:** `PATCH /api/queue/token/<id>`

---

### 5.6 Admin Queue Overview

Read-only analytics view of all departments:
- Tokens waiting per department
- Tokens served today
- Average wait time per department

---

### 5.7 Pages & Components — Feature 2

**Pages:**
- `/queue/book` — token booking form
- `/queue/confirmation` — token number + wait time
- `/queue/live` — public live queue board
- `/doctor/queue` — doctor queue with mark done
- `/admin/queue` — admin analytics overview

**Key reusable components:**
- `TokenCard` — token number, name, priority flag, status
- `PriorityBadge` — coloured badge per priority type
- `QueueCounter` — large animated number for live board (use Motion flip/slide)
- `WaitTimeEstimate` — calculates and displays "approx X minutes"
- `DepartmentSummaryCard` — queue stats card for admin view

---

## 6. STATE MANAGEMENT — ZUSTAND

One Zustand store with three slices:

**`authStore`**
- Current user object
- Role
- Loading state

**`donationStore`**
- Active blood requests
- Matched donors list
- Donor registration form state

**`queueStore`**
- Current queue tokens for doctor view
- Live token being served

Firebase listeners update Zustand directly — when Firebase fires an update, the store updates and all subscribed components re-render automatically.

---

## 7. MOTION (FRAMER MOTION) — USAGE GUIDE

Use Motion for three specific high-impact moments only:

| Moment | Animation |
|---|---|
| Live queue counter changes | Flip / slide number transition |
| Donor search results load | Stagger fade + slide up per card |
| Emergency request raised | Red alert banner slides down from top |

Keep all other interactions minimal. Motion highlights key demo moments — it should not decorate every click.

---

## 8. LUCIDE REACT — ICON GUIDE

| Context | Icon |
|---|---|
| Blood / donation | `Droplets` |
| Organ donor | `Heart` |
| Emergency / urgency | `AlertTriangle` |
| Queue / waiting | `Clock` |
| Token / ticket | `Ticket` |
| Doctor | `Stethoscope` |
| Hospital admin | `Building2` |
| Notification | `Bell` |
| Done / fulfilled | `CheckCircle2` |
| Skip token | `SkipForward` |
| Search donors | `Search` |
| Location / city | `MapPin` |
| Priority | `Flame` |
| Pending approval | `HourglassIcon` |
| SMS / email sent | `Send` |

---

## 9. FIREBASE DATA STRUCTURE

```
/users/{uid}
    name, email, phone, role, city, pincode,
    blood_group, date_of_birth, created_at
    // doctor-only fields:
    specialisation, hospital_id, department,
    medical_reg_number, status ("approved")

/pending_doctors/{uid}
    name, email, phone, specialisation,
    hospital_id, department, medical_reg_number,
    status ("pending" | "rejected"), submitted_at

/blood_donor_profiles/{uid}
    last_donation_date, is_eligible,
    total_donations, willing_to_donate

/organ_donor_profiles/{uid}
    organs_consented[], consent_signed, medical_notes

/emergency_requests/{requestId}
    hospital_id, hospital_name, blood_group,
    units_needed, urgency, status,
    notified_count, notified_user_ids[], created_at

/organ_requests/{requestId}
    hospital_id, donor_uid, organ_type,
    status, created_at

/queue_tokens/{tokenId}
    patient_uid, patient_name, patient_phone,
    doctor_id, department, token_number,
    priority, status, created_at, served_at

/hospitals/{hospitalId}
    name, address, city, phone,
    admin_uid, hospital_code

/departments/{deptId}
    hospital_id, name, current_token_serving,
    tokens_served_today, avg_wait_minutes
```

---

## 10. FLASK API ENDPOINTS

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/doctor-register` | Save to pending_doctors, email admin |
| `PATCH` | `/api/auth/doctor-approve/<uid>` | Move to users, email doctor approval |
| `PATCH` | `/api/auth/doctor-reject/<uid>` | Update status, email doctor rejection |
| `POST` | `/api/emergency/broadcast` | Save request, match users, send email + SMS |
| `GET` | `/api/organ-search` | Query organ donors by organ + blood group |
| `POST` | `/api/organ/contact` | Send email + SMS to specific organ donor |
| `POST` | `/api/queue/book` | Assign token with priority handling |
| `PATCH` | `/api/queue/token/<id>` | Update token status (done / skip) |
| `GET` | `/api/queue/status/<dept_id>` | Return current queue state for department |

---

## 11. FOLDER STRUCTURE

```
src/
  pages/
    auth/             Login, Register (User), Register (Doctor)
    admin/            Dashboard, BloodRequest, OrganSearch,
                      RequestDetail, PendingDoctors, QueueOverview
    doctor/           QueueDashboard
    user/             Dashboard, QueueConfirmation
    queue/            LiveBoard, BookToken
  components/
    shared/           Navbar, Sidebar, Loader, ProtectedRoute
    badges/           BloodGroupBadge, UrgencyBadge,
                      PriorityBadge, EligibilityStatus
    donation/         DonorCard, RequestCard, BloodRequestForm,
                      BloodDonorForm, OrganDonorForm
    queue/            TokenCard, QueueCounter, WaitTimeEstimate,
                      DepartmentSummaryCard
  store/
    authStore.js
    donationStore.js
    queueStore.js
  services/
    firebase.js       Firebase config and init
    api.js            Axios calls to Flask backend
```

---

## 12. BUILD ORDER (Recommended)

| Step | Task |
|---|---|
| 1 | Firebase project setup, seed one hospital + one admin account |
| 2 | User registration form with all fields including phone |
| 3 | Login with role-based routing and status check |
| 4 | Doctor registration form → write to `/pending_doctors` → email admin |
| 5 | Admin pending approvals panel → approve / reject → email doctor |
| 6 | Blood donor profile form inside user dashboard |
| 7 | Organ donor profile form inside user dashboard |
| 8 | Emergency blood request form for admin + Flask broadcast (email + SMS) |
| 9 | Emergency requests feed on user dashboard (live Firebase listener) |
| 10 | Organ search for admin + organ contact notification |
| 11 | Queue token booking + Flask token assignment with priority |
| 12 | Doctor queue dashboard with Mark Done and Skip |
| 13 | Live queue board with Firebase real-time listener |
| 14 | Motion animations — counter flip, donor card stagger, alert banner |

---

## 13. DEMO SCRIPT

### Part 0 — Doctor Approval Flow (1 minute)
Register a Doctor account → See "pending approval" screen → Switch to Admin → See pending doctor card → Click Approve → Email sent confirmation → Doctor logs in successfully

### Part 1 — Emergency Blood Broadcast (3 minutes)
Log in as Admin → Raise Critical B+ request → Flask finds X matching users in city → Frontend shows "X users notified via Email and SMS" → Open real email inbox to show alert email arrived → Switch to User login → See request appear in dashboard feed

### Part 2 — Donor Responds (1 minute)
As User → Click "I Can Help" on the request card → Hospital contact number revealed → Admin dashboard shows respondent count updated

### Part 3 — Organ Search (1 minute)
As Admin → Organ Search → Filter Kidney + B+ → Match cards appear → Click Send Contact Request → Confirmation shown → Donor receives email + SMS

### Part 4 — Live Queue (3 minutes)
Open `/queue/live` on second tab → Log in as Doctor on first tab → Show queue with priority flags → Mark top token Done → Live board updates instantly with animated counter → Book new token as User → Token appears on doctor dashboard in real time

---

## 14. KEY ARCHITECTURAL NOTES

- **Pending doctor flow** lives in a separate Firestore collection (`/pending_doctors`) until approved. Do not use Firebase Auth `disabled` flag — it is harder to control cleanly.
- **All notification logic** (email + SMS) runs server-side on Flask. Firebase client SDK cannot safely loop through all users and send emails.
- **Zustand + Firebase listeners** are the core real-time pattern — set up `onSnapshot` listeners on mount, update Zustand store from the callback, components re-render automatically.
- **Redis is not needed for MVP** — Firebase Realtime Database or Firestore is fast enough for queue state at hackathon scale.
- **Mock SMS for demo** — log Twilio payload to Flask console and show a frontend toast. Integrate real Twilio only if time permits.