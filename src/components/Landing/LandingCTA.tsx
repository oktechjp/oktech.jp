import { FaDiscord } from "react-icons/fa6";
import { LuCalendarPlus, LuMessageCircleCode } from "react-icons/lu";

import BlobIconGrid, { type BlobIconGridItemConfig } from "@/components/Common/BlobIconGrid";
import CalendarSubscribeButton from "@/components/Common/CalendarSubscribeButton";
import Container from "@/components/Common/Container";
import MarqueeBackground from "@/components/Common/MarqueeBackground";

export default function LandingCTA() {
  const items: BlobIconGridItemConfig[] = [
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
          <button
            type="button"
            className="flex h-full w-full cursor-pointer items-center justify-center"
          >
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

  return (
    <section className="relative isolate overflow-hidden py-24">
      <MarqueeBackground
        text="Get Involved"
        className="-my-6 md:-my-8"
        lineCount={3}
        mobileLineCount={14}
      />

      <div className="relative z-10 -mt-6 md:-mt-8">
        <Container>
          <BlobIconGrid items={items} className="md:gap-16" />
        </Container>
      </div>
    </section>
  );
}
