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

const toggleFields: FeedbackFieldType[] = ["comment", "feeling", "sleepHours"];

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

  const addFeedbackField = (type: FeedbackFieldType) => {
    onChange((prev) => ({
      ...prev,
      feedbackFields: [...prev.feedbackFields, createFeedbackField(type, prev.feedbackFields)],
    }));
  };

  const addDistanceDurationPair = () => {
    onChange((prev) => {
      const nextFields = [...prev.feedbackFields];
      nextFields.push(createFeedbackField("distance", nextFields));
      nextFields.push(createFeedbackField("duration", nextFields));

      return {
        ...prev,
        feedbackFields: nextFields,
      };
    });
  };

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

  const removeFeedbackField = (fieldId: string) => {
    onChange((prev) => ({
      ...prev,
      feedbackFields: prev.feedbackFields.filter((field) => field.id !== fieldId),
    }));
  };

  const removeFeedbackFields = (fieldIds: string[]) => {
    onChange((prev) => ({
      ...prev,
      feedbackFields: prev.feedbackFields.filter((field) => !fieldIds.includes(field.id)),
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
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="font-medium">Valfria feedbackfält</p>
              <p className="text-sm text-base-content/70">
                Lägg bara till de uppföljningsfrågor du vill samla in för passet.
                Avmarkera ett fält om du inte vill be om det.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className="btn btn-outline btn-xs"
                onClick={addDistanceDurationPair}
              >
                + Distans + tid
              </button>
              <button
                type="button"
                className="btn btn-ghost btn-xs"
                onClick={() => addFeedbackField("weight")}
              >
                + {feedbackFieldLabels.weight}
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {toggleFields.map((type) => (
              <label
                key={type}
                className="flex items-center gap-2 rounded-full border border-base-200 px-3 py-1 text-sm"
              >
                <input
                  type="checkbox"
                  className="checkbox checkbox-sm"
                  checked={hasFieldType(type)}
                  onChange={() => toggleFeedbackField(type)}
                />
                <span>{feedbackFieldLabels[type]}</span>
              </label>
            ))}
          </div>

          <div className="space-y-3">
            {formState.feedbackFields.length === 0 && (
              <p className="text-sm text-base-content/70">
                Inga valfria fält tillagda ännu.
              </p>
            )}

            {(() => {
              const items: JSX.Element[] = [];

              for (let index = 0; index < formState.feedbackFields.length; index += 1) {
                const field = formState.feedbackFields[index];
                const nextField = formState.feedbackFields[index + 1];

                if (field.type === "distance" && nextField?.type === "duration") {
                  items.push(
                    <div
                      key={`pair-${field.id}-${nextField.id}`}
                      className="space-y-2 rounded-md border border-base-200 p-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-semibold">Distans &amp; tid</div>
                        <button
                          type="button"
                          className="btn btn-ghost btn-xs"
                          onClick={() => removeFeedbackFields([field.id, nextField.id])}
                        >
                          Ta bort paret
                        </button>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        {[field, nextField].map((pairedField) => (
                          <div key={pairedField.id} className="flex flex-col gap-2 rounded-md border border-base-200 p-3">
                            <div className="text-sm font-semibold">
                              {feedbackFieldLabels[pairedField.type]}
                            </div>
                            <label className="form-control gap-1">
                              <span className="label-text text-xs text-base-content/70">
                                Egen etikett (valfritt)
                              </span>
                              <input
                                className="input input-sm input-bordered"
                                type="text"
                                value={pairedField.label ?? ""}
                                onChange={(event) =>
                                  updateFeedbackLabel(pairedField.id, event.target.value)
                                }
                                placeholder=""
                              />
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>,
                  );

                  index += 1;
                  continue;
                }

                items.push(
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
                        placeholder=""
                      />
                    </label>
                  </div>,
                );
              }

              return items;
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}
