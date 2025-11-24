"use client";

import { type DragEvent, type FormEvent, useMemo, useRef, useState } from "react";

import {
  type ActiveDrag,
  type Athlete,
  type DaySchedule,
  type EditingContext,
  type Module,
  type ModuleForm,
  AssignScheduleModal,
  CreateModuleModal,
  DrawerToggle,
  EditModuleModal,
  ReusableBlocksDrawer,
  ScheduleSection,
} from "@/components/dashboard";

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
