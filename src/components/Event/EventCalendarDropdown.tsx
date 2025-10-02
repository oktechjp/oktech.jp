import CalendarSubscribeButton from "@/components/Common/CalendarSubscribeButton";
import type { EventEnriched } from "@/content/events";

interface AddToCalendarDropdownProps {
  event: EventEnriched;
}

export default function AddToCalendarDropdown({ event }: AddToCalendarDropdownProps) {
  return <CalendarSubscribeButton event={event} />;
}
