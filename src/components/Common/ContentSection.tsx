import clsx from "clsx";

import Container from "./Container";
import SimpleSection, { type SimpleSectionProps } from "./SimpleSection";

type ContentSectionProps = {
  children?: React.ReactNode;
  text?: string;
  reverse?: boolean;
} & SimpleSectionProps;

function SectionLayout({ children, text, reverse }: ContentSectionProps) {
  // if text is not set, just render inline without a flex
  if (!text) return <div>{children}</div>;
  // otherwise, render the children in it's own flex container
  return (
    <div
      className={clsx(
        "flex flex-col items-center justify-center gap-20 sm:flex-row",
        reverse && "sm:flex-row-reverse",
      )}
    >
      {children}
    </div>
  );
}

export default function ContentSection(props: ContentSectionProps) {
  const { children, text, className = "py-12", ...rest } = props;
  return (
    <Container>
      <SectionLayout {...props}>
        {!!text && children}
        <SimpleSection className={className} {...rest}>
          {!text ? children : <p className="text-lg">{text}</p>}
        </SimpleSection>
      </SectionLayout>
    </Container>
  );
}
