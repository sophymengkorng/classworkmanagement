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

## Supabase Login Setup

Create a `.env.local` file from `.env.example`, then add your Supabase project values:

```env
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="your-supabase-publishable-key"
NEXT_PUBLIC_SITE_URL="https://your-hosted-website.com"
SUPABASE_DOCUMENT_BUCKET="student-documents"
```

The login form uses Supabase email/password authentication. Students can switch between Login and Create Account on the same form. When Supabase is configured, `/dashboard` checks the authenticated session and redirects unsigned users back to `/login`.

If email confirmation is enabled in Supabase, a new student must confirm their email before logging in.

For hosting, add the same environment variables in your hosting dashboard, then redeploy the project. `NEXT_PUBLIC_SITE_URL` must be your deployed website URL, for example `https://student-class-work.vercel.app`, not `http://localhost:3000`.

In Supabase, also open **Authentication > URL Configuration** and set:

- **Site URL:** your hosted website URL
- **Redirect URLs:** your hosted callback URL, for example `https://student-class-work.vercel.app/auth/callback`
- Optional local redirect for development: `http://localhost:3000/auth/callback`

## Supabase Database Setup

Before deploying, open your Supabase project and run [supabase/schema.sql](</E:/Student_Class_Work/my-app/supabase/schema.sql>) in the Supabase SQL Editor.

This creates:

- `tasks` table for each user's assignments
- `documents` table for each user's document records
- `student-documents` private storage bucket for uploaded files
- Row Level Security policies so each logged-in user can only access their own data

After this setup, hosted users can create an account, log in, create tasks, edit tasks, delete tasks, upload documents, replace documents, download documents, and delete documents with data saved in Supabase instead of local JSON files.

## Current Status

This project currently includes the pages, navigation flow, Supabase login, protected system pages, logout, Supabase task storage, Supabase document storage, and responsive layouts. The login, dashboard, tasks, documents, schedule, notification dialog, and settings screens are ready as a working hosted prototype after the Supabase SQL setup is complete.

The schedule sample data is stored in `app/data.ts`. When Supabase environment variables are configured, created, edited, and deleted tasks are saved in the Supabase `tasks` table for the logged-in user. Without Supabase environment variables, local development falls back to `data/tasks.json`.

When Supabase environment variables are configured, uploaded documents are saved in Supabase Storage and their file information is saved in the Supabase `documents` table for the logged-in user. Without Supabase environment variables, local development falls back to `data/uploads/` and `data/documents.json`.

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
