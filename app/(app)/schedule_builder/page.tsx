"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/components/auth-provider";
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
import {
  type AthleteRow,
  type ModuleRow,
  getAthletes,
  getModulesByOwner,
} from "@/lib/supabase/training-modules";

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

const days: Day[] = [
  { id: "mon", label: "Måndag" },
  { id: "tue", label: "Tisdag" },
  { id: "wed", label: "Onsdag" },
  { id: "thu", label: "Torsdag" },
  { id: "fri", label: "Fredag" },
  { id: "sat", label: "Lördag" },
  { id: "sun", label: "Söndag" },
];

const mapModuleRow = (row: ModuleRow): Module => ({
  id: row.id,
  title: row.name,
  description: row.description ?? "",
  category: (row.category as Module["category"]) ?? "kondition",
  subcategory: row.subCategory ?? undefined,
  distanceMeters: row.distance ?? undefined,
  durationMinutes: row.durationMinutes ?? undefined,
  durationSeconds: row.durationSeconds ?? undefined,
  weightKg: row.weight ?? undefined,
});

const mapAthleteRow = (row: AthleteRow): Athlete => ({
  id: row.id,
  name: row.name,
  sport: row.email,
});

export default function CoachDashboard() {
  const router = useRouter();
  const { user, profile, isLoading, isLoadingProfile } = useAuth();
  const weekOptions = useMemo(() => createRollingWeekOptions(), []);
  const [selectedWeek, setSelectedWeek] = useState<string>(() => weekOptions[0]?.value ?? "");
  const [scheduleTitle, setScheduleTitle] = useState("Träningsläger");
  const [modules, setModules] = useState<Module[]>([]);
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [dataError, setDataError] = useState<string | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const {
    libraryControls,
    scheduleControls,
    editingControls,
    assignControls,
    dragState,
  } = useScheduleBuilderState({
    days,
    initialModules: modules,
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

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login?redirectTo=/schedule_builder");
    }
  }, [isLoading, user, router]);

  useEffect(() => {
    if (!profile?.id) return;

    const loadData = async () => {
      setIsLoadingData(true);
      setDataError(null);

      try {
        const [moduleRows, athleteRows] = await Promise.all([
          getModulesByOwner(profile.id),
          getAthletes(),
        ]);

        setModules(moduleRows.map(mapModuleRow));
        setAthletes(athleteRows.map(mapAthleteRow));
      } catch (supabaseError) {
        setDataError(
          supabaseError instanceof Error
            ? supabaseError.message
            : String(supabaseError),
        );
      } finally {
        setIsLoadingData(false);
      }
    };

    void loadData();
  }, [profile?.id]);

  if (isLoading || isLoadingProfile || isLoadingData) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <span className="loading loading-spinner" aria-label="Laddar schemabyggare" />
      </div>
    );
  }

  if (!user) return null;

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

          {dataError && <div className="alert alert-error">{dataError}</div>}

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
