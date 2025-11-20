"use client";

import { FormEvent, useMemo, useRef, useState } from "react";

type ModuleAttribute = {
  id: string;
  key: string;
  value: string;
};

type Module = {
  id: string;
  title: string;
  description: string;
  attributes: ModuleAttribute[];
};

type DaySchedule = Record<string, Module[]>;

type EditingContext =
  | { type: "library"; moduleId: string }
  | { type: "schedule"; moduleId: string; dayId: string; moduleIndex: number };

type ModuleForm = Omit<Module, "id">;

type Athlete = {
  id: string;
  name: string;
  sport: string;
};

const initialModules: Module[] = [
  {
    id: "mod-1",
    title: "Explosive Power Circuit",
    description:
      "Olympic lifts, sled pushes, and plyometrics to prime neuromuscular output.",
    attributes: [
      { id: "attr-1", key: "Focus", value: "Strength" },
      { id: "attr-2", key: "Duration", value: "45 min" },
      { id: "attr-3", key: "Intensity", value: "High" },
    ],
  },
  {
    id: "mod-2",
    title: "Tempo Endurance Ride",
    description: "Zone 3 tempo ride with cadence holds for sustainable power.",
    attributes: [
      { id: "attr-1", key: "Focus", value: "Conditioning" },
      { id: "attr-2", key: "Duration", value: "60 min" },
      { id: "attr-3", key: "Intensity", value: "Moderate" },
    ],
  },
  {
    id: "mod-3",
    title: "Mobility & Prehab Flow",
    description:
      "Thoracic opener, hip cars, and ankle sequencing for joint prep.",
    attributes: [
      { id: "attr-1", key: "Focus", value: "Mobility" },
      { id: "attr-2", key: "Duration", value: "25 min" },
      { id: "attr-3", key: "Intensity", value: "Low" },
    ],
  },
  {
    id: "mod-4",
    title: "Race Visualization",
    description:
      "Guided visualization script focusing on strategic decision-making.",
    attributes: [
      { id: "attr-1", key: "Focus", value: "Mindset" },
      { id: "attr-2", key: "Duration", value: "15 min" },
      { id: "attr-3", key: "Intensity", value: "Low" },
    ],
  },
  {
    id: "mod-5",
    title: "Threshold Track Session",
    description:
      "5x1k repeats @ 10k pace with 90s recoveries to raise lactate threshold.",
    attributes: [
      { id: "attr-1", key: "Focus", value: "Conditioning" },
      { id: "attr-2", key: "Duration", value: "50 min" },
      { id: "attr-3", key: "Intensity", value: "High" },
    ],
  },
  {
    id: "mod-6",
    title: "Contrast Recovery",
    description:
      "Contrast bath protocol paired with diaphragmatic breathing reset.",
    attributes: [
      { id: "attr-1", key: "Focus", value: "Recovery" },
      { id: "attr-2", key: "Duration", value: "30 min" },
      { id: "attr-3", key: "Intensity", value: "Low" },
    ],
  },
  {
    id: "mod-7",
    title: "Strength Foundations",
    description:
      "Tempo squats, pull variations, and single-leg stability primer.",
    attributes: [
      { id: "attr-1", key: "Focus", value: "Strength" },
      { id: "attr-2", key: "Duration", value: "40 min" },
      { id: "attr-3", key: "Intensity", value: "Moderate" },
    ],
  },
  {
    id: "mod-8",
    title: "Track Strides",
    description: "8x120m strides with buildups to reinforce running mechanics.",
    attributes: [
      { id: "attr-1", key: "Focus", value: "Conditioning" },
      { id: "attr-2", key: "Duration", value: "20 min" },
      { id: "attr-3", key: "Intensity", value: "Moderate" },
    ],
  },
];

