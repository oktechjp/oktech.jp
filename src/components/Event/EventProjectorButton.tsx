import { useState } from "react";

import { LuProjector } from "react-icons/lu";

import type { EventEnriched } from "@/content";

import EventProjectorOverlay from "./EventProjectorOverlay";

interface EventProjectorButtonProps {
  event: EventEnriched;
}

export default function EventProjectorButton({ event }: EventProjectorButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsOpen(true)} className="btn btn-lg btn-outline gap-4">
        <LuProjector />
        Projector
      </button>
      <EventProjectorOverlay event={event} isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
