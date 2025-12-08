# Supabase RLS policies for Coach Pro

Coach Pro uses the Supabase anon key on the client, so **every data call is subject to row-level security (RLS)**. The app assumes the authenticated user can only read or mutate rows they own (coach) or participate in (athlete). This guide lists recommended policies and a quick process to replace any existing rules that block editing modules or schedules.

## Tables and roles at a glance

| Table | Who should read | Who should write |
| --- | --- | --- |
| `user` | Authenticated users (coaches need to list athletes) | The authenticated user for their own row (or service role) |
| `module` | Owner coach | Owner coach |
| `scheduleWeek` | Owner coach **and** assigned athlete | Owner coach |
| `scheduleDay` | Owner coach **and** assigned athlete of its parent week | Owner coach |
| `_ModuleToScheduleDay` (join table) | Owner coach **and** assigned athlete of the linked week | Owner coach |

## Policy SQL (copy/paste into the Supabase SQL editor)

> These statements **replace** existing policies with predictable names. Run them in the SQL Editor while connected as the service role (or an owner with `supabase_admin`).

### Common helpers

Enable RLS and clean up any conflicting policies first:

```sql
-- Enable RLS on every table we control
alter table public."user" enable row level security;
alter table public."module" enable row level security;
alter table public."scheduleWeek" enable row level security;
alter table public."scheduleDay" enable row level security;
alter table public."_ModuleToScheduleDay" enable row level security;

-- Drop old policies with these names if they exist (no-op if missing)
drop policy if exists "Users can read directory" on public."user";
drop policy if exists "Users manage own row" on public."user";
drop policy if exists "Modules readable by owner" on public."module";
drop policy if exists "Modules writable by owner" on public."module";
drop policy if exists "Weeks visible to participants" on public."scheduleWeek";
drop policy if exists "Weeks writable by owner" on public."scheduleWeek";
drop policy if exists "Days visible to participants" on public."scheduleDay";
drop policy if exists "Days writable by owner" on public."scheduleDay";
drop policy if exists "Days deletable by owner" on public."scheduleDay";
drop policy if exists "Links readable to participants" on public."_ModuleToScheduleDay";
drop policy if exists "Links writable by owner" on public."_ModuleToScheduleDay";
```

### `user`

Coaches need to list athletes, so allow any authenticated user to read; writes are limited to the user’s own row.

```sql
create policy "Users can read directory"
  on public."user"
  for select
  to authenticated
  using (true);

create policy "Users manage own row"
  on public."user"
  for all
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());
```

### `module`

Modules are coach-owned. All CRUD is tied to `owner = auth.uid()`.

```sql
create policy "Modules readable by owner"
  on public."module"
  for select
  to authenticated
  using (owner = auth.uid());

create policy "Modules writable by owner"
  on public."module"
  for all
  to authenticated
  using (owner = auth.uid())
  with check (owner = auth.uid());
```

### `scheduleWeek`

Coaches own the week; athletes can read their assignment.

```sql
create policy "Weeks visible to participants"
  on public."scheduleWeek"
  for select
  to authenticated
  using (owner = auth.uid() or athlete = auth.uid());

create policy "Weeks writable by owner"
  on public."scheduleWeek"
  for all
  to authenticated
  using (owner = auth.uid())
  with check (owner = auth.uid());
```

### `scheduleDay`

Visibility and writes are inherited from the parent `scheduleWeek`.

```sql
create policy "Days visible to participants"
  on public."scheduleDay"
  for select
  to authenticated
  using (
    exists (
      select 1
      from public."scheduleWeek" sw
      where sw.id = "weekId" and (sw.owner = auth.uid() or sw.athlete = auth.uid())
    )
  );

create policy "Days writable by owner"
  on public."scheduleDay"
  for insert, update
  to authenticated
  using (
    exists (
      select 1
      from public."scheduleWeek" sw
      where sw.id = "weekId" and sw.owner = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public."scheduleWeek" sw
      where sw.id = "weekId" and sw.owner = auth.uid()
    )
  );

create policy "Days deletable by owner"
  on public."scheduleDay"
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public."scheduleWeek" sw
      where sw.id = "weekId" and sw.owner = auth.uid()
    )
  );
```

### `_ModuleToScheduleDay`

Read access is allowed for week participants; writes are restricted to the week’s owner.

```sql
create policy "Links readable to participants"
  on public."_ModuleToScheduleDay"
  for select
  to authenticated
  using (
    exists (
      select 1
      from public."scheduleDay" sd
      join public."scheduleWeek" sw on sw.id = sd."weekId"
      -- The join table columns are Pascal-case ("A" = module id, "B" = schedule day id)
      where sd.id = "_ModuleToScheduleDay"."B"
        and (sw.owner = auth.uid() or sw.athlete = auth.uid())
    )
  );

create policy "Links writable by owner"
  on public."_ModuleToScheduleDay"
  for all
  to authenticated
  using (
    exists (
      select 1
      from public."scheduleDay" sd
      join public."scheduleWeek" sw on sw.id = sd."weekId"
      where sd.id = "_ModuleToScheduleDay"."B"
        and sw.owner = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public."scheduleDay" sd
      join public."scheduleWeek" sw on sw.id = sd."weekId"
      where sd.id = "_ModuleToScheduleDay"."B"
        and sw.owner = auth.uid()
    )
  );
```

## Verifying the new policies

1. In Supabase, open **Authentication → Users** and pick a coach or athlete; grab their JWT from **Generate JWT**.
2. Open the **SQL Editor**, click the **gear icon → Use custom JWT**, and paste the token. Queries now run as that user.
3. Run sanity checks:
   - `select * from public.module;` should return only the coach’s modules.
   - `select * from public.scheduleWeek;` should return weeks where the user is owner or athlete.
   - `select * from public.scheduleDay;` and `select * from public."_ModuleToScheduleDay";` should match the same weeks.
   - Try an `insert` or `delete` as an athlete; it should be denied for weeks they do not own.
4. Switch the custom JWT to the service role to confirm the policies are not blocking migrations or admin tasks.

## Updating existing policies safely

1. **Back up** current policies: in the SQL Editor, run `select * from pg_policies where schemaname = 'public';` and save the results.
2. Apply the SQL blocks above. Supabase logs will show which policies were dropped/created.
3. Re-run the read queries with coach and athlete JWTs to confirm access aligns with expectations.
4. Redeploy the app. Because the client only uses the anon key, any RLS gap will surface immediately in the UI (empty objects in errors). Reverting is as simple as restoring the backed-up policy definitions.
