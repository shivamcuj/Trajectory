# Trajectory — Engineering Student Timeline Portfolio

A zero-login personal portfolio timeline app for B.Tech students to log, organize, and showcase their academic journey. Anyone can view; only the admin can edit after unlocking with a server-verified password.

Built with [TanStack Start](https://tanstack.com/start), React 19, Supabase (Database + Storage), Tailwind CSS v4, and shadcn/ui. Deployed on Cloudflare Workers.

## Features

### 1. Profile Hero Dashboard
- Avatar photo, name, tagline, and bio in a gradient banner
- Personalized greeting with student's name
- Quick-filter category buttons with entry counts

### 2. Timeline Entry CRUD
- Create entries with title, category, date, academic year/semester, description, issuer, credential URL, and skills/tags
- Edit and delete entries via a modal dialog
- Reverse-chronological timeline grouped by month and year
- Upload file attachments (images, PDFs, DOCX, TXT, MD) and add URL links

### 3. Admin Password Unlock
- **View mode** (default): read-only — no edit/delete buttons, no "New entry" button
- Click **"Unlock to edit"** in the header to open a password dialog
- Password is verified server-side against the `ADMIN_PASSWORD` environment variable using TanStack Start server functions
- Lock icon switches to a Lock button; session is ephemeral (resets on page refresh)

### 4. Category System

| Category | Icon | Color |
|---|---|---|
| Academic Learning | GraduationCap | Blue |
| Course / Certification | Award | Green |
| Project / Design | Wrench | Orange |
| Skill | Sparkles | Purple |
| Milestone | Trophy | Gold |

### 5. Search & Filtering
- Full-text search across title, description, issuer, skills, and tags
- Filters by category, academic year, and skill
- Active filter chips with match count
- Clear all filters option

### 6. Responsive Design
- Mobile-friendly with adaptive layouts
- Sticky header with backdrop blur
- Smooth transitions and hover effects

### 7. Dark Mode
- Full light/dark theme with OKLCH color space
- Category colors adapt for dark mode

### 8. Error Handling
- Custom error boundary with "Try again" and "Go home" options
- Toast notifications for success/error states
- Form validation (required fields, URL format)

## Tech Stack

- **Framework**: React 19 + TanStack Start (SSR on Cloudflare Workers)
- **Routing**: TanStack Router (file-based)
- **Bundler**: Vite 7 + Cloudflare Vite Plugin
- **Styling**: Tailwind CSS v4 + tw-animate-css
- **Backend**: Supabase (Database + Storage)
- **UI**: shadcn/ui (Radix primitives) + Lucide icons
- **Language**: TypeScript 5.8
- **Deployment**: Cloudflare Workers (via Wrangler)

## Getting Started

### Prerequisites
- Node.js 18+
- A Supabase project (free tier works)
- A Cloudflare account (for deployment)

### Installation

```bash
git clone <repo-url>
cd trajectory
npm install
```

### Environment Variables

Create a `.env` file at the project root:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_PUBLISHABLE_KEY=your-anon-key
```

> `VITE_*` variables are baked into the client bundle at build time. The same non-VITE versions are read server-side by the SSR worker at runtime.

For admin password gating (optional locally, required in production):

```env
ADMIN_PASSWORD=your-secret-password
```

`ADMIN_PASSWORD` is only read server-side (in `src/lib/verify-password.ts`). Never expose it client-side.

#### How to Get Supabase Variables

**Supabase URL**
1. Go to your Supabase project dashboard → **Project Settings** → **API**
2. Under **Project URL**, copy the URL (e.g. `https://xxxxx.supabase.co`)
3. Use the same value for both `VITE_SUPABASE_URL` and `SUPABASE_URL`

**Supabase Anon / Publishable Key**
1. In your Supabase project dashboard → **Project Settings** → **API**
2. Under **Project API keys**, find the **anon public** key
3. Use the same value for both `VITE_SUPABASE_PUBLISHABLE_KEY` and `SUPABASE_PUBLISHABLE_KEY`

### Database Setup

The app uses two Supabase tables: `timeline_entries` and `attachments`.

**If starting from scratch**, create them via the Supabase SQL Editor:

```sql
-- timeline_entries
CREATE TABLE timeline_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  date DATE NOT NULL,
  academic_year TEXT,
  semester TEXT,
  description TEXT NOT NULL,
  issuer TEXT,
  credential_url TEXT,
  skills TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- attachments
CREATE TABLE attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id UUID NOT NULL REFERENCES timeline_entries(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  url TEXT,
  file_path TEXT,
  filename TEXT,
  label TEXT,
  file_type TEXT,
  file_size BIGINT,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

**If converting an existing project** that had auth and per-user RLS, run:

```sql
ALTER TABLE timeline_entries DROP COLUMN user_id CASCADE;
ALTER TABLE timeline_entries DISABLE ROW LEVEL SECURITY;
DROP TABLE IF EXISTS profiles CASCADE;
```

### Development

```bash
npm run dev
```

Open `http://localhost:5173` in your browser.

### Build & Preview

```bash
npm run build
npm run preview
```

## Deployment

### Deploy to Cloudflare Workers

```bash
# Login to Cloudflare
npx wrangler login

# Set environment secrets
npx wrangler secret put SUPABASE_URL
npx wrangler secret put SUPABASE_PUBLISHABLE_KEY
npx wrangler secret put ADMIN_PASSWORD

# Build and deploy
npm run deploy
```

The worker is configured in `wrangler.jsonc` with `nodejs_compat` flag, compatibility date `2025-09-24`, and points to `dist/server/server.js` with static assets in `dist/client/`.

### Deploy Shortcut

```bash
npm run deploy    # builds and deploys in one step
```

## Project Structure

```
src/
├── components/           # App components
│   ├── ui/               # shadcn/ui components
│   ├── app-header.tsx    # Sticky header with unlock/lock toggle
│   ├── timeline-entry-card.tsx  # Entry card with edit/delete dropdown
│   ├── entry-form-dialog.tsx     # Create/edit entry modal
│   └── admin-unlock-dialog.tsx   # Password dialog for edit mode
├── integrations/supabase/  # Supabase client + generated types
├── lib/                   # Utilities, types, profile
│   ├── profile.ts         # Profile data (name, photo, tagline, bio)
│   ├── verify-password.ts # Server function for password verification
│   ├── edit-mode-context.tsx  # React context for unlock/lock state
│   └── types.ts           # TypeScript type aliases
├── routes/                # TanStack Router file-based routes
├── router.tsx             # Router configuration
├── routeTree.gen.ts       # Auto-generated route tree
└── styles.css             # Tailwind v4 + custom theme (dark/light)
```

## License

MIT
