"use client";

import { useEffect, useState } from "react";

import clsx from "clsx";
import { LuCalendarClock } from "react-icons/lu";

import type { EventEnriched } from "@/content";
import { isEventRecent } from "@/utils/eventFilters";

const DEFAULT_BADGE_CLASS = `badge-warning`;
const LIVE_BADGE_CLASS = `badge-info`;

const MS_PER_SECOND = 1000;
const MS_PER_MINUTE = 60 * MS_PER_SECOND;
const MS_PER_HOUR = 60 * MS_PER_MINUTE;
const HOURS_THRESHOLD = 3;
const TIMEZONE = "Asia/Tokyo";
const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

interface TimeUntilEvent {
  isUpcoming: boolean;
  displayText: string;
  hours: number;
}

function getCalendarDayDiff(now: Date, eventDate: Date): number {
  // Get dates in Tokyo timezone for calendar day comparison
  const nowInTz = new Date(now.toLocaleString("en-US", { timeZone: TIMEZONE }));
  const eventInTz = new Date(eventDate.toLocaleString("en-US", { timeZone: TIMEZONE }));

  // Reset to midnight for calendar day comparison
  const nowMidnight = new Date(nowInTz.getFullYear(), nowInTz.getMonth(), nowInTz.getDate());
  const eventMidnight = new Date(
    eventInTz.getFullYear(),
    eventInTz.getMonth(),
    eventInTz.getDate(),
  );

  const diffMs = eventMidnight.getTime() - nowMidnight.getTime();
  return Math.round(diffMs / (24 * MS_PER_HOUR));
}

function calculateTimeUntilEvent(eventDate: Date): TimeUntilEvent | null {
  const now = new Date();
  const start = eventDate.getTime();
  const isUpcoming = now.getTime() < start;
  const difference = isUpcoming ? start - now.getTime() : now.getTime() - start;

  const hours = Math.floor(difference / MS_PER_HOUR);
  const minutes = Math.floor((difference % MS_PER_HOUR) / MS_PER_MINUTE);
  const seconds = Math.floor((difference % MS_PER_MINUTE) / MS_PER_SECOND);

  if (!isUpcoming) {
    // Event has started - show elapsed time
    if (hours > 0) {
      const plural = hours === 1 ? "" : "s";
      return { isUpcoming: false, displayText: `started ${hours} hour${plural} ago`, hours };
    } else if (minutes > 0) {
      const plural = minutes === 1 ? "" : "s";
      return { isUpcoming: false, displayText: `started ${minutes} minute${plural} ago`, hours: 0 };
    } else if (seconds >= 0) {
      return { isUpcoming: false, displayText: "just started", hours: 0 };
    }
    return null;
  }

  // Event is upcoming - use calendar-based display
  const calendarDays = getCalendarDayDiff(now, eventDate);
  const eventInTz = new Date(eventDate.toLocaleString("en-US", { timeZone: TIMEZONE }));
  const eventDayName = DAY_NAMES[eventInTz.getDay()];

  if (calendarDays === 0) {
    // Same calendar day - show hours/minutes
    if (hours > 0) {
      const plural = hours === 1 ? "" : "s";
      return { isUpcoming: true, displayText: `starts in ${hours} hour${plural}`, hours };
    } else if (minutes > 0) {
      const plural = minutes === 1 ? "" : "s";
      return { isUpcoming: true, displayText: `starts in ${minutes} minute${plural}`, hours: 0 };
    } else {
      return { isUpcoming: true, displayText: "starting now", hours: 0 };
    }
  } else if (calendarDays === 1) {
    return { isUpcoming: true, displayText: "starts tomorrow", hours };
  } else if (calendarDays <= 6) {
    // Within a week - show day name
    return { isUpcoming: true, displayText: `starts ${eventDayName}`, hours };
  } else {
    // More than a week - show calendar days
    return { isUpcoming: true, displayText: `starts in ${calendarDays} days`, hours };
  }
}

interface EventCountdownProps {
  event: EventEnriched;
  className?: string;
  wrapper?: (children: React.ReactNode) => React.ReactNode;
  asString?: boolean;
  capitalize?: boolean;
}

export default function EventCountdown({
  event,
  className,
  wrapper,
  asString = false,
  capitalize = true,
}: EventCountdownProps) {
  // Start with "starts soon" to avoid hydration mismatches
  const [timeString, setTimeString] = useState<string>("starts soon");
  const [badgeClass, setBadgeClass] = useState<string>(DEFAULT_BADGE_CLASS);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
    // Check if event has ended (including buffer)
    if (isEventRecent(event)) {
      setTimeString("");
      return;
    }

    let intervalId: NodeJS.Timeout;

    const updateTime = () => {
      // Re-check if event has ended
      if (isEventRecent(event)) {
        setTimeString("");
        if (intervalId) clearInterval(intervalId);
        return;
      }

      const timeInfo = calculateTimeUntilEvent(new Date(event.data.dateTime));

      if (!timeInfo) {
        setTimeString("");
        return;
      }

      setTimeString(timeInfo.displayText);
      setBadgeClass(timeInfo.isUpcoming ? DEFAULT_BADGE_CLASS : LIVE_BADGE_CLASS);

      // Adjust interval based on time remaining/elapsed
      const newInterval = timeInfo.hours >= HOURS_THRESHOLD ? MS_PER_MINUTE : MS_PER_SECOND;

      // Clear existing interval before creating a new one to prevent memory leaks
      if (intervalId) clearInterval(intervalId);
      intervalId = setInterval(updateTime, newInterval);
    };

    updateTime();

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [event.data.dateTime, event.data.duration]);

  if (!timeString) return null;

  // Apply capitalization once at the end
  const displayText =
    capitalize && timeString
      ? timeString.charAt(0).toUpperCase() + timeString.slice(1)
      : timeString;

  if (asString) {
    return <>{displayText}</>;
  }

  // Show "Starts soon" badge before hydration to avoid layout shift
  const badgeText = !isHydrated ? (capitalize ? "Starts soon" : "starts soon") : displayText;

  const content = (
    <div
      className={clsx(
        badgeClass,
        "badge text-base-800 dark:text-base-100 gap-2 whitespace-nowrap",
        className,
      )}
    >
      <LuCalendarClock />
      {badgeText}
    </div>
  );

  return wrapper ? <>{wrapper(content)}</> : content;
}
