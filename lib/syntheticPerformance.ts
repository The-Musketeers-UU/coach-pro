export type PerformanceEntry = {
  id: string;
  time: string;
  performance: string;
  recordedAt: string;
};

export type AthletePerformanceSeries = {
  athleteId: string;
  athleteName: string;
  moduleSlug: string;
  moduleTitle: string;
  entries: PerformanceEntry[];
};

const athletePool: AthletePerformanceSeries["athleteId"][] = [
  "athlete-alex",
  "athlete-billie",
  "athlete-chen",
  "athlete-dani",
  "athlete-eli",
  "athlete-frankie",
];

const athleteNames: Record<string, string> = {
  "athlete-alex": "Alex Kim",
  "athlete-billie": "Billie Tran",
  "athlete-chen": "Chen Larsson",
  "athlete-dani": "Dani Perez",
  "athlete-eli": "Eli Nordin",
  "athlete-frankie": "Frankie Berg",
};

const hashString = (value: string) => {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }
  return Math.abs(hash);
};

const seededRandom = (seed: number) => {
  let current = seed;
  return () => {
    current += 1;
    const x = Math.sin(current) * 10000;
    return x - Math.floor(x);
  };
};

const toTimeString = (minutesValue: number) => {
  const totalSeconds = Math.max(30, Math.round(minutesValue * 60));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
};

const buildEntriesForAthlete = (
  moduleSlug: string,
  moduleTitle: string,
  athleteId: string,
  athleteName: string,
  seed: number,
): PerformanceEntry[] => {
  const rand = seededRandom(seed);
  const entryCount = 5;
  const basePerformance = 55 + rand() * 20;
  const entries: PerformanceEntry[] = [];

  for (let index = 0; index < entryCount; index += 1) {
    const improvement = index * (2 + rand() * 1.5);
    const score = Math.round(basePerformance + improvement + rand() * 4);
    const minutes = Math.max(8, 52 - improvement + rand() * 3);
    const recordedAt = new Date(
      Date.now() - (entryCount - index) * 36 * 60 * 60 * 1000,
    ).toISOString();

    entries.push({
      id: `${moduleSlug}-${athleteId}-${index}`,
      time: toTimeString(minutes),
      performance: score.toString(),
      recordedAt,
    });
  }

  return entries;
};

export const buildModuleSlug = (
  module: { title?: string; id?: string },
  fallbackKey?: string,
) => {
  const rawBase = module.id ?? module.title ?? fallbackKey ?? "module";
  const base = typeof rawBase === "string" ? rawBase : String(rawBase ?? "module");
  return (
    base
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "module"
  );
};

export const getSyntheticModuleSeries = (
  moduleSlug: string,
  moduleTitle?: string,
): AthletePerformanceSeries[] => {
  const baseTitle = moduleTitle?.trim() || moduleSlug;
  const seed = hashString(`${moduleSlug}-${baseTitle}`);
  return athletePool.map((athleteId, index) => {
    const athleteName = athleteNames[athleteId] ?? `Atlet ${index + 1}`;
    const entries = buildEntriesForAthlete(
      moduleSlug,
      baseTitle,
      athleteId,
      athleteName,
      seed + index * 17,
    );

    return {
      athleteId,
      athleteName,
      moduleSlug,
      moduleTitle: baseTitle,
      entries,
    };
  });
};

export const getSyntheticEntriesForModule = (
  moduleSlug: string,
  moduleTitle?: string,
  options?: { athleteName?: string },
): PerformanceEntry[] => {
  const [firstSeries] = getSyntheticModuleSeries(moduleSlug, moduleTitle);
  if (!firstSeries) return [];

  if (options?.athleteName) {
    const normalizedName = options.athleteName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");
    return firstSeries.entries.map((entry) => ({
      ...entry,
      id: `${entry.id}-${normalizedName}`,
    }));
  }

  return firstSeries.entries;
};
