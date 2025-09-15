import { useRef } from "react";

import clsx from "clsx";
import { LuArrowUp, LuCalendar, LuRss } from "react-icons/lu";

import CopyText from "@/components/Common/CopyText";
import { useClickOutside } from "@/hooks/useClickOutside";
import { urls } from "@/utils/urls";

interface CalendarFeedsProps {
  children?: React.ReactNode;
  className?: string;
  dropdownPosition?: "top" | "bottom";
  inline?: boolean;
}

function FeedBox({
  url,
  Icon,
  label,
  infoText,
}: {
  url: string;
  Icon: React.ElementType;
  label: string;
  infoText?: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <a
        className="text-link flex items-center gap-2 px-2 text-sm"
        href={url}
        target="_blank"
        rel="noopener noreferrer"
      >
        <Icon className="h-4 w-4 flex-shrink-0" />
        <span>{label}</span>
      </a>
      <CopyText text={url} className="w-full" />
      {infoText && (
        <div className="text-base-content/70 flex w-56 items-start gap-3 px-2 text-xs">
          <LuArrowUp className="mt-1 h-3 w-3 flex-shrink-0" />
          <span>{infoText}</span>
        </div>
      )}
    </div>
  );
}

export default function CalendarFeeds({
  children,
  className = "",
  dropdownPosition = "bottom",
  inline = false,
}: CalendarFeedsProps) {
  const dropdownRef = useRef<HTMLDetailsElement>(null);
  const baseUrl = urls.getBaseUrl();
  const icsUrl = `${baseUrl}/oktech-events.ics`;
  const rssUrl = `${baseUrl}/rss.xml`;

  if (!inline) {
    useClickOutside(dropdownRef, () => {
      if (dropdownRef.current?.open) {
        dropdownRef.current.open = false;
      }
    });
  }

  const feedsContent = (
    <div className={clsx((inline && className) || "flex flex-col gap-6")}>
      <FeedBox
        url={icsUrl}
        Icon={LuCalendar}
        label="Calendar Feed (ICS)"
        infoText="You can add this link to Outlook, iCal, Google Calendar, etc."
      />
      <FeedBox
        url={rssUrl}
        Icon={LuRss}
        label="RSS Feed (XML)"
        infoText="If you remember what RSS is, you know what to do."
      />
    </div>
  );

  // If inline mode, just render the content without dropdown
  if (inline) {
    return feedsContent;
  }

  const dropdownClass = dropdownPosition === "top" ? "dropdown-top" : "dropdown-bottom";
  const marginClass = dropdownPosition === "top" ? "mb-2" : "mt-2";

  return (
    <details className={`dropdown ${dropdownClass} ${className}`} ref={dropdownRef}>
      <summary className="cursor-pointer list-none" data-testid="calendar-feeds-trigger">
        {children}
      </summary>
      <div
        className={`dropdown-content bg-base-100 text-base-content rounded-box z-50 ${marginClass} flex min-w-max flex-col gap-6 p-6 shadow`}
      >
        {feedsContent}
      </div>
    </details>
  );
}
