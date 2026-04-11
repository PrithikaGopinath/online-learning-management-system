# 🎓 LearnHub VLE
### Virtual Learning Environment for Grades 1–12

A full-stack Online Learning Management System built with **React** and **Supabase**, designed for the UK curriculum covering Grades 1 to 12.

![LearnHub VLE](https://img.shields.io/badge/LearnHub-VLE-5c6bc0?style=for-the-badge&logo=react)
![React](https://img.shields.io/badge/React-18-61dafb?style=for-the-badge&logo=react)
![Supabase](https://img.shields.io/badge/Supabase-Database-3ecf8e?style=for-the-badge&logo=supabase)
![Vite](https://img.shields.io/badge/Vite-Build-646cff?style=for-the-badge&logo=vite)

---

## ✨ Features

### 👨‍🎓 Student Features
- Personalised dashboard with progress tracking
- View modules organised by UK curriculum stage
- Submit assignments with file upload
- Take auto-graded quizzes
- View weekly timetable
- Join live video meetings via Jitsi Meet
- Real-time chat with tutors
- View announcements

### 👩‍🏫 Tutor Features
- Full teaching dashboard with stats
- Upload modules with file attachments
- Post and manage assignments
- Create multiple choice quizzes with auto grading
- Manage weekly timetable
- Schedule and host video meetings
- Real-time chat with students
- Post announcements to specific grades
- View all students grouped by school stage

---

## 🏫 UK Curriculum Stages

| Stage | Grades | Ages |
|-------|--------|------|
| 🌱 Primary | 1 – 5 | 5 – 11 |
| 📘 Lower Secondary | 6 – 8 | 11 – 14 |
| 📙 Upper Secondary GCSE | 9 – 10 | 14 – 16 |
| 🎓 Sixth Form A-Level | 11 – 12 | 16 – 18 |

---

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| React 18 | Frontend UI |
| Vite | Build tool |
| React Router DOM | Client-side routing |
| Supabase | Database, Auth, Storage |
| Jitsi Meet | Video meetings |
| GitHub | Version control |

---

## 🗄️ Database Tables

- `profiles` — User profiles with roles (student/tutor)
- `modules` — Learning materials per grade and subject
- `assignments` — Assignments set by tutors
- `submissions` — Student assignment submissions
- `quizzes` — Quiz metadata
- `quiz_questions` — Individual quiz questions
- `quiz_attempts` — Student quiz results
- `timetable` — Weekly schedule per grade
- `meetings` — Scheduled video meetings
- `messages` — Real-time chat messages
- `announcements` — Notices from tutors

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm
- Supabase account

### Installation

```bash
# Clone the repository
git clone https://github.com/PrithikaGopinath/online-learning-management-system.git

# Go into the project
cd online-learning-management-system

# Install dependencies
npm install

# Start the development server
npm run dev
```

### Environment Setup

Update `src/config/supabase.js` with your Supabase credentials:

```javascript
const supabaseUrl = 'YOUR_SUPABASE_PROJECT_URL'
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY'
```

### Supabase Setup

1. Create a new Supabase project
2. Run the SQL schema in Supabase SQL Editor
3. Create two storage buckets:
   - `modules` — set to Public
   - `submissions` — set to Public
4. Go to Authentication → Sign In / Providers → Email
5. Turn OFF Confirm email and click Save

---

## 📁 Project Structure

learnhub/
├── public/
├── src/
│   ├── components/
│   │   └── Sidebar.jsx        # Navigation sidebar
│   ├── config/
│   │   └── supabase.js        # Supabase client
│   ├── pages/
│   │   ├── Home.jsx           # Landing page
│   │   ├── Login.jsx          # Role-based login
│   │   ├── Register.jsx       # Role-based register
│   │   ├── Dashboard.jsx      # Student/Tutor dashboard
│   │   ├── Modules.jsx        # Learning modules
│   │   ├── Assignments.jsx    # Assignments
│   │   ├── Quiz.jsx           # Quizzes and tests
│   │   ├── Timetable.jsx      # Weekly timetable
│   │   ├── VideoMeeting.jsx   # Video meetings
│   │   ├── Chat.jsx           # Real-time chat
│   │   ├── Announcements.jsx  # Notices
│   │   └── Students.jsx       # Student management
│   ├── App.jsx                # Routes
│   ├── main.jsx               # Entry point
│   └── index.css              # Global styles
├── index.html
├── package.json
└── vite.config.js

---

## 🌿 Branch Strategy

| Branch | Purpose |
|--------|---------|
| `main` | Production ready code |
| `dev` | Development integration |
| `feature/project` | Feature development |

---

## 🖥️ Pages

| Page | Tutor | Student |
|------|-------|---------|
| Dashboard | Stats, modules, assignments overview | Progress, pending work, scores |
| Modules | Upload lessons by grade and subject | View and download lessons |
| Assignments | Post assignments, view submissions | Submit work, track status |
| Quiz | Create quizzes with questions | Take quizzes, see scores |
| Timetable | Add and edit weekly slots | View class schedule |
| Video Meeting | Schedule and host meetings | Join meetings |
| Chat | Message any student | Message tutors |
| Announcements | Post notices to grades | View notices |
| Students | View all students by stage | View own profile |

---

## 👩‍💻 Developer

**Prithika Gopinath**
- GitHub: [@PrithikaGopinath](https://github.com/PrithikaGopinath)

---

## 📄 Licence

This project is for educational purposes.

---

*Built with ❤️ using React and Supabase*