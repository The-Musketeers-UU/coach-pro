import {
  useEffect,
  useMemo,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";

import type { ModuleForm } from "@/components/schedulebuilder/types";

type OptionalFieldKey =
  | "subcategory"
  | "distanceMeters"
  | "weightKg"
  | "duration"
  | "feedbackDescription"
  | "feedbackNumericValue"
  | "feedbackRating"
  | "feedbackComment";

type ModuleFormFieldsProps = {
  formState: ModuleForm;
  onChange: Dispatch<SetStateAction<ModuleForm>>;
};

export function ModuleFormFields({ formState, onChange }: ModuleFormFieldsProps) {
  const initialVisible = useMemo(() => {
    const visible = new Set<OptionalFieldKey>();

    if (formState.subcategory) visible.add("subcategory");
    if (formState.distanceMeters) visible.add("distanceMeters");
    if (formState.weightKg) visible.add("weightKg");
    if (formState.durationMinutes || formState.durationSeconds)
      visible.add("duration");
    if (formState.feedbackDescription) visible.add("feedbackDescription");
    if (formState.feedbackNumericValue) visible.add("feedbackNumericValue");
    if (formState.feedbackRating) visible.add("feedbackRating");
    if (formState.feedbackComment) visible.add("feedbackComment");

    return visible;
  }, [formState]);

  const [visibleOptionalFields, setVisibleOptionalFields] = useState(initialVisible);

  useEffect(() => {
    setVisibleOptionalFields(initialVisible);
  }, [initialVisible]);

  const addOptionalField = (field: OptionalFieldKey) => {
    setVisibleOptionalFields((prev) => new Set(prev).add(field));
  };

  const removeOptionalField = (field: OptionalFieldKey) => {
    setVisibleOptionalFields((prev) => {
      const next = new Set(prev);
      next.delete(field);
      return next;
    });

    onChange((prev) => {
      if (field === "duration") {
        return { ...prev, durationMinutes: "", durationSeconds: "" };
      }

      if (field === "feedbackDescription") {
        return { ...prev, feedbackDescription: "" };
      }

      if (field === "feedbackNumericValue") {
        return { ...prev, feedbackNumericValue: "" };
      }

      if (field === "feedbackRating") {
        return { ...prev, feedbackRating: "" };
      }

      if (field === "feedbackComment") {
        return { ...prev, feedbackComment: "" };
      }

      return { ...prev, [field]: "" } as ModuleForm;
    });
  };

  const optionalFieldLabels: Record<OptionalFieldKey, string> = {
    subcategory: "Underkategori",
    distanceMeters: "Distans (m)",
    weightKg: "Vikt (kg)",
    duration: "Tid (minuter/sekunder)",
    feedbackDescription: "Feedbackinstruktion",
    feedbackNumericValue: "Numeriskt värde att fylla i",
    feedbackRating: "Betygsskala 1-10",
    feedbackComment: "Kommentar",
  };

  const optionalFieldOrder: OptionalFieldKey[] = [
    "subcategory",
    "distanceMeters",
    "weightKg",
    "duration",
    "feedbackDescription",
    "feedbackNumericValue",
    "feedbackRating",
    "feedbackComment",
  ];

  const availableFields = optionalFieldOrder.filter(
    (field) => !visibleOptionalFields.has(field)
  );

  const renderOptionalField = (field: OptionalFieldKey) => {
    switch (field) {
      case "subcategory":
        return (
          <label className="form-control flex flex-col gap-1">
            <div className="flex items-center justify-between text-sm">
              <span className="label-text">Underkategori:</span>
              <button
                type="button"
                className="link link-error text-xs"
                onClick={() => removeOptionalField("subcategory")}
              >
                Ta bort
              </button>
            </div>
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
        );

      case "distanceMeters":
        return (
          <label className="form-control flex gap-4 items-end">
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between text-sm">
                <span className="label-text">Distans (m):</span>
                <button
                  type="button"
                  className="link link-error text-xs"
                  onClick={() => removeOptionalField("distanceMeters")}
                >
                  Ta bort
                </button>
              </div>
              <input
                type="number"
                min="0"
                className="input input-sm input-bordered w-24"
                value={formState.distanceMeters}
                onChange={(event) =>
                  onChange((prev) => ({
                    ...prev,
                    distanceMeters: event.target.value,
                  }))
                }
                placeholder=""
              />
            </div>
          </label>
        );

      case "weightKg":
        return (
          <label className="form-control flex gap-4 items-end">
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between text-sm">
                <span className="label-text">Vikt (kg):</span>
                <button
                  type="button"
                  className="link link-error text-xs"
                  onClick={() => removeOptionalField("weightKg")}
                >
                  Ta bort
                </button>
              </div>
              <input
                type="number"
                min="0"
                className="input input-sm input-bordered w-24"
                value={formState.weightKg}
                onChange={(event) =>
                  onChange((prev) => ({
                    ...prev,
                    weightKg: event.target.value,
                  }))
                }
                placeholder=""
              />
            </div>
          </label>
        );

      case "duration":
        return (
          <div className="grid grid-cols-2 gap-3">
            <label className="form-control flex flex-col gap-1">
              <div className="flex items-center justify-between text-sm">
                <span className="label-text">Minuter:</span>
                <button
                  type="button"
                  className="link link-error text-xs"
                  onClick={() => removeOptionalField("duration")}
                >
                  Ta bort
                </button>
              </div>
              <input
                type="number"
                min="0"
                className="input input-sm input-bordered"
                value={formState.durationMinutes}
                onChange={(event) =>
                  onChange((prev) => ({
                    ...prev,
                    durationMinutes: event.target.value,
                  }))
                }
                placeholder=""
              />
            </label>

            <label className="form-control flex flex-col gap-1">
              <span className="label-text text-sm">Sekunder:</span>
              <input
                type="number"
                min="0"
                max="59"
                className="input input-sm input-bordered"
                value={formState.durationSeconds}
                onChange={(event) =>
                  onChange((prev) => ({
                    ...prev,
                    durationSeconds: event.target.value,
                  }))
                }
                placeholder=""
              />
            </label>
          </div>
        );

      case "feedbackDescription":
        return (
          <label className="form-control flex-col flex gap-1">
            <div className="flex items-center justify-between text-sm">
              <span className="label-text">Feedbackinstruktion:</span>
              <button
                type="button"
                className="link link-error text-xs"
                onClick={() => removeOptionalField("feedbackDescription")}
              >
                Ta bort
              </button>
            </div>
            <textarea
              className="textarea textarea-bordered w-full"
              rows={2}
              placeholder="Vad vill du att atleten ska lämna feedback på?"
              value={formState.feedbackDescription}
              onChange={(event) =>
                onChange((prev) => ({
                  ...prev,
                  feedbackDescription: event.target.value,
                }))
              }
            />
          </label>
        );

      case "feedbackNumericValue":
        return (
          <label className="form-control flex flex-col gap-1">
            <div className="flex items-center justify-between text-sm">
              <span className="label-text">Numeriskt feedbackvärde:</span>
              <button
                type="button"
                className="link link-error text-xs"
                onClick={() => removeOptionalField("feedbackNumericValue")}
              >
                Ta bort
              </button>
            </div>
            <input
              type="number"
              className="input input-sm input-bordered"
              value={formState.feedbackNumericValue}
              onChange={(event) =>
                onChange((prev) => ({
                  ...prev,
                  feedbackNumericValue: event.target.value,
                }))
              }
              placeholder="t.ex. total belastning"
            />
          </label>
        );

      case "feedbackRating":
        return (
          <label className="form-control flex flex-col gap-1">
            <div className="flex items-center justify-between text-sm">
              <span className="label-text">Betygsskala (1-10):</span>
              <button
                type="button"
                className="link link-error text-xs"
                onClick={() => removeOptionalField("feedbackRating")}
              >
                Ta bort
              </button>
            </div>
            <input
              type="number"
              min="1"
              max="10"
              className="input input-sm input-bordered"
              value={formState.feedbackRating}
              onChange={(event) =>
                onChange((prev) => ({
                  ...prev,
                  feedbackRating: event.target.value,
                }))
              }
              placeholder="t.ex. skattat välmående"
            />
          </label>
        );

      case "feedbackComment":
        return (
          <label className="form-control flex-col flex gap-1">
            <div className="flex items-center justify-between text-sm">
              <span className="label-text">Kommentar:</span>
              <button
                type="button"
                className="link link-error text-xs"
                onClick={() => removeOptionalField("feedbackComment")}
              >
                Ta bort
              </button>
            </div>
            <textarea
              className="textarea textarea-bordered w-full"
              rows={2}
              placeholder="Frivilliga kommentarer från atleten"
              value={formState.feedbackComment}
              onChange={(event) =>
                onChange((prev) => ({
                  ...prev,
                  feedbackComment: event.target.value,
                }))
              }
            />
          </label>
        );

      default:
        return null;
    }
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

      <div className="flex flex-col gap-3 border-t border-base-200 pt-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-base-content/80">
            Valfria fält
          </span>
          {availableFields.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {availableFields.map((field) => (
                <button
                  key={field}
                  type="button"
                  className="btn btn-xs btn-outline"
                  onClick={() => addOptionalField(field)}
                >
                  Lägg till {optionalFieldLabels[field].toLowerCase()}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3">
          {optionalFieldOrder.map((field) =>
            visibleOptionalFields.has(field) ? (
              <div key={field}>{renderOptionalField(field)}</div>
            ) : null
          )}
        </div>
      </div>
    </div>
  );
}
