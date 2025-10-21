import type { ComponentType, ReactNode, SVGProps } from "react";

import clsx from "clsx";

import discordLogo from "@/assets/logo-discord.svg?url";
import calendarLogo from "@/assets/logo-gcal.svg?url";
import GithubLogoSvg from "@/assets/logo-github.svg?react";
import githubLogo from "@/assets/logo-github.svg?url";
import linkedinLogo from "@/assets/logo-linkedin.svg?url";
import meetupLogo from "@/assets/logo-meetup.svg?url";
import CalendarSubscribeButton from "@/components/Common/CalendarSubscribeButton";
import Link from "@/components/Common/Link";
import MarqueeBackground from "@/components/Common/MarqueeBackground";
import SafariIOSDarkdmodeBugfix from "@/components/Common/SafariIOSDarkdmodeBugfix";

const CONNECT_ITEMS: Array<{
  key: string;
  label: string;
  logo: string;
  svg?: ComponentType<SVGProps<SVGSVGElement>>;
  variables?: Array<{ name: string; light: string; dark: string }>;
  render(content: ReactNode): ReactNode;
}> = [
  {
    key: "calendar",
    label: "Calendar",
    logo: calendarLogo,
    render: (content) => (
      <CalendarSubscribeButton>
        <button
          type="button"
          aria-label="Subscribe to the OKTech calendar"
          className="cursor-pointer"
        >
          {content}
        </button>
      </CalendarSubscribeButton>
    ),
  },
  {
    key: "discord",
    label: "Discord",
    logo: discordLogo,
    render: (content) => (
      <Link
        href="/discord"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Join the OKTech Discord"
      >
        {content}
      </Link>
    ),
  },
  {
    key: "meetup",
    label: "Meetup",
    logo: meetupLogo,
    render: (content) => (
      <a
        href="https://www.meetup.com/osaka-web-designers-and-developers-meetup/"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Visit the OKTech Meetup page"
      >
        {content}
      </a>
    ),
  },
  {
    key: "github",
    label: "GitHub",
    logo: githubLogo,
    svg: GithubLogoSvg,
    variables: [{ name: "--github-mark-fill", light: "#111111", dark: "#ffffff" }],
    render: (content) => (
      <a
        href="https://github.com/oktechjp/oktech.jp"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Explore OKTech on GitHub"
      >
        {content}
      </a>
    ),
  },
  {
    key: "linkedin",
    label: "LinkedIn",
    logo: linkedinLogo,
    render: (content) => (
      <a
        href="https://www.linkedin.com/company/owddm-kwddm"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Connect with OKTech on LinkedIn"
      >
        {content}
      </a>
    ),
  },
];

function TileContent({
  logo,
  svg,
  variables,
  label,
}: {
  logo: string;
  svg?: ComponentType<SVGProps<SVGSVGElement>>;
  variables?: Array<{ name: string; light: string; dark: string }>;
  label: string;
}) {
  const icon =
    svg && variables ? (
      <SafariIOSDarkdmodeBugfix
        imgSrc={logo}
        Svg={svg}
        variables={variables}
        alt=""
        aria-hidden="true"
        className="w-full"
      />
    ) : (
      <img
        src={logo}
        alt=""
        aria-hidden="true"
        className="w-full"
        loading="lazy"
        decoding="async"
      />
    );

  return (
    <div className="group hover:pointer flex w-full max-w-[12rem] flex-col items-center gap-6">
      <div className="flex h-20 w-20 items-center justify-center transition-all duration-300 group-hover:scale-110">
        {icon}
      </div>
      <span className="group-hover:text-base-700 text-lg font-bold">{label}</span>
    </div>
  );
}

export default function SocialsBig() {
  return (
    <section className="relative isolate overflow-hidden py-12">
      <MarqueeBackground text="Connect with us" />

      <div className="relative z-10 mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 justify-items-center gap-6 sm:grid-cols-3 md:grid-cols-5">
          {CONNECT_ITEMS.map(({ key, label, logo, svg, variables, render }, index) => {
            const isLastItem = index === CONNECT_ITEMS.length - 1;
            return (
              <div
                key={key}
                className={clsx(
                  "flex h-full w-full justify-center",
                  isLastItem && "col-span-2 sm:col-span-1 md:col-span-1",
                )}
              >
                {render(<TileContent logo={logo} svg={svg} variables={variables} label={label} />)}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
