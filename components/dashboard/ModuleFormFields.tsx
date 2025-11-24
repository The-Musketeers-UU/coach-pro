import type { Dispatch, SetStateAction } from "react";

import type { Category, ModuleForm } from "@/components/dashboard/types";

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
        <select
          className="select select-bordered select-sm"
          value={formState.category}
          onChange={(event) =>
            onChange((prev) => ({
              ...prev,
              category: event.target.value as Category,
            }))
          }
          required
        >
          <option value="" disabled>
            Välj kategori
          </option>
          <option value="warmup">Uppvärmning</option>
          <option value="kondition">Kondition</option>
          <option value="styrka">Styrka</option>
        </select>
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
          value={formState.distanceMeters}
          onChange={(event) =>
            onChange((prev) => ({
              ...prev,
              distanceMeters: event.target.value,
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
          value={formState.weightKg}
          onChange={(event) =>
            onChange((prev) => ({
              ...prev,
              weightKg: event.target.value,
            }))
          }
          placeholder=""
        />
      </label>

      <div className="grid grid-cols-2 gap-3">
        <label className="form-control flex flex-col gap-1">
          <span className="label-text text-sm">Minuter:</span>
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
    </div>
  );
}
