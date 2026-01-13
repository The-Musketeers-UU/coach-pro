import type { Athlete, TrainingGroup } from "@/components/schedulebuilder/types";

type AssignScheduleModalProps = {
  isOpen: boolean;
  athletes: Athlete[];
  trainingGroups: TrainingGroup[];
  selectedGroupIds: string[];
  selectedAthletes: string[];
  scheduleTitle: string;
  onScheduleTitleChange: (value: string) => void;
  weekOptions: { value: string; label: string }[];
  selectedWeek: string;
  onWeekChange: (value: string) => void;
  toggleGroupSelection: (groupId: string) => void;
  toggleAthleteSelection: (athleteId: string) => void;
  isAssigning?: boolean;
  errorMessage?: string | null;
  successMessage?: string | null;
  onClose: () => void;
  onAssign: () => void;
};

export function AssignScheduleModal({
  isOpen,
  athletes,
  trainingGroups,
  selectedGroupIds,
  selectedAthletes,
  scheduleTitle,
  onScheduleTitleChange,
  weekOptions,
  selectedWeek,
  onWeekChange,
  toggleGroupSelection,
  toggleAthleteSelection,
  isAssigning = false,
  errorMessage,
  successMessage,
  onClose,
  onAssign,
}: AssignScheduleModalProps) {
  return (
    <dialog className={`modal ${isOpen ? "modal-open" : ""}`}>
      <div className="modal-box flex max-h-[70vh] max-w-md flex-col">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-xl font-semibold">Tilldela schema</h3>
          </div>
          <button className="btn btn-circle btn-ghost btn-sm" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="space-y-4 py-4">
          {errorMessage && (
            <div className="alert alert-error text-sm">{errorMessage}</div>
          )}
          {successMessage && (
            <div className="alert alert-success text-sm">{successMessage}</div>
          )}
          <label className="form-control flex flex-col gap-1">
            <span className="label-text text-sm">Vecka</span>
            <select
              className="select select-sm select-bordered w-full"
              value={selectedWeek}
              onChange={(event) => onWeekChange(event.target.value)}
              required
            >
              {weekOptions.map((week) => (
                <option key={week.value} value={week.value}>
                  {week.label}
                </option>
              ))}
            </select>
          </label>
          <label className="form-control flex flex-col gap-1">
            <span className="label-text text-sm">Schematitel (valfritt)</span>
            <input
              type="text"
              className="input input-sm input-bordered w-full"
              value={scheduleTitle}
              onChange={(event) => onScheduleTitleChange(event.target.value)}
              placeholder="Ange schematitel"
            />
          </label>
          <section className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral">
              Träningsgrupper
            </p>
            {trainingGroups.length === 0 ? (
              <p className="text-sm text-base-content/60">
                Du har inga träningsgrupper ännu.
              </p>
            ) : (
              <div className="grid gap-2">
                {trainingGroups.map((group) => {
                  const isSelected = selectedGroupIds.includes(group.id);
                  const hasAthletes = group.athletes.length > 0;

                  return (
                    <label
                      key={group.id}
                      className={`flex cursor-pointer items-center justify-between gap-2 rounded-xl border border-base-200 bg-base-50 px-3 py-2 text-sm hover:border-base-300 ${
                        !hasAthletes ? "opacity-60" : ""
                      }`}
                    >
                      <div>
                        <p className="font-semibold">{group.name}</p>
                        <p className="text-xs text-base-content/60">
                          {group.athletes.length} aktiva
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        className="checkbox checkbox-sm"
                        checked={isSelected}
                        onChange={() => toggleGroupSelection(group.id)}
                        disabled={!hasAthletes}
                      />
                    </label>
                  );
                })}
              </div>
            )}
          </section>

          <section className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral">Aktiva</p>
            <div className="max-h-56 overflow-y-auto pr-1">
              <div className="grid gap-2">
                {athletes.map((athlete) => (
                  <label
                    key={athlete.id}
                    className="flex cursor-pointer items-center justify-between gap-2 rounded-xl border border-base-200 bg-base-50 px-3 py-2 text-sm hover:border-base-300"
                  >
                    <div>
                      <p className="font-semibold">{athlete.name}</p>
                      <p className="text-xs text-base-content/60">{athlete.sport}</p>
                    </div>
                    <input
                      type="checkbox"
                      className="checkbox checkbox-sm"
                      checked={selectedAthletes.includes(athlete.id)}
                      onChange={() => toggleAthleteSelection(athlete.id)}
                    />
                  </label>
                ))}
              </div>
            </div>
          </section>
        </div>

        <div className="mt-auto flex flex-col gap-2 pt-4 sm:flex-row sm:justify-end">
          <button className="btn" onClick={onClose}>
            Avbryt
          </button>
          <button
            className={`btn btn-secondary ${isAssigning ? "loading" : ""}`}
            onClick={onAssign}
            disabled={isAssigning}
          >
            {isAssigning ? "Tilldelar..." : "Tilldela"}
          </button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop" onSubmit={onClose}>
        <button>close</button>
      </form>
    </dialog>
  );
}
