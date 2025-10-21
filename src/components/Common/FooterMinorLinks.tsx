import Link from "@/components/Common/Link";
import { MENU } from "@/constants";

export default function FooterMinorLinks() {
  const minorItems = MENU.filter((item) => item.footerMinor === true);

  return (
    <div className="flex flex-wrap justify-center gap-4" data-testid="footer-minor-links">
      {minorItems.map((item) => {
        // Use custom component if provided
        if (item.component) {
          const Component = item.component;
          return <Component key={item.href} label={item.label} href={item.href} icon={item.icon} />;
        }

        // Default link without icon
        return (
          <Link
            key={item.href}
            href={item.href}
            className="link link-hover"
            target={item.target}
            rel={item.target === "_blank" ? "noopener noreferrer" : undefined}
          >
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}
