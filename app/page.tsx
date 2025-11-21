"use client";

import { type DragEvent, FormEvent, useMemo, useRef, useState } from "react";

type Category = "warmup" | "kondition" | "styrka";

type Module = {
  id: string;
  title: string;
  description: string;
  category: Category;
  subcategory?: string;
  distanceMeters?: number;
  durationMinutes?: number;
  durationSeconds?: number;
  weightKg?: number;
};

type DaySchedule = Record<string, Module[]>;

type ActiveDrag =
  | { source: { type: "library" }; module: Module }
  | { source: { type: "schedule"; dayId: string; moduleIndex: number }; module: Module };

type EditingContext =
  | { type: "library"; moduleId: string }
  | { type: "schedule"; moduleId: string; dayId: string; moduleIndex: number };

type ModuleForm = {
  title: string;
  description: string;
  category: Category | "";
  subcategory: string;
  distanceMeters: string;
  durationMinutes: string;
  durationSeconds: string;
  weightKg: string;
};

type Athlete = {
  id: string;
  name: string;
  sport: string;
};

const initialModules: Module[] = [
  {
    id: "mod-1",
    title: "Dynamisk uppvärmning",
    description:
      "Ledande mobility-sekvens med skips, höga knän och bandaktivering innan huvudpasset.",
    category: "warmup",
    subcategory: "Rörlighet",
    durationMinutes: 12,
  },
  {
    id: "mod-2",
    title: "Tröskelintervaller",
    description: "4x8 minuter i jämn tröskelfart med 2 minuter joggvila.",
    category: "kondition",
    subcategory: "Intervaller",
    distanceMeters: 8000,
    durationMinutes: 40,
  },
  {
    id: "mod-3",
    title: "Back to basics styrka",
    description:
      "Knäböj, bänkpress och rodd med fokus på kontrollerade 3-1-1-tempon.",
    category: "styrka",
    subcategory: "Baslyft",
    weightKg: 60,
    durationMinutes: 45,
  },
  {
    id: "mod-4",
    title: "Progressiv distans",
    description: "Jämn distanslöpning med fartökning sista tredjedelen.",
    category: "kondition",
    subcategory: "Distans",
    distanceMeters: 10000,
    durationMinutes: 55,
    durationSeconds: 0,
  },
  {
    id: "mod-5",
    title: "Explosiv kettlebell",
    description:
      "Svingar, clean & press och farmers walks för helkroppsathleticism.",
    category: "styrka",
    subcategory: "Explosivitet",
    weightKg: 24,
    durationMinutes: 30,
    durationSeconds: 0,
  },
];

const createInitialFormState = (): ModuleForm => ({
  title: "",
  description: "",
  category: "",
  subcategory: "",
  distanceMeters: "",
  durationMinutes: "",
  durationSeconds: "",
  weightKg: "",
});

const formatDuration = (minutes?: number, seconds?: number) => {
  const parts: string[] = [];

  if (minutes !== undefined) {
    parts.push(`${minutes} min`);
  }

  if (seconds !== undefined) {
    parts.push(`${seconds} sec`);
  }

  return parts.join(" ");
};

const days = [
  { id: "mon", label: "Monday" },
  { id: "tue", label: "Tuesday" },
  { id: "wed", label: "Wednesday" },
  { id: "thu", label: "Thursday" },
  { id: "fri", label: "Friday" },
  { id: "sat", label: "Saturday" },
  { id: "sun", label: "Sunday" },
];

const athletes: Athlete[] = [
  {
    id: "ath-1",
    name: "Jordan Vega",
    sport: "800m",
  },
];

