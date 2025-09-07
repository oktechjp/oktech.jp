import { useEffect, useState } from "react";

import clsx from "clsx";

import Brand from "@/components/Common/Brand";
import Container from "@/components/Common/Container";
import Link from "@/components/Common/Link";
import { MENU } from "@/constants";

function GlassCell({
  children,
  showBackground,
  testId,
  className,
}: {
  children: React.ReactNode;
  showBackground: boolean;
  testId?: string;
  className?: string;
}) {
  return (
    <div className={clsx("soft-glass", !showBackground && "no-bg", className)} data-testid={testId}>
      {children}
    </div>
  );
}

export default function TopBar() {
  const items = MENU.filter((item) => item.header === true);
  const [showBackground, setShowBackground] = useState(false);
  const [logoActive, setLogoActive] = useState(false);

  useEffect(() => {
    let last = window.scrollY > 0;
    setShowBackground(last);
    let ticking = false;

    const onScroll = () => {
      const y = window.scrollY;
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const next = y > 0;
        if (next !== last) {
          last = next;
          setShowBackground(next);
        }
        ticking = false;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLogoActive(true);
    }, 500);

    const handleFocus = () => setLogoActive(true);
    const handleBlur = () => setLogoActive(false);

    window.addEventListener("focus", handleFocus);
    window.addEventListener("blur", handleBlur);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("blur", handleBlur);
    };
  }, []);

  return (
    <div data-testid="top-bar" className="fixed top-0 z-50 w-full">
      <Container>
        <div className="-mx-2 flex items-start justify-between pt-4 sm:-mx-2 lg:-mx-5">
          <GlassCell showBackground={showBackground} testId="navbar-logo">
            <Link
              href="/"
              className="group btn btn-glass sm:btn-lg md:btn-xl rounded-field"
              data-astro-prefetch
            >
              <div className="-mr-1 -ml-2">
                <Brand active={logoActive} className="w-28 sm:w-32 md:w-42" />
              </div>
            </Link>
          </GlassCell>
          <GlassCell showBackground={showBackground} testId="navbar-menu">
            <div className="flex items-center">
              {items.map((item, i) => (
                <Link
                  key={item.label}
                  href={item.href}
                  data-astro-prefetch
                  className={clsx(
                    "btn btn-glass btn-md sm:btn-lg md:btn-xl rounded-field font-bold",
                    // "-mr-1 -ml-1",
                    i > 0 && "-ml-2",
                    // i === items.length - 1 && "-mr-0",
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </GlassCell>
        </div>
      </Container>
    </div>
  );
}
