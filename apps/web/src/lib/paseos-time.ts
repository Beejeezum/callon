export const PASEOS_TIME_ZONE = "America/New_York";

type DateTimeParts = {
  date: string;
  time: string;
};

function numericParts(value: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: PASEOS_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(value);
  return Object.fromEntries(
    parts
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, Number(part.value)]),
  ) as Record<string, number>;
}

export function paseosDateTimeParts(value: string | Date): DateTimeParts {
  const parts = numericParts(
    typeof value === "string" ? new Date(value) : value,
  );
  const pad = (part: number) => `${part}`.padStart(2, "0");
  return {
    date: `${parts.year}-${pad(parts.month)}-${pad(parts.day)}`,
    time: `${pad(parts.hour)}:${pad(parts.minute)}`,
  };
}

export function paseosLocalDateTimeToDate(
  datePart: string,
  timePart: string,
): Date | null {
  const dateMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(datePart);
  const timeMatch = /^(\d{2}):(\d{2})$/.exec(timePart);
  if (!dateMatch || !timeMatch) return null;

  const desired = {
    year: Number(dateMatch[1]),
    month: Number(dateMatch[2]),
    day: Number(dateMatch[3]),
    hour: Number(timeMatch[1]),
    minute: Number(timeMatch[2]),
  };
  if (
    desired.month < 1 ||
    desired.month > 12 ||
    desired.day < 1 ||
    desired.day > 31 ||
    desired.hour > 23 ||
    desired.minute > 59
  ) {
    return null;
  }

  const wallClockUtc = Date.UTC(
    desired.year,
    desired.month - 1,
    desired.day,
    desired.hour,
    desired.minute,
  );

  let candidate = new Date(wallClockUtc);
  for (let pass = 0; pass < 2; pass += 1) {
    const shown = numericParts(candidate);
    const shownAsUtc = Date.UTC(
      shown.year,
      shown.month - 1,
      shown.day,
      shown.hour,
      shown.minute,
      shown.second,
    );
    candidate = new Date(candidate.getTime() + (wallClockUtc - shownAsUtc));
  }

  const roundTrip = numericParts(candidate);
  if (
    roundTrip.year !== desired.year ||
    roundTrip.month !== desired.month ||
    roundTrip.day !== desired.day ||
    roundTrip.hour !== desired.hour ||
    roundTrip.minute !== desired.minute
  ) {
    return null;
  }
  return candidate;
}

export function formatPaseosDateTime(
  value: string | Date,
  options: Intl.DateTimeFormatOptions,
) {
  return new Intl.DateTimeFormat("en-US", {
    ...options,
    timeZone: PASEOS_TIME_ZONE,
  }).format(typeof value === "string" ? new Date(value) : value);
}
