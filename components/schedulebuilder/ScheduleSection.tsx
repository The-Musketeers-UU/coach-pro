import {
  useMemo,
  useState,
  type Dispatch,
  type DragEvent,
  type MutableRefObject,
  type SetStateAction,
} from "react";

import type {
  ActiveDrag,
  DaySchedule,
  DropPreviewLocation,
  EditingContext,
  Module,
} from "@/components/schedulebuilder/types";
import { DayColumn } from "@/components/schedulebuilder/DayColumn";

type ScheduleSectionProps = {
  days: { id: string; label: string }[];
  schedule: DaySchedule;
  handleDayDragOver: (event: DragEvent<HTMLElement>, dayId: string) => void;
  handleDrop: (dayId: string, targetIndex?: number) => void;
  allowDrop: (event: DragEvent) => void;
  isPreviewLocation: (dayId: string, index: number) => boolean;
  updateDropPreviewFromDragTop: (dayId: string, dragTop: number) => void;
  dragPointerOffsetYRef: MutableRefObject<number | null>;
  setActiveDrag: Dispatch<SetStateAction<ActiveDrag | null>>;
  startEditingModule: (module: Module, context: EditingContext) => void;
  handleRemoveModule: (dayId: string, moduleIndex: number) => void;
  registerScheduleCardRef: (
    dayId: string,
    index: number,
    el: HTMLDivElement | null
  ) => void;
  setDropPreview: Dispatch<SetStateAction<DropPreviewLocation | null>>;
  selectedScheduleModuleIds: string[];
  expandedScheduleModuleIds: string[];
  onSelectScheduledModule: (moduleId: string, isMultiSelect: boolean) => void;
  onMoveScheduledModule: (
    dayId: string,
    moduleId: string,
    direction: "up" | "down",
  ) => void;
  onToggleScheduledModuleExpansion: (moduleId: string) => void;
  onAssignClick: () => void;
  weekOptions: { value: string; label: string }[];
  selectedWeek: string;
  onWeekChange: (value: string) => void;
  scheduleTitle: string;
  onScheduleTitleChange: (value: string) => void;
  onOpenMobileLibrary: (dayId: string) => void;
};

export function ScheduleSection({
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
  selectedScheduleModuleIds,
  expandedScheduleModuleIds,
  onSelectScheduledModule,
  onMoveScheduledModule,
  onToggleScheduledModuleExpansion,
  onAssignClick,
  weekOptions,
  selectedWeek,
  onWeekChange,
  scheduleTitle,
  onScheduleTitleChange,
  onOpenMobileLibrary,
}: ScheduleSectionProps) {
  const [selectedDayId, setSelectedDayId] = useState<string | null>(
    days[0]?.id ?? null,
  );

  const selectedDay = useMemo(
    () => days.find((day) => day.id === selectedDayId) ?? days[0],
    [days, selectedDayId],
  );

  const activeDayId = selectedDay?.id ?? null;

  return (
    <section className="w-full max-w-full self-center space-y-6">
      <div className="card bg-base-200 border border-base-300 shadow-md">
        <div className="card-body gap-6">
          <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-3 sm:items-center">
            <form
              className="form-control gap-2"
              onSubmit={(event) => event.preventDefault()}
            >
              <div className=" flex flex-col gap-2">
                <input
                  id="schedule-title"
                  type="text-xl"
                  className="input input-md sm:input-lg input-bordered max-w-xs"
                  value={scheduleTitle}
                  onChange={(event) =>
                    onScheduleTitleChange(event.target.value)
                  }
                  placeholder="Ange schematitel"
                />
              </div>
            </form>

            <div className="grid grid-cols-2 items-center gap-3 sm:col-span-2 sm:grid-cols-2">
              <div className="form-control max-w-40 justify-self-start sm:justify-self-center">
                <label className="label sr-only" htmlFor="week-select">
                  Välj vecka
                </label>
                <select
                  id="week-select"
                  className="select select-sm select-secondary w-full"
                  value={selectedWeek}
                  onChange={(event) => onWeekChange(event.target.value)}
                >
                  {weekOptions.map((week) => (
                    <option key={week.value} value={week.value}>
                      {week.label}
                    </option>
                  ))}
                </select>
              </div>
              <button
                className="btn btn-secondary btn-sm max-w-35 justify-self-end"
                onClick={onAssignClick}
              >
                Tilldela schema
              </button>
            </div>
          </div>

          {days.length > 0 && (
            <div className="md:hidden -mx-4 sm:-mx-6">
              <div className="flex w-full items-center overflow-x-auto border border-base-300 bg-base-100">
                {days.map((day) => (
                  <button
                    key={day.id}
                    type="button"
                    onClick={() => setSelectedDayId(day.id)}
                    className={`btn btn-sm w-full flex-1 whitespace-nowrap ${
                      activeDayId === day.id
                        ? "btn-primary btn-soft"
                        : "btn-ghost"
                    }`}
                  >
                    <span aria-hidden>{day.label.slice(0, 1)}</span>
                    <span className="sr-only">{day.label}</span>
                  </button>
                ))}
              </div>

              {selectedDay && (
                <div className="mt-2 w-full sm:px-6">
                  <DayColumn
                    day={selectedDay}
                    modules={schedule[selectedDay.id]}
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
                    selectedScheduleModuleIds={selectedScheduleModuleIds}
                    expandedScheduleModuleIds={expandedScheduleModuleIds}
                    onSelectScheduledModule={onSelectScheduledModule}
                    onMoveScheduledModule={onMoveScheduledModule}
                    onToggleScheduledModuleExpansion={
                      onToggleScheduledModuleExpansion
                    }
                    onOpenMobileLibrary={onOpenMobileLibrary}
                  />
                </div>
              )}
            </div>
          )}

          <div className="hidden grid-cols-1 gap-1 md:grid md:grid-cols-2 xl:grid-cols-7">
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
                selectedScheduleModuleIds={selectedScheduleModuleIds}
                expandedScheduleModuleIds={expandedScheduleModuleIds}
                onSelectScheduledModule={onSelectScheduledModule}
                onMoveScheduledModule={onMoveScheduledModule}
                onToggleScheduledModuleExpansion={onToggleScheduledModuleExpansion}
                onOpenMobileLibrary={onOpenMobileLibrary}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
