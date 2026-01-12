import type { Athlete, TrainingGroup } from "@/components/schedulebuilder/types";

type AssignScheduleModalProps = {
  isOpen: boolean;
  athletes: Athlete[];
  trainingGroups: TrainingGroup[];
  selectedGroupIds: string[];
  selectedAthletes: string[];
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
      <div className="modal-box max-w-md space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-xl font-semibold">Tilldela schema</h3>
            <p className="text-sm text-base-content/60">
              Välj aktiva eller träningsgrupper att dela veckoschemat med.
            </p>
          </div>
          <button className="btn btn-circle btn-ghost btn-sm" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="space-y-4">
          {errorMessage && (
            <div className="alert alert-error text-sm">{errorMessage}</div>
          )}
          {successMessage && (
            <div className="alert alert-success text-sm">{successMessage}</div>
          )}
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
          </section>

          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
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
      </div>
      <form method="dialog" className="modal-backdrop" onSubmit={onClose}>
        <button>close</button>
      </form>
    </dialog>
  );
}
