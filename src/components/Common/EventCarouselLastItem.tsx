import clsx from "clsx";

export default function EventCarouselLastItem({
  icon: Icon,
  text,
  button,
}: {
  icon?: React.ComponentType<{ className?: string }>;
  text?: string;
  button?: React.ReactNode;
}) {
  return (
    <div
      className={clsx(
        "flex h-full flex-col items-center justify-center gap-8",
        "text-base-500 dark:text-base-600",
      )}
    >
      {Icon && <Icon className="h-18 w-18" />}
      {text && <p className="text-lg">{text}</p>}
      {button && <div>{button}</div>}
    </div>
  );
}
