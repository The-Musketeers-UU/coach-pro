import type { Dispatch, FormEvent, SetStateAction } from "react";

import type { ModuleForm } from "@/components/schedulebuilder/types";
import { ModuleFormFields } from "@/components/schedulebuilder/ModuleFormFields";

type CreateModuleModalProps = {
  isOpen: boolean;
  newModule: ModuleForm;
  formError: string | null;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onReset: () => void;
  onUpdate: Dispatch<SetStateAction<ModuleForm>>;
};

export function CreateModuleModal({
  isOpen,
  newModule,
  formError,
  isSubmitting,
  onClose,
  onSubmit,
  onReset,
  onUpdate,
}: CreateModuleModalProps) {
  return (
    <dialog className={`modal ${isOpen ? "modal-open" : ""} z-[60]`}>
      <div className="modal-box max-w-md space-y-4">
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
          <ModuleFormFields formState={newModule} onChange={onUpdate} />

          <div className="mt-7 flex flex-row gap-2 sm:flex-row">
            <button type="button" className="btn flex-1" onClick={onReset}>
              Rensa formulär
            </button>
            <button
              type="submit"
              className={`btn btn-secondary flex-1 ${
                isSubmitting ? "loading" : ""
              }`}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Sparar..." : "Skapa block"}
            </button>
          </div>
        </form>
      </div>
      <form
        method="dialog"
        className="modal-backdrop z-50"
        onSubmit={onClose}
      >
        <button>close</button>
      </form>
    </dialog>
  );
}
