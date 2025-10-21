import clsx from "clsx";

import { OKTechLogoIcon, OKTechLogoText } from "@/components/Common/OKTechLogo";

export default function Brand({
  className = "w-28",
  active = false,
}: {
  className?: string;
  active?: boolean;
}) {
  return (
    <div className={clsx("grid max-w-full grid-cols-4 items-center justify-center", className)}>
      <div>
        <OKTechLogoIcon noStyle active={active} />
      </div>
      <div className="col-span-3">
        <OKTechLogoText />
      </div>
    </div>
  );
}
