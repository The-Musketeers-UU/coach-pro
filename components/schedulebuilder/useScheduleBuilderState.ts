import {
  type DragEvent,
  type FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  type ActiveDrag,
  type Athlete,
  type DaySchedule,
  type DropPreviewLocation,
  type Day,
  type EditingContext,
  type Module,
  type ModuleForm,
} from "./types";

const createInitialFormState = (): ModuleForm => ({
  title: "",
  description: "",
  category: "",
  subcategory: [],
  distanceMeters: [],
  duration: [],
  weightKg: [],
  feedbackDescription: [],
  feedbackNumericValue: [],
  feedbackRating: [],
  feedbackComment: [],
});

const createEmptySchedule = (days: Day[]): DaySchedule =>
  days.reduce((acc, day) => ({ ...acc, [day.id]: [] }), {} as DaySchedule);

type UseScheduleBuilderStateArgs = {
  days: Day[];
  initialModules: Module[];
  athletes: Athlete[];
  persistModule: (module: Module) => Promise<Module>;
};

export const useScheduleBuilderState = ({
  days,
  initialModules,
  athletes,
  persistModule,
}: UseScheduleBuilderStateArgs) => {
  const [search, setSearch] = useState("");
  const [activeDrag, setActiveDrag] = useState<ActiveDrag | null>(null);
  const [moduleLibrary, setModuleLibrary] = useState<Module[]>(initialModules);
  const [schedule, setSchedule] = useState<DaySchedule>(() =>
    createEmptySchedule(days)
  );
  const [selectedScheduleModuleIds, setSelectedScheduleModuleIds] = useState<
    string[]
  >([]);
  const [expandedScheduleModuleIds, setExpandedScheduleModuleIds] = useState<
    string[]
  >([]);
  const [newModule, setNewModule] = useState<ModuleForm>(() =>
    createInitialFormState()
  );
  const [formError, setFormError] = useState<string | null>(null);
  const [isCreateModuleModalOpen, setIsCreateModuleModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedAthletes, setSelectedAthletes] = useState<string[]>([]);
  const [isSavingModule, setIsSavingModule] = useState(false);
  const [editingContext, setEditingContext] = useState<EditingContext | null>(
    null
  );
  const [editingModuleForm, setEditingModuleForm] = useState<ModuleForm | null>(
    null
  );
  const [editFormError, setEditFormError] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [dropPreview, setDropPreview] = useState<DropPreviewLocation | null>(
    null
  );

  const libraryModuleCounter = useRef(initialModules.length);
  const scheduledModuleCounter = useRef(0);
  const dragPointerOffsetYRef = useRef<number | null>(null);
  const scheduleCardRefs = useRef<Record<string, (HTMLDivElement | null)[]>>({});

  useEffect(() => {
    // Keep the builder library in sync when Supabase data refreshes.
    setModuleLibrary(initialModules);
    libraryModuleCounter.current = initialModules.length;
  }, [initialModules]);

  const calculateScheduledModuleCount = useCallback(
    (nextSchedule: DaySchedule) =>
      Object.values(nextSchedule).reduce(
        (total, modulesForDay) => total + modulesForDay.length,
        0
      ),
    []
  );

  const setScheduleState = useCallback(
    (nextSchedule: DaySchedule, scheduledCount?: number) => {
      setSchedule(nextSchedule);
      const totalModules =
        scheduledCount ?? calculateScheduledModuleCount(nextSchedule);
      scheduledModuleCounter.current = totalModules;
    },
    [calculateScheduledModuleCount]
  );

  const filteredModules = useMemo(() => {
    return moduleLibrary.filter((module) =>
      module.title.toLowerCase().includes(search.toLowerCase())
    );
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
      duration: module.duration,
      weightKg: module.weightKg,
      feedbackDescription: module.feedbackDescription,
      feedbackNumericValue: module.feedbackNumericValue,
      feedbackRating: module.feedbackRating,
      feedbackComment: module.feedbackComment,
      sourceModuleId: module.sourceModuleId ?? module.id,
    };
  };

  const allowDrop = (event: DragEvent) => {
    event.preventDefault();
  };

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

    if (
      activeDrag.source.type === "schedule" &&
      selectedScheduleModuleIds.includes(activeDrag.module.id) &&
      selectedScheduleModuleIds.length > 1
    ) {
      const movingModuleIds = new Set(selectedScheduleModuleIds);

      setSchedule((prev) => {
        const movingModules: Module[] = [];
        const nextSchedule: DaySchedule = {};
        const insertAt = targetIndex ?? (prev[dayId]?.length ?? 0);
        let removedBeforeTarget = 0;

        for (const day of days) {
          const modulesForDay = prev[day.id] ?? [];
          const remainingForDay: Module[] = [];

          modulesForDay.forEach((scheduledModule, index) => {
            if (movingModuleIds.has(scheduledModule.id)) {
              movingModules.push(scheduledModule);
              if (day.id === dayId && index < insertAt) {
                removedBeforeTarget += 1;
              }
            } else {
              remainingForDay.push(scheduledModule);
            }
          });

          nextSchedule[day.id] = remainingForDay;
        }

        if (movingModules.length === 0) {
          return prev;
        }

        const adjustedInsertAt = Math.max(0, insertAt - removedBeforeTarget);
        const destinationModules = [...(nextSchedule[dayId] ?? [])];
        destinationModules.splice(adjustedInsertAt, 0, ...movingModules);
        nextSchedule[dayId] = destinationModules;

        return nextSchedule;
      });

      setActiveDrag(null);
      return;
    }

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
    const moduleIdToRemove = schedule[dayId]?.[moduleIndex]?.id;

    setSchedule((prev) => ({
      ...prev,
      [dayId]: prev[dayId].filter((_, index) => index !== moduleIndex),
    }));

    if (moduleIdToRemove) {
      setSelectedScheduleModuleIds((prev) =>
        prev.filter((moduleId) => moduleId !== moduleIdToRemove)
      );
      setExpandedScheduleModuleIds((prev) =>
        prev.filter((moduleId) => moduleId !== moduleIdToRemove)
      );
    }
  };

  const handleSelectScheduledModule = (
    moduleId: string,
    isMultiSelect: boolean
  ) => {
    setSelectedScheduleModuleIds((prev) => {
      if (isMultiSelect) {
        return prev.includes(moduleId)
          ? prev.filter((id) => id !== moduleId)
          : [...prev, moduleId];
      }

      return [moduleId];
    });
  };

  const clearSelectedScheduleModules = useCallback(() => {
    setSelectedScheduleModuleIds([]);
  }, []);

  const removeSelectedScheduleModules = useCallback(() => {
    if (selectedScheduleModuleIds.length === 0) return;

    setSchedule((prev) => {
      let hasChanges = false;
      const nextSchedule: DaySchedule = {};

      days.forEach((day) => {
        const modulesForDay = prev[day.id] ?? [];
        const filteredModules = modulesForDay.filter(
          (module) => !selectedScheduleModuleIds.includes(module.id)
        );

        if (filteredModules.length !== modulesForDay.length) {
          hasChanges = true;
        }

        nextSchedule[day.id] = filteredModules;
      });

      return hasChanges ? nextSchedule : prev;
    });

    setSelectedScheduleModuleIds([]);
    setExpandedScheduleModuleIds((prev) =>
      prev.filter((moduleId) => !selectedScheduleModuleIds.includes(moduleId))
    );
  }, [days, selectedScheduleModuleIds]);

  const toggleScheduledModuleExpansion = (moduleId: string) => {
    setExpandedScheduleModuleIds((prev) =>
      prev.includes(moduleId)
        ? prev.filter((id) => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  const resetModuleForm = () => {
    setNewModule(createInitialFormState());
    setFormError(null);
  };

  const parseOptionalNumber = (value: string, label: string) => {
    const trimmed = value.trim();
    if (!trimmed) return { value: undefined as number | undefined } as const;

    const parsed = Number(trimmed);
    if (Number.isNaN(parsed) || parsed < 0) {
      return {
        error: `${label} måste vara ett icke-negativt tal.`,
      } as const;
    }

    return { value: parsed } as const;
  };

  const parseNumberList = (values: string[], label: string) => {
    const parsedValues: number[] = [];

    for (const value of values) {
      const result = parseOptionalNumber(value, label);
      if ("error" in result) return result;
      if (result.value !== undefined) parsedValues.push(result.value);
    }

    return { values: parsedValues } as const;
  };

  const prepareModuleToSave = (
    formState: ModuleForm,
    moduleId?: string
  ): { module?: Module; error?: string } => {
    const trimmedTitle = formState.title.trim();
    const trimmedDescription = formState.description.trim();
    const selectedCategory = formState.category;
    const trimmedSubcategories = formState.subcategory
      .map((value) => value.trim())
      .filter(Boolean);

    const preparedFeedbackDescriptions = formState.feedbackDescription.map(
      (value) => value.trim()
    );

    const feedbackNumericValueResult = formState.feedbackNumericValue.map(
      (value) => {
        const trimmed = value.trim();
        if (!trimmed) return null;

        const parsed = Number(trimmed);
        if (Number.isNaN(parsed) || parsed < 0) {
          return { error: "Numeriskt feedbackvärde måste vara ett tal." } as const;
        }

        return parsed as number;
      }
    );

    const numericError = feedbackNumericValueResult.find(
      (entry) => typeof entry === "object" && entry !== null && "error" in entry
    );
    if (numericError && typeof numericError === "object" && "error" in numericError) {
      return { error: numericError.error } as const;
    }

    const feedbackRatingResult = formState.feedbackRating.map((value) => {
      const trimmed = value.trim();
      if (!trimmed) return null;

      const parsed = Number(trimmed);
      if (Number.isNaN(parsed)) {
        return { error: "Feedbackbetyg måste vara ett tal." } as const;
      }

      if (parsed < 1 || parsed > 10) {
        return { error: "Feedbackbetyg måste vara mellan 1 och 10." } as const;
      }

      return parsed as number;
    });

    const ratingError = feedbackRatingResult.find(
      (entry) => typeof entry === "object" && entry !== null && "error" in entry
    );
    if (ratingError && typeof ratingError === "object" && "error" in ratingError) {
      return { error: ratingError.error } as const;
    }

    if (!trimmedTitle || !trimmedDescription || !selectedCategory) {
      return {
        error: "Titel, beskrivning och kategori är obligatoriska.",
      };
    }

    const distanceResult = parseNumberList(
      formState.distanceMeters,
      "Distans"
    );
    if ("error" in distanceResult) return { error: distanceResult.error };

    const durationResults = formState.duration.map((entry, index) => {
      const minutesResult = parseOptionalNumber(
        entry.minutes,
        `Minuter #${index + 1}`
      );
      if ("error" in minutesResult) return minutesResult;

      const secondsResult = parseOptionalNumber(
        entry.seconds,
        `Sekunder #${index + 1}`
      );
      if ("error" in secondsResult) return secondsResult;

      if (secondsResult.value !== undefined && secondsResult.value >= 60) {
        return { error: "Sekunder måste vara under 60." } as const;
      }

      if (
        minutesResult.value === undefined &&
        secondsResult.value === undefined
      ) {
        return { value: undefined } as const;
      }

      return {
        value: {
          minutes: minutesResult.value,
          seconds: secondsResult.value,
        },
      } as const;
    });

    const durationErrors = durationResults.find((result) => "error" in result);
    if (durationErrors && "error" in durationErrors)
      return { error: durationErrors.error };

    const durationValues = durationResults
      .map((result) => ("value" in result ? result.value : undefined))
      .filter(Boolean);

    const weightResult = parseNumberList(formState.weightKg, "Vikt");
    if ("error" in weightResult) return { error: weightResult.error };

    const preparedFeedbackComments = formState.feedbackComment.map((value) =>
      value.trim()
    );

    return {
      module: {
        id: moduleId ?? `mod-${(libraryModuleCounter.current += 1)}`,
        title: trimmedTitle,
        description: trimmedDescription,
        category: selectedCategory,
        subcategory: trimmedSubcategories.length
          ? trimmedSubcategories
          : undefined,
        distanceMeters: distanceResult.values?.length
          ? distanceResult.values
          : undefined,
        duration: durationValues.length ? durationValues : undefined,
        weightKg: weightResult.values?.length ? weightResult.values : undefined,
        feedbackDescription: preparedFeedbackDescriptions.length
          ? preparedFeedbackDescriptions
          : undefined,
        feedbackNumericValue: feedbackNumericValueResult.length
          ? (feedbackNumericValueResult as (number | null)[])
          : undefined,
        feedbackRating: feedbackRatingResult.length
          ? (feedbackRatingResult as (number | null)[])
          : undefined,
        feedbackComment: preparedFeedbackComments.length
          ? preparedFeedbackComments
          : undefined,
        sourceModuleId: moduleId,
      },
    };
  };

  const handleAddModule = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isSavingModule) return;

    const result = prepareModuleToSave(newModule);

    if (result.error) {
      setFormError(result.error);
      return;
    }

    if (!result.module) return;

    setFormError(null);
    setIsSavingModule(true);

    try {
      const savedModule = await persistModule(result.module);
      const savedWithExtras: Module = {
        ...savedModule,
        feedbackDescription: result.module.feedbackDescription,
        feedbackNumericValue: result.module.feedbackNumericValue,
        feedbackRating: result.module.feedbackRating,
        feedbackComment: result.module.feedbackComment,
      };

      setModuleLibrary((prev) => [savedWithExtras, ...prev]);

      resetModuleForm();
      setIsCreateModuleModalOpen(false);
    } catch (persistError) {
      setFormError(
        persistError instanceof Error
          ? persistError.message
          : String(persistError)
      );
    } finally {
      setIsSavingModule(false);
    }
  };

  const closeCreateModuleModal = () => {
    setIsCreateModuleModalOpen(false);
    resetModuleForm();
  };

  const startEditingModule = (module: Module, context: EditingContext) => {
    setEditFormError(null);
    setIsEditMode(false);
    setEditingContext(context);
    setEditingModuleForm({
      title: module.title,
      description: module.description,
      category: module.category,
      subcategory: module.subcategory ?? [],
      distanceMeters:
        module.distanceMeters?.map((value) => String(value)) ?? [],
      duration:
        module.duration?.map((value) => ({
          minutes:
            value.minutes !== undefined ? String(value.minutes) : "",
          seconds:
            value.seconds !== undefined ? String(value.seconds) : "",
        })) ?? [],
      weightKg: module.weightKg?.map((value) => String(value)) ?? [],
      feedbackDescription: module.feedbackDescription ?? [],
      feedbackNumericValue:
        module.feedbackNumericValue?.map((value) =>
          value === null || value === undefined ? "" : String(value)
        ) ?? [],
      feedbackRating:
        module.feedbackRating?.map((value) =>
          value === null || value === undefined ? "" : String(value)
        ) ?? [],
      feedbackComment: module.feedbackComment ?? [],
    });
  };

  const closeEditModal = () => {
    setEditingContext(null);
    setEditingModuleForm(null);
    setEditFormError(null);
    setIsEditMode(false);
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
              ? {
                  ...result.module!,
                  id: module.id,
                  sourceModuleId: module.sourceModuleId ?? result.module?.id,
                }
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

  return {
    libraryControls: {
      search,
      setSearch,
      filteredModules,
      newModule,
      formError,
      setNewModule,
      handleAddModule,
      resetModuleForm,
      isSavingModule,
      isCreateModuleModalOpen,
      openCreateModal: () => setIsCreateModuleModalOpen(true),
      closeCreateModal: closeCreateModuleModal,
      handleRemoveLibraryModule,
    },
    scheduleControls: {
      schedule,
      setScheduleState,
      handleDayDragOver,
      handleDrop,
      allowDrop,
      isPreviewLocation,
      handleRemoveModule,
      registerScheduleCardRef,
      selectedScheduleModuleIds,
      expandedScheduleModuleIds,
      handleSelectScheduledModule,
      clearSelectedScheduleModules,
      removeSelectedScheduleModules,
      toggleScheduledModuleExpansion,
    },
    editingControls: {
      editingContext,
      editingModuleForm,
      editFormError,
      isEditMode,
      setIsEditMode,
      setEditingModuleForm,
      startEditingModule,
      handleSaveEditedModule,
      closeEditModal,
    },
    assignControls: {
      isAssignModalOpen,
      openAssignModal: () => setIsAssignModalOpen(true),
      closeAssignModal: () => setIsAssignModalOpen(false),
      selectedAthletes,
      toggleAthleteSelection,
      handleAssignToAthletes,
      athletes,
    },
    dragState: {
      activeDrag,
      setActiveDrag,
      dragPointerOffsetYRef,
      updateDropPreviewFromDragTop,
      setDropPreview,
    },
  };
};
