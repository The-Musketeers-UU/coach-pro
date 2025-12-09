import {
  type Dispatch,
  type DragEvent,
  type MutableRefObject,
  type SetStateAction,
  type TouchEvent,
  useEffect,
  useRef,
  useState,
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
  dropPreview: DropPreviewLocation | null;
  dragPointerOffsetYRef: MutableRefObject<number | null>;
  setActiveDrag: Dispatch<SetStateAction<ActiveDrag | null>>;
  updateDropPreviewFromDragTop: (dayId: string, dragTop: number) => void;
  setDropPreview: Dispatch<SetStateAction<DropPreviewLocation | null>>;
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
  onToggleExpand: () => void;
};

export function ScheduledModuleCard({
  dayId,
  index,
  module,
  allowDrop,
  handleDrop,
  dropPreview,
  dragPointerOffsetYRef,
  setActiveDrag,
  updateDropPreviewFromDragTop,
  setDropPreview,
  handleRemoveModule,
  registerScheduleCardRef,
  startEditingModule,
  isSelected,
  isExpanded,
  onSelect,
  onToggleExpand,
}: ScheduledModuleCardProps) {
  const [isTouchDragging, setIsTouchDragging] = useState(false);
  const longPressTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const touchStartYRef = useRef<number | null>(null);

  const clearTouchDrag = () => {
    setIsTouchDragging(false);
    setActiveDrag(null);
    setDropPreview(null);
    touchStartYRef.current = null;
  };

  useEffect(() => {
    return () => {
      if (longPressTimeoutRef.current) {
        clearTimeout(longPressTimeoutRef.current);
      }
    };
  }, []);

  const startTouchDrag = (touchY: number, target: HTMLElement) => {
    const rect = target.getBoundingClientRect();
    dragPointerOffsetYRef.current = touchY - rect.top;
    setIsTouchDragging(true);
    setActiveDrag({
      module,
      source: {
        type: "schedule",
        dayId,
        moduleIndex: index,
      },
    });
  };

  const handleTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    if (longPressTimeoutRef.current) {
      clearTimeout(longPressTimeoutRef.current);
    }

    const touch = event.touches[0];
    if (!touch) return;

    touchStartYRef.current = touch.clientY;

    const target = event.currentTarget;
    longPressTimeoutRef.current = setTimeout(() => {
      startTouchDrag(touch.clientY, target);
    }, 500);
  };

  const handleTouchMove = (event: TouchEvent<HTMLDivElement>) => {
    const touch = event.touches[0];
    if (!touch) return;

    if (!isTouchDragging && touchStartYRef.current !== null) {
      const movedDistance = Math.abs(touch.clientY - touchStartYRef.current);
      if (movedDistance > 10 && longPressTimeoutRef.current) {
        clearTimeout(longPressTimeoutRef.current);
        longPressTimeoutRef.current = null;
      }
    }

    if (isTouchDragging) {
      event.preventDefault();
      const dragTop = touch.clientY - (dragPointerOffsetYRef.current ?? 0);
      updateDropPreviewFromDragTop(dayId, dragTop);
    }
  };

  const handleTouchEnd = () => {
    if (longPressTimeoutRef.current) {
      clearTimeout(longPressTimeoutRef.current);
    }

    if (isTouchDragging) {
      const targetIndex =
        dropPreview?.dayId === dayId ? dropPreview.index : undefined;
      handleDrop(dayId, targetIndex);
      clearTouchDrag();
      return;
    }

    clearTouchDrag();
  };

  const handleTouchCancel = () => {
    if (longPressTimeoutRef.current) {
      clearTimeout(longPressTimeoutRef.current);
    }
    clearTouchDrag();
  };

  return (
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
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchCancel}
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
      className={`w-full cursor-grab rounded-lg border bg-base-100 p-3 pt-2 pr-0 transition hover:border-primary active:cursor-grabbing ${
        isSelected ? "border-primary ring-2 ring-primary/50" : "border-base-200"
      } ${isExpanded ? "scale-[1.02] shadow-lg" : ""}`}
      aria-pressed={isSelected}
    >
      <div className="space-y-1 text-xs text-base-content/60">
        <div className="flex flex-row justify-between items-center">
          <p className="font-semibold text-base-content">{module.title}</p>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              handleRemoveModule(dayId, index);
            }}
            className="btn btn-ghost btn-circle btn-xs text-error self-start mr-1.5"
            aria-label={`Delete ${module.title}`}
          >
            <span aria-hidden="true">✕</span>
          </button>
        </div>
        <div className="pr-3 space-y-2">
          <p className="text-xs text-base-content/70">{module.description}</p>
          <ModuleBadges module={module} />
        </div>
      </div>
    </div>
  );
}
