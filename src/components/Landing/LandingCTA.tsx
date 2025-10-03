import { FaDiscord } from "react-icons/fa6";
import { LuCalendarPlus, LuMessageCircleCode } from "react-icons/lu";

import BlobIconGrid, { type BlobIconGridItem } from "@/components/Common/BlobIconGrid";
import CalendarSubscribeButton from "@/components/Common/CalendarSubscribeButton";

export default function LandingCTA() {
  const items: BlobIconGridItem[] = [
    {
      title: "Join the Discord",
      description: "Chat with our community",
      icon: FaDiscord,
      href: "/discord",
      target: "_blank",
      rel: "noopener noreferrer",
    },
    {
      title: "Subscribe to Calendar",
      description: "Never miss an event",
      icon: LuCalendarPlus,
      wrap: (content) => (
        <CalendarSubscribeButton>
          <button type="button" className="flex h-full w-full items-center justify-center">
            {content}
          </button>
        </CalendarSubscribeButton>
      ),
    },
    {
      title: "Make a Presentation",
      description: "Share your ideas",
      icon: LuMessageCircleCode,
      href: "https://discord.com/channels/1034792577293094972/1034862103653257306",
      target: "_blank",
      rel: "noopener noreferrer",
      testId: "proposal-cta",
    },
  ];

  return <BlobIconGrid items={items} />;
}
