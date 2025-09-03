import { forwardRef } from "react";

import { resolveInternalHref } from "@/utils/urlResolver";

export interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  ref?: React.RefObject<HTMLAnchorElement>;
}

const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link(
  { href, children, ...rest },
  ref,
) {
  const finalHref = resolveInternalHref(href);

  return (
    <a ref={ref} href={finalHref} {...rest}>
      {children}
    </a>
  );
});

export default Link;
