import type { ReactNode } from "react";

import CalendarSubscribeButton from "@/components/Common/CalendarSubscribeButton";
import { SOCIALS } from "@/constants";

interface SocialsFooterProps {
  className?: string;
}

const buttonClass = "btn btn-circle btn-sm btn-ghost";

export default function SocialsFooter({ className = "" }: SocialsFooterProps) {
  const items = SOCIALS.map(buildFooterEntry);

  return (
    <div className={`flex items-center gap-2 ${className}`} data-testid="socials-footer">
      {items.map(({ key, tooltip, content }) => (
        <div key={key} className="tooltip tooltip-top" data-tip={tooltip}>
          {content}
        </div>
      ))}
    </div>
  );
}

function buildFooterEntry(social: (typeof SOCIALS)[number]) {
  const IconComponent = social.icon;
  const icon = <IconComponent size={18} />;

  if ("type" in social && social.type === "calendar") {
    return {
      key: social.label,
      tooltip: "Subscribe",
      content: (
        <CalendarSubscribeButton>
          <button type="button" aria-label={social.label} className={buttonClass}>
            {icon}
          </button>
        </CalendarSubscribeButton>
      ) as ReactNode,
    };
  }

  return {
    key: social.label,
    tooltip: social.label,
    content: (
      <a
        href={social.href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={social.label}
        className={buttonClass}
      >
        {icon}
      </a>
    ) as ReactNode,
  };
}
