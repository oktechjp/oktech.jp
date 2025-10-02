import { useRef } from "react";

import { FaGoogle, FaYahoo } from "react-icons/fa6";
import { LuArrowUp, LuCalendar, LuRss, LuX } from "react-icons/lu";

import CopyText from "@/components/Common/CopyText";
import type { EventEnriched } from "@/content/events";
import { urls } from "@/utils/urls";

interface CalendarSubscribeModalProps {
  children: React.ReactNode;
  event?: EventEnriched;
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
    <div className="flex flex-col gap-4">
      <a
        className="flex items-center gap-4 text-lg"
        href={url}
        target="_blank"
        rel="noopener noreferrer"
      >
        <Icon className="h-5 w-5 flex-shrink-0" />
        <span>{label}</span>
      </a>
      <CopyText text={url} />
      {infoText && (
        <div className="flex items-start gap-4 text-sm">
          <LuArrowUp className="mt-1 h-3 w-3 flex-shrink-0" />
          <span>{infoText}</span>
        </div>
      )}
    </div>
  );
}

interface CalendarButtonProps {
  href: string;
  icon: React.ReactNode;
  text: string;
  testId?: string;
}

function CalendarButton({ href, icon, text, testId }: CalendarButtonProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="btn btn-outline btn-lg gap-4"
      data-testid={testId}
    >
      {icon}
      {text}
    </a>
  );
}

export default function CalendarSubscribeModal({ children, event }: CalendarSubscribeModalProps) {
  const modalRef = useRef<HTMLDialogElement>(null);
  const baseUrl = urls.getBaseUrl();
  const icsUrl = `${baseUrl}oktech-events.ics`;
  const rssUrl = `${baseUrl}rss.xml`;

  const openModal = () => {
    modalRef.current?.showModal();
  };

  const closeModal = () => {
    modalRef.current?.close();
  };

  // Generate calendar URLs for single event
  let googleUrl = "";
  let yahooUrl = "";

  if (event) {
    const eventUrl = `${baseUrl}events/${event.id}`;
    const startDate = new Date(event.data.dateTime);
    const endDate = new Date(event.data.dateTime);
    const duration = event.data.duration || 2;
    endDate.setHours(endDate.getHours() + duration);

    const formatDate = (date: Date) => {
      return date
        .toISOString()
        .replace(/[-:]/g, "")
        .replace(/\.\d{3}/, "");
    };

    const formattedStart = formatDate(startDate);
    const formattedEnd = formatDate(endDate);

    const title = encodeURIComponent(event.data.title);
    const details = encodeURIComponent(`${event.data.title} - OK Tech Meetup\n\n${eventUrl}`);
    const location = encodeURIComponent(
      event.venue?.title
        ? `${event.venue.title}${event.venue.address ? `, ${event.venue.address}` : ""}`
        : "TBD",
    );

    googleUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${formattedStart}/${formattedEnd}&details=${details}&location=${location}&sf=true`;
    yahooUrl = `https://calendar.yahoo.com/?v=60&title=${title}&st=${formattedStart}&et=${formattedEnd}&desc=${details}&in_loc=${location}`;
  }

  return (
    <>
      <div
        onClick={openModal}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            openModal();
          }
        }}
        role="button"
        tabIndex={0}
        data-testid="calendar-modal-trigger"
      >
        {children}
      </div>

      <dialog ref={modalRef} className="modal" data-testid="calendar-subscribe-modal">
        <div className="modal-box bg-base-0 text-base-content max-w-lg text-left">
          <button
            onClick={closeModal}
            className="btn btn-circle btn-ghost btn-sm absolute top-4 right-4"
            aria-label="Close"
          >
            <LuX className="h-5 w-5" />
          </button>
          <div className="flex flex-col gap-12">
            {event && (
              <>
                <h3 className="text-xl">Add Event to Calendar</h3>
                <div className="flex flex-col gap-4">
                  <CalendarButton
                    href={`/events/${event.id}.ics`}
                    icon={<LuCalendar className="h-4 w-4" />}
                    text="Outlook / iCal"
                    testId="calendar-ical"
                  />
                  <CalendarButton
                    href={googleUrl}
                    icon={<FaGoogle className="h-4 w-4" />}
                    text="Google Calendar"
                    testId="calendar-google"
                  />
                  <CalendarButton
                    href={yahooUrl}
                    icon={<FaYahoo className="h-4 w-4" />}
                    text="Yahoo Calendar"
                    testId="calendar-yahoo"
                  />
                </div>
              </>
            )}
            <h3 className="text-xl">Subscribe to All OKTech Events</h3>
            <FeedBox
              url={icsUrl}
              Icon={LuCalendar}
              label="Calendar Feed (ICS)"
              infoText="Add this link to Outlook, iCal, Google Calendar, or any calendar app that supports ICS feeds."
            />
            <FeedBox
              url={rssUrl}
              Icon={LuRss}
              label="RSS Feed (XML)"
              infoText="If you remember what RSS is, you know what to do."
            />
          </div>

          <div className="modal-action">
            <button onClick={closeModal} className="btn btn-outline btn-lg">
              Close
            </button>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop" onClick={closeModal}>
          <button type="button" aria-label="Close modal">
            close
          </button>
        </form>
      </dialog>
    </>
  );
}
