import { useEffect, useMemo, useRef, useState } from "react";
import type { Dispatch, DragEvent, MutableRefObject, SetStateAction } from "react";

import type {
  ActiveDrag,
  DropPreviewLocation,
  EditingContext,
  Module,
} from "@/components/schedulebuilder/types";
import { ModuleBadges } from "@/components/ModuleBadges";

const sortOptions = [
  { value: "title", label: "Titel" },
  { value: "category", label: "Kategori" },
  { value: "subcategory", label: "Underkategori" },
] as const;

type SortKey = (typeof sortOptions)[number]["value"];
type SortDirection = "asc" | "desc";

type ReusableBlocksShelfProps = {
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
  onSwitchToDrawer: () => void;
};

const sortModules = (
  modules: Module[],
  sortKey: SortKey,
  direction: SortDirection,
) => {
  const sorted = [...modules].sort((a, b) => {
    const aValue =
      sortKey === "title"
        ? a.title
        : sortKey === "category"
          ? a.category
          : a.subcategory ?? "";
    const bValue =
      sortKey === "title"
        ? b.title
        : sortKey === "category"
          ? b.category
          : b.subcategory ?? "";

    const primary = aValue.localeCompare(bValue, "sv", { sensitivity: "base" });
    if (primary !== 0) return primary;

    return a.title.localeCompare(b.title, "sv", { sensitivity: "base" });
  });

  return direction === "asc" ? sorted : sorted.reverse();
};

