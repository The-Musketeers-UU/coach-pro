ALTER TABLE "scheduleWeek"
ADD COLUMN "year" INTEGER NOT NULL DEFAULT date_part('year', now())::int;
