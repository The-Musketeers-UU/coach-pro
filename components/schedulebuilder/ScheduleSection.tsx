import type {
  Dispatch,
  DragEvent,
  MutableRefObject,
  SetStateAction,
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
  onToggleScheduledModuleExpansion,
  onAssignClick,
  weekOptions,
  selectedWeek,
  onWeekChange,
  scheduleTitle,
  onScheduleTitleChange,
  onOpenMobileLibrary,
}: ScheduleSectionProps) {
  return (
    <section className="w-full max-w-full self-center space-y-6">
      <div className="card bg-base-200 border border-base-300 shadow-md">
        <div className="card-body gap-6">
          <div className="grid grid-cols-3 items-center w-full">
            <form
              className="form-control gap-2"
              onSubmit={(event) => event.preventDefault()}
            >
              <div className=" flex flex-col gap-2">
                <input
                  id="schedule-title"
                  type="text-xl"
                  className="input input-lg input-bordered max-w-xs"
                  value={scheduleTitle}
                  onChange={(event) =>
                    onScheduleTitleChange(event.target.value)
                  }
                  placeholder="Ange schematitel"
                />
              </div>
            </form>

            <div className="form-control max-w-40 justify-self-center">
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
              selectedScheduleModuleIds={selectedScheduleModuleIds}
              expandedScheduleModuleIds={expandedScheduleModuleIds}
              onSelectScheduledModule={onSelectScheduledModule}
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
