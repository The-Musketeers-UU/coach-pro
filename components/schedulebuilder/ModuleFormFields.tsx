import type { Dispatch, SetStateAction } from "react";

import type { FeedbackFieldType, ModuleForm } from "@/components/schedulebuilder/types";

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

export function ModuleFormFields({ formState, onChange }: ModuleFormFieldsProps) {
  const addFeedbackField = (type: FeedbackFieldType) => {
    if (formState.activeFeedbackFields.includes(type)) return;

    onChange((prev) => ({
      ...prev,
      activeFeedbackFields: [...prev.activeFeedbackFields, type],
    }));
  };

  const removeFeedbackField = (type: FeedbackFieldType) => {
    onChange((prev) => ({
      ...prev,
      activeFeedbackFields: prev.activeFeedbackFields.filter(
        (fieldType) => fieldType !== type,
      ),
      [type]: "",
    }));
  };

  const handleFieldValueChange = (type: FeedbackFieldType, value: string) => {
    onChange((prev) => ({
      ...prev,
      [type]: value,
    }));
  };

  const renderFeedbackFieldInput = (type: FeedbackFieldType) => {
    const placeholder = feedbackFieldPlaceholders[type];

    if (type === "comment") {
      return (
        <textarea
          className="textarea textarea-bordered"
          rows={2}
          value={formState.comment}
          onChange={(event) => handleFieldValueChange(type, event.target.value)}
          placeholder={placeholder}
        />
      );
    }

    const inputProps = {
      distance: { step: 10, min: 0, type: "number" },
      duration: { type: "text", inputMode: "decimal", pattern: "[0-9:.,]*" },
      weight: { step: 1, min: 0, type: "number" },
      feeling: { step: 1, min: 1, max: 10, type: "number" },
      sleepHours: { step: 0.5, min: 0, type: "number" },
    } as const;

    const value = formState[type];

    return (
      <input
        className="input input-sm input-bordered"
        {...inputProps[type]}
        value={value}
        onChange={(event) => handleFieldValueChange(type, event.target.value)}
        placeholder={placeholder}
      />
    );
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
              const isActive = formState.activeFeedbackFields.includes(type);

              return (
                <button
                  key={type}
                  type="button"
                  className="btn btn-ghost btn-xs"
                  onClick={() => addFeedbackField(type)}
                  disabled={isActive}
                >
                  + {feedbackFieldLabels[type]}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-3 space-y-3">
          {formState.activeFeedbackFields.length === 0 && (
            <p className="text-sm text-base-content/70">
              Inga valfria fält tillagda ännu.
            </p>
          )}

          {formState.activeFeedbackFields.map((type) => (
            <div
              key={type}
              className="flex flex-col gap-2 rounded-md border border-base-200 p-3"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="text-sm font-semibold">
                  {feedbackFieldLabels[type]}
                </div>
                <button
                  type="button"
                  className="btn btn-ghost btn-xs"
                  onClick={() => removeFeedbackField(type)}
                >
                  Ta bort
                </button>
              </div>

              {renderFeedbackFieldInput(type)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
