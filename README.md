# HRIS Admin Frontend

A Human Resource Information System (HRIS) admin panel built with React 19, TypeScript, and Vite. It provides authentication, employee management, and an attendance overview dashboard for administrators.

## Tech Stack

| | |
|---|---|
| React 19 | UI library |
| TypeScript | Type safety |
| Vite | Build tool & dev server |
| React Router v7 | Client-side routing |
| Zustand | Global state management |
| Axios | HTTP client |
| Tailwind CSS | Utility-first styling |
| Moment.js | Date formatting & manipulation |

## Features

- **Authentication** — JWT-based login/logout with token stored in `localStorage`. Token payload is decoded client-side to hydrate the user session.
- **Protected & Public Routes** — Route guards redirect unauthenticated users to `/login` and authenticated users away from the login page.
- **Dashboard** — Displays attendance records with filtering support (date range, late flag, pagination, sort order, and user selection).
- **Employee Management** — Admins can view, search, filter, and update employee records including photo uploads and position assignments.
- **Snackbar Notifications** — Global notification component for user feedback.

## Project Structure

```
src/
├── api/
│   └── axios.ts              # Axios instance with Bearer token interceptor
├── assets/
├── components/
│   ├── AttendanceSummary.tsx
│   ├── Dashboard.tsx
│   ├── EmployeeManagement.tsx
│   ├── Navbar.tsx
│   ├── Sidebar.tsx
│   ├── Snackbar.tsx
│   └── UserSelect.tsx
├── interface/
│   ├── PositionInterface.ts  # Position type definition
│   └── UserInterface.ts      # User type definition
├── pages/
│   ├── LoginPage.tsx
│   └── DashboardPage.tsx
├── routes/
│   └── AppRouter.tsx         # Route definitions with ProtectedRoute & PublicRoute
├── store/
│   ├── authStore.ts          # Auth state (login, logout, initUser)
│   ├── attendanceStore.ts    # Attendance state with filter support
│   ├── employeeStore.ts      # Employee list state with CRUD support
│   └── userStore.ts          # User list state for select/search
├── App.tsx
└── main.tsx
```

## Getting Started

### Prerequisites

- Node.js >= 18
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/nurhabibrs/hris-admin-frontend.git
cd hris-admin-frontend

# Install dependencies
npm install
```

### Environment Variables

Create a `.env` file in the project root:

```env
VITE_API_URL=http://localhost:3000
```

`VITE_API_URL` is the base URL of the HRIS backend API. All requests made through the Axios instance will use this as their base.

### Running the App

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint
npm run lint
```

## Authentication Flow

1. User submits credentials on `/login`.
2. `authStore.login()` calls `POST /auth/login` and stores the returned JWT in `localStorage`.
3. The token payload is decoded to populate the `user` state.
4. On app mount, `initUser()` fetches the latest profile data from `GET /users/:id`.
5. `logout()` calls `POST /auth/logout`, clears `localStorage`, and resets the store.

## State Management

State is managed with Zustand:

- `useAuthStore` — holds `user`, `token`, and actions: `login`, `logout`, `updateUser`, `initUser`.
- `useAttendanceStore` — holds `attendances`, `meta`, and `fetchAttendanceSummary(filters?)` which fetches paginated attendance records from `GET /attendances`.
- `useEmployeeStore` — holds `employees`, `meta`, `loading`, and actions: `fetchEmployees(filters?)`, `updateEmployee(userId, data)`, `resetEmployees()`.
- `useUserStore` — holds `users`, `meta`, `loading`, and actions: `fetchUsers(params?)`, `resetUsers()` used for user selection in filters.
