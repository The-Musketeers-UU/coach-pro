import type { Dispatch, DragEvent, MutableRefObject, SetStateAction } from "react";

import type {
  ActiveDrag,
  DaySchedule,
  DropPreviewLocation,
  EditingContext,
  Module,
} from "@/components/dashboard/types";
import { DayColumn } from "@/components/dashboard/DayColumn";

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
  onAssignClick: () => void;
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
