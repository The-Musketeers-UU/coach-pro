import type { Dispatch, FormEvent, SetStateAction } from "react";

import type { EditingContext, ModuleForm } from "@/components/schedulebuilder/types";
import { ModuleFormFields } from "@/components/schedulebuilder/ModuleFormFields";
import { formatCentiseconds, parseDurationToCentiseconds } from "@/lib/time";

type EditModuleModalProps = {
  isOpen: boolean;
  editingContext: EditingContext | null;
  editingModuleForm: ModuleForm | null;
  editFormError: string | null;
  setEditingModuleForm: Dispatch<SetStateAction<ModuleForm | null>>;
  onClose: () => void;
  onSave: (event: FormEvent<HTMLFormElement>) => void;
};

export function EditModuleModal({
  isOpen,
  editingContext,
  editingModuleForm,
  editFormError,
  setEditingModuleForm,
  onClose,
  onSave,
}: EditModuleModalProps) {
  if (!isOpen || !editingModuleForm) return null;

  const formattedDuration = editingModuleForm?.duration
    ? formatCentiseconds(parseDurationToCentiseconds(editingModuleForm.duration) ?? undefined)
    : "";

  return (
    <dialog className={`modal ${isOpen ? "modal-open" : ""}`}>
      <div className="modal-box w-full max-w-4xl space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-xl font-semibold">
              {editingModuleForm?.title || editingContext?.moduleId}
            </h3>
            {editingContext && (
              <p className="text-xs text-base-content/60">
                {editingContext.type === "library" ? "Bibliotek" : "Schedule"}
              </p>
            )}
          </div>
          <button className="btn btn-circle btn-ghost btn-sm" onClick={onClose}>
            ✕
          </button>
        </div>

        {editFormError && <div className="alert alert-error text-sm">{editFormError}</div>}

        {editingModuleForm && (
          <form className="space-y-3" onSubmit={onSave}>
            <ModuleFormFields
              formState={editingModuleForm}
              onChange={setEditingModuleForm as Dispatch<SetStateAction<ModuleForm>>}
            />

            <div className="mt-7 flex flex-row gap-2 sm:flex-row">
              <button type="button" className="btn flex-1" onClick={onClose}>
                Avbryt
              </button>
              <button type="submit" className="btn btn-secondary flex-1">
                Spara ändringar
              </button>
            </div>
          </form>
        )}
      </div>
      <form method="dialog" className="modal-backdrop" onSubmit={onClose}>
        <button>close</button>
      </form>
    </dialog>
  );
}
