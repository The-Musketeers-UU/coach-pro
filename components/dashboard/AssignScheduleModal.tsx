import type { Athlete } from "@/components/dashboard/types";

type AssignScheduleModalProps = {
  isOpen: boolean;
  athletes: Athlete[];
  selectedAthletes: string[];
  toggleAthleteSelection: (athleteId: string) => void;
  onClose: () => void;
  onAssign: () => void;
};

export function AssignScheduleModal({
  isOpen,
  athletes,
  selectedAthletes,
  toggleAthleteSelection,
  onClose,
  onAssign,
}: AssignScheduleModalProps) {
  return (
    <dialog className={`modal ${isOpen ? "modal-open" : ""}`}>
      <div className="modal-box max-w-md space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-xl font-semibold">Assign schedule</h3>
            <p className="text-sm text-base-content/60">
              Select athletes to receive this training week.
            </p>
          </div>
          <button className="btn btn-circle btn-ghost btn-sm" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <section className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral">Athletes</p>
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

            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
              <button className="btn" onClick={onClose}>
                Avbryt
              </button>
              <button className="btn btn-secondary" onClick={onAssign}>
                Tilldela
              </button>
            </div>
          </section>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop" onSubmit={onClose}>
        <button>close</button>
      </form>
    </dialog>
  );
}
