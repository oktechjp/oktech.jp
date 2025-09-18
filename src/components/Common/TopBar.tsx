import { useEffect, useState } from "react";

import { animated, useSpring } from "@react-spring/web";
import clsx from "clsx";

import Brand from "@/components/Common/Brand";
import Container from "@/components/Common/Container";
import Link from "@/components/Common/Link";
import ThemeToggle from "@/components/Common/ThemeToggle";
import { MENU } from "@/constants";
import { useBelowBreakpoint } from "@/utils/hooks/useBreakpoint";
import { useFocus } from "@/utils/hooks/useFocus";

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
  const isMobile = useBelowBreakpoint("sm");
  const logoActive = useFocus();

  const springs = useSpring({
    margin: showBackground ? (isMobile ? 10 : 40) : 0,
    config: { mass: 0.8, tension: 180, friction: 9 },
  });

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

  return (
    <div data-testid="top-bar" className="fixed top-0 z-50 w-full">
      <Container>
        <animated.div
          className="m-auto pt-6"
          style={{
            marginLeft: springs.margin.to((m) => `${m}px`),
            marginRight: springs.margin.to((m) => `${m}px`),
          }}
        >
          <GlassCell
            showBackground={showBackground}
            testId="navbar-logo"
            className="flex w-full justify-between"
          >
            <Link
              href="/"
              className="group btn btn-glass sm:btn-lg md:btn-xl rounded-field"
              data-astro-prefetch
            >
              <div className="-mr-1 -ml-2">
                <Brand active={logoActive} className="w-28 sm:w-32 md:w-42" />
              </div>
            </Link>
            {/* </GlassCell>
          <GlassCell showBackground={showBackground} testId="navbar-menu"> */}
            <div className="flex items-center">
              {items.map((item, i) => (
                <Link
                  key={item.label}
                  href={item.href}
                  data-astro-prefetch
                  className={clsx(
                    "btn btn-glass btn-md sm:btn-lg md:btn-xl rounded-field font-bold",
                    i > 0 && "-ml-2",
                  )}
                >
                  {item.label}
                </Link>
              ))}
              <ThemeToggle className="btn btn-glass btn-md sm:btn-lg md:btn-xl rounded-field -ml-2 font-bold" />
            </div>
          </GlassCell>
        </animated.div>
      </Container>
    </div>
  );
}
