# Supabase RLS policies for Coach Pro

Coach Pro uses the Supabase anon key on the client, so every request is evaluated by row-level security. The SQL block below sets up predictable grants and policies that let an authenticated user manage their own profile, while coaches can manage their own training content and share it with assigned athletes.

Run the statements in the Supabase SQL Editor while connected as the service role (or an owner with `supabase_admin`). They replace any conflicting policies with known-good definitions.

## Full SQL (copy/paste)

```sql
-- Baseline grants so the authenticated role can interact with tables before RLS checks
grant usage on schema public to authenticated;
grant usage on schema public to anon;

grant select, insert, update, delete on all tables in schema public to authenticated;
grant select on all tables in schema public to anon;

grant usage, select on all sequences in schema public to authenticated;
grant usage, select on all sequences in schema public to anon;

-- Enable RLS everywhere we read/write
alter table public."user" enable row level security;
alter table public."module" enable row level security;
alter table public."scheduleWeek" enable row level security;
alter table public."scheduleDay" enable row level security;
alter table public."_ModuleToScheduleDay" enable row level security;
alter table public."scheduleModuleFeedback" enable row level security;

-- Remove conflicting policies
\timing off

drop policy if exists "Users can read directory" on public."user";
drop policy if exists "Users manage own row" on public."user";
drop policy if exists "Modules readable by owner" on public."module";
drop policy if exists "Modules readable to participants" on public."module";
drop policy if exists "Modules writable by owner" on public."module";
drop policy if exists "Weeks visible to participants" on public."scheduleWeek";
drop policy if exists "Weeks writable by owner" on public."scheduleWeek";
drop policy if exists "Days visible to participants" on public."scheduleDay";
drop policy if exists "Days insertable by owner" on public."scheduleDay";
drop policy if exists "Days updatable by owner" on public."scheduleDay";
drop policy if exists "Days deletable by owner" on public."scheduleDay";
drop policy if exists "Links readable to participants" on public."_ModuleToScheduleDay";
drop policy if exists "Links writable by owner" on public."_ModuleToScheduleDay";
drop policy if exists "Feedback readable to participants" on public."scheduleModuleFeedback";
drop policy if exists "Feedback writable by participants" on public."scheduleModuleFeedback";

-- User directory: anyone authenticated can read; only the matching user can write their own row
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

-- Modules: owned by coach, but athletes can read modules scheduled for them
create policy "Modules readable by owner"
  on public."module"
  for select
  to authenticated
  using (owner = auth.uid());

create policy "Modules readable to participants"
  on public."module"
  for select
  to authenticated
  using (
    owner = auth.uid()
    or exists (
      select 1
      from public."_ModuleToScheduleDay" msd
      join public."scheduleDay" sd on sd.id = msd."B"
      join public."scheduleWeek" sw on sw.id = sd."weekId"
      where msd."A" = "module".id and sw.athlete = auth.uid()
    )
  );

create policy "Modules writable by owner"
  on public."module"
  for all
  to authenticated
  using (owner = auth.uid())
  with check (owner = auth.uid());

-- scheduleWeek: owned by coach, readable by coach and assigned athlete
create policy "Weeks visible to participants"
  on public."scheduleWeek"
  for select
  to authenticated
  using (
    owner = auth.uid()
    or athlete = auth.uid()
  );

create policy "Weeks writable by owner"
  on public."scheduleWeek"
  for all
  to authenticated
  using (owner = auth.uid())
  with check (owner = auth.uid());

-- scheduleDay: tied to scheduleWeek ownership for writes, visible to owner and athlete
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

create policy "Days insertable by owner"
  on public."scheduleDay"
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public."scheduleWeek" sw
      where sw.id = "weekId" and sw.owner = auth.uid()
    )
  );

create policy "Days updatable by owner"
  on public."scheduleDay"
  for update
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

-- Join table linking modules to schedule days
create policy "Links readable to participants"
  on public."_ModuleToScheduleDay"
  for select
  to authenticated
  using (
    exists (
      select 1
      from public."scheduleDay" sd
      join public."scheduleWeek" sw on sw.id = sd."weekId"
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

-- Feedback entries tied to scheduled modules
create policy "Feedback readable to participants"
  on public."scheduleModuleFeedback"
  for select
  to authenticated
  using (
    exists (
      select 1
      from public."scheduleDay" sd
      join public."scheduleWeek" sw on sw.id = sd."weekId"
      where sd.id = "scheduleDayId" and (sw.owner = auth.uid() or sw.athlete = auth.uid())
    )
  );

create policy "Feedback writable by participants"
  on public."scheduleModuleFeedback"
  for all
  to authenticated
  using (
    exists (
      select 1
      from public."scheduleDay" sd
      join public."scheduleWeek" sw on sw.id = sd."weekId"
      where sd.id = "scheduleDayId" and (sw.owner = auth.uid() or sw.athlete = auth.uid())
    )
  )
  with check (
    exists (
      select 1
      from public."scheduleDay" sd
      join public."scheduleWeek" sw on sw.id = sd."weekId"
      where sd.id = "scheduleDayId" and (sw.owner = auth.uid() or sw.athlete = auth.uid())
    )
  );
```
