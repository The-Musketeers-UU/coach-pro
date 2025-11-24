export type Category = "warmup" | "kondition" | "styrka";

export type Module = {
  id: string;
  title: string;
  description: string;
  category: Category;
  subcategory?: string;
  distanceMeters?: number;
  durationMinutes?: number;
  durationSeconds?: number;
  weightKg?: number;
};

export type DaySchedule = Record<string, Module[]>;

export type ActiveDrag =
  | { source: { type: "library" }; module: Module }
  | { source: { type: "schedule"; dayId: string; moduleIndex: number }; module: Module };

export type EditingContext =
  | { type: "library"; moduleId: string }
  | { type: "schedule"; moduleId: string; dayId: string; moduleIndex: number };

export type ModuleForm = {
  title: string;
  description: string;
  category: Category | "";
  subcategory: string;
  distanceMeters: string;
  durationMinutes: string;
  durationSeconds: string;
  weightKg: string;
};

export type Athlete = {
  id: string;
  name: string;
  sport: string;
};

export type DropPreviewLocation = { dayId: string; index: number };
