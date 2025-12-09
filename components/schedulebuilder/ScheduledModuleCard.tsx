import type {
  Dispatch,
  DragEvent,
  MutableRefObject,
  SetStateAction,
} from "react";

import type {
  ActiveDrag,
  DropPreviewLocation,
  EditingContext,
  Module,
} from "@/components/schedulebuilder/types";
import { ModuleBadges } from "@/components/ModuleBadges";

type ScheduledModuleCardProps = DropPreviewLocation & {
  module: Module;
  allowDrop: (event: DragEvent) => void;
  handleDrop: (dayId: string, targetIndex?: number) => void;
  dragPointerOffsetYRef: MutableRefObject<number | null>;
  setActiveDrag: Dispatch<SetStateAction<ActiveDrag | null>>;
  handleRemoveModule: (dayId: string, moduleIndex: number) => void;
  registerScheduleCardRef: (
    dayId: string,
    index: number,
    el: HTMLDivElement | null
  ) => void;
  startEditingModule: (module: Module, context: EditingContext) => void;
  isSelected: boolean;
  isExpanded: boolean;
  onSelect: (isMultiSelect: boolean) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  disableMoveUp: boolean;
  disableMoveDown: boolean;
  onToggleExpand: () => void;
};

export function ScheduledModuleCard({
  dayId,
  index,
  module,
  allowDrop,
  handleDrop,
  dragPointerOffsetYRef,
  setActiveDrag,
  handleRemoveModule,
  registerScheduleCardRef,
  startEditingModule,
  isSelected,
  isExpanded,
  onSelect,
  onMoveUp,
  onMoveDown,
  disableMoveUp,
  disableMoveDown,
  onToggleExpand,
}: ScheduledModuleCardProps) {
  return (
    <div className="relative">
      <div
        draggable
        data-scheduled-module-card
        onDragOver={allowDrop}
        onDrop={(event) => {
          event.stopPropagation();
          handleDrop(dayId, index);
        }}
        onDragStart={(event) => {
          const rect = (
            event.currentTarget as HTMLDivElement
          ).getBoundingClientRect();
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
        onClick={(event) => {
          onSelect(event.shiftKey);
        }}
        onDoubleClick={(event) => {
          event.stopPropagation();
          onToggleExpand();
          startEditingModule(module, {
            type: "schedule",
            moduleId: module.id,
            dayId,
            moduleIndex: index,
          });
        }}
        ref={(el) => registerScheduleCardRef(dayId, index, el)}
        className={`w-full cursor-grab rounded-lg border bg-base-100 p-3 pt-2 pr-12 transition hover:border-primary active:cursor-grabbing ${
          isSelected ? "border-primary ring-2 ring-primary/50" : "border-base-200"
        } ${isExpanded ? "scale-[1.02] shadow-lg" : ""}`}
        aria-pressed={isSelected}
      >
        {isSelected && (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              handleRemoveModule(dayId, index);
            }}
            className="btn btn-ghost btn-circle btn-xs text-error absolute right-16 top-2"
            aria-label={`Delete ${module.title}`}
          >
            <span aria-hidden="true">✕</span>
          </button>
        )}
        {isSelected && (
          <div className="absolute inset-y-2 right-2 flex flex-col items-center justify-between sm:hidden">
            <button
              type="button"
              className="btn btn-circle btn-ghost btn-xs"
              onClick={(event) => {
                event.stopPropagation();
                onMoveUp();
              }}
              aria-label="Flytta upp"
              disabled={disableMoveUp}
            >
              <svg
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-4 w-4 text-primary"
              >
                <path d="M12 4.83582L5.79291 11.0429L7.20712 12.4571L12 7.66424L16.7929 12.4571L18.2071 11.0429L12 4.83582ZM12 10.4857L5.79291 16.6928L7.20712 18.107L12 13.3141L16.7929 18.107L18.2071 16.6928L12 10.4857Z"></path>
              </svg>
            </button>
            <button
              type="button"
              className="btn btn-circle btn-ghost btn-xs"
              onClick={(event) => {
                event.stopPropagation();
                onMoveDown();
              }}
              aria-label="Flytta ned"
              disabled={disableMoveDown}
            >
              <svg
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-4 w-4 text-primary rotate-180"
              >
                <path d="M12 4.83582L5.79291 11.0429L7.20712 12.4571L12 7.66424L16.7929 12.4571L18.2071 11.0429L12 4.83582ZM12 10.4857L5.79291 16.6928L7.20712 18.107L12 13.3141L16.7929 18.107L18.2071 16.6928L12 10.4857Z"></path>
              </svg>
            </button>
          </div>
        )}
        <div className="space-y-1 text-xs text-base-content/60">
          <div className="flex flex-row items-start justify-between gap-2">
            <p className="font-semibold text-base-content">{module.title}</p>
          </div>
          <div className="pr-3 space-y-2">
            <p className="text-xs text-base-content/70">{module.description}</p>
            <ModuleBadges module={module} />
          </div>
        </div>
      </div>
    </div>
  );
}
