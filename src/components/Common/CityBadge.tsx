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
        "badge",
        isOsaka && "bg-error-content text-white",
        isKyoto && "bg-info-content text-white",
        isOther && "bg-success-content text-white",
        className,
      )}
    >
      {capitalize(city)}
    </span>
  );
}
