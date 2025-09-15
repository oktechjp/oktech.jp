import { useEffect, useRef } from "react";

import { prefetch } from "astro:prefetch";

import { urls } from "@/utils/urls";

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

  const finalHref = urls.withBase(href);

  return (
    <a ref={linkRef} href={finalHref} {...rest}>
      {children}
    </a>
  );
}
