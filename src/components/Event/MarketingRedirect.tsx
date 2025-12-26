import { useEffect } from "react";

import { MEETUP_EVENT_URL } from "@/constants";

const OFFSET_MINUTES = 30;

interface MarketingRedirectProps {
  meetupId: number;
  eventDateTime: string;
  isCancelled?: boolean;
}

export default function MarketingRedirect({
  meetupId,
  eventDateTime,
  isCancelled,
}: MarketingRedirectProps) {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const source = params.get("source");
    if (!source || !meetupId || isCancelled) return;

    const cutoffTime = new Date(eventDateTime).getTime() - OFFSET_MINUTES * 60 * 1000;
    if (Date.now() < cutoffTime) {
      window.location.replace(`${MEETUP_EVENT_URL}/${meetupId}/`);
    }
  }, [meetupId, eventDateTime, isCancelled]);

  return null;
}
