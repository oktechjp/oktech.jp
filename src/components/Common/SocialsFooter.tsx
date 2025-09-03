import CalendarFeeds from "@/components/Common/CalendarFeeds";
import { SOCIALS } from "@/constants";

interface SocialsFooterProps {
  className?: string;
}

export default function SocialsFooter({ className = "" }: SocialsFooterProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`} data-testid="socials-footer">
      {SOCIALS.map((social) => {
        const IconComponent = social.icon;

        if ((social as any).type === "calendar") {
          return (
            <div key={social.label} className="tooltip tooltip-top" data-tip={social.label}>
              <CalendarFeeds dropdownPosition="top" className="dropdown-end">
                <span
                  aria-label={social.label}
                  className="btn btn-circle btn-sm btn-ghost"
                  role="button"
                  tabIndex={0}
                >
                  <IconComponent size={18} />
                </span>
              </CalendarFeeds>
            </div>
          );
        }

        return (
          <div key={social.label} className="tooltip tooltip-top" data-tip={social.label}>
            <a
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={social.label}
              className="btn btn-circle btn-sm btn-ghost"
            >
              <IconComponent size={18} />
            </a>
          </div>
        );
      })}
    </div>
  );
}
