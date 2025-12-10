const pad = (value: number, length = 2) => String(value).padStart(length, "0");

/**
 * Parse a human-friendly duration string ("MM:SS", "SS.s", "M:SS.hh") into
 * centiseconds so we can store hundredth-of-a-second precision in integer
 * columns.
 *
 * Returns:
 * - `null` when the input is empty
 * - a number representing centiseconds when valid
 * - `undefined` when the input cannot be parsed
 */
export const parseDurationToCentiseconds = (
  rawValue: string,
): number | null | undefined => {
  const value = rawValue.trim();
  if (!value) return null;

  // Support comma as decimal separator
  const normalized = value.replace(",", ".");
  const [minutePart, secondPart] = normalized.includes(":")
    ? normalized.split(":", 2)
    : ["0", normalized];

  const minutes = Number.parseInt(minutePart, 10);
  const seconds = Number.parseFloat(secondPart);

  if (!Number.isFinite(minutes) || minutes < 0) return undefined;
  if (!Number.isFinite(seconds) || seconds < 0) return undefined;

  const totalSeconds = minutes * 60 + seconds;
  return Math.round(totalSeconds * 100);
};

/**
 * Format a centisecond duration as mm:ss or mm:ss.hh when hundredths exist.
 */
export const formatCentiseconds = (value?: number | null): string => {
  if (value === null || value === undefined) return "";

  const centiseconds = Math.max(0, Math.round(value));
  const totalSeconds = Math.floor(centiseconds / 100);
  const hundredths = centiseconds % 100;

  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  const base = `${minutes}:${pad(seconds)}`;
  if (hundredths === 0) return base;

  return `${base}.${pad(hundredths)}`;
};
