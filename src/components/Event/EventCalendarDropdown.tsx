import { LuCalendarPlus } from "react-icons/lu";

import CalendarSubscribeModal from "@/components/Common/CalendarSubscribeModal";
import type { EventEnriched } from "@/content/events";

interface AddToCalendarDropdownProps {
  event: EventEnriched;
}

export default function AddToCalendarDropdown({ event }: AddToCalendarDropdownProps) {
  return (
    <CalendarSubscribeModal event={event}>
      <button className="btn btn-lg w-full gap-4" data-testid="add-to-calendar-dropdown">
        Add to Calendar
        <LuCalendarPlus />
      </button>
    </CalendarSubscribeModal>
  );
}
