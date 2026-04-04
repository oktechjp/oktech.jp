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

  const isExternal = /^https?:\/\//.test(href);
  const finalHref = isExternal ? href : urls.withBase(href);
  const externalProps = isExternal && !rest.target ? { target: "_blank", rel: "noopener noreferrer" } : {};

  return (
    <a ref={linkRef} href={finalHref} {...externalProps} {...rest}>
      {children}
    </a>
  );
}
