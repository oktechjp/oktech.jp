import { useRef } from "react";

import { LuArrowUp, LuCalendar, LuRss, LuX } from "react-icons/lu";

import CalendarAddEventLinks from "@/components/Common/CalendarAddEventLinks";
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

  return (
    <>
      <div onClick={openModal} role="button" tabIndex={0} data-testid="calendar-modal-trigger">
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
            {event && <CalendarAddEventLinks event={event} />}
            <h3 className="text-xl">Subscribe to OKTech Events</h3>
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
