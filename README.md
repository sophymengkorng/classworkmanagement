# Student Classwork Automation System

A Next.js student assistant for managing class schedules, tasks, documents, profile information, and deadline notifications.

The app uses Supabase for authentication, database storage, and file storage. Each logged-in user only sees their own tasks, documents, notification reads, and profile data.

## Features

- Email/password account creation and login with Supabase Auth
- Protected system pages after login
- Dashboard with today's classes, task counts, recent tasks, and recent documents
- Quick task creation from the dashboard
- Full task create, edit, delete, and complete workflows
- Weekly SETEC SW35 (E-T) schedule
- Document upload, preview, replace, download, and delete
- Notification dropdown for tasks due tomorrow
- Notification read/unread saved to Supabase
- Editable profile with name, email, student ID, phone, and avatar
- Responsive layout for desktop and mobile

## Project Structure

```text
app/
  api/                         # Server API routes
    documents/                 # Document upload, replace, delete, download
    notifications/read/        # Mark notification as read
    profile/                   # Save profile details
    tasks/                     # Task CRUD API

  auth/callback/               # Supabase email confirmation callback
  dashboard/                   # Dashboard page
  documents/                   # Documents page
  login/                       # Login page
  schedule/                    # Schedule page
  tasks/                       # Tasks page and task detail page

  components/
    layout/                    # App shell, sidebar navigation, logout
    ui/                        # Shared UI components

  features/
    auth/                      # Login/create-account UI
    dashboard/                 # Dashboard-specific UI
    documents/                 # Document manager UI
    notifications/             # Notification dropdown UI
    profile/                   # Profile dialog UI
    settings/                  # Settings dialog UI
    tasks/                     # Task manager UI

  lib/
    stores/                    # Supabase data access modules
    supabase/                  # Supabase client/server config
    auth-error.ts              # Shared auth error handling
    require-auth.ts            # Protected-page helper

  data.ts                      # Static schedule, class info, and date helpers
```

## Data Storage

| Data | Supabase Location |
| --- | --- |
| Users/login | Supabase Auth |
| Profile details | `public.profiles` |
| Profile images | Storage bucket `student-avatars` |
| Tasks | `public.tasks` |
| Documents metadata | `public.documents` |
| Document files | Storage bucket `student-documents` |
| Notification read status | `public.notification_reads` |

## Environment Variables

Create `.env.local` from `.env.example`:

```env
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="your-supabase-publishable-key"
NEXT_PUBLIC_SITE_URL="https://your-hosted-website.com"
SUPABASE_DOCUMENT_BUCKET="student-documents"
SUPABASE_AVATAR_BUCKET="student-avatars"
```

Add the same variables in Vercel for Production and Preview.

## Supabase Setup

Run this in Supabase SQL Editor:

```text
supabase/schema.sql
```

If you need to fix storage or notification permissions separately, run:

```text
supabase/storage-policies.sql
supabase/avatar-storage-policies.sql
supabase/notification-reads-permissions.sql
```

Supabase Authentication URL Configuration:

- Site URL: your hosted website URL
- Redirect URL: your hosted website URL plus `/auth/callback`

Example:

```text
https://student-class-work.vercel.app/auth/callback
```

## Development

Install dependencies:

```bash
npm install
```

Start local development:

```bash
npm run dev
```

Check code:

```bash
npm run lint
npm run build
```

## Developer Guide

- Add page routes inside `app/<route>/page.tsx`.
- Add reusable layout or shared UI under `app/components`.
- Add page-specific UI under `app/features/<feature>`.
- Add database logic under `app/lib/stores`.
- Keep API routes thin: validate request data, call a store function, return JSON.
- Keep Supabase table and storage changes documented in `supabase/schema.sql`.

This structure keeps UI, server APIs, database access, and configuration separated so new developers can find the right file quickly.
