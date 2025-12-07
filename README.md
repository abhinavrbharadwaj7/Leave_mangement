# Leave Management System for Acquis Compliance

A full-featured Leave Management platform for organizations, built with React, Node.js, Express, and MongoDB.

## Demo
[Live Demo](https://leave-mangement-blond.vercel.app/)

## Features
- Employee, Manager, and Admin dashboards
- OTP-based login with branded email template
- Department and Employee management (CRUD)
- Leave request workflow: apply, approve, reject, edit, delete
- Role-based access (employee, manager, admin)
- Real-time status updates and notifications
- Responsive UI with Ant Design and custom blue branding

## Tech Stack
- **Frontend:** React, Ant Design, Axios
- **Backend:** Node.js, Express
- **Database:** MongoDB (Mongoose ODM)

## Getting Started

### Prerequisites
- Node.js (v16+ recommended)
- npm or yarn
- MongoDB (local or Atlas)

### 1. Clone the repository
```bash
# Clone the repo
git clone <your-repo-url>
cd leave-mangement
```

### 2. Backend Setup
```bash
cd leave-management-frontend/leave-management-backend
npm install
# Create a .env file if needed for MongoDB URI and email credentials
# Example .env:
# MONGO_URI=mongodb://localhost:27017/leave_mangement
# EMAIL_USER=your@email.com
# EMAIL_PASS=yourpassword
npm run dev
```

### 3. Frontend Setup
```bash
cd ../
npm install
npm start
```

### 4. Environment Variables
- Set `REACT_APP_BACKEND_URL` in the frontend `.env` if your backend is not on `localhost:3001`.

### 5. Usage
- Register/login as Employee, Manager, or Admin
- Employees: Apply for leave, edit/delete pending requests
- Managers: Approve/reject/escalate leave, change leave status, view team
- Admins: Manage employees, departments, and leave types

## Folder Structure
```
leave-mangement/
├── leave-management-frontend/
│   ├── src/
│   │   └── components/  # React components (Dashboards, modals, etc)
│   ├── public/
│   └── ...
├── leave-management-backend/
│   ├── routes/          # Express routes (user, leave, department)
│   ├── models/          # Mongoose models
│   └── ...
└── README.md
```

## License
This project is for demonstration purposes.

---
For any issues or feature requests, please open an issue or contact the maintainer.
