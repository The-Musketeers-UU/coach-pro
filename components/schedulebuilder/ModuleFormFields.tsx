import type { Dispatch, SetStateAction } from "react";

import type {
  FeedbackFieldType,
  ModuleForm,
} from "@/components/schedulebuilder/types";

const feedbackFieldLabels: Record<FeedbackFieldType, string> = {
  distance: "Distans (m)",
  duration: "Tid (min)",
  weight: "Vikt (kg)",
  comment: "Kommentar",
  feeling: "Känsla (1-10)",
  sleepHours: "Sömn (timmar)",
};

const defaultPrompts: Record<FeedbackFieldType, string> = {
  distance: "Hur långt blev passet?",
  duration: "Hur lång tid tog passet?",
  weight: "Vilken vikt använde du?",
  comment: "Lämna en kommentar om passet",
  feeling: "Hur kändes passet?",
  sleepHours: "Hur många timmars sömn fick du?",
};

const createFeedbackField = (type: FeedbackFieldType, index: number) => ({
  id: `${type}-${Date.now()}-${index}`,
  type,
  prompt: defaultPrompts[type],
});

type ModuleFormFieldsProps = {
  formState: ModuleForm;
  onChange: Dispatch<SetStateAction<ModuleForm>>;
};

export function ModuleFormFields({ formState, onChange }: ModuleFormFieldsProps) {
  const addFeedbackField = (type: FeedbackFieldType) => {
    onChange((prev) => ({
      ...prev,
      feedbackFields: [
        ...prev.feedbackFields,
        createFeedbackField(type, prev.feedbackFields.length),
      ],
    }));
  };

  const updatePrompt = (id: string, prompt: string) => {
    onChange((prev) => ({
      ...prev,
      feedbackFields: prev.feedbackFields.map((field) =>
        field.id === id ? { ...field, prompt } : field
      ),
    }));
  };

  const removeFeedbackField = (id: string) => {
    onChange((prev) => ({
      ...prev,
      feedbackFields: prev.feedbackFields.filter((field) => field.id !== id),
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
              Lägg till de uppföljningsfrågor du vill samla in för passet. Du kan
              lägga till samma typ flera gånger.
            </p>
          </div>
          <div className="flex flex-wrap gap-1">
            {(Object.keys(feedbackFieldLabels) as FeedbackFieldType[]).map(
              (type) => (
                <button
                  key={type}
                  type="button"
                  className="btn btn-ghost btn-xs"
                  onClick={() => addFeedbackField(type)}
                >
                  + {feedbackFieldLabels[type]}
                </button>
              )
            )}
          </div>
        </div>

        <div className="mt-3 space-y-3">
          {formState.feedbackFields.length === 0 && (
            <p className="text-sm text-base-content/70">
              Inga valfria fält tillagda ännu.
            </p>
          )}

          {formState.feedbackFields.map((field, index) => (
            <div
              key={field.id}
              className="flex flex-col gap-2 rounded-md border border-base-200 p-3"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="text-sm font-semibold">
                  {feedbackFieldLabels[field.type]} #{index + 1}
                </div>
                <button
                  type="button"
                  className="btn btn-ghost btn-xs"
                  onClick={() => removeFeedbackField(field.id)}
                >
                  Ta bort
                </button>
              </div>
              <label className="form-control">
                <span className="label-text text-xs">Frågetext</span>
                <input
                  type="text"
                  className="input input-sm input-bordered"
                  value={field.prompt}
                  onChange={(event) => updatePrompt(field.id, event.target.value)}
                  placeholder={defaultPrompts[field.type]}
                />
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
