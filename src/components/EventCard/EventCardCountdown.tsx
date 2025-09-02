"use client";

import { useEffect, useState } from "react";

import clsx from "clsx";
import { LuCalendarClock } from "react-icons/lu";

import type { EventEnriched } from "@/content";
import { isEventRecent } from "@/utils/eventFilters";

const BADGE_BASE = "badge";
const DEFAULT_BADGE_CLASS = `${BADGE_BASE} badge-accent`;
const LIVE_BADGE_CLASS = `${BADGE_BASE} badge-info`;

const MS_PER_SECOND = 1000;
const MS_PER_MINUTE = 60 * MS_PER_SECOND;
const MS_PER_HOUR = 60 * MS_PER_MINUTE;
const MS_PER_DAY = 24 * MS_PER_HOUR;
const HOURS_THRESHOLD = 3;

interface EventCardCountdownProps {
  event: EventEnriched;
  className?: string;
  wrapper?: (children: React.ReactNode) => React.ReactNode;
}

export default function EventCardCountdown({
  event,
  className = "badge-lg",
  wrapper,
}: EventCardCountdownProps) {
  const [timeString, setTimeString] = useState<string>("");
  const [badgeClass, setBadgeClass] = useState<string>(DEFAULT_BADGE_CLASS);

  useEffect(() => {
    // Check if event has ended (including buffer)
    if (isEventRecent(event)) {
      setTimeString("");
      return;
    }

    let intervalId: NodeJS.Timeout;

    const calculateTime = () => {
      // Re-check if event has ended
      if (isEventRecent(event)) {
        setTimeString("");
        if (intervalId) clearInterval(intervalId);
        return;
      }

      const now = new Date().getTime();
      const start = new Date(event.data.dateTime).getTime();

      const isUpcoming = now < start;
      const difference = isUpcoming ? start - now : now - start;

      const days = Math.floor(difference / MS_PER_DAY);
      const hours = Math.floor((difference % MS_PER_DAY) / MS_PER_HOUR);
      const minutes = Math.floor((difference % MS_PER_HOUR) / MS_PER_MINUTE);
      const seconds = Math.floor((difference % MS_PER_MINUTE) / MS_PER_SECOND);

      let timeStr = "";
      if (days > 0) {
        timeStr = isUpcoming
          ? `Starts in ${days} ${days === 1 ? "day" : "days"}`
          : `Started ${days} ${days === 1 ? "day" : "days"} ago`;
      } else if (hours > 0) {
        timeStr = isUpcoming
          ? `Starts in ${hours} ${hours === 1 ? "hour" : "hours"}`
          : `Started ${hours} ${hours === 1 ? "hour" : "hours"} ago`;
      } else if (minutes > 0) {
        timeStr = isUpcoming
          ? `Starts in ${minutes} ${minutes === 1 ? "minute" : "minutes"}`
          : `Started ${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`;
      } else {
        timeStr = isUpcoming
          ? `Starts in ${seconds} ${seconds === 1 ? "second" : "seconds"}`
          : `Started ${seconds} ${seconds === 1 ? "second" : "seconds"} ago`;
      }

      setTimeString(timeStr);
      setBadgeClass(isUpcoming ? DEFAULT_BADGE_CLASS : LIVE_BADGE_CLASS);

      // Adjust interval based on time remaining/elapsed
      const totalHours = days * 24 + hours;
      const newInterval = totalHours >= HOURS_THRESHOLD ? MS_PER_MINUTE : MS_PER_SECOND;

      // Clear existing interval before creating a new one to prevent memory leaks
      if (intervalId) clearInterval(intervalId);
      intervalId = setInterval(calculateTime, newInterval);
    };

    calculateTime();

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [event.data.dateTime, event.data.duration]);

  if (!timeString) return null;

  const content = (
    <div className={clsx(badgeClass, "flex items-center gap-2", className)}>
      <LuCalendarClock />
      {timeString}
    </div>
  );

  return wrapper ? <>{wrapper(content)}</> : content;
}
