import clsx from "clsx";

import Brand from "@/components/Common/Brand";
import Link from "@/components/Common/Link";
import ShrinkingNavbar from "@/components/Common/ShrinkingNavbar";
import ThemeToggle from "@/components/Common/ThemeToggle";
import { MENU } from "@/constants";
import { useFocus } from "@/hooks/useFocus";

const BUTTON_CLASS =
  "btn btn-md max-[424px]:px-2 font-bold sm:btn-lg md:btn-xl rounded-field font-bold border-none shadow-none bg-base-0/0 hover:bg-base-0/60 active:bg-base-0/90";

export default function TopBar() {
  const items = MENU.filter((item) => item.header === true);
  const logoActive = useFocus();

  return (
    <div data-testid="top-bar" className="text-base-800 fixed top-0 z-50 w-full">
      <ShrinkingNavbar>
        <Link href="/" className={clsx(BUTTON_CLASS)} prefetch>
          <div className="-mr-1 -ml-2">
            <Brand active={logoActive} className="w-28 sm:w-32 md:w-42" />
          </div>
        </Link>
        <div className="flex items-center">
          {items.map((item, i) => (
            <Link
              key={item.label}
              href={item.href}
              prefetch
              className={clsx(BUTTON_CLASS, i > 0 && "-ml-2", item.ruby && "group")}
            >
              {item.ruby ? (
                <span className="relative">
                  {item.label}
                  <span
                    lang="ja"
                    className="absolute -top-[0.7em] left-1/2 -translate-x-1/2 text-[0.55em] font-normal whitespace-nowrap opacity-30 transition-opacity group-hover:opacity-100"
                  >
                    {item.ruby}
                  </span>
                </span>
              ) : (
                item.label
              )}
            </Link>
          ))}
          <ThemeToggle className={clsx(BUTTON_CLASS, "-ml-2")} />
        </div>
      </ShrinkingNavbar>
    </div>
  );
}
