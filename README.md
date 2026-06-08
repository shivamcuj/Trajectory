# Profolio — Engineering Student Timeline Portfolio

A professional timeline portfolio for first-year B.Tech students to log, organize, and showcase their academic journey. Built with TanStack Start, React 19, Supabase, Tailwind CSS v4, and shadcn/ui.

## Features

### 1. User Authentication
- Email/password sign-up and sign-in
- Persistent sessions via Supabase
- Protected routes — unauthenticated users are redirected to `/auth`
- Auto-created user profiles on sign-up

### 2. Timeline Entry CRUD
- Create entries with title, category, date, academic year/semester, description, issuer, credential URL, skills/tags
- Edit and delete entries via a modal dialog
- Reverse-chronological timeline grouped by month/year

### 3. Attachments (Files & Links)
- Upload files (images, PDFs, DOCX, TXT, MD) to Supabase Storage
- Add URL links with labels
- View/download files via signed URLs
- All storage scoped per user (`{userId}/{entryId}/`)

### 4. Category System
| Category | Icon | Color |
|---|---|---|
| Academic Learning | GraduationCap | Blue |
| Course / Certification | Award | Green |
| Project / Design | Wrench | Orange |
| Skill | Sparkles | Purple |
| Milestone | Trophy | Gold |

Quick-filter by category from the hero dashboard.

### 5. Search & Filtering
- Full-text search across title, description, issuer, skills, and tags
- Filters by category, academic year, and skill
- Active filter chips with match count
- Clear all filters option

### 6. Hero Dashboard
- Gradient banner with tagline
- Category stat buttons for quick filtering
- Decorative blur elements

### 7. Responsive Design
- Mobile-friendly with adaptive layouts
- Sticky header with backdrop blur
- Smooth transitions and hover effects

### 8. Dark Mode
- Full light/dark theme with OKLCH color space
- Category colors adapt for dark mode

### 9. Error Handling
- Custom error boundary with "Try again" and "Go home" options
- Toast notifications for success/error states
- Form validation (required fields, URL format)

### 10. Security (RLS)
- Row-Level Security on all tables
- Users can only access their own data
- Storage bucket policies per user folder

### 11. 46 shadcn/ui Components
Full library of Radix-based UI components (dialog, dropdown, form, select, calendar, chart, sidebar, etc.)

## Tech Stack

- **Framework**: React 19 + TanStack Start (SSR)
- **Routing**: TanStack Router (file-based)
- **Bundler**: Vite 7
- **Styling**: Tailwind CSS v4 + tw-animate-css
- **Backend**: Supabase (Auth, Database, Storage)
- **UI**: shadcn/ui (Radix primitives) + Lucide icons
- **Language**: TypeScript 5.8
- **Deployment**: Cloudflare Workers (via Wrangler)

## Getting Started

### Prerequisites
- Node.js 18+ or Bun
- A Supabase project (free tier works)

### Installation

```bash
# Clone the repo
git clone <repo-url>
cd profolio

# Install dependencies
npm install
# or
bun install
```

### Environment Variables

Create a `.env` file at the project root with the following variables:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_PUBLISHABLE_KEY=your-anon-key
VITE_SUPABASE_PROJECT_ID=your-project-id
```

For server-side admin operations (optional):
```env
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

#### How to Get Each Variable

**Supabase Project ID** (`VITE_SUPABASE_PROJECT_ID`)
1. Go to [supabase.com](https://supabase.com) and log in
2. Open your project dashboard
3. The project ID is the subdomain in your project URL (e.g., in `https://ogevyhghfrneodwimfoe.supabase.co`, the ID is `ogevyhghfrneodwimfoe`)
4. Alternatively, go to **Project Settings** → **General** → **Reference ID**

**Supabase URL** (`VITE_SUPABASE_URL` / `SUPABASE_URL`)
1. In your Supabase project dashboard, go to **Project Settings** → **API**
2. Under **Project URL**, copy the URL (looks like `https://xxxxx.supabase.co`)
3. Use the same value for both `VITE_SUPABASE_URL` and `SUPABASE_URL`

**Supabase Anon / Publishable Key** (`VITE_SUPABASE_PUBLISHABLE_KEY` / `SUPABASE_PUBLISHABLE_KEY`)
1. In your Supabase project dashboard, go to **Project Settings** → **API**
2. Under **Project API keys**, find the **anon public** key (starts with `eyJ...`)
3. Use the same value for both `VITE_SUPABASE_PUBLISHABLE_KEY` and `SUPABASE_PUBLISHABLE_KEY`
4. This key is safe to expose in client-side code — it is restricted by Row-Level Security policies

**Supabase Service Role Key** (`SUPABASE_SERVICE_ROLE_KEY`) — *optional, for admin operations*
1. In your Supabase project dashboard, go to **Project Settings** → **API**
2. Under **Project API keys**, find the **service_role** key
3. **⚠️ WARNING**: This key bypasses all RLS policies. Never expose it client-side. Only use it in server-side code or Cloudflare Workers environment variables

### Database Setup

```bash
# Link to your Supabase project
npx supabase link --project-ref your-project-id

# Apply migrations
npx supabase db push

# (Optional) Regenerate TypeScript types
npx supabase gen types typescript --linked > src/integrations/supabase/types.ts
```

### Development

```bash
npm run dev
# or
bun run dev
```

Open `http://localhost:5173` in your browser.

### Build & Preview

```bash
# Production build
npm run build

# Preview the build locally
npm run preview
```

### Lint & Format

```bash
npm run lint
npm run format
```

## Deployment

### Deploy to Cloudflare Workers

```bash
# Login to Cloudflare (if not already)
npx wrangler whoami
npx wrangler login

# Deploy
npx wrangler deploy
```

Set the environment variables (`SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) in your Cloudflare dashboard or via `.dev.vars`.

The worker is configured in `wrangler.jsonc` with `nodejs_compat` flag and a compatibility date of `2025-09-24`.

## Project Structure

```
src/
├── components/          # App components (header, timeline card, entry form)
│   └── ui/              # shadcn/ui components (46 Radix-based)
├── hooks/               # Auth and mobile detection hooks
├── integrations/supabase # Supabase client, types, auth middleware
├── lib/                 # Utilities, category definitions, type aliases
├── routes/              # TanStack Router file-based routes
├── router.tsx           # Router config with error boundary
├── routeTree.gen.ts     # Auto-generated route tree
└── styles.css           # Tailwind v4 + custom theme (dark/light)
supabase/
├── config.toml          # Supabase project config
└── migrations/          # Database schema (tables, RLS, storage)
```

## License

MIT
