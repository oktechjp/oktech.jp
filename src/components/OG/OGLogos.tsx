import { twj } from "tw-to-css";

import { OKTechLogoIcon, OKTechLogoText } from "../Common/OKTechLogo";

function scale(scale: number, type: "icon" | "text"): { width: number; height: number } {
  const dimensions = {
    icon: { width: 100, height: 100 },
    text: { width: 274.88, height: 70.53 },
  };
  return {
    width: Math.round(dimensions[type].width * scale),
    height: Math.round(dimensions[type].height * scale),
  };
}

export default function OGLogo() {
  return (
    <div style={twj("flex justify-start items-center")}>
      <OKTechLogoIcon active noStyle style={scale(2.35, "icon")} />
      <OKTechLogoText style={scale(2.35, "text")} />
    </div>
  );
}
