import type { Dispatch, SetStateAction } from "react";

import type {
  FeedbackFieldDefinition,
  FeedbackFieldType,
  ModuleForm,
} from "@/components/schedulebuilder/types";

const feedbackFieldLabels: Record<FeedbackFieldType, string> = {
  distance: "Distans (m)",
  duration: "Tid (mm:ss.hh)",
  weight: "Vikt (kg)",
  comment: "Kommentar",
  feeling: "Känsla (1-10)",
  sleepHours: "Sömn (timmar)",
};

const feedbackFieldDescriptions: Record<FeedbackFieldType, string> = {
  distance: "Vilken distans sprang du?",
  duration: "Vilken tid sprang du på?",
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
    countOfType === 0
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

  const toggleDistanceDurationPair = () => {
    onChange((prev) => {
      const hasDistance = prev.feedbackFields.some((field) => field.type === "distance");
      const hasDuration = prev.feedbackFields.some((field) => field.type === "duration");

      if (hasDistance || hasDuration) {
        return {
          ...prev,
          feedbackFields: prev.feedbackFields.filter(
            (field) => field.type !== "distance" && field.type !== "duration",
          ),
        };
      }

      const nextFields: FeedbackFieldDefinition[] = [];
      nextFields.push(...prev.feedbackFields);
      nextFields.push(createFeedbackField("distance", nextFields));
      nextFields.push(createFeedbackField("duration", nextFields));

      return { ...prev, feedbackFields: nextFields };
    });
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

      <div className="rounded-lg border border-base-300 p-3">
        <div className="flex flex-col gap-4">
          <div>
            <p className="font-medium">Valfria feedbackfält</p>
            <p className="text-sm text-base-content/70">
              Välj vilka uppföljningsfrågor som ska samlas in efter passet.
            </p>
          </div>

          <div className="flex flex-col divide-y divide-base-200 rounded-md border border-base-200">
            {(["comment", "feeling", "sleepHours"] as const).map((type) => (
              <label key={type} className="flex items-center gap-3 px-3 py-3 text-sm">
                <input
                  type="checkbox"
                  className="checkbox checkbox-sm"
                  checked={hasFieldType(type)}
                  onChange={() => toggleFeedbackField(type)}
                />
                <div className="flex flex-col">
                  <span className="font-medium">{feedbackFieldLabels[type]}</span>
                  <span className="text-xs text-base-content/70">
                    {feedbackFieldDescriptions[type]}
                  </span>
                </div>
              </label>
            ))}

            <label className="flex items-center gap-3 px-3 py-3 text-sm">
              <input
                type="checkbox"
                className="checkbox checkbox-sm"
                checked={hasFieldType("distance") && hasFieldType("duration")}
                onChange={toggleDistanceDurationPair}
              />
              <div className="flex flex-col">
                <span className="font-medium">Distans &amp; tid</span>
                <span className="text-xs text-base-content/70">
                  {feedbackFieldDescriptions.distance} {feedbackFieldDescriptions.duration}
                </span>
              </div>
            </label>

            <label className="flex items-center gap-3 px-3 py-3 text-sm">
              <input
                type="checkbox"
                className="checkbox checkbox-sm"
                checked={hasFieldType("weight")}
                onChange={() => toggleFeedbackField("weight")}
              />
              <div className="flex flex-col">
                <span className="font-medium">{feedbackFieldLabels.weight}</span>
                <span className="text-xs text-base-content/70">
                  {feedbackFieldDescriptions.weight}
                </span>
              </div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
