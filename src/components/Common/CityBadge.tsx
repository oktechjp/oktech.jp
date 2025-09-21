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
        isOsaka && "text-error bg-error-content",
        isKyoto && "text-info bg-info-content",
        isOther && "text-success bg-success-content",
        className,
      )}
    >
      {capitalize(city)}
    </span>
  );
}
