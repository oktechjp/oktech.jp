import { useEffect, useRef } from "react";

import { prefetch } from "astro:prefetch";

import { urls } from "@/utils/urls";

export interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  prefetch?: string | boolean;
}

export default function Link({ href, children, prefetch: prefetchProp, ...rest }: LinkProps) {
  const linkRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const shouldPrefetch =
      prefetchProp !== undefined && prefetchProp !== false && prefetchProp !== "false";

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
  }, [href, prefetchProp]);

  const finalHref = urls.withBase(href);

  return (
    <a ref={linkRef} href={finalHref} {...rest}>
      {children}
    </a>
  );
}
