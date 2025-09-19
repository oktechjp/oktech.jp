import { FaCity } from "react-icons/fa6";
import { LuCalendarDays, LuRocket, LuUsers } from "react-icons/lu";

const statsIcons = {
  calendar: LuRocket,
  calendarDays: LuCalendarDays,
  mapPin: FaCity,
  users: LuUsers,
} as const;

export type StatsIconKey = keyof typeof statsIcons;

export const icons = {
  calendar: "calendar" as StatsIconKey,
  calendarDays: "calendarDays" as StatsIconKey,
  mapPin: "mapPin" as StatsIconKey,
  users: "users" as StatsIconKey,
} as const;

export interface Stat {
  title: string;
  value: string;
  iconKey: StatsIconKey;
  subTitle?: string;
}

interface StatsItemProps {
  stat: Stat;
  colorClass?: string;
}

export default function StatsItem({
  stat,
  colorClass = "bg-primary text-primary-content",
}: StatsItemProps) {
  const Icon = statsIcons[stat.iconKey];

  return (
    <div className={`${colorClass} rounded-box flex h-full w-full items-start rounded-br-none`}>
      <div className="flex h-full flex-col gap-3 px-4 py-6">
        <div className="text-base-content flex items-center gap-2">
          {/* <Icon className="h-5 w-5" /> */}
          <span className="font-header">{stat.title}</span>
        </div>
        <div className="font-header flex-grow text-5xl tracking-tighter">{stat.value}</div>
        {stat.subTitle && (
          <div className="text-base-content text-sm opacity-75">{stat.subTitle}</div>
        )}
      </div>
    </div>
  );
}
