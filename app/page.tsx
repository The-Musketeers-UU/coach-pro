"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

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

const AUTH_STORAGE_KEY = "coach-pro-authenticated";

type AuthMode = "login" | "signup";

function AuthLanding({ onAuthenticated }: { onAuthenticated: () => void }) {
  const [mode, setMode] = useState<AuthMode>("login");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!formData.email || !formData.password) {
      setError("Fyll i både e-post och lösenord.");
      return;
    }

    if (mode === "signup" && formData.password !== formData.confirmPassword) {
      setError("Lösenorden måste matcha.");
      return;
    }

    localStorage.setItem(AUTH_STORAGE_KEY, "true");
    setError("");
    onAuthenticated();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-base-200 px-6 py-10">
      <div className="w-full max-w-3xl rounded-2xl bg-base-100 p-8 shadow-2xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm uppercase tracking-wide text-secondary">Camp Momentum</p>
            <h1 className="text-3xl font-bold text-primary">Logga in för att fortsätta</h1>
            <p className="text-base-content/70">Hantera dina scheman och idrottare på ett ställe.</p>
          </div>
          <div className="join">
            <button
              className={`btn join-item ${mode === "login" ? "btn-primary" : "btn-ghost"}`}
              onClick={() => setMode("login")}
              type="button"
            >
              Logga in
            </button>
            <button
              className={`btn join-item ${mode === "signup" ? "btn-primary" : "btn-ghost"}`}
              onClick={() => setMode("signup")}
              type="button"
            >
              Skapa konto
            </button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-3 rounded-xl bg-base-200 p-6">
            <h2 className="text-lg font-semibold">
              {mode === "login" ? "Logga in med dina uppgifter" : "Skapa ett nytt konto"}
            </h2>
            <p className="text-base-content/70">
              Välj om du vill logga in eller skapa ett konto för att börja bygga scheman.
            </p>
            <ul className="list-disc space-y-1 pl-4 text-base-content/80">
              <li>Snabb åtkomst till dina träningsplaner</li>
              <li>Skapa nya idrottare och moduler</li>
              <li>Samarbeta med ditt team</li>
            </ul>
          </div>

          <form className="space-y-4 rounded-xl border p-6" onSubmit={handleSubmit}>
            <div className="form-control">
              <label className="label">
                <span className="label-text">E-post</span>
              </label>
              <input
                type="email"
                className="input input-bordered"
                placeholder="du@example.com"
                value={formData.email}
                onChange={(event) =>
                  setFormData((prev) => ({ ...prev, email: event.target.value }))
                }
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Lösenord</span>
              </label>
              <input
                type="password"
                className="input input-bordered"
                placeholder="••••••••"
                value={formData.password}
                onChange={(event) =>
                  setFormData((prev) => ({ ...prev, password: event.target.value }))
                }
              />
            </div>

            {mode === "signup" && (
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Bekräfta lösenord</span>
                </label>
                <input
                  type="password"
                  className="input input-bordered"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(event) =>
                    setFormData((prev) => ({
                      ...prev,
                      confirmPassword: event.target.value,
                    }))
                  }
                />
              </div>
            )}

            {error ? <p className="text-sm text-error">{error}</p> : null}

            <button className="btn btn-primary w-full" type="submit">
              {mode === "login" ? "Logga in" : "Skapa konto"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function AuthenticatedDashboard({ onLogout }: { onLogout: () => void }) {
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
          <div className="mb-4 flex items-center justify-between rounded-xl border bg-base-100 p-4 shadow-sm">
            <div>
              <p className="text-xs uppercase tracking-wide text-secondary">Inloggad</p>
              <p className="text-sm text-base-content/70">
                Du har åtkomst till verktygen för schemaläggning.
              </p>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={onLogout} type="button">
              Logga ut
            </button>
          </div>
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

export default function CoachDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window === "undefined") {
      return false;
    }

    return localStorage.getItem(AUTH_STORAGE_KEY) === "true";
  });

  const handleAuthenticated = () => setIsAuthenticated(true);
  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  if (!isAuthenticated) {
    return <AuthLanding onAuthenticated={handleAuthenticated} />;
  }

  return <AuthenticatedDashboard onLogout={handleLogout} />;
}
