import { animated, useTrail } from "@react-spring/web";

import StatsItem, { type Stat } from "@/components/Common/StatsItem";

interface StatsGridProps {
  stats: Stat[];
}

const tileColors = [
  "bg-info text-info-content",
  "bg-success text-success-content",
  "bg-warning text-warning-content",
  "bg-error text-error-content",
];

export default function StatsGrid({ stats }: StatsGridProps) {
  const trail = useTrail(stats.length, {
    from: { opacity: 0, transform: "translate3d(0,-80px,0)" },
    to: { opacity: 1, transform: "translate3d(0,0px,0)" },
    config: { mass: 2, tension: 60, friction: 30 },
    delay: 300,
  });

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {trail.map((style, index) => (
        <animated.div key={index} style={style} className="aspect-square">
          <StatsItem stat={stats[index]} colorClass={tileColors[index % tileColors.length]} />
        </animated.div>
      ))}
    </div>
  );
}
