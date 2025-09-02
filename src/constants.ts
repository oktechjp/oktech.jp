import type { ComponentType } from "react";

import type { IconType } from "react-icons";
import { FaDiscord, FaGithub, FaLinkedin, FaMeetup } from "react-icons/fa6";
import { LuCalendar, LuFileText, LuHouse, LuInfo, LuMap } from "react-icons/lu";

// Development mode flag - automatically detected based on environment
export const DEV_MODE = process.env.NODE_ENV === "development";

// Maximum width for images (they will be resized if larger during import)
export const MAX_IMAGE_WIDTH = 1920;

const shortName = "OKTech";
const longName = "Technology Meetup Group in Osaka, Kyoto, Kansai";
const name = `${shortName} - ${longName}`;

export const SITE = {
  name,
  shortName,
  longName,
  title: {
    default: name,
    template: "%s - " + name,
  },
} as const;

export const MENU: {
  label: string;
  href: string;
  header?: boolean;
  icon?: IconType;
  footerMajor?: boolean;
  footerMinor?: boolean;
  component?: ComponentType<{ label: string; href: string; icon?: IconType }>;
  target?: string;
}[] = [
  {
    label: "Home",
    href: "/",
    footerMajor: true,
    icon: LuHouse,
  },
  {
    label: "Events",
    href: "/events",
    header: true,
    footerMajor: true,
    icon: LuCalendar,
  },
  {
    label: "About",
    href: "/about",
    header: true,
    footerMajor: true,
    icon: LuInfo,
  },
  {
    label: "Code of Conduct",
    href: "/code-of-conduct",
    icon: LuFileText,
    footerMinor: true,
  },
  {
    label: "Sitemap",
    href: "/sitemap",
    footerMinor: true,
    icon: LuMap,
  },
];

// Unified SEO metadata for all static pages, keyed by path
export const SEO_DATA: Record<
  string,
  {
    title: string; // Page title (without site suffix)
    description: string;
    keywords?: string[];
  }
> = {
  "/": {
    title: "Home",
    description:
      "Join the OKTech Meetup Group - A vibrant community for web developers, designers, and tech enthusiasts in the Kansai region. Monthly events, workshops, and networking opportunities.",
    keywords: [
      "tech meetup",
      "osaka",
      "kyoto",
      "kansai",
      "web development",
      "programming",
      "networking",
      "technology community",
    ],
  },
  "/events": {
    title: "Events",
    description:
      "Browse upcoming and past tech meetup events in Osaka and Kyoto. Join us for talks, workshops, hackathons, and networking opportunities with the Kansai tech community.",
    keywords: [
      "tech events",
      "meetups",
      "workshops",
      "talks",
      "hackathons",
      "networking",
      "osaka events",
      "kyoto events",
    ],
  },
  "/events/list": {
    title: "Events (List View)",
    description:
      "View all tech meetup events in a compact list format. Quick overview of upcoming and past events in Osaka, Kyoto, and the Kansai region.",
    keywords: [
      "events list",
      "tech meetups",
      "event calendar",
      "upcoming events",
      "past events",
      "osaka",
      "kyoto",
    ],
  },
  "/events/album": {
    title: "Photo Album",
    description:
      "Photo gallery from our tech meetup events in Osaka and Kyoto. See the vibrant community in action through event photos and memories.",
    keywords: [
      "photo album",
      "event photos",
      "gallery",
      "community photos",
      "meetup memories",
      "tech events",
    ],
  },
  "/about": {
    title: "About",
    description:
      "Learn about the OKTech Meetup Group. Our mission is to build a thriving tech community through monthly events, workshops, and networking opportunities in Japan's Kansai region.",
    keywords: [
      "about",
      "community",
      "tech meetup",
      "osaka",
      "kyoto",
      "kansai",
      "mission",
      "volunteer",
    ],
  },
  "/sitemap": {
    title: "Sitemap",
    description:
      "Site navigation and structure for the OKTech Meetup Group website. Find all pages, events, and venues organized in one place.",
    keywords: ["sitemap", "navigation", "site structure", "pages", "directory"],
  },
};

export const SOCIALS = [
  {
    icon: FaDiscord,
    href: "/discord",
    label: "Discord",
    description: "Join our server for real-time discussions - most of the action happens here",
  },
  {
    icon: FaMeetup,
    href: "https://www.meetup.com/osaka-web-designers-and-developers-meetup/",
    label: "Meetup",
    description: "RSVP for upcoming events connect IRL",
  },
  {
    icon: FaGithub,
    href: "https://github.com/owddm/owddm.com",
    label: "GitHub",
    description: "Our open-source projects and this website's source code",
  },
  {
    icon: FaLinkedin,
    href: "https://www.linkedin.com/company/owddm-kwddm",
    label: "LinkedIn",
    description: "For the professionals to connect and explore career opportunities",
  },
  {
    icon: LuCalendar,
    href: "#",
    label: "Calendar Subscription",
    description: "Subscribe to our event calendar and RSS feeds",
    type: "calendar" as const,
  },
] as const;
