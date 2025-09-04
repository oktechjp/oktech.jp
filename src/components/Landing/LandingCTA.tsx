import { FaDiscord } from "react-icons/fa6";
import { LuCalendarPlus, LuMessageCircleCode } from "react-icons/lu";

import BlobIconGrid, { type BlobIconGridItem } from "@/components/Common/BlobIconGrid";

export default function LandingCTA() {
  const items: BlobIconGridItem[] = [
    {
      type: "a",
      title: "Join the Discord",
      description: "Chat with our community",
      icon: FaDiscord,
      href: "/discord",
      target: "_blank",
      rel: "noopener noreferrer",
      // showTip: true,
    },
    {
      type: "calendar",
      title: "Subscribe to Calendar",
      description: "Never miss an event",
      icon: LuCalendarPlus,
    },
    {
      type: "a",
      title: "Make a Presentation",
      description: "Submit your talk proposal and share your ideas",
      icon: LuMessageCircleCode,
      href: "https://discord.com/channels/1034792577293094972/1034862103653257306",
      target: "_blank",
      rel: "noopener noreferrer",
      testId: "proposal-cta",
    },
  ];

  return <BlobIconGrid items={items} />;
}
