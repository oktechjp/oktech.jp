import Container from "./Container";

export default function SubSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Container wide>
      <h2 className="sub-title mb-12">{title}</h2>
      {children}
    </Container>
  );
}
