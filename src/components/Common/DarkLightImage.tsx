import { type HTMLAttributes } from "react";

import clsx from "clsx";

export default function DarkLightImage({
  ondark,
  onlight,
  className,
  ...rest
}: { ondark: ImageMetadata; onlight: ImageMetadata } & Omit<HTMLAttributes<HTMLImageElement>, "src">) {
  return (
    <>
      <img src={onlight.src} {...rest} className={clsx(className, "dark:hidden")} />
      <img src={ondark.src} {...rest} className={clsx(className, "hidden dark:block")} />
    </>
  );
}