export function ReusableBlocksShelf({
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
  onSwitchToDrawer,
}: ReusableBlocksShelfProps) {
  const drawerRef = useRef<HTMLDivElement | null>(null);
  const hasLeftDrawerDuringDragRef = useRef(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("title");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const sortedModules = useMemo(
    () => sortModules(filteredModules, sortKey, sortDirection),
    [filteredModules, sortKey, sortDirection],
  );

  const categories = useMemo(() => {
    const uniqueCategories = new Set(sortedModules.map((module) => module.category));
    return Array.from(uniqueCategories);
  }, [sortedModules]);

  useEffect(() => {
    if (activeCategory && !categories.includes(activeCategory)) {
      setActiveCategory(null);
    }
  }, [activeCategory, categories]);

  const categoriesWithModules = useMemo(() => {
    const grouped = new Map<string, Module[]>();

    sortedModules.forEach((module) => {
      const list = grouped.get(module.category) ?? [];
      list.push(module);
      grouped.set(module.category, list);
    });

    return grouped;
  }, [sortedModules]);

  const subcategoriesWithModules = useMemo(() => {
    if (!activeCategory) return new Map<string, Module[]>();

    const grouped = new Map<string, Module[]>();
    sortedModules
      .filter((module) => module.category === activeCategory)
      .forEach((module) => {
        const key = module.subcategory?.trim() || "Okategoriserat";
        const list = grouped.get(key) ?? [];
        list.push(module);
        grouped.set(key, list);
      });

    return grouped;
  }, [activeCategory, sortedModules]);

  const closeWhenDraggingOutside = (event: DragEvent<HTMLElement>) => {
    if (hasLeftDrawerDuringDragRef.current) return;

    const rect = drawerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const { clientX, clientY } = event;
    const isOutside =
      clientX < rect.left ||
      clientX > rect.right ||
      clientY < rect.top ||
      clientY > rect.bottom;

    if (isOutside) {
      hasLeftDrawerDuringDragRef.current = true;
    }
  };

  const columns = activeCategory ? subcategoriesWithModules : categoriesWithModules;

  return (
    <div
      ref={drawerRef}
      className="fixed bottom-0 left-0 right-0 z-40 h-[48vh] min-h-[360px] border-t border-base-300 bg-base-200 shadow-2xl"
    >
      <div className="flex h-full flex-col gap-4 px-5 py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide">
              Sparade moduler – alternativ layout
            </p>
            <p className="text-xs text-base-content/60">
              Dra moduler till schemat eller bläddra efter kategori.
            </p>
          </div>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={onSwitchToDrawer}
          >
            Tillbaka till sidomeny
          </button>
        </div>

        <div className="flex min-h-0 flex-1 gap-4">
          <aside className="flex w-56 flex-col gap-4 border-r border-base-300 pr-4">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide">
                Sortering
              </p>
              <label className="form-control w-full">
                <span className="label-text text-xs">Sortera efter</span>
                <select
                  className="select select-bordered select-sm"
                  value={sortKey}
                  onChange={(event) => setSortKey(event.target.value as SortKey)}
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="form-control w-full">
                <span className="label-text text-xs">Ordning</span>
                <select
                  className="select select-bordered select-sm"
                  value={sortDirection}
                  onChange={(event) =>
                    setSortDirection(event.target.value as SortDirection)
                  }
                >
                  <option value="asc">A → Ö</option>
                  <option value="desc">Ö → A</option>
                </select>
              </label>
            </div>
            <div className="space-y-2">
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
                className="btn btn-secondary btn-sm w-full"
                onClick={() => {
                  resetModuleForm();
                  openCreateModal();
                }}
              >
                + Skapa ny modul
              </button>
            </div>
          </aside>

          <div className="flex min-h-0 flex-1 flex-col gap-3">
            {activeCategory ? (
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold">{activeCategory}</p>
                  <p className="text-xs text-base-content/60">
                    Välj underkategori eller gå tillbaka till alla kategorier.
                  </p>
                </div>
                <button
                  type="button"
                  className="btn btn-outline btn-xs"
                  onClick={() => setActiveCategory(null)}
                >
                  Alla kategorier
                </button>
              </div>
            ) : (
              <p className="text-xs text-base-content/60">
                Välj en kategori för att se underkategorier i separata kolumner.
              </p>
            )}

            <div className="min-h-0 flex-1 overflow-auto">
              <div className="flex min-w-max gap-4 pb-2 pr-2">
                {Array.from(columns.entries()).map(([columnKey, modules]) => (
                  <section
                    key={columnKey}
                    className="flex min-w-[240px] max-w-[280px] flex-1 flex-col gap-3 rounded-2xl border border-base-300 bg-base-100 p-3 shadow-sm"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-semibold uppercase tracking-wide">
                        {columnKey}
                      </p>
                      {!activeCategory && (
                        <button
                          type="button"
                          className="btn btn-ghost btn-xs"
                          onClick={() => setActiveCategory(columnKey)}
                        >
                          Underkategorier
                        </button>
                      )}
                    </div>
                    <div className="space-y-3">
                      {modules.map((module) => (
                        <article
                          key={module.id}
                          draggable
                          onDragStart={(event) => {
                            const rect = (
                              event.currentTarget as HTMLDivElement
                            ).getBoundingClientRect();
                            dragPointerOffsetYRef.current =
                              event.clientY - rect.top;
                            hasLeftDrawerDuringDragRef.current = false;

                            setActiveDrag({
                              module,
                              source: { type: "library" },
                            });
                          }}
                          onDrag={(event) => closeWhenDraggingOutside(event)}
                          onDragEnd={() => {
                            setActiveDrag(null);
                            setDropPreview(null);
                            hasLeftDrawerDuringDragRef.current = false;
                          }}
                          onClick={() =>
                            startEditingModule(module, {
                              type: "library",
                              moduleId: module.id,
                            })
                          }
                          className="card cursor-grab overflow-hidden rounded-lg border border-base-200 bg-base-100 transition hover:border-primary"
                        >
                          <div className="card-body flex flex-col gap-2 p-3">
                            <div className="flex items-start justify-between gap-3">
                              <p className="text-xs font-semibold">{module.title}</p>
                              <button
                                type="button"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  const confirmed = window.confirm(
                                    `Är du säker på att du vill radera "${module.title}"?`,
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
                      ))}
                      {modules.length === 0 && (
                        <p className="rounded-2xl border border-dashed border-base-200 p-4 text-center text-xs text-base-content/60">
                          Inga moduler i denna kolumn.
                        </p>
                      )}
                    </div>
                  </section>
                ))}

                {columns.size === 0 && (
                  <div className="min-w-[240px] rounded-2xl border border-dashed border-base-300 p-6 text-center text-sm text-base-content/60">
                    Inga moduler matchar sökningen.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
