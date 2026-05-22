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
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function extractTimeOfDay(dateTime: string, filePath: string): string {
  const match = /^\d{4}-\d{2}-\d{2} (\d{2}:\d{2})$/.exec(dateTime);
  if (!match) throw new Error(`Cannot extract time from dateTime in ${filePath}: ${dateTime}`);
  return match[1];
}

export function parseRepeatKey(
  rawKey: unknown,
  time: string,
  filePath: string,
): { date: Date; slugPrefix: string } {
  const key = String(rawKey);
  if (!/^\d{6}$/.test(key)) {
    throw new Error(`Invalid repeat key in ${filePath}: ${key} (expected YYMMDD, e.g. 260530)`);
  }
  if (!/^\d{2}:\d{2}$/.test(time)) {
    throw new Error(`Invalid time for repeat ${key} in ${filePath}: ${time}`);
  }
  const isoDate = `20${key.slice(0, 2)}-${key.slice(2, 4)}-${key.slice(4, 6)}`;
  const date = new Date(`${isoDate}T${time}:00+09:00`);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid repeat date in ${filePath}: ${key} ${time}`);
  }
  return { date, slugPrefix: key };
}

export function mergeLinks(
  parent: Record<string, string> | undefined,
  override: Record<string, string> | undefined,
): Record<string, string> | undefined {
  if (!parent && !override) return undefined;
  return { ...parent, ...override };
}

export type RepeatOverride = Record<string, unknown> & {
  time?: string;
  links?: Record<string, string>;
};

export function mergeRepeatOverride<T extends { links?: Record<string, string> }>(
  parent: T,
  raw: RepeatOverride,
): T {
  const { time: _time, links: overrideLinks, ...rest } = raw;
  return {
    ...parent,
    ...(rest as Partial<T>),
    links: mergeLinks(parent.links, overrideLinks),
  };
}
