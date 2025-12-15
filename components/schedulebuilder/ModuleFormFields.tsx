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

const feedbackFieldPlaceholders: Record<FeedbackFieldType, string> = {
  distance: "Hur långt blev passet?",
  duration: "Ange tid som mm:ss eller mm:ss.hh",
  weight: "Vilken vikt använde du?",
  comment: "Lämna en kommentar om passet",
  feeling: "Hur kändes passet?",
  sleepHours: "Hur många timmars sömn fick du?",
};

type ModuleFormFieldsProps = {
  formState: ModuleForm;
  onChange: Dispatch<SetStateAction<ModuleForm>>;
};

const optionalFields: FeedbackFieldType[] = [
  "distance",
  "duration",
  "weight",
  "comment",
  "feeling",
  "sleepHours",
];

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
  const addFeedbackField = (type: FeedbackFieldType) => {
    onChange((prev) => ({
      ...prev,
      feedbackFields: [...prev.feedbackFields, createFeedbackField(type, prev.feedbackFields)],
    }));
  };

  const removeFeedbackField = (fieldId: string) => {
    onChange((prev) => ({
      ...prev,
      feedbackFields: prev.feedbackFields.filter((field) => field.id !== fieldId),
    }));
  };

  const updateFeedbackLabel = (fieldId: string, label: string) => {
    onChange((prev) => ({
      ...prev,
      feedbackFields: prev.feedbackFields.map((field) =>
        field.id === fieldId ? { ...field, label } : field,
      ),
    }));
  };

  return (
    <div className="flex flex-col gap-4">
      <label className="form-control flex flex-col gap-1">
        <span className="label-text text-sm">Titel:</span>
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
          className="textarea textarea-bordered w-full"
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
        <span className="label-text text-sm">Kategori:</span>
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
          className="input input-sm input-bordered"
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

      <div className="rounded-lg border border-base-300 p-3">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-medium">Valfria feedbackfält</p>
              <p className="text-sm text-base-content/70">
                Lägg bara till de uppföljningsfrågor du vill samla in för passet.
                Avmarkera ett fält om du inte vill be om det.
              </p>
            </div>
            <div className="flex flex-wrap gap-1">
              {optionalFields.map((type) => {
                return (
                  <button
                    key={type}
                    type="button"
                    className="btn btn-ghost btn-xs"
                  onClick={() => addFeedbackField(type)}
                  >
                    + {feedbackFieldLabels[type]}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-3 space-y-3">
          {formState.feedbackFields.length === 0 && (
            <p className="text-sm text-base-content/70">
              Inga valfria fält tillagda ännu.
            </p>
          )}

          {formState.feedbackFields.map((field) => (
            <div
              key={field.id}
              className="flex flex-col gap-2 rounded-md border border-base-200 p-3"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="text-sm font-semibold">
                  {feedbackFieldLabels[field.type]}
                </div>
                <button
                  type="button"
                  className="btn btn-ghost btn-xs"
                onClick={() => removeFeedbackField(field.id)}
                >
                  Ta bort
                </button>
              </div>

              <label className="form-control gap-1">
                <span className="label-text text-xs text-base-content/70">
                  Egen etikett (valfritt)
                </span>
                <input
                  className="input input-sm input-bordered"
                  type="text"
                  value={field.label ?? ""}
                  onChange={(event) => updateFeedbackLabel(field.id, event.target.value)}
                  placeholder={feedbackFieldPlaceholders[field.type]}
                />
              </label>
            </div>
          ))}
          </div>
        </div>
    </div>
  );
}
