import { useEffect, useRef } from "react";

import { prefetch } from "astro:prefetch";

import { resolveInternalHref } from "@/utils/urlResolver";

export interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  "data-astro-prefetch"?: string | boolean;
}

export default function Link({ href, children, ...rest }: LinkProps) {
  const linkRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const pfProp = rest["data-astro-prefetch"];
    const shouldPrefetch = pfProp !== undefined && pfProp !== false && pfProp !== "false";

    if (!shouldPrefetch || !linkRef.current) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            prefetch(href);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: "100px",
      },
    );

    observer.observe(linkRef.current);

    return () => {
      observer.disconnect();
    };
  }, [href, rest["data-astro-prefetch"]]);

  const finalHref = resolveInternalHref(href);

  return (
    <a ref={linkRef} href={finalHref} {...rest}>
      {children}
    </a>
  );
}
