import Container from "./Container";
import Grid from "./Grid";

export default function SubSection({
  title,
  children,
  grid,
}: {
  title: string;
  children: React.ReactNode;
  grid?: boolean;
}) {
  return (
    <Container wide>
      <h2 className="sub-title mb-12">{title}</h2>
      {grid ? <Grid>{children}</Grid> : children}
    </Container>
  );
}
