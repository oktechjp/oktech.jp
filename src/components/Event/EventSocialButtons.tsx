import clsx from "clsx";
import { FaLinkedin, FaMeetup } from "react-icons/fa6";
import { LuTicket } from "react-icons/lu";

import { MEETUP_EVENT_URL } from "@/constants";
import type { EventEnriched } from "@/content/events";

interface EventSocialButtonsProps {
  event: EventEnriched;
}

interface ButtonConfig {
  href: string;
  text: string;
  icon: typeof LuTicket | typeof FaLinkedin;
}

export default function EventSocialButtons({ event }: EventSocialButtonsProps) {
  const buttons: ButtonConfig[] = [];

  // Meetup button - always show if we have a meetupId
  const meetupId = event.data.meetupId;
  if (meetupId) {
    buttons.push({
      href: `${MEETUP_EVENT_URL}/${meetupId}`,
      text: "Meetup",
      icon: FaMeetup,
    });
  }

  // LinkedIn button - show if we have a LinkedIn URL
  const linkedInUrl = event.data.linkedIn;
  if (linkedInUrl) {
    buttons.push({
      href: linkedInUrl,
      text: "LinkedIn",
      icon: FaLinkedin,
    });
  }

  // Future buttons can be added here in the same pattern
  // For example:
  // if (event.data.discord) {
  //   buttons.push({
  //     href: event.data.discord,
  //     text: "Join Discord",
  //     icon: FaDiscord,
  //   });
  // }

  return (
    <>
      {buttons.map((button, index) => (
        <div key={index} className="w-full">
          <a
            href={button.href}
            target="_blank"
            rel="noopener noreferrer"
            className={clsx("btn btn-lg w-full gap-4")}
          >
            {button.text}
            <button.icon />
          </a>
        </div>
      ))}
    </>
  );
}
