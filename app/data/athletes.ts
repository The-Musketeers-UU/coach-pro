export type AthleteStatus = "Green" | "Yellow" | "Red";

export type Athlete = {
  id: string;
  name: string;
  sport: string;
  program: string;
  readiness: number;
  status: AthleteStatus;
  group: string;
};

export const athleteRoster: Athlete[] = [
  {
    id: "ath-1",
    name: "Jordan Vega",
    sport: "800m",
    program: "Camp Momentum",
    readiness: 94,
    status: "Green",
    group: "Group 1",
  },
  {
    id: "ath-2",
    name: "Mira Hwang",
    sport: "Triathlon",
    program: "Altitude Prep Block",
    readiness: 88,
    status: "Green",
    group: "Group 2",
  },
  {
    id: "ath-3",
    name: "Leo Brennan",
    sport: "400m",
    program: "Camp Momentum",
    readiness: 72,
    status: "Yellow",
    group: "Group 3",
  },
  {
    id: "ath-4",
    name: "Rafa Costa",
    sport: "Soccer",
    program: "Return-to-Play Ramp",
    readiness: 65,
    status: "Yellow",
    group: "Group 1",
  },
  {
    id: "ath-5",
    name: "Ada Lewis",
    sport: "Marathon",
    program: "Altitude Prep Block",
    readiness: 58,
    status: "Red",
    group: "Group 2",
  },
  {
    id: "ath-6",
    name: "Isla Karim",
    sport: "1500m",
    program: "Threshold Builder",
    readiness: 81,
    status: "Green",
    group: "Group 1",
  },
  {
    id: "ath-7",
    name: "Finnley Moore",
    sport: "Cycling",
    program: "Stage Race Prep",
    readiness: 77,
    status: "Green",
    group: "Group 2",
  },
  {
    id: "ath-8",
    name: "Chloe Martins",
    sport: "Swimming",
    program: "Speed & Turns",
    readiness: 69,
    status: "Yellow",
    group: "Group 3",
  },
  {
    id: "ath-9",
    name: "Noah Delgado",
    sport: "CrossFit",
    program: "Strength Base",
    readiness: 74,
    status: "Green",
    group: "Group 3",
  },
];
