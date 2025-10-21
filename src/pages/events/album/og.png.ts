import OGEventsView from "@/components/OGImage/OGEventsView";
import { SEO_DATA } from "@/constants";
import { createOGImageRoute } from "@/utils/og";

export const GET = createOGImageRoute(async () => {
  const seoData = SEO_DATA["/events/album"];

  return {
    component: OGEventsView,
    cacheKeyData: { page: "events-album" },
    props: {
      title: seoData.title,
      subtitle: "Osaka Kansai Tech Community",
      description: seoData.description,
    },
  };
});
