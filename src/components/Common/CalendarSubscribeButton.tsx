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
  buttonClass,
}: CalendarSubscribeButtonProps) {
  const renderButton = () => {
    if (children) {
      return children;
    }

    if (event) {
      return (
        <button
          className={clsx("btn btn-lg w-full gap-4", buttonClass)}
          data-testid="add-to-calendar-dropdown"
        >
          Add to Calendar
          <LuCalendarPlus />
        </button>
      );
    }

    return (
      <button className={clsx("btn btn-lg btn-neutral gap-4", buttonClass)}>
        <LuCalendarPlus />
        Subscribe to Calendar
      </button>
    );
  };

  return <CalendarSubscribeModal event={event}>{renderButton()}</CalendarSubscribeModal>;
}
