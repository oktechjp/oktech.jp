import type { Entry } from "@/utils/sitemap";

import Container from "../Common/Container";
import Grid from "../Common/Grid";
import SitemapCard from "./SitemapCard";

interface SitemapSectionProps {
  title: string;
  entries: Entry[];
}

export default function SitemapSection({ title, entries }: SitemapSectionProps) {
  if (!entries || entries.length === 0) return null;

  return (
    <Container wide className="flex flex-col gap-8">
      <h3 className="sub-title">{title}</h3>
      <Grid>
        {entries.map((entry) => (
          <div key={`${entry.href || entry.title}-${entry.title}`} className="w-full">
            <SitemapCard entry={entry} />
          </div>
        ))}
      </Grid>
    </Container>
  );
}
