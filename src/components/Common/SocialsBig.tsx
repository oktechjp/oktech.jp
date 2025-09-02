import BlobIconGrid, { type BlobIconGridItem } from "@/components/Common/BlobIconGrid";
import { SOCIALS } from "@/constants";

export default function SocialsBig() {
  const items: BlobIconGridItem[] = SOCIALS.map((social) => ({
    type: "type" in social && social.type === "calendar" ? "calendar" : ("a" as const),
    title: social.label,
    description: social.description,
    icon: social.icon,
    href: social.href,
    target: "_blank",
    rel: "noopener noreferrer",
  }));

  return <BlobIconGrid items={items} />;
}
