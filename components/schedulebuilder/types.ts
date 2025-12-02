export type Category = string;

export type DurationEntry = { minutes?: number; seconds?: number };

export type Module = {
  id: string;
  title: string;
  description: string;
  category: Category;
  subcategory?: string[];
  distanceMeters?: number[];
  duration?: DurationEntry[];
  weightKg?: number[];
  feedbackDescription?: string[];
  feedbackNumericValue?: (number | null)[];
  feedbackRating?: (number | null)[];
  feedbackComment?: string[];
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
  subcategory: string[];
  distanceMeters: string[];
  duration: { minutes: string; seconds: string }[];
  weightKg: string[];
  feedbackDescription: string[];
  feedbackNumericValue: string[];
  feedbackRating: string[];
  feedbackComment: string[];
};

export type Athlete = {
  id: string;
  name: string;
  sport: string;
};

export type Day = { id: string; label: string };

export type DropPreviewLocation = { dayId: string; index: number };
