export function calendarDayInTimezone(value: Date, timezone: string): Date {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(value);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return new Date(Date.UTC(Number(values.year), Number(values.month) - 1, Number(values.day)));
}

export function isValidTimezone(timezone: string): boolean {
  try {
    Intl.DateTimeFormat("en-US", { timeZone: timezone }).format();
    return true;
  } catch {
    return false;
  }
}
