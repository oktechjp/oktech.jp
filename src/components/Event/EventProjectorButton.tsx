import { useState } from "react";

import { LuProjector } from "react-icons/lu";

import Button from "@/components/Common/Button";
import TooltipButton from "@/components/Common/TooltipButton";
import type { EventEnriched } from "@/content";

import EventProjectorOverlay from "./EventProjectorOverlay";

interface EventProjectorButtonProps {
  event: EventEnriched;
}

export default function EventProjectorButton({ event }: EventProjectorButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <TooltipButton
        onClick={() => setIsOpen(true)}
        className="btn"
        aria-label="Open projector view"
        tooltip="Projector view"
        tooltipPosition="right"
      >
        <LuProjector className="h-5 w-5" />
      </TooltipButton>
      <EventProjectorOverlay event={event} isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
