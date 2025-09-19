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
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {stats.map((stat, index) => (
        <div key={index} className="aspect-square">
          <StatsItem stat={stat} colorClass={tileColors[index % tileColors.length]} />
        </div>
      ))}
    </div>
  );
}
