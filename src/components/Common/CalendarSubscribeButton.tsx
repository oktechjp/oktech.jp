import clsx from "clsx";
import { LuCalendarPlus } from "react-icons/lu";

import CalendarSubscribeModal from "@/components/Common/CalendarSubscribeModal";
import type { EventEnriched } from "@/content/events";

interface CalendarSubscribeButtonProps {
  event?: EventEnriched;
  children?: React.ReactNode;
  buttonClass?: string;
}

export default function CalendarSubscribeButton({
  event,
  children,
  buttonClass = "btn-neutral",
}: CalendarSubscribeButtonProps) {
  const renderButton = () => {
    if (children) {
      return children;
    }

    return (
      <button className={clsx("btn btn-lg gap-4", buttonClass)}>
        <LuCalendarPlus />
        Subscribe to Calendar
      </button>
    );
  };

  return <CalendarSubscribeModal event={event}>{renderButton()}</CalendarSubscribeModal>;
}
