import clsx from "clsx";
import { type IconType } from "react-icons";
import { FaDiscord, FaLinkedin, FaMeetup } from "react-icons/fa6";
import { LuExternalLink, LuSparkles } from "react-icons/lu";

import { MEETUP_EVENT_URL } from "@/constants";
import type { EventEnriched } from "@/content/events";

interface EventSocialButtonsProps {
  event: EventEnriched;
}

interface ButtonConfig {
  href: string;
  text: string;
  icon: IconType;
}

interface LinkPreset {
  text: string;
  icon: IconType;
  getUrl?: (value: string) => string;
}

const LINK_PRESETS: Record<string, LinkPreset> = {
  meetup: {
    text: "Meetup.com",
    icon: FaMeetup,
  },
  linkedIn: {
    text: "LinkedIn",
    icon: FaLinkedin,
  },
  luma: {
    text: "Luma",
    icon: LuSparkles,
  },
  discord: {
    text: "Discord",
    icon: FaDiscord,
  },
};

function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url);
    // Remove www. prefix if present
    const hostname = urlObj.hostname.replace(/^www\./, "");
    // Return just the domain without subdomains for common cases
    return hostname;
  } catch {
    // If URL parsing fails, return a generic text
    return "Link";
  }
}

export default function EventSocialButtons({ event }: EventSocialButtonsProps) {
  const buttons: ButtonConfig[] = [];

  // Meetup button - always show first if we have a meetupId
  const meetupId = event.data.meetupId;
  if (meetupId && LINK_PRESETS.meetup) {
    buttons.push({
      href: `${MEETUP_EVENT_URL}/${meetupId}`,
      text: LINK_PRESETS.meetup.text,
      icon: LINK_PRESETS.meetup.icon,
    });
  }

  // Process links from the event data, maintaining their order
  if (event.data.links) {
    // First, add known preset links in the order they appear in LINK_PRESETS
    const presetKeys = Object.keys(LINK_PRESETS);

    // Add preset links that exist in the event data, in preset order
    for (const key of presetKeys) {
      if (key === "meetup") continue; // Already handled above
      const url = event.data.links[key];
      if (url && LINK_PRESETS[key]) {
        const preset = LINK_PRESETS[key];
        buttons.push({
          href: preset.getUrl ? preset.getUrl(url) : url,
          text: preset.text,
          icon: preset.icon,
        });
      }
    }

    // Then add any unknown links in the order they appear in the event data
    for (const [key, url] of Object.entries(event.data.links)) {
      if (url && !LINK_PRESETS[key]) {
        // Unknown link type - use generic icon and parse domain
        buttons.push({
          href: url,
          text: extractDomain(url),
          icon: LuExternalLink,
        });
      }
    }
  }

  return (
    <>
      {buttons.map((button, index) => (
        <a
          key={`${button.text}-${index}`}
          href={button.href}
          target="_blank"
          rel="noopener noreferrer"
          className={clsx("btn btn-lg btn-outline gap-4 whitespace-nowrap")}
        >
          <button.icon />
          {button.text}
        </a>
      ))}
    </>
  );
}
