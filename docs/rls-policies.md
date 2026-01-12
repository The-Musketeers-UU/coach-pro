# Supabase RLS policies for Coach Pro

Coach Pro uses the Supabase anon key on the client, so every request is evaluated by row-level security. The SQL block below sets up predictable grants and policies that let an authenticated user manage their own profile, while coaches can manage their own training content, schedule templates, and training groups alongside their athletes.

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
alter table public."scheduleTemplate" enable row level security;
alter table public."scheduleDay" enable row level security;
alter table public."scheduleTemplateDay" enable row level security;
alter table public."_ModuleToScheduleDay" enable row level security;
alter table public."_ModuleToScheduleTemplateDay" enable row level security;
alter table public."scheduleModuleFeedback" enable row level security;
alter table public."trainingGroup" enable row level security;
alter table public."trainingGroupCoach" enable row level security;
alter table public."trainingGroupAthlete" enable row level security;

-- Remove conflicting policies
\timing off

drop policy if exists "Users can read directory" on public."user";
drop policy if exists "Users manage own row" on public."user";
drop policy if exists "Modules readable by owner" on public."module";
drop policy if exists "Modules readable to participants" on public."module";
drop policy if exists "Modules writable by owner" on public."module";
drop policy if exists "Weeks visible to participants" on public."scheduleWeek";
drop policy if exists "Weeks writable by owner" on public."scheduleWeek";
drop policy if exists "Templates readable by owner" on public."scheduleTemplate";
drop policy if exists "Templates writable by owner" on public."scheduleTemplate";
drop policy if exists "Days visible to participants" on public."scheduleDay";
drop policy if exists "Days insertable by owner" on public."scheduleDay";
drop policy if exists "Days updatable by owner" on public."scheduleDay";
drop policy if exists "Days deletable by owner" on public."scheduleDay";
drop policy if exists "Template days readable by owner" on public."scheduleTemplateDay";
drop policy if exists "Template days writable by owner" on public."scheduleTemplateDay";
drop policy if exists "Links readable to participants" on public."_ModuleToScheduleDay";
drop policy if exists "Links writable by owner" on public."_ModuleToScheduleDay";
drop policy if exists "Template links readable by owner" on public."_ModuleToScheduleTemplateDay";
drop policy if exists "Template links writable by owner" on public."_ModuleToScheduleTemplateDay";
drop policy if exists "Feedback readable to participants" on public."scheduleModuleFeedback";
drop policy if exists "Feedback writable by participants" on public."scheduleModuleFeedback";
drop policy if exists "Training groups readable by authenticated" on public."trainingGroup";
drop policy if exists "Training groups writable by head coach" on public."trainingGroup";
drop policy if exists "Group coaches readable by members" on public."trainingGroupCoach";
drop policy if exists "Group coaches insertable by head coach" on public."trainingGroupCoach";
drop policy if exists "Group coaches updatable by member or head coach" on public."trainingGroupCoach";
drop policy if exists "Group coaches deletable by member or head coach" on public."trainingGroupCoach";
drop policy if exists "Group athletes readable by members" on public."trainingGroupAthlete";
drop policy if exists "Group athletes insertable by head coach or athlete" on public."trainingGroupAthlete";
drop policy if exists "Group athletes updatable by member or head coach" on public."trainingGroupAthlete";
drop policy if exists "Group athletes deletable by member or head coach" on public."trainingGroupAthlete";

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

-- scheduleTemplate: owned by coach
create policy "Templates readable by owner"
  on public."scheduleTemplate"
  for select
  to authenticated
  using (owner = auth.uid());

create policy "Templates writable by owner"
  on public."scheduleTemplate"
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

-- scheduleTemplateDay: tied to scheduleTemplate ownership
create policy "Template days readable by owner"
  on public."scheduleTemplateDay"
  for select
  to authenticated
  using (
    exists (
      select 1
      from public."scheduleTemplate" st
      where st.id = "templateId" and st.owner = auth.uid()
    )
  );

