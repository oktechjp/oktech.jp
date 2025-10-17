import { DEV_MODE } from "@/constants";
import { formatDate } from "@/utils/formatDate";

export default function BuiltWithCommit() {
  const env = import.meta.env;
  const commitHash = env.PUBLIC_SOURCE_COMMIT_HASH;
  const commitUrl = env.PUBLIC_SOURCE_COMMIT_URL;

  const timestamp = DEV_MODE ? "Local dev" : formatDate(new Date(), "datetime");
  const href = commitUrl ?? "#";

  const tooltipParts = [timestamp, commitHash?.substring(0, 7)].filter(Boolean);
  const tooltip = tooltipParts.join(" · ");

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="link text-link tooltip md:tooltip-left font-mono"
      data-tip={tooltip}
    >
      Built with <code>{`<3`}</code>
    </a>
  );
}
