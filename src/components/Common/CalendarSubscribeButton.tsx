import clsx from "clsx";
import { LuCalendarPlus } from "react-icons/lu";

import CalendarSubscribeModal from "@/components/Common/CalendarSubscribeModal";
import type { EventEnriched } from "@/content/events";

interface CalendarSubscribeButtonProps {
  event?: EventEnriched;
  children?: React.ReactNode;
  className?: string;
}

export default function CalendarSubscribeButton({
  event,
  children,
  className,
}: CalendarSubscribeButtonProps) {
  const renderButton = () => {
    if (children) {
      return children;
    }

    return (
      <button className={clsx("btn btn-lg btn-neutral gap-4 whitespace-nowrap", className)}>
        <LuCalendarPlus />
        Subscribe to Calendar
      </button>
    );
  };

  return <CalendarSubscribeModal event={event}>{renderButton()}</CalendarSubscribeModal>;
}
