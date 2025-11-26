"use client";

import { useEffect, useMemo, useState } from "react";

import {
  type Athlete,
  type Day,
  type Module,
  AssignScheduleModal,
  CreateModuleModal,
  DrawerHandle,
  DrawerToggle,
  EditModuleModal,
  ReusableBlocksDrawer,
  ScheduleSection,
  useScheduleBuilderState,
} from "@/components/schedulebuilder";

type WeekOption = { value: string; label: string };

const MILLISECONDS_IN_WEEK = 7 * 24 * 60 * 60 * 1000;

const getIsoWeekInfo = (date: Date) => {
  const target = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNumber = (target.getUTCDay() + 6) % 7;
  target.setUTCDate(target.getUTCDate() - dayNumber + 3);

  const firstThursday = new Date(Date.UTC(target.getUTCFullYear(), 0, 4));
  const firstThursdayDayNumber = (firstThursday.getUTCDay() + 6) % 7;
  firstThursday.setUTCDate(firstThursday.getUTCDate() - firstThursdayDayNumber + 3);

  const weekNumber =
    1 + Math.round((target.getTime() - firstThursday.getTime()) / MILLISECONDS_IN_WEEK);

  return { weekNumber, year: target.getUTCFullYear() } as const;
};

const getStartOfIsoWeek = (date: Date) => {
  const result = new Date(date);
  const day = result.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  result.setDate(result.getDate() + diff);
  result.setHours(0, 0, 0, 0);

  return result;
};

const createRollingWeekOptions = (): WeekOption[] => {
  const today = new Date();
  const startOfCurrentWeek = getStartOfIsoWeek(today);
  const endDate = new Date(startOfCurrentWeek);
  endDate.setFullYear(endDate.getFullYear() + 1);

  const options: WeekOption[] = [];
  let currentWeekStart = startOfCurrentWeek;

  while (currentWeekStart <= endDate) {
    const { weekNumber, year } = getIsoWeekInfo(currentWeekStart);
    const value = `${year}-W${weekNumber}`;
    const label = `Vecka ${weekNumber} (${year})`;

    options.push({ value, label });

    currentWeekStart = new Date(currentWeekStart.getTime() + MILLISECONDS_IN_WEEK);
  }

  return options;
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

const days: Day[] = [
  { id: "mon", label: "Måndag" },
  { id: "tue", label: "Tisdag" },
  { id: "wed", label: "Onsdag" },
  { id: "thu", label: "Torsdag" },
  { id: "fri", label: "Fredag" },
  { id: "sat", label: "Lördag" },
  { id: "sun", label: "Söndag" },
];

const athletes: Athlete[] = [
  {
    id: "ath-1",
    name: "Jordan Vega",
    sport: "800m",
  },
];

export default function CoachDashboard() {
  const weekOptions = useMemo(() => createRollingWeekOptions(), []);
  const [selectedWeek, setSelectedWeek] = useState<string>(() => weekOptions[0]?.value ?? "");
  const [scheduleTitle, setScheduleTitle] = useState("Träningsläger");

  const {
    libraryControls,
    scheduleControls,
    editingControls,
    assignControls,
    dragState,
  } = useScheduleBuilderState({
    days,
    initialModules,
    athletes,
  });

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 1536px)");

    const syncDrawerWithScreenSize = () => {
      setIsDrawerOpen(mediaQuery.matches);
    };

    syncDrawerWithScreenSize();
    mediaQuery.addEventListener("change", syncDrawerWithScreenSize);

    return () => mediaQuery.removeEventListener("change", syncDrawerWithScreenSize);
  }, []);

  return (
    <div className={`drawer ${isDrawerOpen ? "drawer-open" : ""} 2xl:drawer-open`}>
      <input
        id="reusable-blocks-drawer"
        type="checkbox"
        className="drawer-toggle"
        checked={isDrawerOpen}
        onChange={(event) => setIsDrawerOpen(event.target.checked)}
      />
      <div className="drawer-content min-h-screen 2xl:ml-[260px]">
        <DrawerHandle
          isOpen={isDrawerOpen}
          onOpen={() => setIsDrawerOpen(true)}
        />
        <div className="mx-auto max-w-full px-5 py-5">
          <DrawerToggle
            targetId="reusable-blocks-drawer"
            onOpen={() => setIsDrawerOpen(true)}
          />

          <ScheduleSection
            days={days}
            schedule={scheduleControls.schedule}
            handleDayDragOver={scheduleControls.handleDayDragOver}
            handleDrop={scheduleControls.handleDrop}
            allowDrop={scheduleControls.allowDrop}
            isPreviewLocation={scheduleControls.isPreviewLocation}
            updateDropPreviewFromDragTop={dragState.updateDropPreviewFromDragTop}
            dragPointerOffsetYRef={dragState.dragPointerOffsetYRef}
            setActiveDrag={dragState.setActiveDrag}
            startEditingModule={editingControls.startEditingModule}
            handleRemoveModule={scheduleControls.handleRemoveModule}
            registerScheduleCardRef={scheduleControls.registerScheduleCardRef}
            setDropPreview={dragState.setDropPreview}
            onAssignClick={assignControls.openAssignModal}
            weekOptions={weekOptions}
            selectedWeek={selectedWeek}
            onWeekChange={setSelectedWeek}
            scheduleTitle={scheduleTitle}
            onScheduleTitleChange={setScheduleTitle}
          />
        </div>

        <CreateModuleModal
          isOpen={libraryControls.isCreateModuleModalOpen}
          newModule={libraryControls.newModule}
          formError={libraryControls.formError}
          onClose={libraryControls.closeCreateModal}
          onSubmit={libraryControls.handleAddModule}
          onReset={libraryControls.resetModuleForm}
          onUpdate={libraryControls.setNewModule}
        />

        <AssignScheduleModal
          isOpen={assignControls.isAssignModalOpen}
          athletes={assignControls.athletes}
          selectedAthletes={assignControls.selectedAthletes}
          toggleAthleteSelection={assignControls.toggleAthleteSelection}
          onClose={assignControls.closeAssignModal}
          onAssign={assignControls.handleAssignToAthletes}
        />

        <EditModuleModal
          isOpen={Boolean(editingControls.editingContext)}
          editingContext={editingControls.editingContext}
          editingModuleForm={editingControls.editingModuleForm}
          editFormError={editingControls.editFormError}
          isEditMode={editingControls.isEditMode}
          setIsEditMode={editingControls.setIsEditMode}
          setEditingModuleForm={editingControls.setEditingModuleForm}
          onClose={editingControls.closeEditModal}
          onSave={editingControls.handleSaveEditedModule}
        />
      </div>

      <ReusableBlocksDrawer
        search={libraryControls.search}
        setSearch={libraryControls.setSearch}
        filteredModules={libraryControls.filteredModules}
        setActiveDrag={dragState.setActiveDrag}
        dragPointerOffsetYRef={dragState.dragPointerOffsetYRef}
        setDropPreview={dragState.setDropPreview}
        startEditingModule={editingControls.startEditingModule}
        handleRemoveLibraryModule={libraryControls.handleRemoveLibraryModule}
        resetModuleForm={libraryControls.resetModuleForm}
        openCreateModal={libraryControls.openCreateModal}
        onHoverOpen={() => setIsDrawerOpen(true)}
        onHoverClose={() => setIsDrawerOpen(false)}
        onClose={() => setIsDrawerOpen(false)}
        onDragOutsideBounds={() => setIsDrawerOpen(false)}
      />
    </div>
  );
}
