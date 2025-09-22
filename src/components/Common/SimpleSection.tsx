import clsx from "clsx";

import Button from "./Button";
import Container from "./Container";

export type SimpleSectionProps = {
  title: string | React.ReactNode;
  element?: React.ReactNode;
  wide?: boolean;
  grid?: boolean;
  children?: React.ReactNode;
  textAlign?: string;
  subTitle?: string | React.ReactNode;
  className?: string;
  button?: {
    text: string;
    href: string;
    className?: string;
    ariaLabel?: string;
  };
};

export default function SimpleSection({
  title,
  element,
  wide = false,
  grid = false,
  children,
  subTitle,
  button,
}: SimpleSectionProps) {
  return (
    <section className="flex flex-col gap-16">
      <Container className="flex flex-col gap-4">
        <div className={clsx("flex", button ? "justify-between" : "justify-center")}>
          <div className="flex gap-4">
            <h2 className="section-title">{title}</h2>
            {element}
          </div>
          {button && (
            <Button
              href={button.href}
              text={button.text}
              className={button.className || "btn-lg btn-neutral"}
              ariaLabel={button.ariaLabel}
            />
          )}
        </div>
        {subTitle && (
          <div className={clsx("text-base-300", button ? "text-left" : "text-center")}>
            {subTitle}
          </div>
        )}
      </Container>
      {children && (
        <Container wide={wide} grid={grid}>
          {children}
        </Container>
      )}
    </section>
  );
}
