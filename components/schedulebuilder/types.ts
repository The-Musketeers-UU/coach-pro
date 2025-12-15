export type Category = string;

export type Module = {
  id: string;
  title: string;
  description: string;
  category: Category;
  subcategory?: string;
  distance?: number | null;
  duration?: number | null;
  weight?: number | null;
  comment?: string | null;
  feeling?: number | null;
  sleepHours?: number | null;
  sourceModuleId?: string;
  activeFeedbackFields?: FeedbackFieldType[];
};

export type DaySchedule = Record<string, Module[]>;

export type ActiveDrag =
  | { source: { type: "library" }; module: Module }
  | {
      source: { type: "schedule"; dayId: string; moduleIndex: number };
      module: Module;
    };

export type EditingContext =
  | { type: "library"; moduleId: string }
  | { type: "schedule"; moduleId: string; dayId: string; moduleIndex: number };

export type ModuleForm = {
  title: string;
  description: string;
  category: string;
  subcategory: string;
  distance: string;
  duration: string;
  weight: string;
  comment: string;
  feeling: string;
  sleepHours: string;
  activeFeedbackFields: FeedbackFieldType[];
};

export type FeedbackFieldType =
  | "distance"
  | "duration"
  | "weight"
  | "comment"
  | "feeling"
  | "sleepHours";

export type Athlete = {
  id: string;
  name: string;
  sport: string;
};

export type Day = { id: string; label: string };

export type DropPreviewLocation = { dayId: string; index: number };
