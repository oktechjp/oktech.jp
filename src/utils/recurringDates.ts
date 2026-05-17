export function parseEventDateTime(value: string, filePath: string): Date {
  if (!/^(\d{4}-\d{2}-\d{2}) (\d{2}:\d{2})$/.test(value)) {
    throw new Error(`Invalid date/time format for ${filePath}: ${value}`);
  }
  const [date, time] = value.split(" ");
  const dateTime = new Date(`${date}T${time}:00+09:00`);
  if (Number.isNaN(dateTime.getTime())) {
    throw new Error(`Invalid date/time for ${filePath}: ${value}`);
  }
  return dateTime;
}

export function toYMD(date: Date): string {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return formatter.format(date);
}

export function toSlugDate(date: Date): string {
  return toYMD(date).slice(2).replace(/-/g, "");
}

function extractTimeOfDay(dateTime: string): string {
  const match = /^\d{4}-\d{2}-\d{2} (\d{2}:\d{2})$/.exec(dateTime);
  if (!match) throw new Error(`Cannot extract time from dateTime: ${dateTime}`);
  return match[1];
}

export function parseRepeatKey(
  rawKey: unknown,
  parentDateTime: string,
  overrideTime: string | undefined,
  filePath: string,
): { date: Date; slugPrefix: string } {
  const key = String(rawKey);
  if (!/^\d{6}$/.test(key)) {
    throw new Error(`Invalid repeat key in ${filePath}: ${key} (expected YYMMDD, e.g. 260530)`);
  }
  const time = overrideTime ?? extractTimeOfDay(parentDateTime);
  if (!/^\d{2}:\d{2}$/.test(time)) {
    throw new Error(`Invalid time for repeat ${key} in ${filePath}: ${time}`);
  }
  const yy = key.slice(0, 2);
  const mm = key.slice(2, 4);
  const dd = key.slice(4, 6);
  const isoDate = `20${yy}-${mm}-${dd}`;
  const date = new Date(`${isoDate}T${time}:00+09:00`);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid repeat date in ${filePath}: ${key} ${time}`);
  }
  return { date, slugPrefix: key };
}
