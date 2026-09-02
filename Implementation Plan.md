School Sphere Admin Dashboard Implementation Plan
A comprehensive, enterprise-grade Admin Dashboard for School Sphere built inside the Clients workspace directory. The frontend will communicate seamlessly with the Express/Prisma/PostgreSQL backend located in ../Server (http://localhost:5000/api/v1).

1. Technology Stack & Key Dependencies
Framework: Next.js 14/15 (App Router, TypeScript)
Styling: Tailwind CSS, PostCSS, Lucide React Icons, clsx, tailwind-merge, class-variance-authority
Component System: Shadcn/UI primitives built with Radix UI (Dialog, DropdownMenu, Tabs, Select, Sheet, Tooltip, Avatar, Skeleton, Table, Badge, Card, Button, Input, Form)
State & Data Fetching: @tanstack/react-query v5 for server state caching, pagination, optimistic updates, and invalidations
API Client: Axios instance with automatic JWT Bearer token injection, cookie credentials, and centralized error handling
Animations: Framer Motion for fluid transitions, page reveals, modal animations, and micro-interactions
Charts & Data Visualization: Recharts for executive KPI analytics (attendance rate, gender distribution, class capacities, academic performance)
Forms & Validation: React Hook Form + Zod resolvers matching the backend's validation schemas exactly
Notifications: Sonner for toast notifications
2. Architecture & Directory Structure (in Clients)

Clients/
├── public/
│   └── (logos, icons, illustrations)
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   └── login/
│   │   │       └── page.tsx           # Modern Glassmorphic Login with Admin credentials quick-fill
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx             # Protected Admin Layout (Sidebar, Topbar, Search, Breadcrumbs)
│   │   │   ├── page.tsx               # Redirect to /dashboard
│   │   │   ├── dashboard/page.tsx     # Executive Overview & Analytics
│   │   │   ├── teachers/page.tsx      # Teacher directory & management (CRUD, subjects assignment)
│   │   │   ├── students/page.tsx      # Student directory & management (CRUD, parent/class links)
│   │   │   ├── parents/page.tsx       # Parent records & children links (CRUD)
│   │   │   ├── classes/page.tsx       # Class management & supervisor assignments
│   │   │   ├── subjects/page.tsx      # Subject catalog & assigned teachers
│   │   │   ├── grades/page.tsx        # Academic grade levels
│   │   │   ├── lessons/page.tsx       # Timetable & lesson scheduling
│   │   │   ├── exams/page.tsx         # Exam schedules & assessments
│   │   │   ├── assignments/page.tsx   # Coursework & homework management
│   │   │   ├── results/page.tsx       # Gradebook & results entry
│   │   │   ├── attendance/page.tsx    # Daily & lesson attendance tracking
│   │   │   ├── events/page.tsx        # School events calendar
│   │   │   ├── announcements/page.tsx # Campus noticeboard & broadcasting
│   │   │   └── settings/page.tsx      # Admin profile, system diagnostics, API health
│   │   ├── globals.css                # Custom theme variables, dark mode palette, scrollbars
│   │   └── layout.tsx                 # Root layout with QueryProvider & AuthProvider
│   ├── components/
│   │   ├── layout/
│   │   │   ├── sidebar.tsx            # Collapsible navigation with active route highlights
│   │   │   ├── header.tsx             # Topbar with global search, notifications, theme toggle, profile
│   │   │   └── breadcrumbs.tsx        # Dynamic route breadcrumbs
│   │   ├── dashboard/
│   │   │   ├── stat-card.tsx          # Metric cards with trend indicators
│   │   │   ├── attendance-chart.tsx   # Interactive attendance area/bar chart
│   │   │   ├── gender-chart.tsx       # Gender demographic donut chart
│   │   │   ├── capacity-chart.tsx     # Class enrollment vs capacity visualization
│   │   │   ├── upcoming-events.tsx    # Event agenda widget
│   │   │   └── announcements-list.tsx # Noticeboard feed widget
│   │   ├── ui/                        # Radix + Tailwind component library
│   │   │   ├── button.tsx, dialog.tsx, dropdown-menu.tsx, input.tsx,
│   │   │   ├── select.tsx, sheet.tsx, table.tsx, tabs.tsx, badge.tsx,
│   │   │   ├── card.tsx, avatar.tsx, skeleton.tsx, alert.tsx, tooltip.tsx
│   │   └── shared/
│   │       ├── data-table.tsx         # Reusable paginated table with search & filters
│   │       ├── confirm-dialog.tsx     # Generic delete/confirmation modal
│   │       ├── empty-state.tsx        # Clean empty-state placeholders
│   │       └── page-header.tsx        # Consistent page title + actions header
│   ├── context/
│   │   └── auth-context.tsx           # Authentication state, login, logout, token persistence
│   ├── hooks/
│   │   ├── use-auth.ts                # Hook to consume AuthContext
│   │   ├── use-teachers.ts            # Queries & mutations for Teachers
│   │   ├── use-students.ts            # Queries & mutations for Students
│   │   ├── use-parents.ts             # Queries & mutations for Parents
│   │   ├── use-classes.ts             # Queries & mutations for Classes & Grades
│   │   ├── use-subjects.ts            # Queries & mutations for Subjects
│   │   ├── use-lessons.ts             # Queries & mutations for Lessons / Timetable
│   │   ├── use-assessments.ts         # Queries & mutations for Exams & Assignments
│   │   ├── use-results.ts             # Queries & mutations for Student Results
│   │   ├── use-attendance.ts          # Queries & mutations for Attendance
│   │   └── use-notices.ts             # Queries & mutations for Events & Announcements
│   ├── lib/
│   │   ├── api.ts                     # Axios client with interceptors
│   │   └── utils.ts                   # cn() helper, date formatting, score formatting
│   └── types/
│       ├── api.ts                     # API response wrapper types { success, meta, data, message }
│       ├── auth.ts                    # User, Login, Token interfaces
│       └── models.ts                  # Teacher, Student, Parent, Class, Lesson, etc. Prisma models & enums
├── .env.local                         # NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api/v1
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── next.config.mjs
3. Backend Integration Matrix
All endpoints adhere strictly to the School Sphere Server API:

Feature / Module	Backend Route	Method	Actions Implemented in UI
Auth	/auth/login	POST	Admin login, store JWT token, redirect to dashboard
Auth	/auth/refresh-token	POST	Transparent access token refresh interceptor
Admins	/admins	POST	Create auxiliary admin accounts
Teachers	/teachers	GET, POST	Paginated listing, search (name, surname, email, phone), filter (subjectId, classId), create teacher modal
Teachers	/teachers/:id	GET, PATCH, DELETE	View profile details (classes, lessons, subjects), update teacher info, safe delete with dependency checks
Students	/students	GET, POST	Paginated listing, search (name, surname, username), filter (classId, gradeId, parentId), create student with auto-relation
Students	/students/:id	GET, PATCH, DELETE	View student details (attendance history, exam/assignment scores, parent contacts), update, delete
Parents	/parents	GET, POST, PATCH, DELETE	List parents, search by name/phone/email, view associated children, create & edit parent records
Grades	/grades	GET, POST	Grade level overview (levels 1-12) & creation
Classes	/classes	GET, POST, PATCH, DELETE	View classes with supervisor teacher & student capacity, create new class with grade & supervisor dropdowns
Subjects	/subjects	GET, POST, PATCH, DELETE	Subject catalog, assign/reassign teachers via multi-select
Lessons	/lessons	GET, POST, PATCH, DELETE	Weekly Timetable schedule grid, day-by-day scheduler, conflict alerts
Exams	/exams	GET, POST, PATCH, DELETE	Exam scheduling linked to lessons, duration, score records
Assignments	/assignments	GET, POST, PATCH, DELETE	Assignment creation with start and due dates
Results	/results	GET, POST, PATCH, DELETE	Record student exam or assignment scores (validated mutual exclusivity: exam XOR assignment)
Attendance	/attendances	GET, POST, PATCH	Date & lesson attendance register, batch/toggle student presence
Events	/events	GET, POST, PATCH, DELETE	School calendar events with class targeting or school-wide
Announcements	/announcements	GET, POST, PATCH, DELETE	Global or class-level announcements with real-time preview
4. UI/UX & Design Highlights
Modern School Sphere Aesthetic:
Palette: Deep rich slate dark mode (#0B0F19, #111827) with vibrant Indigo/Violet accents (#6366F1) and Emerald success badges (#10B981).
Card surfaces with subtle frosted borders (border-white/10) and crisp typography (Inter / Outfit).
Interactive Dashboard:
Dynamic counter cards with live percentages and micro-charts.
Interactive charts for Attendance trends, Male/Female student ratio, Class utilization gauges.
Productive Data Tables:
Instant debounced search bar.
Dropdown filters (Grade, Class, Subject, Gender, Blood Group).
Pagination controls with total count and page size selector.
Bulk actions and quick action dropdowns (Edit, View Details, Delete).
Resilient Form Experience:
Dynamic validation using Zod with clear error feedback.
Loading skeletons and spinners on mutating queries.
Confirmation dialogs for non-reversible actions (deleting teachers, students, classes).
Developer & Demo Friendly:
Quick-fill credentials badge on the login screen (admin / Password123!).
Live backend connectivity badge in the topbar/footer to instantly know if the Express server is up on port 5000.
5. Step-by-Step Implementation Strategy
Scaffold Next.js App in Clients/:
Initialize Next.js 14/15 with TypeScript, Tailwind CSS, ESLint, App Router.
Install required packages: @tanstack/react-query, lucide-react, framer-motion, axios, zod, react-hook-form, @hookform/resolvers, recharts, sonner, @radix-ui/*, clsx, tailwind-merge.
Core Theme & UI Primitives:
Setup globals.css with sleek dark mode color tokens.
Create Shadcn-style UI primitives (Button, Card, Input, Dialog, Select, Table, Badge, DropdownMenu, Tabs, Sheet, Tooltip, Skeleton, Avatar).
API & Authentication Layer:
Create src/lib/api.ts with Axios client configured for http://localhost:5000/api/v1.
Setup src/context/auth-context.tsx with token storage, user session, and automatic route guarding.
Shell & Navigation Layout:
Build responsive Sidebar with icons for all 14 modules.
Build Header with search, notifications, theme toggle, API status indicator, and user dropdown.
Module Pages Implementation:
/login: Premium login portal with quick-login button.
/dashboard: High-impact KPI stats, attendance chart, gender demographic, class capacity, upcoming events.
/teachers: Complete CRUD with subject assignment and details modal.
/students: Complete CRUD with class/grade/parent linking and profile drawer.
/parents: Complete CRUD with student links.
/classes, /subjects, /grades: Academic structure management.
/lessons: Weekly timetable viewer and lesson scheduler.
/exams, /assignments, /results: Assessment and gradebook management.
/attendance: Lesson attendance marker.
/events, /announcements: Noticeboard and calendar management.
/settings: Diagnostics and admin profile.
Validation & Verification:
Build application with npm run build to ensure type safety and error-free bundling.
Test dev server and endpoints.
6. Verification Plan
Automated Verification
Run npm run build in Clients to guarantee 100% TypeScript compilation and zero build errors.
Run ESLint to ensure code quality and conformity.
Functional Verification
Verify login screen loads cleanly at http://localhost:3000/login.
Test logging in with admin credentials (admin / Password123!) against the backend at http://localhost:5000/api/v1/auth/login.
Verify authenticated redirection to /dashboard.
Verify data fetching across all entities: Teachers, Students, Parents, Classes, Subjects, Lessons, etc.
Verify modals and forms validate inputs properly before submitting to the backend.
Verify smooth animations, responsive collapse/expand sidebar, and dark theme consistency.