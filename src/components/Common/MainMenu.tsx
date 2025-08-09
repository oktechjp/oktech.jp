import LinkReact from "@/components/Common/LinkReact";
import { MENU } from "@/constants";

interface MainMenuProps {
  variant?: "footer" | "default";
  className?: string;
}

export default function MainMenu({ variant = "default", className = "" }: MainMenuProps) {
  if (variant === "footer") {
    const majorItems = MENU.filter((item) => item.footerMajor === true);
    return (
      <nav
        className={`-mx-4 flex flex-wrap justify-center gap-1 ${className}`}
        data-testid="main-menu"
      >
        {majorItems.map((item) => {
          const IconComponent = item.icon;
          return (
            <LinkReact
              key={item.href}
              href={item.href}
              className="btn btn-ghost items-center justify-start gap-2 text-sm"
            >
              {IconComponent && <IconComponent />}
              {item.label}
            </LinkReact>
          );
        })}
      </nav>
    );
  }

  // Default variant for other uses
  const items = MENU.filter((item) => item.header === true);
  return (
    <nav className={className} data-testid="main-menu">
      {items.map((item) => (
        <LinkReact
          key={item.label}
          href={item.href}
          className="btn btn-ghost items-center justify-start gap-3 text-lg"
        >
          {item.label}
        </LinkReact>
      ))}
    </nav>
  );
}
