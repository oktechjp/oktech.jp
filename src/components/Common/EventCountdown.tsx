"use client";

import { useEffect, useState } from "react";

import clsx from "clsx";
import { LuCalendarClock } from "react-icons/lu";

import type { EventEnriched } from "@/content";
import { isEventRecent } from "@/utils/eventFilters";

const DEFAULT_BADGE_CLASS = `badge badge-warning`;
const LIVE_BADGE_CLASS = `badge badge-info`;

const MS_PER_SECOND = 1000;
const MS_PER_MINUTE = 60 * MS_PER_SECOND;
const MS_PER_HOUR = 60 * MS_PER_MINUTE;
const MS_PER_DAY = 24 * MS_PER_HOUR;
const HOURS_THRESHOLD = 3;

interface TimeUntilEvent {
  value: number;
  unit: "day" | "hour" | "minute" | "second";
  isUpcoming: boolean;
}

function calculateTimeUntilEvent(eventDate: Date): TimeUntilEvent | null {
  const now = new Date().getTime();
  const start = eventDate.getTime();

  const isUpcoming = now < start;
  const difference = isUpcoming ? start - now : now - start;

  const days = Math.floor(difference / MS_PER_DAY);
  const hours = Math.floor((difference % MS_PER_DAY) / MS_PER_HOUR);
  const minutes = Math.floor((difference % MS_PER_HOUR) / MS_PER_MINUTE);
  const seconds = Math.floor((difference % MS_PER_MINUTE) / MS_PER_SECOND);

  if (days > 0) {
    return { value: days, unit: "day", isUpcoming };
  } else if (hours > 0) {
    return { value: hours, unit: "hour", isUpcoming };
  } else if (minutes > 0) {
    return { value: minutes, unit: "minute", isUpcoming };
  } else if (seconds >= 0) {
    return { value: seconds, unit: "second", isUpcoming };
  }

  return null;
}

function formatTimeString(time: TimeUntilEvent): string {
  const plural = time.value === 1 ? "" : "s";
  const timePhrase = `${time.value} ${time.unit}${plural}`;

  if (time.isUpcoming) {
    return `starts in ${timePhrase}`;
  } else {
    return `started ${timePhrase} ago`;
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
  className = "badge-lg",
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

      const timeStr = formatTimeString(timeInfo);
      setTimeString(timeStr);
      setBadgeClass(timeInfo.isUpcoming ? DEFAULT_BADGE_CLASS : LIVE_BADGE_CLASS);

      // Adjust interval based on time remaining/elapsed
      const totalHours =
        timeInfo.unit === "day"
          ? timeInfo.value * 24
          : timeInfo.unit === "hour"
            ? timeInfo.value
            : 0;
      const newInterval = totalHours >= HOURS_THRESHOLD ? MS_PER_MINUTE : MS_PER_SECOND;

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
    <div className={clsx(badgeClass, "flex items-center gap-2", className)}>
      <LuCalendarClock />
      {badgeText}
    </div>
  );

  return wrapper ? <>{wrapper(content)}</> : content;
}
