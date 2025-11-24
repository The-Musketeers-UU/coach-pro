import type { Dispatch, FormEvent, SetStateAction } from "react";

import type { EditingContext, ModuleForm } from "@/components/schedulebuilder/types";
import { ModuleFormFields } from "@/components/schedulebuilder/ModuleFormFields";

type EditModuleModalProps = {
  isOpen: boolean;
  editingContext: EditingContext | null;
  editingModuleForm: ModuleForm | null;
  editFormError: string | null;
  isEditMode: boolean;
  setIsEditMode: Dispatch<SetStateAction<boolean>>;
  setEditingModuleForm: Dispatch<SetStateAction<ModuleForm | null>>;
  onClose: () => void;
  onSave: (event: FormEvent<HTMLFormElement>) => void;
};

export function EditModuleModal({
  isOpen,
  editingContext,
  editingModuleForm,
  editFormError,
  isEditMode,
  setIsEditMode,
  setEditingModuleForm,
  onClose,
  onSave,
}: EditModuleModalProps) {
  const formattedDuration = (() => {
    if (!editingModuleForm) return "";

    const parts = [] as string[];
    if (editingModuleForm.durationMinutes)
      parts.push(`${editingModuleForm.durationMinutes} min`);
    if (editingModuleForm.durationSeconds)
      parts.push(`${editingModuleForm.durationSeconds} s`);

    return parts.join(" ");
  })();

  return (
    <dialog className={`modal ${isOpen ? "modal-open" : ""}`}>
      <div className="modal-box max-w-md space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-xl font-semibold">
              {editingModuleForm?.title ?? editingContext?.moduleId ?? "Block"}
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

        {!isEditMode && editingModuleForm && (
          <div className="space-y-3 rounded-xl bg-base-200 p-4 text-sm">
            {editingModuleForm.description && (
              <p className="text-base-content/80">{editingModuleForm.description}</p>
            )}

            <dl className="grid grid-cols-2 gap-3">
              {editingModuleForm.category && (
                <div>
                  <dt className="text-xs uppercase tracking-wide text-base-content/60">
                    Category
                  </dt>
                  <dd className="font-medium text-base-content">
                    {editingModuleForm.category}
                  </dd>
                </div>
              )}

              {editingModuleForm.subcategory && (
                <div>
                  <dt className="text-xs uppercase tracking-wide text-base-content/60">
                    Subcategory
                  </dt>
                  <dd className="font-medium text-base-content">
                    {editingModuleForm.subcategory}
                  </dd>
                </div>
              )}

              {editingModuleForm.distanceMeters && (
                <div>
                  <dt className="text-xs uppercase tracking-wide text-base-content/60">
                    Distance
                  </dt>
                  <dd className="font-medium text-base-content">
                    {editingModuleForm.distanceMeters} m
                  </dd>
                </div>
              )}

              {formattedDuration && (
                <div>
                  <dt className="text-xs uppercase tracking-wide text-base-content/60">
                    Duration
                  </dt>
                  <dd className="font-medium text-base-content">{formattedDuration}</dd>
                </div>
              )}

              {editingModuleForm.weightKg && (
                <div>
                  <dt className="text-xs uppercase tracking-wide text-base-content/60">
                    Load
                  </dt>
                  <dd className="font-medium text-base-content">
                    {editingModuleForm.weightKg} kg
                  </dd>
                </div>
              )}
            </dl>
          </div>
        )}

        {isEditMode && editingModuleForm && (
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

        {!isEditMode && (
          <div className="flex flex-row gap-2 sm:flex-row">
            <button type="button" className="btn flex-1" onClick={onClose}>
              Stäng
            </button>
            <button
              type="button"
              className="btn btn-secondary flex-1"
              onClick={() => setIsEditMode(true)}
            >
              Redigera
            </button>
          </div>
        )}
      </div>
      <form method="dialog" className="modal-backdrop" onSubmit={onClose}>
        <button>close</button>
      </form>
    </dialog>
  );
}
