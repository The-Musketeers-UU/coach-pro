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
  templateOptions: { value: string; label: string }[];
  selectedTemplate: string;
  onTemplateChange: (value: string) => void;
  templateName: string;
  onTemplateNameChange: (value: string) => void;
  onSaveTemplate: () => void;
  onApplyTemplate: () => void;
  isSavingTemplate: boolean;
  isApplyingTemplate: boolean;
  onOpenMobileLibrary: (dayId: string) => void;
  isAlternateLayout?: boolean;
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
  templateOptions,
  selectedTemplate,
  onTemplateChange,
  templateName,
  onTemplateNameChange,
  onSaveTemplate,
  onApplyTemplate,
  isSavingTemplate,
  isApplyingTemplate,
  onOpenMobileLibrary,
  isAlternateLayout = false,
}: ScheduleSectionProps) {
  const [selectedDayId, setSelectedDayId] = useState<string | null>(
    days[0]?.id ?? null,
  );

  const selectedDay = useMemo(
    () => days.find((day) => day.id === selectedDayId) ?? days[0],
    [days, selectedDayId],
  );

  const activeDayId = selectedDay?.id ?? null;
  const sectionClassName = isAlternateLayout
    ? "flex min-h-0 flex-1 flex-col space-y-6 w-full max-w-full self-center"
    : "w-full max-w-full self-center space-y-6";
  const cardClassName = `card bg-base-200 border border-base-300 shadow-md ${
    isAlternateLayout ? "flex min-h-0 flex-1 flex-col" : ""
  }`;
  const cardBodyClassName = isAlternateLayout
    ? "card-body gap-6 flex min-h-0 flex-1 flex-col"
    : "card-body gap-6";
  const desktopGridClassName = `hidden grid-cols-1 gap-1 md:grid md:grid-cols-2 xl:grid-cols-7 ${
    isAlternateLayout ? "min-h-0 flex-1 items-stretch" : ""
  }`;

  return (
    <section className={sectionClassName}>
      <div className={cardClassName}>
        <div className={cardBodyClassName}>
          <div className="grid w-full grid-cols-1 gap-4 lg:grid-cols-[auto_auto_1fr] lg:items-end lg:justify-start">
            <div className="flex flex-col gap-2">
              <span className="text-sm font-semibold text-base-content">
                Spara som mall
              </span>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <input
                  type="text"
                  className="input input-sm input-bordered w-full sm:w-56"
                  value={templateName}
                  onChange={(event) => onTemplateNameChange(event.target.value)}
                  placeholder="Mallnamn"
                />
                <button
                  className="btn btn-primary btn-sm"
                  onClick={onSaveTemplate}
                  disabled={isSavingTemplate}
                >
                  {isSavingTemplate ? "Sparar..." : "Spara mall"}
                </button>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-sm font-semibold text-base-content">
                Använd mall
              </span>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <select
                  className="select select-sm select-bordered w-full sm:w-56"
                  value={selectedTemplate}
                  onChange={(event) => onTemplateChange(event.target.value)}
                  disabled={templateOptions.length === 0}
                >
                  <option value="">
                    {templateOptions.length === 0
                      ? "Inga mallar sparade"
                      : "Välj mall"}
                  </option>
                  {templateOptions.map((template) => (
                    <option key={template.value} value={template.value}>
                      {template.label}
                    </option>
                  ))}
                </select>
                <button
                  className="btn btn-outline btn-sm"
                  onClick={onApplyTemplate}
                  disabled={!selectedTemplate || isApplyingTemplate}
                >
                  {isApplyingTemplate ? "Laddar..." : "Ladda mall"}
                </button>
              </div>
            </div>
            <div className="flex items-end justify-end lg:justify-self-end">
              <button className="btn btn-secondary btn-sm" onClick={onAssignClick}>
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
                    isAlternateLayout={isAlternateLayout}
                  />
                </div>
              )}
            </div>
          )}

          <div className={desktopGridClassName}>
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
                isAlternateLayout={isAlternateLayout}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
