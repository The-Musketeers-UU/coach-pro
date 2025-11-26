export type ProgramModule = {
  title: string;
  description: string;
  category: string;
  subcategory?: string;
  distanceMeters?: number;
  weightKg?: number;
  durationMinutes?: number;
  durationSeconds?: number;
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
    label: "Camp Momentum",
    focus: "Tävlingsvecka – finlir",
    days: [
      {
        id: "mon",
        label: "Måndag",
        modules: [
          {
            title: "Explosivt styrkepass",
            description:
              "Olympiska lyft, släddrag och hopp för att väcka nervsystemet innan race.",
            category: "styrka",
            subcategory: "Explosivitet",
            weightKg: 60,
            durationMinutes: 45,
          },
          {
            title: "Kontraståterhämtning",
            description: "Varm/kall-växling och andningsfokus för att sänka stressnivåer.",
            category: "återhämtning",
            subcategory: "Väderbad",
            durationMinutes: 20,
          },
        ],
      },
      {
        id: "tue",
        label: "Tisdag",
        modules: [
          {
            title: "Tröskelpass på bana",
            description: "5×1 km på jämn fart med 90 sekunder joggvila, sista repetitionen snabbare.",
            category: "kondition",
            subcategory: "Intervaller",
            distanceMeters: 5000,
            durationMinutes: 50,
          },
          {
            title: "Rörlighet & prehab",
            description: "Öppna bröstkorg och höfter, avsluta med fotledssekvenser efter banpasset.",
            category: "rörlighet",
            subcategory: "Prehab",
            durationMinutes: 25,
          },
        ],
      },
      {
        id: "wed",
        label: "Onsdag",
        modules: [
          {
            title: "Tempo cykling",
            description: "Zon 3-block med kadensstegar, håll puls under 165 bpm.",
            category: "kondition",
            subcategory: "Tempo",
            durationMinutes: 60,
          },
          {
            title: "Tävlingsvisualisering",
            description: "Guidad visualisering av positionsbyten under sista varvet.",
            category: "mindset",
            subcategory: "Mental förberedelse",
            durationMinutes: 15,
          },
        ],
      },
      {
        id: "thu",
        label: "Torsdag",
        modules: [
          {
            title: "Grundstyrka",
            description: "Tempo-böj, drag och enbensstabilitet som sista styrkepolering.",
            category: "styrka",
            subcategory: "Baslyft",
            weightKg: 50,
            durationMinutes: 40,
          },
          {
            title: "Bana – stegringslopp",
            description: "8×120 m stegringar för att hålla löpsteget lätt.",
            category: "kondition",
            subcategory: "Strides",
            distanceMeters: 960,
            durationMinutes: 20,
          },
        ],
      },
      {
        id: "fri",
        label: "Fredag",
        modules: [
          {
            title: "Kort rörlighet",
            description: "Förenklad sekvens med fokus på vader och fotleder.",
            category: "rörlighet",
            durationMinutes: 20,
          },
          {
            title: "Pre-meet shakeout",
            description: "Lätt jogg, dynamiska drillar och strides. Avbryt vid stel hamstring.",
            category: "kondition",
            subcategory: "Distans",
            distanceMeters: 4000,
            durationMinutes: 30,
          },
        ],
      },
      {
        id: "sat",
        label: "Lördag",
        modules: [
          {
            title: "Tävlingsuppvärmning",
            description: "Standardrace med uppvärmning och avslutande stegringar.",
            category: "kondition",
            subcategory: "Race prep",
            distanceMeters: 1500,
            durationMinutes: 35,
          },
        ],
      },
      {
        id: "sun",
        label: "Söndag",
        modules: [
          {
            title: "Regenerationsdag",
            description: "Lågintensiv återhämtning med vatten, promenad och journalföring.",
            category: "återhämtning",
            subcategory: "Lågintensiv",
            durationMinutes: 45,
          },
        ],
      },
    ],
  },
  {
    id: "wk-2",
    label: "Vecka 34",
    focus: "Återgång – bygga tålighet",
    days: [
      {
        id: "mon",
        label: "Måndag",
        modules: [
          {
            title: "Isometrisk styrka",
            description: "Mid-thigh pull och split squat-håll för att väcka baksidan.",
            category: "styrka",
            subcategory: "Isometrisk",
            weightKg: 40,
            durationMinutes: 35,
          },
          {
            title: "Mjukdelsflush",
            description: "Cykel + foam roll för att hantera stelhet efter resa.",
            category: "återhämtning",
            durationMinutes: 20,
          },
        ],
      },
      {
        id: "tue",
        label: "Tisdag",
        modules: [
          {
            title: "Accelerationsteknik",
            description: "Väggdrillar och 6×20 m starter med fokus på lutning.",
            category: "kondition",
            subcategory: "Acceleration",
            distanceMeters: 120,
            durationMinutes: 30,
          },
          {
            title: "Höftstabilitet",
            description: "Band walks, Copenhagen plank och enbensbalans för sprintförberedelse.",
            category: "rörlighet",
            subcategory: "Stabilitet",
            durationMinutes: 20,
          },
        ],
      },
      {
        id: "wed",
        label: "Onsdag",
        modules: [
          {
            title: "Tempo distanslöpning",
            description: "Zon 2–3 progression med strides i slutet.",
            category: "kondition",
            subcategory: "Tempo",
            distanceMeters: 8000,
            durationMinutes: 45,
          },
          {
            title: "Andningsreset",
            description: "Box-breathing och nedvarvning efter löpningen.",
            category: "mindset",
            subcategory: "Återställning",
            durationMinutes: 10,
          },
        ],
      },
      {
        id: "thu",
        label: "Torsdag",
        modules: [
          {
            title: "Styrka i maskin",
            description: "Maskinbaserat helkroppspass för att minska impact.",
            category: "styrka",
            subcategory: "Maskin",
            weightKg: 45,
            durationMinutes: 40,
          },
          {
            title: "Rörlighet underkropp",
            description: "Fokus på höft, knä och fotled – kontrollerade CARs.",
            category: "rörlighet",
            subcategory: "CARs",
            durationMinutes: 20,
          },
        ],
      },
      {
        id: "fri",
        label: "Fredag",
        modules: [
          {
            title: "Kort bana",
            description: "4×200 m kontrollerade reps, lång vila.",
            category: "kondition",
            subcategory: "Bana",
            distanceMeters: 800,
            durationMinutes: 25,
          },
          {
            title: "Rörlig andning",
            description: "Lätt mobilitet och diafragmafokus för återhämtning.",
            category: "mindset",
            subcategory: "Andning",
            durationMinutes: 15,
          },
        ],
      },
      {
        id: "sat",
        label: "Lördag",
        modules: [
          {
            title: "Styrkebalans",
            description: "Enbenspress, drag och bålrotationer för symmetri.",
            category: "styrka",
            subcategory: "Balans",
            weightKg: 35,
            durationMinutes: 35,
          },
          {
            title: "Rörlighetsreset",
            description: "Kort helkroppsreset för att minska stelhet.",
            category: "rörlighet",
            durationMinutes: 15,
          },
        ],
      },
      {
        id: "sun",
        label: "Söndag",
        modules: [
          {
            title: "Regenererande promenad",
            description: "Lätt promenad med dagbok och fokus på sömn inför nästa block.",
            category: "återhämtning",
            subcategory: "Lågintensiv",
            distanceMeters: 3000,
            durationMinutes: 40,
          },
        ],
      },
    ],
  },
];
