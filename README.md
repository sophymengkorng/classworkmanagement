# Student Classwork Automation System

This project is a Student Classwork Automation website built with Next.js, TypeScript, and Tailwind CSS. It helps a student manage class schedules, assignments, documents, and deadline notifications from one simple dashboard.

The current version runs as a local full-stack Next.js prototype. It uses sample schedule data, saves created tasks to a local JSON file, and saves uploaded documents on the server during development.

## Main Features

- Login page for entering the student system
- Dashboard summary for today's classes, pending tasks, and due-tomorrow tasks
- Weekly SETEC SW35 (E-T) class schedule page, updated to P50 effective August 31, 2026
- Tasks page with assignment cards, edit buttons, and delete buttons
- Task detail pages with subject, teacher, deadline, description, and status
- Documents page for uploading class files to the server
- Server document storage with upload, download, replace, and delete actions
- Dashboard notification button with a pop-up reminder dialog
- Confirmation dialogs before login, task creation, task edits, task deletion, task status changes, document upload, and document deletion
- Responsive layout for desktop, tablet, and mobile phone screens
- Settings page for future Telegram, Gmail, database, and scheduler connections

## Page Flow

```text
Website
  |
  v
Login
  |
  v
Dashboard
  |
  +-- Schedule
  +-- Tasks
  |     |
  |     +-- Task Detail
  +-- Documents
  +-- Notification Dialog
  +-- Settings
```

## Website Pages

| Page | URL | Purpose |
| --- | --- | --- |
| Login | `/` and `/login` | First screen. The Login button opens the dashboard. |
| Dashboard | `/dashboard` | Shows the student summary, quick navigation buttons, task creation form, and notification pop-up. |
| Schedule | `/schedule` | Shows the weekly class schedule. |
| Tasks | `/tasks` | Shows all assignments and links to task details. |
| Task Detail | `/tasks/1`, `/tasks/2`, etc. | Shows full assignment details and a complete button. |
| Documents | `/documents` | Uploads documents to the server and shows saved class files. |
| Settings | `/settings` | Shows future automation settings. |

## Project Structure

```text
app/
+-- page.tsx                  # Login page
+-- api/
|   +-- documents/
|   |   +-- route.ts          # Upload and list documents
|   |   +-- [id]/
|   |       +-- route.ts      # Get and delete one document
|   |       +-- download/
|   |           +-- route.ts  # Download uploaded file
|   +-- tasks/
|       +-- route.ts          # Create and list tasks
|       +-- [id]/
|           +-- route.ts      # Get, edit, and delete one task
+-- login/
|   +-- page.tsx              # Login route
+-- dashboard/
|   +-- page.tsx              # Dashboard page
+-- schedule/
|   +-- page.tsx              # Schedule page
+-- tasks/
|   +-- page.tsx              # Task list page
|   +-- [id]/
|       +-- page.tsx          # Task detail page
+-- documents/
|   +-- page.tsx              # Documents page
+-- settings/
|   +-- page.tsx              # Settings page
+-- components/
|   +-- app-shell.tsx         # Shared sidebar and page layout
|   +-- dashboard-notifications-dialog.tsx
|   +-- documents-manager.tsx # Document upload, download, replace, and delete UI
|   +-- login-form.tsx        # Login form component
|   +-- task-complete-button.tsx
+-- lib/
|   +-- document-store.ts     # Local document metadata and file storage helpers
|   +-- task-store.ts         # Local task storage helpers
+-- data.ts                   # Sample schedule, tasks, documents, and helper functions
data/
+-- documents.json            # Saved document metadata during local development
+-- tasks.json                # Saved task data during local development
+-- uploads/                  # Uploaded document files during local development
```

## Technology Used

- Next.js
- React
- TypeScript
- Tailwind CSS

## How to Run

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open the website:

```text
http://localhost:3000
```

Build the project:

```bash
npm run build
```

Run lint checks:

```bash
npm run lint
```

## Current Status

This project currently includes the pages, navigation flow, task server actions, document upload server actions, and responsive layouts. The login, dashboard, tasks, documents, schedule, notification dialog, and settings screens are ready as a working local prototype.

The schedule sample data is stored in `app/data.ts`. Created, edited, and deleted tasks are saved on the server in `data/tasks.json` during local development.

Uploaded documents are saved on the server in `data/uploads/`, and their file information is saved in `data/documents.json` during local development. The Documents page can upload a file, download the saved file, replace it with a new file, and delete it after confirmation.

## Future Development

The next development phase is to connect the frontend to a real backend.

Recommended next steps:

1. Add real authentication.
2. Connect a SQL database for users, classes, tasks, and documents.
3. Move document files from local storage to cloud storage for production.
4. Add a deadline checker using a cron job or scheduled task.
5. Connect Telegram Bot API for reminders.
6. Connect Gmail or an email service for email notifications.
7. Make the system save task status changes permanently.

## Project Goal

The goal of this project is to help students organize classwork and reduce missed deadlines by keeping schedules, assignments, documents, and reminders in one automated website.