const createInitialFormState = (): ModuleForm => ({
  title: "",
  description: "",
  attributes: [],
});

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
  const [activeDrag, setActiveDrag] = useState<Module | null>(null);
  const [moduleLibrary, setModuleLibrary] = useState<Module[]>(initialModules);
  const [schedule, setSchedule] = useState<DaySchedule>(() =>
    days.reduce((acc, day) => ({ ...acc, [day.id]: [] }), {} as DaySchedule)
  );
  const [newModule, setNewModule] = useState<ModuleForm>(() =>
    createInitialFormState()
  );
  const [formError, setFormError] = useState<string | null>(null);
  const [isAddModuleExpanded, setIsAddModuleExpanded] = useState(false);
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
  const attributeIdCounter = useRef(0);
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
      attributes: module.attributes.map((attribute) => ({ ...attribute })),
    };
  };

  const handleDrop = (dayId: string) => {
    if (!activeDrag) return;
    setSchedule((prev) => ({
      ...prev,
      [dayId]: [...prev[dayId], cloneModuleForSchedule(activeDrag)],
    }));
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
      attributes: module.attributes.map((attribute) => ({ ...attribute })),
    });
  };

  const prepareModuleToSave = (
    formState: ModuleForm,
    moduleId?: string
  ): { module?: Module; error?: string } => {
    const trimmedTitle = formState.title.trim();
    const trimmedDescription = formState.description.trim();
    const completedAttributes = formState.attributes.filter(
      (attribute) => attribute.key.trim() && attribute.value.trim()
    );
    const hasIncompleteAttribute = formState.attributes.some(
      (attribute) =>
        (attribute.key.trim() && !attribute.value.trim()) ||
        (!attribute.key.trim() && attribute.value.trim())
    );

    if (!trimmedTitle || !trimmedDescription) {
      return { error: "Title and description are required." };
    }

    if (hasIncompleteAttribute) {
      return { error: "Complete or remove any partial key/value pairs." };
    }

    return {
      module: {
        id:
          moduleId ?? `mod-${(libraryModuleCounter.current += 1)}`,
        title: trimmedTitle,
        description: trimmedDescription,
        attributes: completedAttributes,
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
    <div className="min-h-screen">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 lg:flex-row">
        <aside className="w-full space-y-6 lg:w-1/3">
          <div className="card bg-base-200 shadow-md border border-base-300">
            <div className="card-body space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="card-title text-lg">Create a new block</h2>
                  <p className="text-sm text-base-content/70"></p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setIsAddModuleExpanded((prev) => {
                      const nextState = !prev;
                      if (!nextState) resetModuleForm();
                      return nextState;
                    })
                  }
                  className="btn btn-secondary btn-outline btn-sm"
                  aria-expanded={isAddModuleExpanded}
                >
                  {isAddModuleExpanded ? "Hide form" : "Add block"}
                </button>
              </div>

              {isAddModuleExpanded && (
                <>
                  {formError && (
                    <div className="alert alert-error text-sm">{formError}</div>
                  )}

                  <form className="space-y-3" onSubmit={handleAddModule}>
                    <label className="form-control">
                      <span className="label-text">Title</span>
                      <input
                        type="text"
                        value={newModule.title}
                        onChange={(event) =>
                          setNewModule((prev) => ({
                            ...prev,
                            title: event.target.value,
                          }))
                        }
                        className="input input-bordered"
                        placeholder="Explosive Acceleration"
                      />
                    </label>

                    <label className="form-control">
                      <span className="label-text">Description</span>
                      <textarea
                        className="textarea textarea-bordered"
                        rows={3}
                        placeholder="What's the intent?"
                        value={newModule.description}
                        onChange={(event) =>
                          setNewModule((prev) => ({
                            ...prev,
                            description: event.target.value,
                          }))
                        }
                      />
                    </label>

                    <div className="space-y-2 rounded-xl border border-base-300 bg-base-100 p-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-semibold">
                          Key/value pairs
                        </span>
                        <button
                          type="button"
                          className="btn btn-ghost btn-xs"
                          onClick={() =>
                            setNewModule((prev) => ({
                              ...prev,
                              attributes: [
                                ...prev.attributes,
                                {
                                  id: `attr-${(attributeIdCounter.current += 1)}`,
                                  key: "",
                                  value: "",
                                },
                              ],
                            }))
                          }
                        >
                          + Add pair
                        </button>
                      </div>

                      <div className="space-y-3">
                        {newModule.attributes.map((attribute, index) => (
                          <div
                            key={attribute.id}
                            className="grid grid-cols-1 gap-2 md:grid-cols-2"
                          >
                            <label className="form-control">
                              <span className="label-text">Key</span>
                              <input
                                type="text"
                                className="input input-bordered"
                                value={attribute.key}
                                onChange={(event) => {
                                  const updated = [...newModule.attributes];
                                  updated[index] = {
                                    ...attribute,
                                    key: event.target.value,
                                  };
                                  setNewModule((prev) => ({
                                    ...prev,
                                    attributes: updated,
                                  }));
                                }}
                                placeholder="e.g. Focus"
                              />
                            </label>
                            <label className="form-control">
                              <span className="label-text">Value</span>
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  className="input input-bordered flex-1"
                                  value={attribute.value}
                                  onChange={(event) => {
                                    const updated = [...newModule.attributes];
                                    updated[index] = {
                                      ...attribute,
                                      value: event.target.value,
                                    };
                                    setNewModule((prev) => ({
                                      ...prev,
                                      attributes: updated,
                                    }));
                                  }}
                                  placeholder="e.g. Moderate"
                                />
                                {newModule.attributes.length > 0 && (
                                  <button
                                    type="button"
                                    className="btn btn-ghost btn-square"
                                    aria-label="Remove pair"
                                    onClick={() =>
                                      setNewModule((prev) => ({
                                        ...prev,
                                        attributes: prev.attributes.filter(
                                          (_, attrIndex) => attrIndex !== index
                                        ),
                                      }))
                                    }
                                  >
                                    ✕
                                  </button>
                                )}
                              </div>
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row">
                      <button
                        type="submit"
                        className="btn btn-secondary w-full"
                      >
                        Add block to library
                      </button>
                      <button
                        type="button"
                        className="btn btn-ghost w-full"
                        onClick={resetModuleForm}
                      >
                        Clear form
                      </button>
                    </div>
                  </form>
                </>
              )}
            </div>
          </div>

          <div className="card bg-base-200 border border-base-300 shadow-md">
            <div className="card-body">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs font-semibold uppercase tracking-wide text-neutral">
                  Reusable blocks
                </p>
                <label className="input input-bordered input-sm flex items-center gap-2 sm:max-w-xs">
                  <input
                    type="search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search blocks"
                    className="grow"
                  />
                </label>
              </div>
              <div className="mt-3 max-h-[30rem] space-y-3 overflow-y-auto pr-1">
                {filteredModules.map((module) => (
                  <article
                    key={module.id}
                    draggable
                    onDragStart={() => setActiveDrag(module)}
                    onDragEnd={() => setActiveDrag(null)}
                    onClick={() =>
                      startEditingModule(module, {
                        type: "library",
                        moduleId: module.id,
                      })
                    }
                    className="card cursor-grab border border-base-200 bg-base-100 transition hover:border-primary"
                  >
                    <div className="card-body space-y-2 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <h2 className="font-semibold">{module.title}</h2>
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
                      <p className="text-sm text-base-content/70">
                        {module.description}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {module.attributes.map((attribute) => (
                          <span
                            key={attribute.id}
                            className="badge badge-outline badge-sm"
                          >
                            {attribute.key}: {attribute.value}
                          </span>
                        ))}
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
        </aside>

        <section className="w-full space-y-6 lg:w-2/3">
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
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {days.map((day) => (
                  <div
                    key={day.id}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={() => handleDrop(day.id)}
                    className="flex min-h-[220px] flex-col rounded-2xl border border-dashed border-base-200 bg-base-300 p-4"
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
                        <div
                          key={`${module.id}-${index}`}
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
                              <p className="font-semibold text-base-content">
                                {module.title}
                              </p>
                              <div className="flex flex-wrap gap-1">
                                {module.attributes.map((attribute) => (
                                  <span
                                    key={attribute.id}
                                    className="badge badge-outline badge-xs"
                                  >
                                    {attribute.key}: {attribute.value}
                                  </span>
                                ))}
                              </div>
                            </div>
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
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>

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
                  ? "Edit scheduled block"
                  : "Edit reusable block"}
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
            <form className="space-y-3 flex flex-col" onSubmit={handleSaveEditedModule}>
              <label className="form-control">
                <span className="label-text">Title</span>
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
                  className="input input-bordered"
                  placeholder="Explosive Acceleration"
                />
              </label>

              <label className="form-control">
                <span className="label-text">Description</span>
                <textarea
                  className="textarea textarea-bordered"
                  rows={3}
                  placeholder="What's the intent?"
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

              <div className="space-y-2 rounded-xl border border-base-300 bg-base-100 p-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold">Key/value pairs</span>
                  <button
                    type="button"
                    className="btn btn-ghost btn-xs"
                    onClick={() =>
                      setEditingModuleForm((prev) =>
                        prev
                          ? {
                              ...prev,
                              attributes: [
                                ...prev.attributes,
                                {
                                  id: `attr-${(attributeIdCounter.current += 1)}`,
                                  key: "",
                                  value: "",
                                },
                              ],
                            }
                          : prev
                      )
                    }
                  >
                    + Add pair
                  </button>
                </div>

                <div className="space-y-3">
                  {editingModuleForm.attributes.map((attribute, index) => (
                    <div
                      key={attribute.id}
                      className="grid grid-cols-1 gap-2 md:grid-cols-2"
                    >
                      <label className="form-control">
                        <span className="label-text">Key</span>
                        <input
                          type="text"
                          className="input input-bordered"
                          value={attribute.key}
                          onChange={(event) => {
                            const updated = [...editingModuleForm.attributes];
                            updated[index] = {
                              ...attribute,
                              key: event.target.value,
                            };
                            setEditingModuleForm((prev) =>
                              prev ? { ...prev, attributes: updated } : prev
                            );
                          }}
                          placeholder="e.g. Focus"
                        />
                      </label>
                      <label className="form-control">
                        <span className="label-text">Value</span>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            className="input input-bordered flex-1"
                            value={attribute.value}
                            onChange={(event) => {
                              const updated = [...editingModuleForm.attributes];
                              updated[index] = {
                                ...attribute,
                                value: event.target.value,
                              };
                              setEditingModuleForm((prev) =>
                                prev ? { ...prev, attributes: updated } : prev
                              );
                            }}
                            placeholder="e.g. Moderate"
                          />
                          {editingModuleForm.attributes.length > 0 && (
                            <button
                              type="button"
                              className="btn btn-ghost btn-square"
                              aria-label="Remove pair"
                              onClick={() =>
                                setEditingModuleForm((prev) =>
                                  prev
                                    ? {
                                        ...prev,
                                        attributes: prev.attributes.filter(
                                          (_, attrIndex) => attrIndex !== index
                                        ),
                                      }
                                    : prev
                                )
                              }
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      </label>
                    </div>
                  ))}
                </div>
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
  );
}
