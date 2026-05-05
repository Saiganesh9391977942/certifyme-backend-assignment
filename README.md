# CertifyMe Full Stack Assignment

## Setup Instructions

### 1. Clone Repository

git clone <your-repo-link>

### 2. Backend Setup

cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python app.py

Backend will run at:
http://127.0.0.1:5000

### 3. Frontend Setup

Open index.html in browser

---

## Features Implemented

* Admin Signup
* Admin Login (JWT Authentication)
* Forgot Password (token-based)
* Opportunity CRUD (Create, Read, Update, Delete)
* Data persistence using SQLite
* User-specific data isolation

---

## Tech Stack

* Backend: Python (Flask)
* Database: SQLite
* Frontend: HTML, CSS, JavaScript

---

## Testing

Use Postman or frontend UI to test APIs.

---

## Notes

* UI is not modified as per instructions
* All data is stored in database (no hardcoded values)
