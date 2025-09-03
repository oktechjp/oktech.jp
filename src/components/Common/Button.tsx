import clsx from "clsx";
import { LuArrowUpRight, LuChevronLeft } from "react-icons/lu";

import LinkReact from "./Link";

interface ButtonProps {
  href: string;
  text: string;
  icon?: string;
  className?: string;
  iconLeft?: boolean;
  ariaLabel?: string;
}

export default function Button({
  href,
  text,
  className,
  iconLeft = false,
  ariaLabel,
}: ButtonProps) {
  const needsSrText = ariaLabel && ariaLabel !== text;

  return (
    <LinkReact className={clsx("btn btn-primary mx-auto", className)} href={href}>
      {iconLeft && <LuChevronLeft />}
      {needsSrText ? (
        <>
          <span aria-hidden="true">{text}</span>
          <span className="sr-only">{ariaLabel}</span>
        </>
      ) : (
        text
      )}
      {!iconLeft && <LuArrowUpRight />}
    </LinkReact>
  );
}
