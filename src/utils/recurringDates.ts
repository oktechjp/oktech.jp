export type RecurringConfig = {
  frequency: "weekly";
  endDate?: Date;
  skipDates?: string[];
  onlyDates?: string[];
  cancelled?: string[];
};

export type RecurringFrontmatter = {
  frequency: "weekly";
  endDate?: string | Date;
  skipDates?: (string | Date)[];
  onlyDates?: (string | Date)[];
  cancelled?: (string | Date)[];
};

function coerceYMD(value: string | Date, filePath: string, field: string): string {
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const asDate = value instanceof Date ? value : new Date(String(value));
  if (Number.isNaN(asDate.getTime())) {
    throw new Error(`Invalid ${field} for ${filePath}: ${String(value)}`);
  }
  return toYMD(asDate);
}

function coerceYMDArray(
  values: (string | Date)[] | undefined,
  filePath: string,
  field: string,
): string[] | undefined {
  return values?.map((d) => coerceYMD(d, filePath, field));
}

export function parseRecurringConfig(
  recurring: RecurringFrontmatter,
  filePath: string,
): RecurringConfig {
  const config: RecurringConfig = { frequency: recurring.frequency };
  if (recurring.endDate !== undefined) {
    const ymd = coerceYMD(recurring.endDate, filePath, "recurring.endDate");
    config.endDate = new Date(`${ymd}T23:59:59+09:00`);
  }
  config.skipDates = coerceYMDArray(recurring.skipDates, filePath, "recurring.skipDates");
  config.onlyDates = coerceYMDArray(recurring.onlyDates, filePath, "recurring.onlyDates");
  config.cancelled = coerceYMDArray(recurring.cancelled, filePath, "recurring.cancelled");
  return config;
}

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

function advance(cursor: Date, frequency: RecurringConfig["frequency"]): void {
  if (frequency === "weekly") {
    cursor.setUTCDate(cursor.getUTCDate() + 7);
    return;
  }
  throw new Error(`Unsupported recurring frequency: ${frequency}`);
}

function parseYMDAtTime(ymd: string, template: Date): Date {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(ymd)) {
    throw new Error(`Invalid YMD date in recurring config: ${ymd}`);
  }
  const time = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Tokyo",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(template);
  return new Date(`${ymd}T${time}:00+09:00`);
}

export function getRecurringInstanceDates(
  config: RecurringConfig,
  startDateTime: Date,
  now: Date = new Date(),
  futureCount: number = 4,
): { past: Date[]; future: Date[] } {
  const skipSet = new Set(config.skipDates ?? []);

  let past: Date[];
  if (config.onlyDates && config.onlyDates.length > 0) {
    past = config.onlyDates
      .map((s) => parseYMDAtTime(s, startDateTime))
      .filter((d) => d <= now)
      .filter((d) => !skipSet.has(toYMD(d)))
      .sort((a, b) => a.getTime() - b.getTime());
  } else {
    past = [];
    const cursor = new Date(startDateTime);
    const cutoff = config.endDate
      ? new Date(Math.min(config.endDate.getTime(), now.getTime()))
      : now;
    while (cursor.getTime() <= cutoff.getTime()) {
      if (!skipSet.has(toYMD(cursor))) past.push(new Date(cursor));
      advance(cursor, config.frequency);
    }
  }

  const future: Date[] = [];
  const cursor = new Date(startDateTime);
  while (cursor.getTime() <= now.getTime()) advance(cursor, config.frequency);
  while (
    future.length < futureCount &&
    (!config.endDate || cursor.getTime() <= config.endDate.getTime())
  ) {
    if (!skipSet.has(toYMD(cursor))) future.push(new Date(cursor));
    advance(cursor, config.frequency);
  }

  return { past, future };
}
