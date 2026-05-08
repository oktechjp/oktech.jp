export type RecurringConfig = {
  frequency: "weekly";
  endDate?: Date;
  skipDates?: string[];
  onlyDates?: string[];
  cancelled?: string[];
};

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
