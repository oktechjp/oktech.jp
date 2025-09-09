import BlobSlideshow from "@/components/Common/BlobSlideshow";
import StatsItem, { type Stat } from "@/components/Common/StatsItem";

interface StatsSlideshowProps {
  stats: Stat[];
}

export default function StatsSlideshow({ stats }: StatsSlideshowProps) {
  const renderer = (stat: Stat) => <StatsItem stat={stat} />;

  return (
    <BlobSlideshow
      data={stats}
      blobOffset={1}
      renderer={renderer}
      slideDelay={1500}
      containerClassName="aspect-square"
    />
  );
}
