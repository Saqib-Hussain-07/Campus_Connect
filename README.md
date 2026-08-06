# 🎓 CampusConnect

**CampusConnect** is a full-stack academic networking and collaboration platform built using the **MERN (MongoDB, Express.js, React, Node.js) stack**. It provides a unified, secure portal for university students to connect with peers, discover projects, participate in study groups, register for campus events, and share study resources.

---

## 🚀 Key Features

*   **🔒 Secure Authentication:** JWT-based user authentication featuring secure login, registration, password reset flows, and credential hashing.
*   **👥 Explore Peers:** Discover students across various departments, search by skills or names, endorse skills, and send connection requests.
*   **💻 Projects Showcase:** Share and showcase applications, prototypes, or research work. Includes filters for categories (Web, Mobile, AI/ML, Hardware, Research), project status indicators, and likes/comments.
*   **💬 Real-Time Messaging:** Dynamic instant messaging between connected peers with badge alerts and active conversation threads.
*   **📢 Notice Board:** View and post announcements, placement news, internship deadlines, or academic alerts.
*   **🏆 Leaderboard:** Gamified student engagement leaderboard showing peer recognition and platform activities.
*   **📅 Events Calendar:** Discover and RSVP to hackathons, webinars, workshops, and study sessions.
*   **📚 Study Resources:** Access and share lecture notes, PDFs, code templates, and reference materials.

---

## 🛠️ Tech Stack

*   **Frontend:** React.js, React Router DOM, Custom CSS (Aesthetic layout alignment, vertical responsive drawer)
*   **Backend:** Node.js, Express.js (RESTful API endpoints)
*   **Database:** MongoDB, Mongoose ODM (12 models for relations)
*   **Authentication:** JSON Web Tokens (JWT) & bcryptjs
*   **Dev Utilities:** Concurrently (dual frontend/backend startup), Nodemon

---

## 📂 Project Structure

```text
CampusConnect/
├── client/                     # React Frontend App
│   ├── public/                 # HTML shell and static icons
│   ├── src/                    # Components, pages, styles
│   ├── package.json
│   └── vercel.json             # Vercel deployment configuration
├── server/                     # Node/Express Backend App
│   ├── models/                 # Mongoose schemas (relational MongoDB documents)
│   ├── routes/                 # Express REST API endpoints
│   ├── seed.js                 # Database mock data seeding script
│   └── index.js                # Express application bootstrap
├── assets/
│   └── uploads/
│       └── avatars/            # Uploaded profile photos
├── DEPLOYMENT_GUIDE.md         # Full manual for Vercel, Render & MongoDB Atlas
├── .gitignore                  # Prevents committing node_modules, builds, and keys
├── .env.example                # Template for environment configuration
└── package.json                # Concurrently developer execution script
```

---

## 💻 Local Setup & Installation

### Prerequisites
Make sure you have [Node.js](https://nodejs.org) and [MongoDB](https://www.mongodb.com) installed and running locally.

### 1. Clone & Install Dependencies
Run the installation command in the root folder to download all required developer packages:
```bash
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the project root based on the provided template:
```bash
cp .env.example .env
```
Ensure your database URI, port, and security keys are set inside `.env`:
```env
MONGO_URI=mongodb://127.0.0.1:27017/campusconnect
JWT_SECRET=YOUR_SECURE_JWT_SECRET_KEY
PORT=5000
```

### 3. Seed Initial Database Mock Data (Optional)
To populate your local MongoDB database with mock university students, projects, and groups:
```bash
cd server
node seed.js
cd ..
```

### 4. Run Development Server
Startup both the Express server (port `5000`) and the React development frontend (port `3000`) concurrently using the root shortcut:
```bash
npm run dev
```

---

## 🚢 Deployment

For full deployment instructions, environment variable configurations, and step-by-step procedures, consult the **[DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)** file in the root folder.
