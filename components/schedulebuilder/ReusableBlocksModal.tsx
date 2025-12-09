import type { Dispatch, SetStateAction } from "react";

import { ModuleBadges } from "@/components/ModuleBadges";
import type {
  EditingContext,
  Module,
} from "@/components/schedulebuilder/types";

type ReusableBlocksModalProps = {
  isOpen: boolean;
  dayLabel?: string;
  search: string;
  setSearch: Dispatch<SetStateAction<string>>;
  filteredModules: Module[];
  selectedModuleId: string | null;
  onSelectModule: (moduleId: string) => void;
  onAddModule: () => void;
  startEditingModule: (module: Module, context: EditingContext) => void;
  handleRemoveLibraryModule: (moduleId: string) => void;
  resetModuleForm: () => void;
  openCreateModal: () => void;
  onClose: () => void;
};

export function ReusableBlocksModal({
  isOpen,
  dayLabel,
  search,
  setSearch,
  filteredModules,
  selectedModuleId,
  onSelectModule,
  onAddModule,
  startEditingModule,
  handleRemoveLibraryModule,
  resetModuleForm,
  openCreateModal,
  onClose,
}: ReusableBlocksModalProps) {
  return (
    <dialog className={`modal ${isOpen ? "modal-open" : ""}`}>
      <div className="modal-box flex h-[80vh] max-w-md flex-col space-y-4 p-0 md:h-auto">
        <div className="flex items-center justify-between border-b border-base-200 px-5 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral">
              Sparade moduler
            </p>
            {dayLabel && (
              <p className="text-sm text-base-content/70">Lägg till i {dayLabel}</p>
            )}
          </div>
          <button
            className="btn btn-ghost btn-circle btn-sm"
            onClick={onClose}
            aria-label="Stäng sparade moduler"
          >
            ✕
          </button>
          </div>

        <div className="flex-1 space-y-3 overflow-y-auto px-5">
          <div className="flex flex-col gap-2">
            <label className="input input-bordered input-sm flex items-center gap-2">
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Sök"
                className="grow"
              />
            </label>
            <button
              type="button"
              className="btn btn-secondary btn-sm self-start"
              onClick={() => {
                resetModuleForm();
                openCreateModal();
              }}
            >
              Skapa ny modul
            </button>
          </div>

          <div className="space-y-3 pr-1">
            {filteredModules.map((module) => {
              const isSelected = selectedModuleId === module.id;
              return (
                <article
                  key={module.id}
                  onClick={() => onSelectModule(module.id)}
                  onDoubleClick={() =>
                    startEditingModule(module, {
                      type: "library",
                      moduleId: module.id,
                    })
                  }
                  className={`card cursor-pointer overflow-hidden border bg-base-100 transition hover:border-primary rounded-lg ${
                    isSelected ? "border-primary ring-2 ring-primary/40" : "border-base-200"
                  }`}
                >
                  <div className="card-body flex flex-col gap-2 p-3 bg-base-300">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-xs font-semibold">{module.title}</p>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          const confirmed = window.confirm(
                            `Är du säker på att du vill radera "${module.title}"?`
                          );
                          if (!confirmed) return;
                          handleRemoveLibraryModule(module.id);
                        }}
                        className="btn btn-ghost btn-circle btn-xs text-error"
                        aria-label={`Delete ${module.title}`}
                      >
                        <span aria-hidden="true">✕</span>
                      </button>
                    </div>
                    <p className="max-h-16 overflow-hidden text-xs text-base-content/70">
                      {module.description}
                    </p>
                    <ModuleBadges module={module} />
                  </div>
                </article>
              );
            })}

            {filteredModules.length === 0 && (
              <p className="rounded-2xl border border-dashed border-base-200 p-6 text-center text-sm text-base-content/60">
                Inga moduler matchar sökningen.
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-base-200 px-5 py-4">
          <button type="button" className="btn" onClick={onClose}>
            Avbryt
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={onAddModule}
            disabled={!selectedModuleId}
          >
            Lägg
          </button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop" onSubmit={onClose}>
        <button>close</button>
      </form>
    </dialog>
  );
}
