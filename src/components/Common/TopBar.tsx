import clsx from "clsx";

import Brand from "@/components/Common/Brand";
import Container from "@/components/Common/Container";
import Link from "@/components/Common/Link";
import ThemeToggle from "@/components/Common/ThemeToggle";
import { MENU } from "@/constants";
import { useFocus } from "@/utils/hooks/useFocus";
import { useScrolled } from "@/utils/hooks/useScrolled";

const BUTTON_CLASS =
  "btn btn-glass btn-md sm:btn-lg md:btn-xl rounded-field font-bold border-none shadow-none bg-base-100/0 hover:bg-base-100/60 active:bg-base-100/90";

export default function TopBar() {
  const items = MENU.filter((item) => item.header === true);
  const logoActive = useFocus();
  const showBackground = useScrolled();

  return (
    <div data-testid="top-bar" className="fixed top-0 z-50 w-full">
      <Container wide>
        <div className="flex justify-center pt-6">
          <div
            className={clsx(
              "rounded-box flex w-full justify-between border p-px transition-all duration-300",
              !showBackground
                ? "bg-base-100/0 border-base-100/0 max-w-full"
                : "bg-base-100/50 border-base-100/50 max-w-sm md:max-w-lg lg:max-w-3xl xl:max-w-4xl",
            )}
            style={{
              backdropFilter: showBackground ? "brightness(1.4) saturate(1.3) blur(30px)" : "none",
            }}
          >
            <Link href="/" className={clsx(BUTTON_CLASS)} data-astro-prefetch>
              <div className="-mr-1 -ml-2">
                <Brand active={logoActive} className="w-28 sm:w-32 md:w-42" />
              </div>
            </Link>
            <div className="flex items-center">
              {items.map((item, i) => (
                <Link
                  key={item.label}
                  href={item.href}
                  data-astro-prefetch
                  className={clsx(BUTTON_CLASS, i > 0 && "-ml-2")}
                >
                  {item.label}
                </Link>
              ))}
              <ThemeToggle className={clsx(BUTTON_CLASS, "-ml-2")} />
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
