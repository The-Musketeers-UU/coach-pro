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

    if (formState.subcategory.length > 0) visible.add("subcategory");
    if (formState.distanceMeters.length > 0) visible.add("distanceMeters");
    if (formState.weightKg.length > 0) visible.add("weightKg");
    if (formState.duration.length > 0) visible.add("duration");
    if (formState.feedbackDescription.length > 0)
      visible.add("feedbackDescription");
    if (formState.feedbackNumericValue.length > 0)
      visible.add("feedbackNumericValue");
    if (formState.feedbackRating.length > 0) visible.add("feedbackRating");
    if (formState.feedbackComment.length > 0) visible.add("feedbackComment");

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
        return { ...prev, duration: [] };
      }

      if (field === "subcategory") {
        return { ...prev, subcategory: [] };
      }

      if (field === "distanceMeters") {
        return { ...prev, distanceMeters: [] };
      }

      if (field === "weightKg") {
        return { ...prev, weightKg: [] };
      }

      if (field === "feedbackDescription") {
        return { ...prev, feedbackDescription: [] };
      }

      if (field === "feedbackNumericValue") {
        return { ...prev, feedbackNumericValue: [] };
      }

      if (field === "feedbackRating") {
        return { ...prev, feedbackRating: [] };
      }

      if (field === "feedbackComment") {
        return { ...prev, feedbackComment: [] };
      }

      return prev;
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
          <div className="flex flex-col gap-3 rounded-lg border border-base-200 p-3">
            <div className="flex items-center justify-between text-sm">
              <span className="label-text">Underkategorier:</span>
              <button
                type="button"
                className="link link-error text-xs"
                onClick={() => removeOptionalField("subcategory")}
              >
                Ta bort alla
              </button>
            </div>

            <div className="flex flex-col gap-2">
              {formState.subcategory.map((value, index) => (
                <div className="flex items-center gap-2" key={`subcategory-${index}`}>
                  <input
                    type="text"
                    className="input input-sm input-bordered flex-1"
                    value={value}
                    onChange={(event) =>
                      onChange((prev) => ({
                        ...prev,
                        subcategory: prev.subcategory.map((item, idx) =>
                          idx === index ? event.target.value : item
                        ),
                      }))
                    }
                    placeholder="t.ex. Intervaller, baslyft"
                  />
                  <button
                    type="button"
                    className="btn btn-circle btn-ghost btn-xs"
                    aria-label="Ta bort underkategori"
                    onClick={() =>
                      onChange((prev) => ({
                        ...prev,
                        subcategory: prev.subcategory.filter((_, idx) =>
                          idx !== index
                        ),
                      }))
                    }
                  >
                    ✕
                  </button>
                </div>
              ))}

              <button
                type="button"
                className="btn btn-outline btn-xs self-start"
                onClick={() =>
                  onChange((prev) => ({
                    ...prev,
                    subcategory: [...prev.subcategory, ""],
                  }))
                }
              >
                Lägg till underkategori
              </button>
            </div>
          </div>
        );

      case "distanceMeters":
        return (
          <div className="flex flex-col gap-3 rounded-lg border border-base-200 p-3">
            <div className="flex items-center justify-between text-sm">
              <span className="label-text">Distans (m):</span>
              <button
                type="button"
                className="link link-error text-xs"
                onClick={() => removeOptionalField("distanceMeters")}
              >
                Ta bort alla
              </button>
            </div>

            <div className="flex flex-col gap-2">
              {formState.distanceMeters.map((value, index) => (
                <div className="flex items-center gap-2" key={`distance-${index}`}>
                  <input
                    type="number"
                    min="0"
                    className="input input-sm input-bordered w-28"
                    value={value}
                    onChange={(event) =>
                      onChange((prev) => ({
                        ...prev,
                        distanceMeters: prev.distanceMeters.map((item, idx) =>
                          idx === index ? event.target.value : item
                        ),
                      }))
                    }
                  />
                  <button
                    type="button"
                    className="btn btn-circle btn-ghost btn-xs"
                    aria-label="Ta bort distans"
                    onClick={() =>
                      onChange((prev) => ({
                        ...prev,
                        distanceMeters: prev.distanceMeters.filter((_, idx) =>
                          idx !== index
                        ),
                      }))
                    }
                  >
                    ✕
                  </button>
                </div>
              ))}

              <button
                type="button"
                className="btn btn-outline btn-xs self-start"
                onClick={() =>
                  onChange((prev) => ({
                    ...prev,
                    distanceMeters: [...prev.distanceMeters, ""],
                  }))
                }
              >
                Lägg till distans
              </button>
            </div>
          </div>
        );

      case "weightKg":
        return (
          <div className="flex flex-col gap-3 rounded-lg border border-base-200 p-3">
            <div className="flex items-center justify-between text-sm">
              <span className="label-text">Vikt (kg):</span>
              <button
                type="button"
                className="link link-error text-xs"
                onClick={() => removeOptionalField("weightKg")}
              >
                Ta bort alla
              </button>
            </div>

            <div className="flex flex-col gap-2">
              {formState.weightKg.map((value, index) => (
                <div className="flex items-center gap-2" key={`weight-${index}`}>
                  <input
                    type="number"
                    min="0"
                    className="input input-sm input-bordered w-28"
                    value={value}
                    onChange={(event) =>
                      onChange((prev) => ({
                        ...prev,
                        weightKg: prev.weightKg.map((item, idx) =>
                          idx === index ? event.target.value : item
                        ),
                      }))
                    }
                  />
                  <button
                    type="button"
                    className="btn btn-circle btn-ghost btn-xs"
                    aria-label="Ta bort vikt"
                    onClick={() =>
                      onChange((prev) => ({
                        ...prev,
                        weightKg: prev.weightKg.filter((_, idx) => idx !== index),
                      }))
                    }
                  >
                    ✕
                  </button>
                </div>
              ))}

              <button
                type="button"
                className="btn btn-outline btn-xs self-start"
                onClick={() =>
                  onChange((prev) => ({
                    ...prev,
                    weightKg: [...prev.weightKg, ""],
                  }))
                }
              >
                Lägg till vikt
              </button>
            </div>
          </div>
        );

      case "duration":
        return (
          <div className="flex flex-col gap-3 rounded-lg border border-base-200 p-3">
            <div className="flex items-center justify-between text-sm">
              <span className="label-text">Tid (minuter/sekunder):</span>
              <button
                type="button"
                className="link link-error text-xs"
                onClick={() => removeOptionalField("duration")}
              >
                Ta bort alla
              </button>
            </div>

            <div className="flex flex-col gap-2">
              {formState.duration.map((entry, index) => (
                <div
                  className="grid grid-cols-2 items-end gap-3"
                  key={`duration-${index}`}
                >
                  <label className="form-control flex flex-col gap-1">
                    <span className="label-text text-sm">Minuter:</span>
                    <input
                      type="number"
                      min="0"
                      className="input input-sm input-bordered"
                      value={entry.minutes}
                      onChange={(event) =>
                        onChange((prev) => ({
                          ...prev,
                          duration: prev.duration.map((item, idx) =>
                            idx === index
                              ? { ...item, minutes: event.target.value }
                              : item
                          ),
                        }))
                      }
                    />
                  </label>

                  <div className="flex items-center gap-2">
                    <label className="form-control flex-1 flex-col gap-1">
                      <span className="label-text text-sm">Sekunder:</span>
                      <input
                        type="number"
                        min="0"
                        max="59"
                        className="input input-sm input-bordered"
                        value={entry.seconds}
                        onChange={(event) =>
                          onChange((prev) => ({
                            ...prev,
                            duration: prev.duration.map((item, idx) =>
                              idx === index
                                ? { ...item, seconds: event.target.value }
                                : item
                            ),
                          }))
                        }
                      />
                    </label>

                    <button
                      type="button"
                      className="btn btn-circle btn-ghost btn-xs"
                      aria-label="Ta bort tidsfält"
                      onClick={() =>
                        onChange((prev) => ({
                          ...prev,
                          duration: prev.duration.filter((_, idx) => idx !== index),
                        }))
                      }
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}

              <button
                type="button"
                className="btn btn-outline btn-xs self-start"
                onClick={() =>
                  onChange((prev) => ({
                    ...prev,
                    duration: [...prev.duration, { minutes: "", seconds: "" }],
                  }))
                }
              >
                Lägg till tid
              </button>
            </div>
          </div>
        );

      case "feedbackDescription":
        return (
          <div className="flex flex-col gap-3 rounded-lg border border-base-200 p-3">
            <div className="flex items-center justify-between text-sm">
              <span className="label-text">Feedbackinstruktioner:</span>
              <button
                type="button"
                className="link link-error text-xs"
                onClick={() => removeOptionalField("feedbackDescription")}
              >
                Ta bort alla
              </button>
            </div>

            <div className="flex flex-col gap-2">
              {formState.feedbackDescription.map((value, index) => (
                <div className="flex items-start gap-2" key={`feedback-desc-${index}`}>
                  <textarea
                    className="textarea textarea-bordered w-full"
                    rows={2}
                    placeholder="Vad vill du att atleten ska lämna feedback på?"
                    value={value}
                    onChange={(event) =>
                      onChange((prev) => ({
                        ...prev,
                        feedbackDescription: prev.feedbackDescription.map(
                          (item, idx) => (idx === index ? event.target.value : item)
                        ),
                      }))
                    }
                  />
                  <button
                    type="button"
                    className="btn btn-circle btn-ghost btn-xs"
                    aria-label="Ta bort feedbackinstruktion"
                    onClick={() =>
                      onChange((prev) => ({
                        ...prev,
                        feedbackDescription: prev.feedbackDescription.filter(
                          (_, idx) => idx !== index
                        ),
                      }))
                    }
                  >
                    ✕
                  </button>
                </div>
              ))}

              <button
                type="button"
                className="btn btn-outline btn-xs self-start"
                onClick={() =>
                  onChange((prev) => ({
                    ...prev,
                    feedbackDescription: [...prev.feedbackDescription, ""],
                  }))
                }
              >
                Lägg till feedbackinstruktion
              </button>
            </div>
          </div>
        );

      case "feedbackNumericValue":
        return (
          <div className="flex flex-col gap-3 rounded-lg border border-base-200 p-3">
            <div className="flex items-center justify-between text-sm">
              <span className="label-text">Numeriska feedbackvärden:</span>
              <button
                type="button"
                className="link link-error text-xs"
                onClick={() => removeOptionalField("feedbackNumericValue")}
              >
                Ta bort alla
              </button>
            </div>

            <div className="flex flex-col gap-2">
              {formState.feedbackNumericValue.map((value, index) => (
                <div className="flex items-center gap-2" key={`feedback-num-${index}`}>
                  <input
                    type="number"
                    className="input input-sm input-bordered flex-1"
                    value={value}
                    onChange={(event) =>
                      onChange((prev) => ({
                        ...prev,
                        feedbackNumericValue: prev.feedbackNumericValue.map(
                          (item, idx) => (idx === index ? event.target.value : item)
                        ),
                      }))
                    }
                    placeholder="t.ex. total belastning"
                  />
                  <button
                    type="button"
                    className="btn btn-circle btn-ghost btn-xs"
                    aria-label="Ta bort numeriskt feedbackvärde"
                    onClick={() =>
                      onChange((prev) => ({
                        ...prev,
                        feedbackNumericValue: prev.feedbackNumericValue.filter(
                          (_, idx) => idx !== index
                        ),
                      }))
                    }
                  >
                    ✕
                  </button>
                </div>
              ))}

              <button
                type="button"
                className="btn btn-outline btn-xs self-start"
                onClick={() =>
                  onChange((prev) => ({
                    ...prev,
                    feedbackNumericValue: [...prev.feedbackNumericValue, ""],
                  }))
                }
              >
                Lägg till numeriskt värde
              </button>
            </div>
          </div>
        );

      case "feedbackRating":
        return (
          <div className="flex flex-col gap-3 rounded-lg border border-base-200 p-3">
            <div className="flex items-center justify-between text-sm">
              <span className="label-text">Betygsskala (1-10):</span>
              <button
                type="button"
                className="link link-error text-xs"
                onClick={() => removeOptionalField("feedbackRating")}
              >
                Ta bort alla
              </button>
            </div>

            <div className="flex flex-col gap-2">
              {formState.feedbackRating.map((value, index) => (
                <div className="flex items-center gap-2" key={`feedback-rating-${index}`}>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    className="input input-sm input-bordered flex-1"
                    value={value}
                    onChange={(event) =>
                      onChange((prev) => ({
                        ...prev,
                        feedbackRating: prev.feedbackRating.map((item, idx) =>
                          idx === index ? event.target.value : item
                        ),
                      }))
                    }
                    placeholder="t.ex. skattat välmående"
                  />
                  <button
                    type="button"
                    className="btn btn-circle btn-ghost btn-xs"
                    aria-label="Ta bort feedbackbetyg"
                    onClick={() =>
                      onChange((prev) => ({
                        ...prev,
                        feedbackRating: prev.feedbackRating.filter(
                          (_, idx) => idx !== index
                        ),
                      }))
                    }
                  >
                    ✕
                  </button>
                </div>
              ))}

              <button
                type="button"
                className="btn btn-outline btn-xs self-start"
                onClick={() =>
                  onChange((prev) => ({
                    ...prev,
                    feedbackRating: [...prev.feedbackRating, ""],
                  }))
                }
              >
                Lägg till betyg
              </button>
            </div>
          </div>
        );

      case "feedbackComment":
        return (
          <div className="flex flex-col gap-3 rounded-lg border border-base-200 p-3">
            <div className="flex items-center justify-between text-sm">
              <span className="label-text">Kommentar:</span>
              <button
                type="button"
                className="link link-error text-xs"
                onClick={() => removeOptionalField("feedbackComment")}
              >
                Ta bort alla
              </button>
            </div>

            <div className="flex flex-col gap-2">
              {formState.feedbackComment.map((value, index) => (
                <div className="flex items-start gap-2" key={`feedback-comment-${index}`}>
                  <textarea
                    className="textarea textarea-bordered w-full"
                    rows={2}
                    placeholder="Frivilliga kommentarer från atleten"
                    value={value}
                    onChange={(event) =>
                      onChange((prev) => ({
                        ...prev,
                        feedbackComment: prev.feedbackComment.map((item, idx) =>
                          idx === index ? event.target.value : item
                        ),
                      }))
                    }
                  />
                  <button
                    type="button"
                    className="btn btn-circle btn-ghost btn-xs"
                    aria-label="Ta bort kommentar"
                    onClick={() =>
                      onChange((prev) => ({
                        ...prev,
                        feedbackComment: prev.feedbackComment.filter(
                          (_, idx) => idx !== index
                        ),
                      }))
                    }
                  >
                    ✕
                  </button>
                </div>
              ))}

              <button
                type="button"
                className="btn btn-outline btn-xs self-start"
                onClick={() =>
                  onChange((prev) => ({
                    ...prev,
                    feedbackComment: [...prev.feedbackComment, ""],
                  }))
                }
              >
                Lägg till kommentar
              </button>
            </div>
          </div>
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
