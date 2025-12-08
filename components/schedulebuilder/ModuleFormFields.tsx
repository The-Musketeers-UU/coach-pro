import type { Dispatch, SetStateAction } from "react";

import type { ModuleForm } from "@/components/schedulebuilder/types";

type ModuleFormFieldsProps = {
  formState: ModuleForm;
  onChange: Dispatch<SetStateAction<ModuleForm>>;
};

export function ModuleFormFields({ formState, onChange }: ModuleFormFieldsProps) {
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
      <label className="form-control flex gap-4 items-end">
        <span className="label-text text-sm">Distans (m):</span>
        <input
          type="number"
          min="0"
          className="input input-sm input-bordered w-20"
          value={formState.distance}
          onChange={(event) =>
            onChange((prev) => ({
              ...prev,
              distance: event.target.value,
            }))
          }
          placeholder=""
        />
      </label>

      <label className="form-control flex gap-4 items-end">
        <span className="label-text text-sm">Vikt (kg):</span>
        <input
          type="number"
          min="0"
          className="input input-sm input-bordered w-20"
          value={formState.weight}
          onChange={(event) =>
            onChange((prev) => ({
              ...prev,
              weight: event.target.value,
            }))
          }
          placeholder=""
        />
      </label>

      <label className="form-control flex flex-col gap-1">
        <span className="label-text text-sm">Tid (minuter):</span>
        <input
          type="number"
          min="0"
          className="input input-sm input-bordered"
          value={formState.duration}
          onChange={(event) =>
            onChange((prev) => ({
              ...prev,
              duration: event.target.value,
            }))
          }
          placeholder=""
        />
      </label>

      <label className="form-control flex-col flex gap-1">
        <span className="label-text text-sm">Kommentar:</span>
        <textarea
          className="textarea textarea-bordered w-full"
          rows={2}
          placeholder="Anteckningar om passet"
          value={formState.comment}
          onChange={(event) =>
            onChange((prev) => ({
              ...prev,
              comment: event.target.value,
            }))
          }
        />
      </label>

      <div className="grid grid-cols-2 gap-3">
        <label className="form-control flex flex-col gap-1">
          <span className="label-text text-sm">Känsla (1-10):</span>
          <input
            type="number"
            min="0"
            max="10"
            className="input input-sm input-bordered"
            value={formState.feeling}
            onChange={(event) =>
              onChange((prev) => ({
                ...prev,
                feeling: event.target.value,
              }))
            }
            placeholder=""
          />
        </label>

        <label className="form-control flex flex-col gap-1">
          <span className="label-text text-sm">Sömn (timmar):</span>
          <input
            type="number"
            min="0"
            className="input input-sm input-bordered"
            value={formState.sleepHours}
            onChange={(event) =>
              onChange((prev) => ({
                ...prev,
                sleepHours: event.target.value,
              }))
            }
            placeholder=""
          />
        </label>
      </div>
    </div>
  );
}
