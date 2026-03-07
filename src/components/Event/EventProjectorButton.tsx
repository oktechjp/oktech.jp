import { useState } from "react";

import { LuProjector } from "react-icons/lu";

import type { EventEnriched } from "@/content";

import EventProjectorOverlay from "./EventProjectorOverlay";

interface EventProjectorButtonProps {
  event: EventEnriched;
  variant?: "default" | "link";
}

export default function EventProjectorButton({ event, variant = "default" }: EventProjectorButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={
          variant === "link"
            ? "cursor-pointer px-2 py-1 opacity-0 transition-opacity hover:opacity-100"
            : "btn btn-lg btn-outline gap-4"
        }
      >
        {variant === "default" && <LuProjector />}
        Projector
      </button>
      <EventProjectorOverlay event={event} isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
