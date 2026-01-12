import type { Dispatch, SetStateAction } from "react";

import type {
  FeedbackFieldDefinition,
  FeedbackFieldType,
  ModuleForm,
} from "@/components/schedulebuilder/types";

const feedbackFieldLabels: Record<FeedbackFieldType, string> = {
  distance: "Distans (m)",
  duration: "Vilken tid sprang du distansen på?",
  weight: "Vikt (kg)",
  comment: "Kommentar",
  feeling: "Känsla (1-10)",
  sleepHours: "Sömn (timmar)",
};

const feedbackFieldDescriptions: Record<FeedbackFieldType, string> = {
  distance: "Vilken distans sprang du?",
  duration: "Vilken tid sprang du distansen på?",
  weight: "Vilken vikt använde du?",
  comment: "Lämna en kommentar om passet",
  feeling: "Atleten väljer en känsla på en skala 1–10.",
  sleepHours: "Hur många timmars sömn fick du?",
};

type ModuleFormFieldsProps = {
  formState: ModuleForm;
  onChange: Dispatch<SetStateAction<ModuleForm>>;
};

const createFeedbackField = (
  type: FeedbackFieldType,
  existing: FeedbackFieldDefinition[],
): FeedbackFieldDefinition => {
  const countOfType = existing.filter((field) => field.type === type).length;
  const defaultLabel =
    type === "distance"
      ? ""
      : countOfType === 0
        ? feedbackFieldLabels[type]
        : `${feedbackFieldLabels[type]} #${countOfType + 1}`;

  const id =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `${type}-${Date.now()}-${Math.random().toString(16).slice(2)}`;

  return { id, type, label: defaultLabel };
};

