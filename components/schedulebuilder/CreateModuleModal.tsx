import type { Dispatch, FormEvent, SetStateAction } from "react";

import type { ModuleForm } from "@/components/schedulebuilder/types";
import { ModuleFormFields } from "@/components/schedulebuilder/ModuleFormFields";

type CreateModuleModalProps = {
  isOpen: boolean;
  newModule: ModuleForm;
  formError: string | null;
  isSubmitting: boolean;
  categoryOptions: string[];
  subcategoryOptions: Record<string, string[]>;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onUpdate: Dispatch<SetStateAction<ModuleForm>>;
};

export function CreateModuleModal({
  isOpen,
  newModule,
  formError,
  isSubmitting,
  categoryOptions,
  subcategoryOptions,
  onClose,
  onSubmit,
  onUpdate,
}: CreateModuleModalProps) {
  return (
    <dialog className={`modal ${isOpen ? "modal-open" : ""} z-[1100]`}>
      <div className="modal-box w-full max-w-4xl space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-xl font-semibold">Skapa nytt block</h3>
          </div>
          <button className="btn btn-circle btn-ghost btn-sm" onClick={onClose}>
            ✕
          </button>
        </div>

        {formError && <div className="alert alert-error text-sm">{formError}</div>}

        <form className="space-y-3" onSubmit={onSubmit}>
          <ModuleFormFields
            formState={newModule}
            onChange={onUpdate}
            categoryOptions={categoryOptions}
            subcategoryOptions={subcategoryOptions}
          />

          <div className="mt-7 flex justify-end">
            <button
              type="submit"
              className={`btn btn-secondary px-6 ${
                isSubmitting ? "loading" : ""
              }`}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Sparar..." : "Skapa block"}
            </button>
          </div>
        </form>
      </div>
      <form method="dialog" className="modal-backdrop" onSubmit={onClose}>
        <button>close</button>
      </form>
    </dialog>
  );
}