export default function CoachDashboard() {
  const [search, setSearch] = useState("");
  const [activeDrag, setActiveDrag] = useState<ActiveDrag | null>(null);
  const [moduleLibrary, setModuleLibrary] = useState<Module[]>(initialModules);
  const [schedule, setSchedule] = useState<DaySchedule>(() =>
    days.reduce((acc, day) => ({ ...acc, [day.id]: [] }), {} as DaySchedule)
  );
  const [newModule, setNewModule] = useState<ModuleForm>(() =>
    createInitialFormState()
  );
  const [formError, setFormError] = useState<string | null>(null);
  const [isCreateModuleModalOpen, setIsCreateModuleModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedAthletes, setSelectedAthletes] = useState<string[]>([]);
  const [editingContext, setEditingContext] = useState<EditingContext | null>(
    null
  );
  const [editingModuleForm, setEditingModuleForm] = useState<ModuleForm | null>(
    null
  );
  const [editFormError, setEditFormError] = useState<string | null>(null);
  const libraryModuleCounter = useRef(initialModules.length);
  const scheduledModuleCounter = useRef(0);

  const filteredModules = useMemo(() => {
    return moduleLibrary.filter((module) => {
      const matchesSearch = module.title
        .toLowerCase()
        .includes(search.toLowerCase());
      return matchesSearch;
    });
  }, [moduleLibrary, search]);

  const cloneModuleForSchedule = (module: Module): Module => {
    scheduledModuleCounter.current += 1;

    return {
      id: `scheduled-${module.id}-${scheduledModuleCounter.current}`,
      title: module.title,
      description: module.description,
      category: module.category,
      subcategory: module.subcategory,
      distanceMeters: module.distanceMeters,
      durationMinutes: module.durationMinutes,
      durationSeconds: module.durationSeconds,
      weightKg: module.weightKg,
    };
  };

  const allowDrop = (event: DragEvent) => {
    event.preventDefault();
  };

  const handleDrop = (dayId: string, targetIndex?: number) => {
    if (!activeDrag) return;

    setSchedule((prev) => {
      const insertAt = targetIndex ?? prev[dayId].length;

      if (activeDrag.source.type === "library") {
        const nextModules = [...prev[dayId]];
        nextModules.splice(insertAt, 0, cloneModuleForSchedule(activeDrag.module));
        return {
          ...prev,
          [dayId]: nextModules,
        };
      }

      const { dayId: sourceDayId, moduleIndex } = activeDrag.source;
      const movingModule = prev[sourceDayId][moduleIndex];
      if (!movingModule) return prev;

      const updatedSchedule = { ...prev };
      updatedSchedule[sourceDayId] = prev[sourceDayId].filter(
        (_, index) => index !== moduleIndex
      );

      const adjustedInsertAt =
        sourceDayId === dayId && moduleIndex < insertAt
          ? Math.max(0, insertAt - 1)
          : insertAt;

      const destinationModules = [...updatedSchedule[dayId]];
      destinationModules.splice(adjustedInsertAt, 0, movingModule);
      updatedSchedule[dayId] = destinationModules;

      return updatedSchedule;
    });

    setActiveDrag(null);
  };

  const handleRemoveModule = (dayId: string, moduleIndex: number) => {
    setSchedule((prev) => ({
      ...prev,
      [dayId]: prev[dayId].filter((_, index) => index !== moduleIndex),
    }));
  };

  const handleRemoveLibraryModule = (moduleId: string) => {
    setModuleLibrary((prev) => prev.filter((module) => module.id !== moduleId));

    if (
      editingContext?.type === "library" &&
      editingContext.moduleId === moduleId
    ) {
      closeEditModal();
    }
  };

  const resetModuleForm = () => {
    setNewModule(createInitialFormState());
    setFormError(null);
  };

  const closeCreateModuleModal = () => {
    setIsCreateModuleModalOpen(false);
    resetModuleForm();
  };

  const closeEditModal = () => {
    setEditingContext(null);
    setEditingModuleForm(null);
    setEditFormError(null);
  };

  const startEditingModule = (module: Module, context: EditingContext) => {
    setEditFormError(null);
    setEditingContext(context);
    setEditingModuleForm({
      title: module.title,
      description: module.description,
      category: module.category,
      subcategory: module.subcategory ?? "",
      distanceMeters:
        module.distanceMeters !== undefined
          ? String(module.distanceMeters)
          : "",
      durationMinutes:
        module.durationMinutes !== undefined
          ? String(module.durationMinutes)
          : "",
      durationSeconds:
        module.durationSeconds !== undefined
          ? String(module.durationSeconds)
          : "",
      weightKg: module.weightKg !== undefined ? String(module.weightKg) : "",
    });
  };

  const prepareModuleToSave = (
    formState: ModuleForm,
    moduleId?: string
  ): { module?: Module; error?: string } => {
    const trimmedTitle = formState.title.trim();
    const trimmedDescription = formState.description.trim();
    const selectedCategory = formState.category;
    const trimmedSubcategory = formState.subcategory.trim();

    const parseOptionalNumber = (value: string, label: string) => {
      const trimmed = value.trim();
      if (!trimmed) return { value: undefined as number | undefined };

      const parsed = Number(trimmed);
      if (Number.isNaN(parsed) || parsed < 0) {
        return {
          error: `${label} måste vara ett icke-negativt tal.`,
        } as const;
      }

      return { value: parsed } as const;
    };

    if (!trimmedTitle || !trimmedDescription || !selectedCategory) {
      return {
        error: "Titel, beskrivning och kategori är obligatoriska.",
      };
    }

    const distanceResult = parseOptionalNumber(
      formState.distanceMeters,
      "Distans"
    );
    if ("error" in distanceResult) return { error: distanceResult.error };

    const durationMinutesResult = parseOptionalNumber(
      formState.durationMinutes,
      "Minuter"
    );
    if ("error" in durationMinutesResult)
      return { error: durationMinutesResult.error };

    const durationSecondsResult = parseOptionalNumber(
      formState.durationSeconds,
      "Sekunder"
    );
    if ("error" in durationSecondsResult)
      return { error: durationSecondsResult.error };

    if (
      durationSecondsResult.value !== undefined &&
      durationSecondsResult.value >= 60
    ) {
      return { error: "Sekunder måste vara under 60." };
    }

    const weightResult = parseOptionalNumber(formState.weightKg, "Vikt");
    if ("error" in weightResult) return { error: weightResult.error };

    return {
      module: {
        id: moduleId ?? `mod-${(libraryModuleCounter.current += 1)}`,
        title: trimmedTitle,
        description: trimmedDescription,
        category: selectedCategory,
        subcategory: trimmedSubcategory || undefined,
        distanceMeters: distanceResult.value,
        durationMinutes: durationMinutesResult.value,
        durationSeconds: durationSecondsResult.value,
        weightKg: weightResult.value,
      },
    };
  };

  const handleAddModule = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const result = prepareModuleToSave(newModule);

    if (result.error) {
      setFormError(result.error);
      return;
    }

    if (!result.module) return;

    setModuleLibrary((prev) => [result.module as Module, ...prev]);

    resetModuleForm();
    setIsCreateModuleModalOpen(false);
  };

  const handleSaveEditedModule = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!editingContext || !editingModuleForm) return;
    const result = prepareModuleToSave(
      editingModuleForm,
      editingContext.moduleId
    );

    if (result.error) {
      setEditFormError(result.error);
      return;
    }

    if (!result.module) return;

    if (editingContext.type === "library") {
      setModuleLibrary((prev) =>
        prev.map((module) =>
          module.id === editingContext.moduleId ? result.module! : module
        )
      );
    }

    if (editingContext.type === "schedule") {
      setSchedule((prev) => ({
        ...prev,
        [editingContext.dayId]: prev[editingContext.dayId].map(
          (module, index) =>
            index === editingContext.moduleIndex
              ? { ...result.module!, id: module.id }
              : module
        ),
      }));
    }

    closeEditModal();
  };

  const toggleAthleteSelection = (athleteId: string) => {
    setSelectedAthletes((prev) =>
      prev.includes(athleteId)
        ? prev.filter((id) => id !== athleteId)
        : [...prev, athleteId]
    );
  };

  const handleAssignToAthletes = () => {
    setSelectedAthletes([]);
    setIsAssignModalOpen(false);
  };

  return (
    <div className="drawer lg:drawer-open">
      <input
        id="reusable-blocks-drawer"
        type="checkbox"
        className="drawer-toggle"
      />
      <div className="drawer-content min-h-screen">
        <div className="mx-auto max-w-full px-5 py-5">
          <div className="flex items-center justify-between">
            <label
              htmlFor="reusable-blocks-drawer"
              className="btn btn-primary btn-sm lg:hidden"
            >
              Visa reusable blocks
            </label>
          </div>

          <section className="w-full max-w-full self-center space-y-6">
            <div className="card bg-base-200 border border-base-300 shadow-md">
              <div className="card-body gap-6">
                <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-neutral">
                      Schedule in progress
                    </p>
                    <h2 className="text-3xl font-semibold">
                      Camp Momentum · Week 43
                    </h2>
                  </div>

                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => setIsAssignModalOpen(true)}
                  >
                    Assign schedule
                  </button>
                </header>
                <div className="grid grid-cols-1 gap-1 md:grid-cols-2 xl:grid-cols-7">
                  {days.map((day) => (
                    <div
                      key={day.id}
                      onDragOver={allowDrop}
                      onDrop={() => handleDrop(day.id)}
                      className="flex min-h-[600px] flex-col rounded-2xl border border-dashed border-base-200 bg-base-300 p-2"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-neutral">
                            {day.label}
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 flex-1 space-y-3">
                        {schedule[day.id].length === 0 && (
                          <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-base-200 bg-base-100/60 p-4 text-center text-xs text-base-content/60">
                            Drag a module to begin
                          </div>
                        )}

                        {schedule[day.id].map((module, index) => (
                          <div key={`${module.id}-${index}`} className="space-y-2">
                            <div
                              onDragOver={allowDrop}
                              onDrop={(event) => {
                                event.stopPropagation();
                                handleDrop(day.id, index);
                              }}
                              className="h-2 w-full"
                            />
                            <div
                              draggable
                              onDragOver={allowDrop}
                              onDrop={(event) => {
                                event.stopPropagation();
                                handleDrop(day.id, index);
                              }}
                              onDragStart={() =>
                                setActiveDrag({
                                  module,
                                  source: {
                                    type: "schedule",
                                    dayId: day.id,
                                    moduleIndex: index,
                                  },
                                })
                              }
                              onDragEnd={() => setActiveDrag(null)}
                              onClick={() =>
                                startEditingModule(module, {
                                  type: "schedule",
                                  moduleId: module.id,
                                  dayId: day.id,
                                  moduleIndex: index,
                                })
                              }
                              className="w-full rounded-xl border border-base-200 bg-base-100 p-3 transition"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="space-y-1 text-xs text-base-content/60">
                                  <div className="flex flex-row justify-between">
                                    <p className="font-semibold text-base-content">
                                      {module.title}
                                    </p>
                                    <button
                                      type="button"
                                      onClick={(event) => {
                                        event.stopPropagation();
                                        handleRemoveModule(day.id, index);
                                      }}
                                      className="btn btn-ghost btn-xs text-error"
                                      aria-label={`Delete ${module.title}`}
                                    >
                                      Delete
                                    </button>
                                  </div>
                                  <p className="text-xs text-base-content/70">
                                    {module.description}
                                  </p>
                                  <div className="flex flex-wrap gap-1">
                                    <span className="badge badge-outline badge-xs capitalize">
                                      {module.category}
                                    </span>
                                    {module.subcategory && (
                                      <span className="badge badge-outline badge-xs">
                                        Underkategori: {module.subcategory}
                                      </span>
                                    )}
                                    {module.distanceMeters !== undefined && (
                                      <span className="badge badge-outline badge-xs">
                                        Distans: {module.distanceMeters} m
                                      </span>
                                    )}
                                    {formatDuration(
                                      module.durationMinutes,
                                      module.durationSeconds
                                    ) && (
                                      <span className="badge badge-outline badge-xs">
                                        Tid:{" "}
                                        {formatDuration(
                                          module.durationMinutes,
                                          module.durationSeconds
                                        )}
                                      </span>
                                    )}
                                    {module.weightKg !== undefined && (
                                      <span className="badge badge-outline badge-xs">
                                        Vikt: {module.weightKg} kg
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}

                        {schedule[day.id].length > 0 && (
                          <div
                            onDragOver={allowDrop}
                            onDrop={(event) => {
                              event.stopPropagation();
                              handleDrop(day.id, schedule[day.id].length);
                            }}
                            className="h-2 w-full"
                          />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>

        <dialog
          className={`modal ${isCreateModuleModalOpen ? "modal-open" : ""}`}
        >
          <div className="modal-box max-w-md space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-semibold">Skapa nytt block</h3>
              </div>
              <button
                className="btn btn-circle btn-ghost btn-sm"
                onClick={closeCreateModuleModal}
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="alert alert-error text-sm">{formError}</div>
            )}

            <form className="space-y-3" onSubmit={handleAddModule}>
              <div className="flex flex-col gap-2">
                <label className="form-control flex flex-col gap-1">
                  <span className="label-text text-sm">Titel:</span>
                  <input
                    type="text"
                    value={newModule.title}
                    onChange={(event) =>
                      setNewModule((prev) => ({
                        ...prev,
                        title: event.target.value,
                      }))
                    }
                    className="input input-sm input-bordered w-full"
                    placeholder="t.ex. Explosiv acceleration"
                  />
                </label>

                <label className="form-control flex-col flex gap-1">
                  <span className="label-text text-sm">Beskrivning:</span>
                  <textarea
                    className="textarea textarea-bordered w-full"
                    rows={3}
                    placeholder="Vad är syftet med blocket?"
                    value={newModule.description}
                    onChange={(event) =>
                      setNewModule((prev) => ({
                        ...prev,
                        description: event.target.value,
                      }))
                    }
                  />
                </label>

                <label className="form-control flex flex-col gap-1">
                  <span className="label-text text-sm">Kategori:</span>
                  <select
                    className="select select-bordered select-sm"
                    value={newModule.category}
                    onChange={(event) =>
                      setNewModule((prev) => ({
                        ...prev,
                        category: event.target.value as Category,
                      }))
                    }
                    required
                  >
                    <option value="" disabled>
                      Välj kategori
                    </option>
                    <option value="warmup">Uppvärmning</option>
                    <option value="kondition">Kondition</option>
                    <option value="styrka">Styrka</option>
                  </select>
                </label>

                <label className="form-control flex flex-col gap-1">
                  <span className="label-text text-sm">Underkategori:</span>
                  <input
                    type="text"
                    className="input input-sm input-bordered"
                    value={newModule.subcategory}
                    onChange={(event) =>
                      setNewModule((prev) => ({
                        ...prev,
                        subcategory: event.target.value,
                      }))
                    }
                    placeholder="t.ex. Intervaller, baslyft"
                  />
                </label>
                <label className="form-control flex gap-4 items-end">
                  <span className="label-text text-sm">Distans (m):</span>
                  <input
                    type="number"
                    min="0"
                    className="input input-sm input-bordered w-20"
                    value={newModule.distanceMeters}
                    onChange={(event) =>
                      setNewModule((prev) => ({
                        ...prev,
                        distanceMeters: event.target.value,
                      }))
                    }
                    placeholder=""
                  />
                </label>

                <label className="form-control flex gap-4 items-end">
                  <span className="label-text text-sm">Vikt (kg):</span>
                  <input
                    type="number"
                    min="0"
                    className="input input-sm input-bordered w-20"
                    value={newModule.weightKg}
                    onChange={(event) =>
                      setNewModule((prev) => ({
                        ...prev,
                        weightKg: event.target.value,
                      }))
                    }
                    placeholder=""
                  />
                </label>
                <div className="flex flex-row gap-2 items-end">
                  <label className="form-control flex gap-4 items-end">
                    <span className="label-text text-sm">Tid: </span>
                    <input
                      type="number"
                      min="0"
                      className="input input-sm input-bordered w-20"
                      value={newModule.durationMinutes}
                      onChange={(event) =>
                        setNewModule((prev) => ({
                          ...prev,
                          durationMinutes: event.target.value,
                        }))
                      }
                      placeholder=""
                    />
                  </label>

                  <p className="text-sm">min</p>

                  <label className="form-control">
                    <span className="label-text text-sm"></span>
                    <input
                      type="number"
                      min="0"
                      max="59"
                      className="input input-sm input-bordered w-20"
                      value={newModule.durationSeconds}
                      onChange={(event) =>
                        setNewModule((prev) => ({
                          ...prev,
                          durationSeconds: event.target.value,
                        }))
                      }
                      placeholder=""
                    />
                  </label>
                  <p className="text-sm">sek</p>
                </div>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                <button type="submit" className="btn btn-secondary w-full">
                  Lägg till block i biblioteket
                </button>
                <button
                  type="button"
                  className="btn btn-ghost w-full"
                  onClick={resetModuleForm}
                >
                  Rensa formulär
                </button>
              </div>
            </form>
          </div>
          <form
            method="dialog"
            className="modal-backdrop"
            onSubmit={closeCreateModuleModal}
          >
            <button>close</button>
          </form>
        </dialog>

        <dialog className={`modal ${isAssignModalOpen ? "modal-open" : ""}`}>
          <div className="modal-box max-w-l space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-semibold">Assign schedule</h3>
              </div>
              <button
                className="btn btn-circle btn-ghost btn-sm"
                onClick={() => setIsAssignModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-1">
              <section className="space-y-3 rounded-2xl border border-base-300 bg-base-100 p-4">
                <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
                  {athletes.map((athlete) => (
                    <label
                      key={athlete.id}
                      className="flex cursor-pointer items-center justify-between gap-2 rounded-xl border border-base-200 bg-base-50 px-3 py-2 text-sm hover:border-base-300"
                    >
                      <div>
                        <p className="font-semibold">{athlete.name}</p>
                        <p className="text-xs text-base-content/60">
                          {athlete.sport}
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        className="checkbox"
                        checked={selectedAthletes.includes(athlete.id)}
                        onChange={() => toggleAthleteSelection(athlete.id)}
                      />
                    </label>
                  ))}
                </div>

                <button
                  className="btn btn-secondary w-full"
                  disabled={selectedAthletes.length === 0}
                  onClick={handleAssignToAthletes}
                >
                  Assign to selected athletes
                </button>
              </section>
            </div>
          </div>
          <form
            method="dialog"
            className="modal-backdrop"
            onSubmit={() => setIsAssignModalOpen(false)}
          >
            <button>close</button>
          </form>
        </dialog>

        <dialog className={`modal ${editingContext ? "modal-open" : ""}`}>
          <div className="modal-box max-w-2xl space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-neutral">
                  {editingContext?.type === "schedule"
                    ? "Redigera schemalagt block"
                    : "Redigera återanvändbart block"}
                </p>
                <h3 className="text-xl font-semibold">
                  {editingModuleForm?.title}
                </h3>
              </div>
              <button
                className="btn btn-circle btn-ghost btn-sm"
                onClick={closeEditModal}
              >
                ✕
              </button>
            </div>

            {editFormError && (
              <div className="alert alert-error text-sm">{editFormError}</div>
            )}

            {editingModuleForm && (
              <form
                className="space-y-3 flex flex-col"
                onSubmit={handleSaveEditedModule}
              >
                <label className="form-control">
                  <span className="label-text text-sm">Titel</span>
                  <input
                    type="text"
                    value={editingModuleForm.title}
                    onChange={(event) =>
                      setEditingModuleForm((prev) =>
                        prev
                          ? {
                              ...prev,
                              title: event.target.value,
                            }
                          : prev
                      )
                    }
                    className="input input-sm input-bordered"
                    placeholder="t.ex. Explosiv acceleration"
                  />
                </label>

                <label className="form-control">
                  <span className="label-text text-sm">Beskrivning</span>
                  <textarea
                    className="textarea textarea-bordered"
                    rows={3}
                    placeholder="Vad är syftet med blocket?"
                    value={editingModuleForm.description}
                    onChange={(event) =>
                      setEditingModuleForm((prev) =>
                        prev
                          ? {
                              ...prev,
                              description: event.target.value,
                            }
                          : prev
                      )
                    }
                  />
                </label>

                <label className="form-control">
                  <span className="label-text text-sm">Kategori</span>
                  <select
                    className="select select-bordered select-sm"
                    value={editingModuleForm.category}
                    onChange={(event) =>
                      setEditingModuleForm((prev) =>
                        prev
                          ? {
                              ...prev,
                              category: event.target.value as Category,
                            }
                          : prev
                      )
                    }
                    required
                  >
                    <option value="" disabled>
                      Välj kategori
                    </option>
                    <option value="warmup">Uppvärmning</option>
                    <option value="kondition">Kondition</option>
                    <option value="styrka">Styrka</option>
                  </select>
                </label>

                <label className="form-control">
                  <span className="label-text label.sm">
                    Underkategori (valfritt)
                  </span>
                  <input
                    type="text"
                    className="input input-sm input-bordered"
                    value={editingModuleForm.subcategory}
                    onChange={(event) =>
                      setEditingModuleForm((prev) =>
                        prev
                          ? { ...prev, subcategory: event.target.value }
                          : prev
                      )
                    }
                    placeholder="t.ex. Intervaller, baslyft"
                  />
                </label>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <label className="form-control">
                    <span className="label-text text-sm">
                      Distans (meter, valfritt)
                    </span>
                    <input
                      type="number"
                      min="0"
                      className="input input-sm input-bordered"
                      value={editingModuleForm.distanceMeters}
                      onChange={(event) =>
                        setEditingModuleForm((prev) =>
                          prev
                            ? { ...prev, distanceMeters: event.target.value }
                            : prev
                        )
                      }
                      placeholder="t.ex. 5000"
                    />
                  </label>

                  <label className="form-control">
                    <span className="label-text text-sm">
                      Vikt (kg, valfritt)
                    </span>
                    <input
                      type="number"
                      min="0"
                      className="input input-sm input-bordered"
                      value={editingModuleForm.weightKg}
                      onChange={(event) =>
                        setEditingModuleForm((prev) =>
                          prev
                            ? { ...prev, weightKg: event.target.value }
                            : prev
                        )
                      }
                      placeholder="t.ex. 20"
                    />
                  </label>
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <label className="form-control">
                    <span className="label-text text-sm">
                      Tid (minuter, valfritt)
                    </span>
                    <input
                      type="number"
                      min="0"
                      className="input input-sm input-bordered"
                      value={editingModuleForm.durationMinutes}
                      onChange={(event) =>
                        setEditingModuleForm((prev) =>
                          prev
                            ? { ...prev, durationMinutes: event.target.value }
                            : prev
                        )
                      }
                      placeholder="t.ex. 30"
                    />
                  </label>

                  <label className="form-control">
                    <span className="label-text text-sm">
                      Tid (sekunder, valfritt)
                    </span>
                    <input
                      type="number"
                      min="0"
                      max="59"
                      className="input input-sm input-bordered"
                      value={editingModuleForm.durationSeconds}
                      onChange={(event) =>
                        setEditingModuleForm((prev) =>
                          prev
                            ? { ...prev, durationSeconds: event.target.value }
                            : prev
                        )
                      }
                      placeholder="0-59"
                    />
                  </label>
                </div>

                <div className="flex gap-2 sm:flex-col">
                  <p className="text-sm">
                    {editingContext?.type === "schedule"
                      ? "Changes will apply only to this block in the schedule. Reusable templates and other scheduled blocks remain unchanged."
                      : "Changes will affect only the reusable block template, no blocks in schedules will be affected."}
                  </p>
                  <button type="submit" className="btn btn-secondary w-full">
                    Save changes
                  </button>
                </div>
              </form>
            )}
          </div>
          <form
            method="dialog"
            className="modal-backdrop"
            onSubmit={closeEditModal}
          >
            <button>close</button>
          </form>
        </dialog>
      </div>

      <div className="drawer-side">
        <label
          htmlFor="reusable-blocks-drawer"
          aria-label="close sidebar"
          className="drawer-overlay"
        ></label>
        <div className="flex h-full w-65 min-w-[150px] flex-col gap-3 border-r border-base-300 bg-primary-content p-4">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral">
              Reusable blocks
            </p>
            <label
              htmlFor="reusable-blocks-drawer"
              className="btn btn-ghost btn-circle btn-xs lg:hidden"
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
                placeholder="Search blocks"
                className="grow"
              />
            </label>
            <button
              type="button"
              className="btn btn-secondary btn-sm self-start"
              onClick={() => {
                resetModuleForm();
                setIsCreateModuleModalOpen(true);
              }}
            >
              Create block
            </button>
          </div>
          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
            {filteredModules.map((module) => (
              <article
                key={module.id}
                draggable
                onDragStart={() =>
                  setActiveDrag({
                    module,
                    source: { type: "library" },
                  })
                }
                onDragEnd={() => setActiveDrag(null)}
                onClick={() =>
                  startEditingModule(module, {
                    type: "library",
                    moduleId: module.id,
                  })
                }
                className="card cursor-grab overflow-hidden border border-base-200 bg-base-100 transition hover:border-primary"
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
                      Delete
                    </button>
                  </div>
                  <p className="max-h-16 overflow-hidden text-xs text-base-content/70">
                    {module.description}
                  </p>
                  <div className="mt-auto flex flex-wrap gap-1">
                    <span className="badge badge-outline badge-xs capitalize">
                      {module.category}
                    </span>
                    {module.subcategory && (
                      <span className="badge badge-outline badge-xs">
                        Underkategori: {module.subcategory}
                      </span>
                    )}
                    {module.distanceMeters !== undefined && (
                      <span className="badge badge-outline badge-xs">
                        Distans: {module.distanceMeters} m
                      </span>
                    )}
                    {formatDuration(
                      module.durationMinutes,
                      module.durationSeconds
                    ) && (
                      <span className="badge badge-outline badge-xs">
                        Tid:{" "}
                        {formatDuration(
                          module.durationMinutes,
                          module.durationSeconds
                        )}
                      </span>
                    )}
                    {module.weightKg !== undefined && (
                      <span className="badge badge-outline badge-xs">
                        Vikt: {module.weightKg} kg
                      </span>
                    )}
                  </div>
                </div>
              </article>
            ))}

            {filteredModules.length === 0 && (
              <p className="rounded-2xl border border-dashed border-base-200 p-6 text-center text-sm text-base-content/60">
                No modules match your search. Clear filters to see more.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
