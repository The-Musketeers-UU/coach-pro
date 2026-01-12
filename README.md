## Coach Pro

A role-aware Next.js app for coaches who plan weekly training programs for their athletes. Coaches create reusable modules (with details like duration, distance, weight, and subjective feedback fields) and assign them to ISO weeks; athletes sign in to review the assigned sessions. Supabase handles authentication and data storage, with Prisma managing the schema.

### Key features

- **Coach workflows:** Build reusable training modules, drag them into week/day slots, save the week with a title, and assign it to an athlete. Weeks can be re-opened for edits from the dashboard.
- **Athlete experience:** Athletes see their current week’s schedule and session details after signing in. Navigation routes users to the appropriate coach or athlete area based on their profile.
- **Supabase-backed data:** Modules, athletes, and schedules are stored in Supabase via REST calls. Prisma migrations keep the Supabase schema in sync (see `docs/supabase-prisma.md`). Row-level security rules are required for the client-side anon key; see `docs/rls-policies.md`.
- **UI stack:** Next.js App Router, Tailwind CSS, and DaisyUI components with client-side data fetching.

## Getting started

1. Install dependencies:
   ```bash
   npm install
   ```
2. Configure environment variables (e.g., in `.env.local`):
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>
   SUPABASE_SERVICE_ROLE_KEY=<service-role-key-for-server-requests>
   ```
3. Apply the Prisma schema to your Supabase project by following [docs/supabase-prisma.md](docs/supabase-prisma.md).
4. Start the development server:
   ```bash
   npm run dev
   ```
   The app runs at [http://localhost:3000](http://localhost:3000).

## Scripts

- `npm run dev` – start the development server
- `npm run build` – create a production build
- `npm run start` – serve the production build
- `npm run lint` – run ESLint
- `npm run seed` – populate Supabase with starter modules, schedules, and feedback

## Database seeding

Use the included seed script whenever you need to reset Supabase with useful starter data:

```bash
npm run seed
```

The script reads `data/seed-data.json`, creates the listed modules for every coach, and assigns the provided schedule templates
– including starter feedback – to all athletes. Coaches and athletes must already exist in Supabase; the script pairs athletes
round-robin with the available coaches. Pass a different JSON path to seed from another file:

```bash
npm run seed -- ./path/to/custom-data.json
```

## Project structure highlights

- `app/(app)/schedule_builder` – coach-facing schedule builder UI
- `app/(app)/dashboard` – coach dashboard to review/modify scheduled weeks per athlete
- `app/(app)/athlete` – athlete-facing weekly schedule
- `components/` – shared UI components (navigation, schedule/ module forms, etc.)
- `lib/supabase/` – Supabase REST helpers for browser/server usage
- `prisma/` – Prisma schema and migrations for Supabase
