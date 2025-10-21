import OGEventsView from "@/components/OGImage/OGEventsView";
import { SEO_DATA } from "@/constants";
import { createOGImageRoute } from "@/utils/og";

export const GET = createOGImageRoute(async () => {
  const seoData = SEO_DATA["/events/list"];

  return {
    component: OGEventsView,
    cacheKeyData: { page: "events-list" },
    props: {
      title: seoData.title,
      subtitle: "Osaka Kansai Tech Community",
      description: seoData.description,
    },
  };
});
