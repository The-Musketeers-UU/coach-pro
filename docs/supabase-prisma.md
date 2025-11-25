# Syncing Prisma schemas to Supabase

If Supabase responds with `Could not find the table 'public.user' in the schema cache`, it usually means the tables defined in your Prisma schema have not been created in the Supabase database. Use Prisma to push your schema and ensure the table names match what Supabase expects.

## 1. Point Prisma at your Supabase database

Set the `DATABASE_URL` environment variable to the **service role** connection string for your Supabase project (Project Settings → Database → Connection string → URI). For example:

```bash
export DATABASE_URL="postgresql://postgres:<password>@db.<project>.supabase.co:6543/postgres"
```

Make sure the same value is available to Next.js locally (e.g., in `.env.local`) so migrations run against the correct database.

## 2. Apply your Prisma migrations to Supabase

If you already have migration files under `prisma/migrations`, deploy them directly to Supabase:

```bash
npx prisma migrate deploy --schema prisma/schema.prisma
npx prisma generate --schema prisma/schema.prisma
```

This applies every pending migration and refreshes the Prisma client.

## 3. Create tables when you do not have migrations yet

During early development you can push the current schema without creating migration files:

```bash
npx prisma db push --schema prisma/schema.prisma --skip-generate
npx prisma generate --schema prisma/schema.prisma
```

This will create the tables (or sync changes) in Supabase so PostgREST can see them.

## 4. Map Prisma models to Supabase table names

Supabase exposes the `public` schema through PostgREST, and it is best to avoid tables named `user` because `user` is a reserved word in Postgres. Make sure your Prisma models map to pluralized table names (e.g., `users`) so Supabase can find them:

```prisma
model User {
  id    String @id @default(cuid())
  email String @unique

  @@map("users")
}
```

The `@@map("users")` attribute tells Prisma to create/use a `public.users` table, which Supabase will expose without schema-cache errors.

## 5. Deploy migrations when you cannot run commands against Supabase

If you cannot run Prisma locally against the Supabase connection string (e.g., Vercel-hosted app without direct terminal access), run migrations from your CI/CD pipeline instead of your laptop:

1. **Store the Supabase service-role connection string as a secret in your CI provider.** On Vercel, add `DATABASE_URL` (service role) to **Project Settings → Environment Variables** and mark it for Production/Preview. Never expose the service role to the browser.
2. **Run `prisma migrate deploy` during the build/deploy step.** For Vercel, set the Install Command to:

   ```bash
   npm ci
   npx prisma migrate deploy --schema prisma/schema.prisma
   npx prisma generate --schema prisma/schema.prisma
   ```

   Keep your Build Command as `npm run build`. The migrations run against Supabase before the app is bundled.
3. **Alternative: GitHub Actions.** If you deploy with GitHub, add a workflow that installs dependencies and runs `prisma migrate deploy` using the `DATABASE_URL` secret. This keeps Supabase in sync even when you cannot connect directly.
