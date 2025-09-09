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
  return (
    <div className="rounded-box grid aspect-square grid-cols-2 gap-4 overflow-hidden">
      {stats.map((stat, index) => (
        <div key={index} className="aspect-square">
          <StatsItem stat={stat} colorClass={tileColors[index % tileColors.length]} />
        </div>
      ))}
    </div>
  );
}
