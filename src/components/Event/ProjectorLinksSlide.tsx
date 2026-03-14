import { QRCodeSVG } from "qrcode.react";

import Brand from "@/components/Common/Brand";

const LINKS = [
  {
    label: "Website",
    url: "https://oktech.jp",
  },
  {
    label: "Discord",
    url: "https://oktech.jp/discord",
  },
];

export default function ProjectorLinksSlide() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-[3vw] p-[0.5vw]">
      <div className="w-[35vw] text-white">
        <Brand active className="w-full" />
      </div>

      <div className="flex items-center justify-center gap-[8vw]">
        {LINKS.map((link) => (
          <div key={link.label} className="flex flex-col items-center gap-[1.2vw]">
            <div className="rounded-box bg-white p-[1.2vw]">
              <QRCodeSVG value={link.url} className="size-[20vw]" />
            </div>
            <span className="text-[2.4vw] font-semibold text-white">
              {link.label}
            </span>
            <span className="text-[1.4vw] text-white">
              {link.url}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
