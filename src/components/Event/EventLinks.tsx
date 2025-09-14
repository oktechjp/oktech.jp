import SimpleSection from "@/components/Common/SimpleSection";
import type { EventEnriched } from "@/content/events";

import EventLinkCard from "./EventLinkCard";

export interface EventLink {
  icon: string;
  title: string;
  description?: string;
  url: string;
}

interface Props {
  event: EventEnriched;
}

export default function EventLinks({ event }: Props) {
  const links = event.data.attachments || [];

  if (links.length === 0) {
    return null;
  }

  return (
    <SimpleSection grid title="Links">
      {links.map((link, index) => (
        <EventLinkCard key={index} link={link} />
      ))}
    </SimpleSection>
  );
}
