"use client";

import {
  type DragEvent,
  Dispatch,
  FormEvent,
  SetStateAction,
  useMemo,
  useRef,
  useState,
} from "react";

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
  const [isEditMode, setIsEditMode] = useState(false);
  const [dropPreview, setDropPreview] = useState<
    { dayId: string; index: number } | null
  >(null);
  const libraryModuleCounter = useRef(initialModules.length);
  const scheduledModuleCounter = useRef(0);
  const dragPointerOffsetYRef = useRef<number | null>(null);
  const scheduleCardRefs = useRef<Record<string, (HTMLDivElement | null)[]>>({});

  const registerScheduleCardRef = (
    dayId: string,
    index: number,
    el: HTMLDivElement | null
  ) => {
    if (!scheduleCardRefs.current[dayId]) {
      scheduleCardRefs.current[dayId] = [];
    }

    scheduleCardRefs.current[dayId][index] = el;
  };

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

  const updateDropPreviewFromDragTop = (dayId: string, dragTop: number) => {
    const cards = scheduleCardRefs.current[dayId] ?? [];

    let targetIndex = cards.length;

    for (let index = 0; index < cards.length; index += 1) {
      const card = cards[index];
      if (!card) continue;

      const rect = card.getBoundingClientRect();

      if (dragTop < rect.top + rect.height / 2) {
        targetIndex = index;
        break;
      }
    }

    setDropPreview({ dayId, index: targetIndex });
  };

  const handleDayDragOver = (event: DragEvent<HTMLElement>, dayId: string) => {
    allowDrop(event);

    if (!activeDrag) return;

    const offsetFromPointer = dragPointerOffsetYRef.current ?? 0;
    const dragTop = event.clientY - offsetFromPointer;

    updateDropPreviewFromDragTop(dayId, dragTop);
  };

  const handleDrop = (dayId: string, targetIndex?: number) => {
    if (!activeDrag) return;

    setDropPreview(null);

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

  const isPreviewLocation = (dayId: string, index: number) =>
    dropPreview?.dayId === dayId && dropPreview.index === index;

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
    setIsEditMode(false);
  };

  const startEditingModule = (module: Module, context: EditingContext) => {
    setEditFormError(null);
    setIsEditMode(false);
    setEditingContext(context);
    setEditingModuleForm({
      title: module.title,
      description: module.description,
      category: module.category,
      subcategory: module.subcategory ?? "",
      distanceMeters:
        module.distanceMeters !== undefined ? String(module.distanceMeters) : "",
      durationMinutes:
        module.durationMinutes !== undefined ? String(module.durationMinutes) : "",
      durationSeconds:
        module.durationSeconds !== undefined ? String(module.durationSeconds) : "",
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
          <DrawerToggle targetId="reusable-blocks-drawer" />

          <ScheduleSection
            days={days}
            schedule={schedule}
            handleDayDragOver={handleDayDragOver}
            handleDrop={handleDrop}
            allowDrop={allowDrop}
            isPreviewLocation={isPreviewLocation}
            updateDropPreviewFromDragTop={updateDropPreviewFromDragTop}
            dragPointerOffsetYRef={dragPointerOffsetYRef}
            setActiveDrag={setActiveDrag}
            startEditingModule={startEditingModule}
            handleRemoveModule={handleRemoveModule}
            registerScheduleCardRef={registerScheduleCardRef}
            setDropPreview={setDropPreview}
            onAssignClick={() => setIsAssignModalOpen(true)}
          />
        </div>

        <CreateModuleModal
          isOpen={isCreateModuleModalOpen}
          newModule={newModule}
          formError={formError}
          onClose={closeCreateModuleModal}
          onSubmit={handleAddModule}
          onReset={resetModuleForm}
          onUpdate={setNewModule}
        />

        <AssignScheduleModal
          isOpen={isAssignModalOpen}
          athletes={athletes}
          selectedAthletes={selectedAthletes}
          toggleAthleteSelection={toggleAthleteSelection}
          onClose={() => setIsAssignModalOpen(false)}
          onAssign={handleAssignToAthletes}
        />

        <EditModuleModal
          isOpen={Boolean(editingContext)}
          editingContext={editingContext}
          editingModuleForm={editingModuleForm}
          editFormError={editFormError}
          isEditMode={isEditMode}
          setIsEditMode={setIsEditMode}
          setEditingModuleForm={setEditingModuleForm}
          onClose={closeEditModal}
          onSave={handleSaveEditedModule}
        />
      </div>

      <ReusableBlocksDrawer
        search={search}
        setSearch={setSearch}
        filteredModules={filteredModules}
        setActiveDrag={setActiveDrag}
        dragPointerOffsetYRef={dragPointerOffsetYRef}
        setDropPreview={setDropPreview}
        startEditingModule={startEditingModule}
        handleRemoveLibraryModule={handleRemoveLibraryModule}
        resetModuleForm={resetModuleForm}
        openCreateModal={() => setIsCreateModuleModalOpen(true)}
      />
    </div>
  );
}

type DrawerToggleProps = {
  targetId: string;
};

function DrawerToggle({ targetId }: DrawerToggleProps) {
  return (
    <div className="flex items-center justify-between">
      <label htmlFor={targetId} className="btn btn-primary btn-sm lg:hidden">
        Visa reusable blocks
      </label>
    </div>
  );
}

type ScheduleSectionProps = {
  days: { id: string; label: string }[];
  schedule: DaySchedule;
  handleDayDragOver: (event: DragEvent<HTMLElement>, dayId: string) => void;
  handleDrop: (dayId: string, targetIndex?: number) => void;
  allowDrop: (event: DragEvent) => void;
  isPreviewLocation: (dayId: string, index: number) => boolean;
  updateDropPreviewFromDragTop: (dayId: string, dragTop: number) => void;
  dragPointerOffsetYRef: React.MutableRefObject<number | null>;
  setActiveDrag: React.Dispatch<React.SetStateAction<ActiveDrag | null>>;
  startEditingModule: (module: Module, context: EditingContext) => void;
  handleRemoveModule: (dayId: string, moduleIndex: number) => void;
  registerScheduleCardRef: (
    dayId: string,
    index: number,
    el: HTMLDivElement | null
  ) => void;
  setDropPreview: React.Dispatch<
    React.SetStateAction<{ dayId: string; index: number } | null>
  >;
  onAssignClick: () => void;
};

function ScheduleSection({
  days,
  schedule,
  handleDayDragOver,
  handleDrop,
  allowDrop,
  isPreviewLocation,
  updateDropPreviewFromDragTop,
  dragPointerOffsetYRef,
  setActiveDrag,
  startEditingModule,
  handleRemoveModule,
  registerScheduleCardRef,
  setDropPreview,
  onAssignClick,
}: ScheduleSectionProps) {
  return (
    <section className="w-full max-w-full self-center space-y-6">
      <div className="card bg-base-200 border border-base-300 shadow-md">
        <div className="card-body gap-6">
          <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-neutral">
                Schedule in progress
              </p>
              <h2 className="text-3xl font-semibold">Camp Momentum · Week 43</h2>
            </div>

            <button className="btn btn-secondary btn-sm" onClick={onAssignClick}>
              Assign schedule
            </button>
          </header>

          <div className="grid grid-cols-1 gap-1 md:grid-cols-2 xl:grid-cols-7">
            {days.map((day) => (
              <DayColumn
                key={day.id}
                day={day}
                modules={schedule[day.id]}
                allowDrop={allowDrop}
                handleDayDragOver={handleDayDragOver}
                handleDrop={handleDrop}
                isPreviewLocation={isPreviewLocation}
                updateDropPreviewFromDragTop={updateDropPreviewFromDragTop}
                dragPointerOffsetYRef={dragPointerOffsetYRef}
                setActiveDrag={setActiveDrag}
                startEditingModule={startEditingModule}
                handleRemoveModule={handleRemoveModule}
                registerScheduleCardRef={registerScheduleCardRef}
                setDropPreview={setDropPreview}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

type DayColumnProps = {
  day: { id: string; label: string };
  modules: Module[];
  allowDrop: (event: DragEvent) => void;
  handleDayDragOver: (event: DragEvent<HTMLElement>, dayId: string) => void;
  handleDrop: (dayId: string, targetIndex?: number) => void;
  isPreviewLocation: (dayId: string, index: number) => boolean;
  updateDropPreviewFromDragTop: (dayId: string, dragTop: number) => void;
  dragPointerOffsetYRef: React.MutableRefObject<number | null>;
  setActiveDrag: React.Dispatch<React.SetStateAction<ActiveDrag | null>>;
  startEditingModule: (module: Module, context: EditingContext) => void;
  handleRemoveModule: (dayId: string, moduleIndex: number) => void;
  registerScheduleCardRef: (
    dayId: string,
    index: number,
    el: HTMLDivElement | null
  ) => void;
  setDropPreview: React.Dispatch<
    React.SetStateAction<{ dayId: string; index: number } | null>
  >;
};

function DayColumn({
  day,
  modules,
  allowDrop,
  handleDayDragOver,
  handleDrop,
  isPreviewLocation,
  updateDropPreviewFromDragTop,
  dragPointerOffsetYRef,
  setActiveDrag,
  startEditingModule,
  handleRemoveModule,
  registerScheduleCardRef,
  setDropPreview,
}: DayColumnProps) {
  return (
    <div
      onDragOver={(event) => handleDayDragOver(event, day.id)}
      onDrop={() => handleDrop(day.id)}
      onDragLeave={(event) => {
        if (!(event.currentTarget as HTMLElement).contains(event.relatedTarget as Node)) {
          setDropPreview(null);
        }
      }}
      className="flex min-h-[600px] flex-col rounded-2xl border border-dashed border-base-200 bg-base-300 p-2"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-neutral">
            {day.label}
          </p>
        </div>
      </div>

      <div className="mt-3 flex-1 space-y-1">
        {modules.length === 0 && (
          <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-base-200 bg-base-100/60 p-4 text-center text-xs text-base-content/60">
            Drag a module to begin
          </div>
        )}

        {modules.map((module, index) => (
          <div key={`${module.id}-${index}`} className="space-y-2">
            <DropPreviewBar
              dayId={day.id}
              index={index}
              isActive={isPreviewLocation(day.id, index)}
              onDrop={(event) => {
                event.stopPropagation();
                handleDrop(day.id, index);
              }}
              onDragEnter={(event) => {
                event.stopPropagation();
                const dragTop = event.clientY - (dragPointerOffsetYRef.current ?? 0);
                updateDropPreviewFromDragTop(day.id, dragTop);
              }}
              onDragOver={allowDrop}
            />

            <ScheduledModuleCard
              dayId={day.id}
              index={index}
              module={module}
              allowDrop={allowDrop}
              handleDrop={handleDrop}
              dragPointerOffsetYRef={dragPointerOffsetYRef}
              setActiveDrag={setActiveDrag}
              startEditingModule={startEditingModule}
              handleRemoveModule={handleRemoveModule}
              registerScheduleCardRef={registerScheduleCardRef}
            />
          </div>
        ))}

        {modules.length > 0 && (
          <DropPreviewBar
            dayId={day.id}
            index={modules.length}
            isActive={isPreviewLocation(day.id, modules.length)}
            onDrop={(event) => {
              event.stopPropagation();
              handleDrop(day.id, modules.length);
            }}
            onDragEnter={(event) => {
              event.stopPropagation();
              const dragTop = event.clientY - (dragPointerOffsetYRef.current ?? 0);
              updateDropPreviewFromDragTop(day.id, dragTop);
            }}
            onDragOver={(event) => handleDayDragOver(event as DragEvent<HTMLElement>, day.id)}
          />
        )}
      </div>
    </div>
  );
}

type DropPreviewBarProps = {
  dayId: string;
  index: number;
  isActive: boolean;
  onDrop: (event: DragEvent<HTMLDivElement>) => void;
  onDragEnter: (event: DragEvent<HTMLDivElement>) => void;
  onDragOver: (event: DragEvent<HTMLDivElement>) => void;
};

function DropPreviewBar({ isActive, onDrop, onDragEnter, onDragOver }: DropPreviewBarProps) {
  return (
    <div
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnter={onDragEnter}
      className={`h-1 w-full rounded-full transition-all duration-150 ${
        isActive ? "bg-primary shadow-[0_0_0_2px] shadow-primary/30" : "bg-transparent"
      }`}
    />
  );
}

type ScheduledModuleCardProps = {
  dayId: string;
  index: number;
  module: Module;
  allowDrop: (event: DragEvent) => void;
  handleDrop: (dayId: string, targetIndex?: number) => void;
  dragPointerOffsetYRef: React.MutableRefObject<number | null>;
  setActiveDrag: React.Dispatch<React.SetStateAction<ActiveDrag | null>>;
  startEditingModule: (module: Module, context: EditingContext) => void;
  handleRemoveModule: (dayId: string, moduleIndex: number) => void;
  registerScheduleCardRef: (
    dayId: string,
    index: number,
    el: HTMLDivElement | null
  ) => void;
};

function ScheduledModuleCard({
  dayId,
  index,
  module,
  allowDrop,
  handleDrop,
  dragPointerOffsetYRef,
  setActiveDrag,
  startEditingModule,
  handleRemoveModule,
  registerScheduleCardRef,
}: ScheduledModuleCardProps) {
  return (
    <div
      draggable
      onDragOver={allowDrop}
      onDrop={(event) => {
        event.stopPropagation();
        handleDrop(dayId, index);
      }}
      onDragStart={(event) => {
        const rect = (event.currentTarget as HTMLDivElement).getBoundingClientRect();
        dragPointerOffsetYRef.current = event.clientY - rect.top;

        setActiveDrag({
          module,
          source: {
            type: "schedule",
            dayId,
            moduleIndex: index,
          },
        });
      }}
      onDragEnd={() => {
        setActiveDrag(null);
      }}
      onClick={() =>
        startEditingModule(module, {
          type: "schedule",
          moduleId: module.id,
          dayId,
          moduleIndex: index,
        })
      }
      ref={(el) => registerScheduleCardRef(dayId, index, el)}
      className="w-full cursor-grab rounded-xl border border-base-200 bg-base-100 p-3 transition hover:border-primary active:cursor-grabbing"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-1 text-xs text-base-content/60">
          <div className="flex flex-row justify-between">
            <p className="font-semibold text-base-content">{module.title}</p>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                handleRemoveModule(dayId, index);
              }}
              className="btn btn-ghost btn-xs text-error"
              aria-label={`Delete ${module.title}`}
            >
              Delete
            </button>
          </div>
          <p className="text-xs text-base-content/70">{module.description}</p>
          <ModuleBadges module={module} />
        </div>
      </div>
    </div>
  );
}

type ModuleBadgesProps = {
  module: Module;
};

function ModuleBadges({ module }: ModuleBadgesProps) {
  return (
    <div className="flex flex-wrap gap-1">
      <span className="badge badge-outline badge-xs capitalize">{module.category}</span>
      {module.subcategory && (
        <span className="badge badge-outline badge-xs">Underkategori: {module.subcategory}</span>
      )}
      {module.distanceMeters !== undefined && (
        <span className="badge badge-outline badge-xs">Distans: {module.distanceMeters} m</span>
      )}
      {formatDuration(module.durationMinutes, module.durationSeconds) && (
        <span className="badge badge-outline badge-xs">
          Tid: {formatDuration(module.durationMinutes, module.durationSeconds)}
        </span>
      )}
      {module.weightKg !== undefined && (
        <span className="badge badge-outline badge-xs">Vikt: {module.weightKg} kg</span>
      )}
    </div>
  );
}

type CreateModuleModalProps = {
  isOpen: boolean;
  newModule: ModuleForm;
  formError: string | null;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onReset: () => void;
  onUpdate: Dispatch<SetStateAction<ModuleForm>>;
};

function CreateModuleModal({
  isOpen,
  newModule,
  formError,
  onClose,
  onSubmit,
  onReset,
  onUpdate,
}: CreateModuleModalProps) {
  return (
    <dialog className={`modal ${isOpen ? "modal-open" : ""}`}>
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
            <button type="submit" className="btn btn-secondary flex-1">
              Skapa block
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

type ModuleFormFieldsProps = {
  formState: ModuleForm;
  onChange: Dispatch<SetStateAction<ModuleForm>>;
};

function ModuleFormFields({ formState, onChange }: ModuleFormFieldsProps) {
  return (
    <div className="flex flex-col gap-4">
      <label className="form-control flex flex-col gap-1">
        <span className="label-text text-sm">Titel:</span>
        <input
          type="text"
          value={formState.title}
          onChange={(event) =>
            onChange((prev) => ({
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
          value={formState.description}
          onChange={(event) =>
            onChange((prev) => ({
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
          value={formState.category}
          onChange={(event) =>
            onChange((prev) => ({
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
          value={formState.subcategory}
          onChange={(event) =>
            onChange((prev) => ({
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
          value={formState.distanceMeters}
          onChange={(event) =>
            onChange((prev) => ({
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
          value={formState.weightKg}
          onChange={(event) =>
            onChange((prev) => ({
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
            className="input input-sm input-bordered w-15"
            value={formState.durationMinutes}
            onChange={(event) =>
              onChange((prev) => ({
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
            className="input input-sm input-bordered w-15"
            value={formState.durationSeconds}
            onChange={(event) =>
              onChange((prev) => ({
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
  );
}

type AssignScheduleModalProps = {
  isOpen: boolean;
  athletes: Athlete[];
  selectedAthletes: string[];
  toggleAthleteSelection: (athleteId: string) => void;
  onClose: () => void;
  onAssign: () => void;
};

function AssignScheduleModal({
  isOpen,
  athletes,
  selectedAthletes,
  toggleAthleteSelection,
  onClose,
  onAssign,
}: AssignScheduleModalProps) {
  return (
    <dialog className={`modal ${isOpen ? "modal-open" : ""}`}>
      <div className="modal-box max-w-l space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-xl font-semibold">Assign schedule</h3>
          </div>
          <button className="btn btn-circle btn-ghost btn-sm" onClick={onClose}>
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

function EditModuleModal({
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
  return (
    <dialog className={`modal ${isOpen ? "modal-open" : ""}`}>
      <div className="modal-box max-w-md space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-xl font-semibold">{editingContext?.moduleId}</h3>
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

type ReusableBlocksDrawerProps = {
  search: string;
  setSearch: Dispatch<SetStateAction<string>>;
  filteredModules: Module[];
  setActiveDrag: Dispatch<SetStateAction<ActiveDrag | null>>;
  dragPointerOffsetYRef: React.MutableRefObject<number | null>;
  setDropPreview: Dispatch<
    SetStateAction<{ dayId: string; index: number } | null>
  >;
  startEditingModule: (module: Module, context: EditingContext) => void;
  handleRemoveLibraryModule: (moduleId: string) => void;
  resetModuleForm: () => void;
  openCreateModal: () => void;
};

function ReusableBlocksDrawer({
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
}: ReusableBlocksDrawerProps) {
  return (
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
          <label htmlFor="reusable-blocks-drawer" className="btn btn-ghost btn-circle btn-xs lg:hidden">
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
              openCreateModal();
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
              onDragStart={(event) => {
                const rect = (event.currentTarget as HTMLDivElement).getBoundingClientRect();
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
                <ModuleBadges module={module} />
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
  );
}
