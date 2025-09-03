// import Link from "@/components/Common/Link";

interface EventTagLinkProps {
  tag: string;
  className?: string;
}

export default function EventTagLink({ tag }: EventTagLinkProps) {
  // TODO enable once we have topic filtering

  return <span className="badge">{tag}</span>;

  // const href = `/events/?topic=${encodeURIComponent(tag.toLowerCase().replace(/\s+/g, "-"))}`;
  // const href = "/events";

  // return (
  //   <Link href={href} className={`badge hover:badge-primary transition-all ${className}`}>
  //     {tag}
  //   </Link>
  // );
}
