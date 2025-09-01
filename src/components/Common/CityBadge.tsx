import clsx from "clsx";

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

interface CityBadgeProps {
  city: string | undefined;
  className?: string;
}

export default function CityBadge({ city, className }: CityBadgeProps) {
  if (!city) return null;

  const cityLower = city.toLowerCase();
  const isOsaka = cityLower === "osaka";
  const isKyoto = cityLower === "kyoto";
  const isOther = !isOsaka && !isKyoto;

  return (
    <span
      className={clsx(
        isOsaka && "badge badge-error",
        isKyoto && "badge badge-warning",
        isOther && "badge badge-success",
        className,
      )}
    >
      {capitalize(city)}
    </span>
  );
}
