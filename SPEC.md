# SafeZone Campus - Specification Document

## 1. Project Overview

**Project Name:** SafeZone Campus
**Project Type:** Web Application (React SPA)
**Core Functionality:** Internal campus system for bullying reporting and monitoring
**Target Users:** Students (Mahasiswa) and Admin (Satgas Campus)

## 2. Technology Stack

- **Framework:** Vite
- **Styling:** Tailwind CSS
 React 18 +- **Routing:** React Router v6
- **HTTP Client:** Axios
- **Form Handling:** React Hook Form + Yup
- **Authentication:** JWT (JSON Web Token)
- **Charts:** Chart.js + react-chartjs-2
- **Maps:** Leaflet + react-leaflet
- **Icons:** Lucide React

## 3. Architecture

### Clean Architecture Structure
```
src/
├── assets/              # Static assets
├── components/         # Reusable UI components
│   ├── common/        # Button, Input, Modal, etc.
│   ├── layout/       # Layout components (Sidebar, Navbar)
│   └── Protected/    # Route guards
├── contexts/          # React Context (AuthContext)
├── hooks/             # Custom hooks (useAuth)
├── pages/             # Page components
│   ├── auth/         # Login pages
│   ├── student/      # Student pages
│   └── admin/        # Admin pages
├── services/          # API services
├── utils/             # Utilities, helpers
└── types/             # TypeScript types
```

### Role-Based Access Control (RBAC)

**Roles:**
1. **student** - Mahasiswa
2. **admin** - Satgas Campus

**Route Protection:**
- `/dashboard` → student, admin
- `/laporan/*` → student, admin
- `/admin/*` → admin only

## 4. Features

### Authentication
- JWT Access Token (stored in localStorage for dev)
- Role-based token payload
- Protected Routes with middleware
- Auto-redirect based on role

### Student Features
1. **Login** - NIM + Password
2. **Dashboard** - Report summary, status tracking
3. **Create Report** - Anonymous reporting with form
   - Case type selection
   - Location picker
   - Description
   - Evidence upload
4. **My Reports** - Track report status
5. **Education Module** - Anti-bullying resources

### Admin Features
1. **Login** - Admin credentials
2. **Dashboard** - Statistics overview
3. **All Reports** - View, filter, manage
4. **Filters:** Date, case type, faculty
5. **Status Update:** Baru → Diproses → Selesai
6. **Analytics:**
   - Monthly report chart
   - Case type pie chart
   - Location heatmap
   - Campus Safety Index

## 5. UI/UX Design

### Color Palette
- **Primary:** #2563EB (Blue-600)
- **Secondary:** #7C3AED (Violet-600)
- **Success:** #10B981 (Emerald-500)
- **Warning:** #F59E0B (Amber-500)
- **Danger:** #EF4444 (Red-500)
- **Background:** #F8FAFC (Slate-50)
- **Surface:** #FFFFFF

### Layout
- **Sidebar:** Fixed left (240px), collapsible on mobile
- **Header:** Fixed top (64px)
- **Content:** Responsive grid

## 6. API Endpoints (Mock)

```
POST /api/auth/login
POST /api/auth/logout
GET  /api/reports
POST /api/reports
GET  /api/reports/:id
PUT  /api/reports/:id/status
GET  /api/stats/dashboard
GET  /api/stats/monthly
GET  /api/stats/by-type
GET  /api/stats/by-location
```

## 7. Security Best Practices

- JWT token in localStorage (dev) / HTTP-only cookie (prod)
- Token expiration handling
- Role validation on each protected route
- Input sanitization with Yup validation
- XSS prevention

## 8. Acceptance Criteria

- [ ] User can login as student or admin
- [ ] Student can create anonymous report
- [ ] Student can view own reports
- [ ] Admin can view all reports
- [ ] Admin can filter and update status
- [ ] Dashboard shows correct statistics
- [ ] Charts render properly
- [ ] Route protection works correctly
- [ ] Responsive design works on all devices
