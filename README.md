# RaktSetu — Smart Healthcare & Donation Network

> **Smart Healthcare and Donation Network**

RaktSetu is a comprehensive healthcare platform built to bridge the gap between patients, donors, and hospitals. It features a scalable, real-time system for blood and organ donation, emergency broadcast alerts, and a smart queue management system for hospital departments.

## 🚀 Tech Stack

- **Frontend:** React.js, Tailwind CSS, Zustand (State Management), Framer Motion (Animations), Lucide React (Icons)
- **Backend:** Flask (Python)
- **Database & Auth:** Firebase (Firestore, Authentication)
- **Notifications:** Twilio (SMS), Flask-Mail/SendGrid (Emails)

## ✨ Core Features

1. **Role-Based Dashboards:** Dedicated interfaces for Hospital Admins, Doctors, and Users (Patients/Donors).
2. **Emergency Broadcast System:** Automated matching of blood donors by city and blood group, triggering critical Email and SMS notifications.
3. **Donation Network:** Users can maintain specialized Blood and Organ donor profiles, responding directly to hospital requests.
4. **Smart Queue Management:** A real-time token-based queue system with priority handling (Emergency, Senior Citizen, etc.) and a live public waiting board.
5. **Doctor Approval Flow:** Secure registration and verification process for medical professionals.

## 📁 Repository Structure

- `/frontend` - React application
- `/backend` - Flask API and services
- `prd.md` - Complete Product Requirements Document
- `TechStack.md` - Detailed overview of the technology choices
- `design.md` - Core UI/UX and styling guidelines

## 🛠️ Setup Instructions

To run this project locally, you will need to set up both the frontend and the backend.

### Prerequisites

- Node.js (v18 or higher)
- Python (v3.9 or higher)
- A Firebase project with Firestore and Authentication enabled.

### 1. Frontend Setup

1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install the dependencies:
   ```bash
   npm install
   ```
3. Set up your environment variables. Create a `.env.local` file in the `frontend` root using the `.env.example` (if provided) or add your Firebase credentials:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

### 2. Backend Setup

1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   # On Windows
   python -m venv venv
   .\venv\Scripts\activate

   # On macOS/Linux
   python3 -m venv venv
   source venv/bin/activate
   ```
3. Install the Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Set up the environment variables. Create a `.env` file in the `backend` directory with your Firebase Admin credentials and Twilio/Email keys:
   ```env
   # Firebase Admin SDK (Path to your service account JSON file)
   FIREBASE_CREDENTIALS=path/to/serviceAccountKey.json

   # Other necessary keys (e.g. for Flask Mail or Twilio)
   # ...
   ```
5. Run the Flask development server:
   ```bash
   python run.py
   # OR
   flask run
   ```
