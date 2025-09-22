import { animated, useSpring } from "@react-spring/web";
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
  countdown?: number;
}

interface StatsItemProps {
  stat: Stat;
  colorClass?: string;
}

function parseStatValue(value: string): { number: number; template: string } {
  const match = value.match(/(\d+(?:\.\d+)?)/);
  if (match) {
    const number = parseFloat(match[1]);
    const template = value.replace(match[1], "{{NUMBER}}");
    return { number, template };
  }
  return { number: 0, template: value };
}

export default function StatsItem({
  stat,
  colorClass = "bg-primary text-primary-content",
}: StatsItemProps) {
  const Icon = statsIcons[stat.iconKey];
  const { number, template } = parseStatValue(stat.value);

  const decimals = number < 10 ? 1 : 0;
  const startValue = stat.countdown !== undefined ? stat.countdown : 0;

  const { progress } = useSpring({
    from: { progress: 0 },
    to: { progress: 1 },
    config: { mass: 1, tension: 20, friction: 26 },
  });

  return (
    <div className={`${colorClass} rounded-box flex h-full w-full items-start rounded-br-none`}>
      <div className="flex h-full flex-col gap-3 px-4 py-4 md:px-8 md:py-6 xl:px-8 xl:py-12 2xl:!py-18">
        <div className="text-dark-neutral flex items-center gap-2 lg:text-lg 2xl:!text-xl">
          {/* <Icon className="h-5 w-5" /> */}
          <span className="font-header">{stat.title}</span>
        </div>
        <div className="font-header flex-grow text-5xl tracking-tighter lg:text-7xl 2xl:!text-8xl">
          <animated.span>
            {progress.to((p) => {
              const currentValue = startValue + (number - startValue) * p;
              const formatted = currentValue.toFixed(decimals);
              return template.replace("{{NUMBER}}", formatted.replace(/\.0$/, ""));
            })}
          </animated.span>
        </div>
        {stat.subTitle && (
          <div className="text-dark-neutral text-sm opacity-75 lg:text-base 2xl:!text-xl">
            {stat.subTitle}
          </div>
        )}
      </div>
    </div>
  );
}
