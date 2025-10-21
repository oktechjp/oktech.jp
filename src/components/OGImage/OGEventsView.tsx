import { twj } from "tw-to-css";

import { themeColorsHex } from "@/utils/og/theme-colors";

import OGLayout from "./OGLayout";

interface OGEventsViewProps {
  title: string;
  subtitle?: string;
  description?: string;
}

export default function OGEventsView({ title, subtitle, description }: OGEventsViewProps) {
  const colors = themeColorsHex.light;

  return (
    <OGLayout title={title} subtitle={subtitle}>
      <div style={twj("flex flex-col gap-4")}>
        {description && (
          <p
            style={{
              ...twj("text-xl leading-relaxed"),
              color: colors.baseContent,
              opacity: 0.7,
            }}
          >
            {description}
          </p>
        )}
      </div>
    </OGLayout>
  );
}
