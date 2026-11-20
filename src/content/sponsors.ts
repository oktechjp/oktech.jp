import type { Component } from "react";

import { defineCollection, getCollection, type SchemaContext } from "astro:content";
import { z } from "astro:schema";
import type { ImageMetadata } from "astro";

export type SponsorPeriod = {
  start: Date;
  days: number;
};

export type Sponsor = {
  id: string;
  name: string;
  url: string;
  file: string;
  periods: SponsorPeriod[];
  onlight: ImageMetadata;
  ondark: ImageMetadata;
};

export async function sponsorsLoader(): Promise<Array<Sponsor>> {
  const sponsorFiles = import.meta.glob("/content/sponsors/*/sponsor.yml", {
    import: "default",
    eager: true,
  });
  const ondarkFiles = Object.entries(
    import.meta.glob("/content/sponsors/*/ondark.{png,svg}", {
      import: "default",
      eager: true,
    }),
  );
  const onlightFiles = Object.entries(
    import.meta.glob("/content/sponsors/*/onlight.{png,svg}", {
      import: "default",
      eager: true,
    }),
  );

  return Object.entries(sponsorFiles).map(([file, content]) => {
    const { name, url, periods } = content as {
      name: string;
      url: string;
      periods: Array<{ start: Date; days: number }>;
    };
    const parts = /(.*\/sponsors\/([^\/]+))\/sponsor.yml/g.exec(file)!;
    const id = parts[2];
    const prefix = parts[1];
    const onlight = onlightFiles.filter(([key]) => key.startsWith(prefix))[0]?.[0] as unknown as ImageMetadata;
    const ondark = ondarkFiles.filter(([key]) => key.startsWith(prefix))[0]?.[0] as unknown as ImageMetadata;
    return {
      id,
      name,
      url,
      periods,
      file,
      onlight,
      ondark,
    };
  });
}

export const sponsorsCollection = defineCollection({
  loader: sponsorsLoader,
  schema: sponsorsSchema,
});

function sponsorsSchema({ image }: SchemaContext) {
  return z.object({
    id: z.string(),
    name: z.string(),
    url: z.string().url(),
    periods: z.array(
      z.object({
        start: z.date(),
        days: z.number().positive().int(),
      }),
    ),
    onlight: image(),
    ondark: image(),
  });
}

export async function getSponsors(now = Date.now()) {
  return (await getCollection("sponsors")).filter(({ data }) => {
    for (const period of data.periods) {
      const start = period.start.getTime();
      if (start > now) {
        return false;
      }
      const end = start + period.days * 24 * 60 * 60 * 1000;
      if (end < now) {
        return false;
      }
      return true;
    }
  });
}
