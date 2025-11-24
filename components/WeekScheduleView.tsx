import { ProgramWeek } from "@/app/data/program-weeks";

type WeekScheduleViewProps = {
  week?: ProgramWeek;
  weekNumber: number;
  title?: string;
  focusLabel?: string;
  emptyWeekTitle?: string;
  emptyWeekDescription?: string;
};

export function WeekScheduleView({
  week,
  weekNumber,
  title,
  focusLabel = "Fokus",
  emptyWeekTitle = "Inget program",
  emptyWeekDescription = "Ingen data för veckan.",
}: WeekScheduleViewProps) {
  return (
    <div className="card bg-base-200 border border-base-300 shadow-md">
      <div className="card-body gap-6">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral">
              Vecka {weekNumber}
            </p>
            <h2 className="text-3xl font-semibold">
              {week ? week.label : emptyWeekTitle}
            </h2>
            <p className="text-sm text-base-content/70">
              {week
                ? `${focusLabel}: ${week.focus}`
                : emptyWeekDescription}
            </p>
          </div>
          {title && <p className="badge badge-lg badge-outline">{title}</p>}
        </div>

        {week ? (
          <div className="grid grid-cols-1 gap-1 md:grid-cols-2 xl:grid-cols-7">
            {week.days.map((day) => (
              <article
                key={day.id}
                className="flex min-h-[600px] flex-col rounded-2xl border border-dashed border-base-200 bg-base-300 p-2"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-neutral">
                      {day.label}
                    </p>
                    <p className="text-xs text-base-content/60">
                      {day.modules.length} pass
                    </p>
                  </div>
                </div>

                <div className="mt-3 flex-1 space-y-2">
                  {day.modules.map((module, index) => (
                    <div
                      key={`${day.id}-${index}-${module.title}`}
                      className="space-y-2 rounded-xl border border-base-200 bg-base-100 p-3"
                    >
                      <div className="flex items-center justify-between text-[11px] text-base-content/60">
                        <span className="badge badge-outline badge-xs capitalize">
                          {module.focus}
                        </span>
                        <span className="font-medium text-base-content">
                          {module.duration}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-base-content">
                        {module.title}
                      </p>
                      <p className="text-xs text-base-content/70">{module.intent}</p>
                    </div>
                  ))}

                  {day.modules.length === 0 && (
                    <p className="flex min-h-[120px] items-center justify-center rounded-xl border border-dashed border-base-200 bg-base-100/60 p-4 text-center text-xs text-base-content/60">
                      Inga pass schemalagda.
                    </p>
                  )}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-base-300 bg-base-100/60 p-6 text-center text-sm text-base-content/70">
            Tom vecka.
          </div>
        )}
      </div>
    </div>
  );
}
