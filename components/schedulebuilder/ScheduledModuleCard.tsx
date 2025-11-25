import type { Dispatch, DragEvent, MutableRefObject, SetStateAction } from "react";

import type { ActiveDrag, DropPreviewLocation, EditingContext, Module } from "@/components/schedulebuilder/types";
import { ModuleBadges } from "@/components/ModuleBadges";

type ScheduledModuleCardProps = DropPreviewLocation & {
  module: Module;
  allowDrop: (event: DragEvent) => void;
  handleDrop: (dayId: string, targetIndex?: number) => void;
  dragPointerOffsetYRef: MutableRefObject<number | null>;
  setActiveDrag: Dispatch<SetStateAction<ActiveDrag | null>>;
  startEditingModule: (module: Module, context: EditingContext) => void;
  handleRemoveModule: (dayId: string, moduleIndex: number) => void;
  registerScheduleCardRef: (
    dayId: string,
    index: number,
    el: HTMLDivElement | null
  ) => void;
};

export function ScheduledModuleCard({
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
              Radera
            </button>
          </div>
          <p className="text-xs text-base-content/70">{module.description}</p>
          <ModuleBadges module={module} />
        </div>
      </div>
    </div>
  );
}
