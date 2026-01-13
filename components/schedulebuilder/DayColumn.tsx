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
import { DropPreviewBar } from "@/components/schedulebuilder/DropPreviewBar";
import { ScheduledModuleCard } from "@/components/schedulebuilder/ScheduledModuleCard";

type DayColumnProps = {
  day: { id: string; label: string };
  modules: Module[];
  allowDrop: (event: DragEvent) => void;
  handleDayDragOver: (event: DragEvent<HTMLElement>, dayId: string) => void;
  handleDrop: (dayId: string, targetIndex?: number) => void;
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
  onOpenMobileLibrary: (dayId: string) => void;
  isAlternateLayout?: boolean;
};

export function DayColumn({
  day,
  modules,
  allowDrop,
  handleDayDragOver,
  handleDrop,
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
  onOpenMobileLibrary,
  isAlternateLayout = false,
}: DayColumnProps) {
  return (
    <div
      onDragOver={(event) => handleDayDragOver(event, day.id)}
      onDrop={() => handleDrop(day.id)}
      onDragLeave={(event) => {
        if (
          !(event.currentTarget as HTMLElement).contains(
            event.relatedTarget as Node
          )
        ) {
          setDropPreview(null);
        }
      }}
      className={`flex flex-col rounded-2xl bg-base-300 p-2 ${
        isAlternateLayout ? "min-h-0 h-full overflow-y-auto" : "min-h-[600px]"
      }`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-base-content">
            {day.label}
          </p>
        </div>
      </div>

      <div className="mt-3 flex-1 space-y-1">
        {modules.length === 0 && (
<div className="hidden sm:block h-full rounded-xl bg-base-100/60 p-4">
    {/* Lägg till Flexbox-klasser på den yttre DIV:en */}
    <div className="h-full flex items-center justify-center"> 
        
        {/* Ta bort text-center härifrån om du vill centrera hela textblocket */
           /* Om du vill ha flera rader text: behåll text-center här */ }
        <div className="text-center text-xs text-base-content/60">
            Dra en modul hit
        </div>
    </div>
</div>
        )}

        <button
          type="button"
          className="btn btn-sm gap-2 sm:hidden w-full btn-border"
          onClick={() => onOpenMobileLibrary(day.id)}
        >
          <span aria-hidden="true">＋</span>
          Lägg till modul
        </button>

        {modules.map((module, index) => (
          <div key={`${module.id}-${index}`} className="space-y-2">
            <DropPreviewBar
              dayId={day.id}
              index={index}
              isActive={isPreviewLocation(day.id, index)}
              onDrop={(event) => {
                event.stopPropagation();
                handleDrop(day.id, index);
              }}
              onDragEnter={(event) => {
                event.stopPropagation();
                const dragTop =
                  event.clientY - (dragPointerOffsetYRef.current ?? 0);
                updateDropPreviewFromDragTop(day.id, dragTop);
              }}
              onDragOver={allowDrop}
            />

            <ScheduledModuleCard
              dayId={day.id}
              index={index}
              module={module}
              allowDrop={allowDrop}
              handleDrop={handleDrop}
              dragPointerOffsetYRef={dragPointerOffsetYRef}
              setActiveDrag={setActiveDrag}
              startEditingModule={startEditingModule}
              handleRemoveModule={handleRemoveModule}
              registerScheduleCardRef={registerScheduleCardRef}
              isSelected={selectedScheduleModuleIds.includes(module.id)}
              isExpanded={expandedScheduleModuleIds.includes(module.id)}
              onSelect={(isMultiSelect) =>
                onSelectScheduledModule(module.id, isMultiSelect)
              }
              onMoveUp={() =>
                onMoveScheduledModule(day.id, module.id, "up")
              }
              onMoveDown={() =>
                onMoveScheduledModule(day.id, module.id, "down")
              }
              disableMoveUp={index === 0}
              disableMoveDown={index === modules.length - 1}
              onToggleExpand={() => onToggleScheduledModuleExpansion(module.id)}
            />
          </div>
        ))}

        <DropPreviewBar
          dayId={day.id}
          index={modules.length}
          isActive={isPreviewLocation(day.id, modules.length)}
          onDrop={(event) => {
            event.stopPropagation();
            handleDrop(day.id, modules.length);
          }}
          onDragEnter={(event) => {
            event.stopPropagation();
            const dragTop =
              event.clientY - (dragPointerOffsetYRef.current ?? 0);
            updateDropPreviewFromDragTop(day.id, dragTop);
          }}
          onDragOver={allowDrop}
        />
      </div>
    </div>
  );
}
