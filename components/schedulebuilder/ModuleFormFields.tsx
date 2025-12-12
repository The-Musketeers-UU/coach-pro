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

const feedbackFieldDescriptions: Record<FeedbackFieldType, string> = {
  distance: "Hur långt blev passet?",
  duration: "Ange tid som mm:ss eller mm:ss.hh",
  weight: "Vilken vikt använde du?",
  comment: "Lämna en kommentar om passet",
  feeling: "Atleten väljer en känsla på en skala 1–10.",
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
  const toggleFeedbackField = (type: FeedbackFieldType, isActive: boolean) => {
    onChange((prev) => ({
      ...prev,
      activeFeedbackFields: isActive
        ? [...prev.activeFeedbackFields, type]
        : prev.activeFeedbackFields.filter((fieldType) => fieldType !== type),
      [type]: "",
    }));
  };

  const feelingOptions = Array.from({ length: 10 }, (_, index) => index + 1);

  return (
    <div className="grid gap-6 sm:grid-cols-[minmax(0,1.1fr)_minmax(280px,1fr)]">
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
      </div>

      <div className="rounded-lg border border-base-300 p-3 sm:h-fit">
        <div>
          <p className="font-medium">Valfria feedbackfält</p>
          <p className="text-sm text-base-content/70">
            Bocka i vilka uppföljningsfrågor du vill att atleten ska svara på
            efter passet.
          </p>
        </div>

        <div className="mt-4 space-y-2">
          {optionalFields.map((type) => {
            const isActive = formState.activeFeedbackFields.includes(type);

            return (
              <label
                key={type}
                className="flex items-start gap-3 rounded-md border border-base-200 p-3"
              >
                <input
                  type="checkbox"
                  className="checkbox checkbox-sm mt-1"
                  checked={isActive}
                  onChange={(event) =>
                    toggleFeedbackField(type, event.target.checked)
                  }
                />

                <div className="flex flex-col gap-1">
                  <div className="text-sm font-semibold">
                    {feedbackFieldLabels[type]}
                  </div>
                  <p className="text-xs text-base-content/70">
                    {feedbackFieldDescriptions[type]}
                  </p>

                  {type === "feeling" && (
                    <select
                      className="select select-bordered select-xs max-w-[120px]"
                      value=""
                      disabled
                    >
                      <option value="" disabled>
                        Känsla 1–10
                      </option>
                      {feelingOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );
}
