import { type IconType } from "react-icons";
import { FaGithub, FaYoutube } from "react-icons/fa6";
import {
  LuBook,
  LuCode,
  LuFileText,
  LuGraduationCap,
  LuLink,
  LuPresentation,
  LuVideo,
} from "react-icons/lu";

// Icon presets for common attachment types
const ICON_PRESETS: Record<string, IconType> = {
  slides: LuPresentation,
  presentation: LuPresentation,
  github: FaGithub,
  code: LuCode,
  video: LuVideo,
  youtube: FaYoutube,
  documentation: LuBook,
  docs: LuBook,
  blog: LuFileText,
  article: LuFileText,
  tutorial: LuGraduationCap,
  course: LuGraduationCap,
};

interface EventLinkCardProps {
  link: {
    icon: string;
    title: string;
    description?: string;
    url: string;
  };
}

export default function EventLinkCard({ link }: EventLinkCardProps) {
  // Get icon from presets or use default link icon
  const Icon = ICON_PRESETS[link.icon] || LuLink;

  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      className="card bg-base-100 shadow-xl transition-shadow hover:shadow-2xl"
    >
      <div className="card-body">
        <div className="flex items-start gap-4">
          <div className="text-primary">
            <Icon size={32} />
          </div>
          <div className="flex-1">
            <h3 className="card-title text-lg">{link.title}</h3>
            {link.description && <p className="text-base-content/70 mt-2">{link.description}</p>}
          </div>
        </div>
      </div>
    </a>
  );
}
