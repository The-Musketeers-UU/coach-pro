export type Category = string;

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
  sourceModuleId?: string;
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
  category: string;
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

export type Day = { id: string; label: string };

export type DropPreviewLocation = { dayId: string; index: number };
