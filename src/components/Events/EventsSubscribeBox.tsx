import { LuCalendarPlus } from "react-icons/lu";

import CalendarFeeds from "../Common/CalendarFeeds";
import Container from "../Common/Container";

export default function EventsSubscribeBox() {
  return (
    <Container thin>
      <div className="ok-card flex flex-col gap-12 p-12 text-center">
        <h3 className="text-2xl">Don't Miss a Single Event</h3>
        <p className="mx-auto max-w-lg">
          Be the first to know the moment registration opens and guarantee your place at our most
          anticipated upcoming gatherings.
        </p>
        <CalendarFeeds dropdownPosition="top" className="dropdown-end">
          <div className="btn btn-lg btn-neutral gap-4">
            <LuCalendarPlus />
            Subscribe to Events Calendar
          </div>
        </CalendarFeeds>
      </div>
    </Container>
  );
}
