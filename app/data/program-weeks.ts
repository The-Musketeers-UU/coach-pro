export type ProgramModule = {
  title: string;
  focus: string;
  duration: string;
  intent: string;
};

export type ProgramDay = {
  id: string;
  label: string;
  modules: ProgramModule[];
};

export type ProgramWeek = {
  id: string;
  label: string;
  focus: string;
  days: ProgramDay[];
};

export const programWeeks: ProgramWeek[] = [
  {
    id: "wk-1",
    label: "Camp momentum",
    focus: "Race-week sharpening",
    days: [
      {
        id: "mon",
        label: "Monday",
        modules: [
          {
            title: "Explosive Power Circuit",
            focus: "Strength",
            duration: "45 min",
            intent: "Olympic lifts, sled pushes, and plyometrics to prime neuromuscular output.",
          },
          {
            title: "Contrast Recovery",
            focus: "Recovery",
            duration: "20 min",
            intent: "Contrast bathing and diaphragmatic reset before evening check-in.",
          },
        ],
      },
      {
        id: "tue",
        label: "Tuesday",
        modules: [
          {
            title: "Threshold Track Session",
            focus: "Conditioning",
            duration: "50 min",
            intent: "5x1k @ 10k pace · 90s recovery. Close fast on final rep.",
          },
          {
            title: "Mobility & Prehab Flow",
            focus: "Mobility",
            duration: "25 min",
            intent: "Thoracic opener, hip cars, and ankle sequencing post-track.",
          },
        ],
      },
      {
        id: "wed",
        label: "Wednesday",
        modules: [
          {
            title: "Tempo Endurance Ride",
            focus: "Conditioning",
            duration: "60 min",
            intent: "Zone 3 holds with cadence ladders. Keep heart rate capped at 165.",
          },
          {
            title: "Race Visualization",
            focus: "Mindset",
            duration: "15 min",
            intent: "Guided visualization to rehearse positioning on the final lap.",
          },
        ],
      },
      {
        id: "thu",
        label: "Thursday",
        modules: [
          {
            title: "Strength Foundations",
            focus: "Strength",
            duration: "40 min",
            intent: "Tempo squats, pull variations, and single-leg stability primer.",
          },
          {
            title: "Track Strides",
            focus: "Conditioning",
            duration: "20 min",
            intent: "8x120m strides with buildups to stay loose.",
          },
        ],
      },
      {
        id: "fri",
        label: "Friday",
        modules: [
          {
            title: "Mobility & Prehab Flow",
            focus: "Mobility",
            duration: "20 min",
            intent: "Shortened routine focused on calves and ankles.",
          },
          {
            title: "Pre-Meet Shakeout",
            focus: "Conditioning",
            duration: "30 min",
            intent: "Light jog, dynamic drills, and strides. Stop if hamstring tightness returns.",
          },
        ],
      },
      {
        id: "sat",
        label: "Saturday",
        modules: [
          {
            title: "Race Day Warm-up",
            focus: "Conditioning",
            duration: "35 min",
            intent: "Standard race warm-up with fast buildups · coach arrives 60 min prior.",
          },
        ],
      },
      {
        id: "sun",
        label: "Sunday",
        modules: [
          {
            title: "Regeneration Day",
            focus: "Recovery",
            duration: "45 min",
            intent: "Hydrotherapy + walk + journaling. No structured training.",
          },
        ],
      },
    ],
  },
  {
    id: "wk-2",
    label: "Week 34",
    focus: "Return-to-play rebuild",
    days: [
      {
        id: "mon",
        label: "Monday",
        modules: [
          {
            title: "Isometric Strength Primer",
            focus: "Strength",
            duration: "35 min",
            intent: "Isometric mid-thigh pull and split squat holds to re-engage posterior chain.",
          },
          {
            title: "Soft Tissue Flush",
            focus: "Recovery",
            duration: "20 min",
            intent: "Bike flush + foam roll to manage soreness after travel.",
          },
        ],
      },
      {
        id: "tue",
        label: "Tuesday",
        modules: [
          {
            title: "Acceleration Mechanics",
            focus: "Conditioning",
            duration: "30 min",
            intent: "Wall drills and 6x20m accelerations focusing on projection angle.",
          },
          {
            title: "Hip Stability",
            focus: "Mobility",
            duration: "20 min",
            intent: "Band walks, Copenhagen planks, and single-leg balance to prep for return to sprinting.",
          },
        ],
      },
      {
        id: "wed",
        label: "Wednesday",
        modules: [
          {
            title: "Tempo Endurance Run",
            focus: "Conditioning",
            duration: "45 min",
            intent: "Zone 2-3 progression run with stride pickups.",
          },
          {
            title: "Breathwork Reset",
            focus: "Mindset",
            duration: "10 min",
            intent: "Box breathing to downshift after the run.",
          },
        ],
      },
      {
        id: "thu",
        label: "Thursday",
        modules: [
          {
            title: "Eccentric Hamstring",
            focus: "Strength",
            duration: "30 min",
            intent: "Nordics, RDLs, and hamstring sliders to progress tissue tolerance.",
          },
          {
            title: "Mobility Circuit",
            focus: "Mobility",
            duration: "20 min",
            intent: "T-spine openers, 90/90 transitions, and ankle mobility.",
          },
        ],
      },
      {
        id: "fri",
        label: "Friday",
        modules: [
          {
            title: "Acceleration to Flys",
            focus: "Conditioning",
            duration: "30 min",
            intent: "4x30m accelerations into 30m flys, full recovery.",
          },
          {
            title: "Contrast Water",
            focus: "Recovery",
            duration: "20 min",
            intent: "3x3 contrast + parasympathetic breathing to manage stress.",
          },
        ],
      },
      {
        id: "sat",
        label: "Saturday",
        modules: [
          {
            title: "Strength & Power",
            focus: "Strength",
            duration: "45 min",
            intent: "Trap bar deadlift, split squat, and med ball rotational throws.",
          },
        ],
      },
      {
        id: "sun",
        label: "Sunday",
        modules: [
          {
            title: "Regeneration",
            focus: "Recovery",
            duration: "40 min",
            intent: "Long walk, mobility, and journaling on readiness markers.",
          },
        ],
      },
    ],
  },
];