export function ModuleFormFields({ formState, onChange }: ModuleFormFieldsProps) {
  const hasFieldType = (type: FeedbackFieldType) =>
    formState.feedbackFields.some((field) => field.type === type);

  const toggleFeedbackField = (type: FeedbackFieldType) => {
    onChange((prev) => {
      const hasField = prev.feedbackFields.some((field) => field.type === type);

      if (hasField) {
        return {
          ...prev,
          feedbackFields: prev.feedbackFields.filter((field) => field.type !== type),
        };
      }

      return {
        ...prev,
        feedbackFields: [
          ...prev.feedbackFields,
          createFeedbackField(type, prev.feedbackFields),
        ],
      };
    });
  };

  const distanceFields = formState.feedbackFields.filter(
    (field) => field.type === "distance",
  );
  const durationFields = formState.feedbackFields.filter((field) => field.type === "duration");
  const weightFields = formState.feedbackFields.filter((field) => field.type === "weight");

  const addDistanceDurationPair = () => {
    onChange((prev) => {
      const nextFields: FeedbackFieldDefinition[] = [];
      nextFields.push(...prev.feedbackFields);
      nextFields.push(createFeedbackField("distance", nextFields));
      nextFields.push({
        ...createFeedbackField("duration", nextFields),
        label: feedbackFieldLabels.duration,
      });

      return { ...prev, feedbackFields: nextFields };
    });
  };

  const removeDistanceDurationPair = (pairIndex: number) => {
    onChange((prev) => {
      const distanceList = prev.feedbackFields.filter(
        (field) => field.type === "distance",
      );
      const durationList = prev.feedbackFields.filter(
        (field) => field.type === "duration",
      );

      const distanceToRemove = distanceList[pairIndex];
      const durationToRemove = durationList[pairIndex];

      if (!distanceToRemove && !durationToRemove) {
        return prev;
      }

      return {
        ...prev,
        feedbackFields: prev.feedbackFields.filter(
          (field) =>
            field.id !== distanceToRemove?.id && field.id !== durationToRemove?.id,
        ),
      };
    });
  };

  const addWeightField = () => {
    onChange((prev) => ({
      ...prev,
      feedbackFields: [
        ...prev.feedbackFields,
        createFeedbackField("weight", prev.feedbackFields),
      ],
    }));
  };

  const removeWeightField = (fieldId: string) => {
    onChange((prev) => ({
      ...prev,
      feedbackFields: prev.feedbackFields.filter((field) => field.id !== fieldId),
    }));
  };

  const updateFieldLabel = (fieldId: string, value: string) => {
    onChange((prev) => ({
      ...prev,
      feedbackFields: prev.feedbackFields.map((field) =>
        field.id === fieldId ? { ...field, label: value } : field,
      ),
    }));
  };

  return (
    <div className="grid gap-6 sm:grid-cols-[minmax(0,1fr)_minmax(280px,1fr)]">
      <div className="flex flex-col gap-4">
        <label className="form-control flex flex-col gap-1">
          <div className="flex flex-row">
            <span className="label-text text-sm">Titel:</span>
            <div className="text text-xs text-red-500">*</div>
          </div>
          <input
            type="text"
            value={formState.title}
            onChange={(event) =>
              onChange((prev) => ({
                ...prev,
                title: event.target.value,
              }))
            }
            className="input input-sm input-bordered w-full"
            placeholder="t.ex. Explosiv acceleration"
          />
        </label>

        <label className="form-control flex-col flex gap-1">
          <span className="label-text text-sm">Beskrivning:</span>
          <textarea
            className="textarea textarea-bordered w-full text-xs sm:h-60"
            rows={3}
            placeholder="Vad är syftet med blocket?"
            value={formState.description}
            onChange={(event) =>
              onChange((prev) => ({
                ...prev,
                description: event.target.value,
              }))
            }
          />
        </label>

        <label className="form-control flex flex-row items-center gap-2">
          <input
            type="checkbox"
            className="checkbox checkbox-primary checkbox-sm"
            checked={formState.visibleToAllCoaches}
            onChange={(event) =>
              onChange((prev) => ({
                ...prev,
                visibleToAllCoaches: event.target.checked,
              }))
            }
          />
          <div className="flex flex-col">
            <span className="label-text text-sm">Synlig för alla coacher</span>
            <span className="text-xs text-base-content/70">
              Låt andra coacher använda det här blocket i sina scheman.
            </span>
          </div>
        </label>

        <label className="form-control flex flex-col gap-1">
          <div className="flex flex-row">
            <span className="label-text text-sm">Kategori:</span>
            <div className="text text-xs text-red-500">*</div>
          </div>
          <input
            type="text"
            className="input input-sm input-bordered w-full"
            value={formState.category}
            onChange={(event) =>
              onChange((prev) => ({
                ...prev,
                category: event.target.value,
              }))
            }
            placeholder="t.ex. Kondition"
            required
          />
        </label>

        <label className="form-control flex flex-col gap-1">
          <span className="label-text text-sm">Underkategori:</span>
          <input
            type="text"
            className="input input-sm input-bordered w-full"
            value={formState.subcategory}
            onChange={(event) =>
              onChange((prev) => ({
                ...prev,
                subcategory: event.target.value,
              }))
            }
            placeholder="t.ex. Intervaller, baslyft"
          />
        </label>
        <div className="flex flex-row">
          <div className="text text-xs text-red-500">*</div>
          <div className="text text-xs">Obligatoriska fält</div>
        </div>
      </div>

      <div className="rounded-lg border border-base-300 p-3 text-[11px]">
        <div className="flex flex-col gap-4">
          <div>
            <p className="text-sm font-semibold">Valfria feedbackfält</p>
            <p className="text-xs text-base-content/70">
              Välj vilka uppföljningsfrågor som ska samlas in efter passet.
            </p>
          </div>

          <div className="flex flex-col divide-y divide-base-200 rounded-md border border-base-200">
            {(["comment", "feeling", "sleepHours"] as const).map((type) => (
              <label key={type} className="flex items-center gap-2 px-3 py-2 text-sm">
                <input
                  type="checkbox"
                  className="checkbox checkbox-sm"
                  checked={hasFieldType(type)}
                  onChange={() => toggleFeedbackField(type)}
                />
                <div className="flex flex-col">
                  <span className="text-xs font-semibold">
                    {feedbackFieldLabels[type]}
                  </span>
                  <span className="text-xs text-base-content/70">
                    {feedbackFieldDescriptions[type]}
                  </span>
                </div>
              </label>
            ))}

            <div className="flex flex-col gap-3 px-3 py-3 text-sm">
              <div className="flex items-start justify-between gap-2">
                <div className="flex flex-col">
                  <span className="text-xs font-semibold">Distans &amp; tid</span>
                  <span className="text-xs text-base-content/70">
                    Ange distansen så sparas tiden som uppföljning efter passet.
                  </span>
                </div>
                <button
                  type="button"
                  className="btn btn-ghost btn-xs whitespace-nowrap"
                  onClick={addDistanceDurationPair}
                >
                  + Lägg till par
                </button>
              </div>

              {distanceFields.length > 0 && (
                <div className="flex flex-col gap-2">
                  {distanceFields.map((distanceField, index) => {
                    const durationField = durationFields[index];

                    return (
                      <div
                        key={distanceField.id}
                        className="flex flex-col gap-2 rounded-md bg-base-200/60 px-3 py-2"
                      >
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:gap-3">
                          <label className="form-control w-full gap-1 text-sm">
                            <span className="label-text text-xs">Distans</span>
                            <input
                              type="number"
                              inputMode="decimal"
                              className="input input-xs input-bordered"
                              placeholder="t.ex. 5000"
                              value={distanceField.label ?? ""}
                              onChange={(event) =>
                                updateFieldLabel(distanceField.id, event.target.value)
                              }
                              required
                            />
                          </label>

                          <label className="form-control w-full gap-1 text-sm">
                            <span className="label-text text-xs">Tid</span>
                            <input
                              type="text"
                              className="input input-xs input-bordered"
                              value={durationField?.label ?? feedbackFieldLabels.duration}
                              readOnly
                              disabled
                            />
                          </label>

                          <button
                            type="button"
                            className="btn btn-ghost btn-xs self-start sm:ml-auto"
                            onClick={() => removeDistanceDurationPair(index)}
                            aria-label="Ta bort distans- och tidspar"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-3 px-3 py-3 text-sm">
              <div className="flex items-start justify-between gap-2">
                <div className="flex flex-col">
                  <span className="text-xs font-semibold">
                    {feedbackFieldLabels.weight}
                  </span>
                  <span className="text-xs text-base-content/70">
                    {feedbackFieldDescriptions.weight}
                  </span>
                </div>
                <button
                  type="button"
                  className="btn btn-ghost btn-xs whitespace-nowrap"
                  onClick={addWeightField}
                >
                  + Lägg till vikt
                </button>
              </div>

              {weightFields.length > 0 && (
                <div className="flex flex-col gap-2">
                  {weightFields.map((field, index) => (
                    <div
                      key={field.id}
                      className="flex items-center justify-between rounded-md bg-base-200/60 px-3 py-2"
                    >
                      <span className="text-[11px] font-normal">Vikt #{index + 1}</span>
                      <button
                        type="button"
                        className="btn btn-ghost btn-xs"
                        onClick={() => removeWeightField(field.id)}
                        aria-label="Ta bort viktfält"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
