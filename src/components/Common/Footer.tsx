import Container from "@/components/Common/Container";
import FooterMinorLinks from "@/components/Common/FooterMinorLinks";
import MainMenu from "@/components/Common/MainMenu";
import SocialsFooter from "@/components/Common/SocialsFooter";
import { SITE } from "@/constants";
import { formatDate } from "@/utils/formatDate";
import { meta } from "@/utils/meta";

import Brand from "./Brand";

export default function Footer() {
  return (
    <footer className="text-base-content" data-testid="footer">
      <Container className="flex flex-col gap-8 py-10">
        <div className="flex flex-col items-center justify-between gap-8 sm:flex-row">
          <MainMenu variant="footer" />
          <div className="flex items-center gap-2">
            <SocialsFooter />
          </div>
        </div>
        <div className="flex flex-col items-center justify-between gap-8 text-xs lg:flex-row lg:items-baseline">
          <div className="flex items-center gap-4">
            <span>
              Copyright © {new Date().getFullYear()} {SITE.shortName}
            </span>
            <FooterMinorLinks />
          </div>
          <div className="opacity-70 hover:opacity-100">
            <a
              href={`${meta.repository}/commit/${meta.commitHash}`}
              target="_blank"
              className="link text-link tooltip md:tooltip-left"
              data-tip={`${formatDate(new Date(), "datetime")} UTC · ${meta.commitHash.substring(0, 7)}`}
            >
              Built with <code>{`<3`}</code>
            </a>
          </div>
        </div>
      </Container>
      <div
        className="fade-out overflow-hidden opacity-40 select-none"
        aria-hidden="true"
        role="presentation"
      >
        <Container wide className="group -mb-[6vw] 2xl:-mb-32">
          <Brand className="w-full" />
        </Container>
      </div>
    </footer>
  );
}
