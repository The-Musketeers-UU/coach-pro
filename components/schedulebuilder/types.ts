export type Category = string;

export type Module = {
  id: string;
  title: string;
  description: string;
  category: Category;
  subcategory?: string;
  visibleToAllCoaches?: boolean;
  distance?: number | null;
  duration?: number | null;
  weight?: number | null;
  comment?: string | null;
  feeling?: number | null;
  sleepHours?: number | null;
  sourceModuleId?: string;
  feedbackFields?: FeedbackFieldDefinition[];
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
  visibleToAllCoaches: boolean;
  distance: string;
  duration: string;
  weight: string;
  comment: string;
  feeling: string;
  sleepHours: string;
  feedbackFields: FeedbackFieldDefinition[];
};

export type FeedbackFieldType =
  | "distance"
  | "duration"
  | "weight"
  | "comment"
  | "feeling"
  | "sleepHours";

export type FeedbackFieldDefinition = {
  id: string;
  type: FeedbackFieldType;
  label?: string;
};

export type Athlete = {
  id: string;
  name: string;
  sport: string;
};

export type TrainingGroup = {
  id: string;
  name: string;
  athletes: Athlete[];
};

export type Day = { id: string; label: string };

export type DropPreviewLocation = { dayId: string; index: number };
