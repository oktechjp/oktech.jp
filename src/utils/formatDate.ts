export type DateFormat = "long" | "short" | "short-no-year" | "datetime";

export function formatDate(date: Date | string, format: DateFormat = "short"): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;

  if (format === "long") {
    return dateObj.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "Asia/Tokyo",
    });
  }

  if (format === "short-no-year") {
    return dateObj.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      timeZone: "Asia/Tokyo",
    });
  }

  if (format === "datetime") {
    const year = dateObj.getUTCFullYear();
    const month = String(dateObj.getUTCMonth() + 1).padStart(2, "0");
    const day = String(dateObj.getUTCDate()).padStart(2, "0");
    const hours = String(dateObj.getUTCHours()).padStart(2, "0");
    const minutes = String(dateObj.getUTCMinutes()).padStart(2, "0");
    return `${year}.${month}.${day} ${hours}:${minutes}`;
  }

  // short format
  return dateObj.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "Asia/Tokyo",
  });
}

export function formatTime(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;

  return dateObj.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Asia/Tokyo",
  });
}

export function formatDuration(minutes?: number): string | null {
  if (!minutes) return null;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) {
    return `${mins} ${mins === 1 ? "min" : "mins"}`;
  }
  if (mins === 0) {
    return `${hours} ${hours === 1 ? "hour" : "hours"}`;
  }
  return `${hours} ${hours === 1 ? "hour" : "hours"} ${mins} ${mins === 1 ? "min" : "mins"}`;
}

export function getEndTime(startDate: Date, durationMinutes?: number): Date | null {
  if (!durationMinutes) return null;
  const endDate = new Date(startDate.getTime() + durationMinutes * 60 * 1000);
  return endDate;
}
