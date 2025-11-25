import type { Dispatch, MutableRefObject, SetStateAction } from "react";

import type {
  ActiveDrag,
  DropPreviewLocation,
  EditingContext,
  Module,
} from "@/components/schedulebuilder/types";
import { ModuleBadges } from "@/components/schedulebuilder/ModuleBadges";

type ReusableBlocksDrawerProps = {
  search: string;
  setSearch: Dispatch<SetStateAction<string>>;
  filteredModules: Module[];
  setActiveDrag: Dispatch<SetStateAction<ActiveDrag | null>>;
  dragPointerOffsetYRef: MutableRefObject<number | null>;
  setDropPreview: Dispatch<SetStateAction<DropPreviewLocation | null>>;
  startEditingModule: (module: Module, context: EditingContext) => void;
  handleRemoveLibraryModule: (moduleId: string) => void;
  resetModuleForm: () => void;
  openCreateModal: () => void;
  onHoverOpen: () => void;
  onHoverClose: () => void;
  onClose: () => void;
};

export function ReusableBlocksDrawer({
  search,
  setSearch,
  filteredModules,
  setActiveDrag,
  dragPointerOffsetYRef,
  setDropPreview,
  startEditingModule,
  handleRemoveLibraryModule,
  resetModuleForm,
  openCreateModal,
  onHoverOpen,
  onHoverClose,
  onClose,
}: ReusableBlocksDrawerProps) {
  return (
    <div
      className="drawer-side"
      onMouseEnter={onHoverOpen}
      onMouseLeave={onHoverClose}
    >
      <label
        htmlFor="reusable-blocks-drawer"
        aria-label="close sidebar"
        className="drawer-overlay"
        onClick={onClose}
      ></label>
      <div className="flex h-full w-65 min-w-[150px] flex-col gap-3 border-r border-base-300 bg-primary-content p-4">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-neutral">
            Sparade moduler
          </p>
          <label
            htmlFor="reusable-blocks-drawer"
            className="btn btn-ghost btn-circle btn-xs lg:hidden"
            onClick={onClose}
          >
            ✕
          </label>
        </div>
        <div className="flex flex-col gap-2">
          <label className="input input-bordered input-sm flex items-center gap-2 lg:min-w-[10rem]">
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
        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
          {filteredModules.map((module) => (
            <article
              key={module.id}
              draggable
              onDragStart={(event) => {
                const rect = (
                  event.currentTarget as HTMLDivElement
                ).getBoundingClientRect();
                dragPointerOffsetYRef.current = event.clientY - rect.top;

                setActiveDrag({
                  module,
                  source: { type: "library" },
                });
              }}
              onDragEnd={() => {
                setActiveDrag(null);
                setDropPreview(null);
              }}
              onClick={() =>
                startEditingModule(module, {
                  type: "library",
                  moduleId: module.id,
                })
              }
              className="card cursor-grab overflow-hidden border border-base-200 bg-base-100 transition hover:border-primary rounded-2xl"
            >
              <div className="card-body flex flex-col gap-2 p-4">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-xs font-semibold">{module.title}</p>
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      handleRemoveLibraryModule(module.id);
                    }}
                    className="btn btn-ghost btn-xs text-error"
                    aria-label={`Delete ${module.title}`}
                  >
                    Radera
                  </button>
                </div>
                <p className="max-h-16 overflow-hidden text-xs text-base-content/70">
                  {module.description}
                </p>
                <ModuleBadges module={module} />
              </div>
            </article>
          ))}

          {filteredModules.length === 0 && (
            <p className="rounded-2xl border border-dashed border-base-200 p-6 text-center text-sm text-base-content/60">
              Inga moduler matchar sökningen.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
