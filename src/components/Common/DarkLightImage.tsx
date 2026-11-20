import { type HTMLAttributes } from "react";

import clsx from "clsx";

export default function DarkLightImage({
  ondark,
  onlight,
  className,
  ...rest
}: { ondark: string; onlight: string } & Omit<HTMLAttributes<HTMLImageElement>, "src">) {
  return (
    <>
      <img src={onlight} {...rest} className={clsx(className, "dark:hidden")} />
      <img src={ondark} {...rest} className={clsx(className, "hidden dark:block")} />
    </>
  );
}
