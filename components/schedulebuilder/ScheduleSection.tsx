import type { Dispatch, DragEvent, MutableRefObject, SetStateAction } from "react";

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
  selectedWeek: string;
  weekOptions: { value: string; label: string }[];
  onChangeWeek: (week: string) => void;
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
  onAssignClick: () => void;
};

export function ScheduleSection({
  days,
  schedule,
  selectedWeek,
  weekOptions,
  onChangeWeek,
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
          <div className="grid grid-cols-3 items-center w-full">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-neutral">
                Skapar schema
              </p>
              <h2 className="text-2xl font-semibold">Träningsläger</h2>
            </div>
            <label className="form-control w-full max-w-48 justify-self-center">
              <span className="label-text text-sm font-semibold text-neutral">Vecka</span>
              <select
                className="select select-bordered select-sm"
                value={selectedWeek}
                onChange={(event) => onChangeWeek(event.target.value)}
              >
                {weekOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <button className="btn btn-secondary btn-sm max-w-35 justify-self-end" onClick={onAssignClick}>
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
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