create policy "Template days writable by owner"
  on public."scheduleTemplateDay"
  for all
  to authenticated
  using (
    exists (
      select 1
      from public."scheduleTemplate" st
      where st.id = "templateId" and st.owner = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public."scheduleTemplate" st
      where st.id = "templateId" and st.owner = auth.uid()
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

-- Join table linking modules to schedule template days
create policy "Template links readable by owner"
  on public."_ModuleToScheduleTemplateDay"
  for select
  to authenticated
  using (
    exists (
      select 1
      from public."scheduleTemplateDay" std
      join public."scheduleTemplate" st on st.id = std."templateId"
      where std.id = "_ModuleToScheduleTemplateDay"."B"
        and st.owner = auth.uid()
    )
  );

create policy "Template links writable by owner"
  on public."_ModuleToScheduleTemplateDay"
  for all
  to authenticated
  using (
    exists (
      select 1
      from public."scheduleTemplateDay" std
      join public."scheduleTemplate" st on st.id = std."templateId"
      where std.id = "_ModuleToScheduleTemplateDay"."B"
        and st.owner = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public."scheduleTemplateDay" std
      join public."scheduleTemplate" st on st.id = std."templateId"
      where std.id = "_ModuleToScheduleTemplateDay"."B"
        and st.owner = auth.uid()
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

-- Training groups: searchable by authenticated users, writable by head coach
create policy "Training groups readable by authenticated"
  on public."trainingGroup"
  for select
  to authenticated
  using (true);

create policy "Training groups writable by head coach"
  on public."trainingGroup"
  for all
  to authenticated
  using (headCoach = auth.uid())
  with check (headCoach = auth.uid());

-- Training group coaches
create policy "Group coaches readable by members"
  on public."trainingGroupCoach"
  for select
  to authenticated
  using (
    coach = auth.uid()
    or exists (
      select 1
      from public."trainingGroup" tg
      where tg.id = "group" and tg."headCoach" = auth.uid()
    )
    or (
      exists (
        select 1
        from public."trainingGroupCoach" tgc
        where tgc."group" = "group" and tgc.coach = auth.uid() and tgc.status = 'accepted'
      )
      and status = 'accepted'
    )
    or (
      exists (
        select 1
        from public."trainingGroupAthlete" tga
        where tga."group" = "group" and tga.athlete = auth.uid() and tga.status = 'accepted'
      )
      and status = 'accepted'
    )
  );

create policy "Group coaches insertable by head coach"
  on public."trainingGroupCoach"
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public."trainingGroup" tg
      where tg.id = "group" and tg."headCoach" = auth.uid()
    )
  );

create policy "Group coaches updatable by member or head coach"
  on public."trainingGroupCoach"
  for update
  to authenticated
  using (
    coach = auth.uid()
    or exists (
      select 1
      from public."trainingGroup" tg
      where tg.id = "group" and tg."headCoach" = auth.uid()
    )
  )
  with check (
    coach = auth.uid()
    or exists (
      select 1
      from public."trainingGroup" tg
      where tg.id = "group" and tg."headCoach" = auth.uid()
    )
  );

create policy "Group coaches deletable by member or head coach"
  on public."trainingGroupCoach"
  for delete
  to authenticated
  using (
    coach = auth.uid()
    or exists (
      select 1
      from public."trainingGroup" tg
      where tg.id = "group" and tg."headCoach" = auth.uid()
    )
  );

-- Training group athletes
create policy "Group athletes readable by members"
  on public."trainingGroupAthlete"
  for select
  to authenticated
  using (
    athlete = auth.uid()
    or exists (
      select 1
      from public."trainingGroup" tg
      where tg.id = "group" and tg."headCoach" = auth.uid()
    )
    or (
      exists (
        select 1
        from public."trainingGroupCoach" tgc
        where tgc."group" = "group" and tgc.coach = auth.uid() and tgc.status = 'accepted'
      )
      and status = 'accepted'
    )
    or (
      exists (
        select 1
        from public."trainingGroupAthlete" tga
        where tga."group" = "group" and tga.athlete = auth.uid() and tga.status = 'accepted'
      )
      and status = 'accepted'
    )
  );

create policy "Group athletes insertable by head coach or athlete"
  on public."trainingGroupAthlete"
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public."trainingGroup" tg
      where tg.id = "group" and tg."headCoach" = auth.uid()
    )
    or (athlete = auth.uid() and status = 'requested')
  );

create policy "Group athletes updatable by member or head coach"
  on public."trainingGroupAthlete"
  for update
  to authenticated
  using (
    athlete = auth.uid()
    or exists (
      select 1
      from public."trainingGroup" tg
      where tg.id = "group" and tg."headCoach" = auth.uid()
    )
  )
  with check (
    athlete = auth.uid()
    or exists (
      select 1
      from public."trainingGroup" tg
      where tg.id = "group" and tg."headCoach" = auth.uid()
    )
  );

create policy "Group athletes deletable by member or head coach"
  on public."trainingGroupAthlete"
  for delete
  to authenticated
  using (
    athlete = auth.uid()
    or exists (
      select 1
      from public."trainingGroup" tg
      where tg.id = "group" and tg."headCoach" = auth.uid()
    )
  );
```
