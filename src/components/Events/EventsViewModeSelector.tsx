import { useMemo } from "react";

import { LuGrid3X3, LuImage, LuList } from "react-icons/lu";

import Link from "@/components/Common/Link";

import { useEventsFilter } from "./EventsFilterProvider";

interface EventsViewModeSelectorProps {
  currentView: string;
}

export function EventsViewModeSelector({ currentView }: EventsViewModeSelectorProps) {
  const { currentFilters } = useEventsFilter();

  const views = useMemo(() => {
    // Build query string from current filters
    const params = new URLSearchParams();

    if (currentFilters.search) {
      params.set("search", currentFilters.search);
    }
    if (currentFilters.topics.length > 0) {
      params.set("topics", currentFilters.topics.join(","));
    }
    if (currentFilters.location) {
      params.set("location", currentFilters.location);
    }
    if (currentFilters.sort !== "date-desc") {
      params.set("sort", currentFilters.sort);
    }

    const queryString = params.toString();
    const query = queryString ? `?${queryString}` : "";

    return [
      { value: "grid", label: "Grid", icon: LuGrid3X3, href: `/events${query}` },
      {
        value: "compact",
        label: "List",
        icon: LuList,
        href: `/events/list${query}`,
      },
      { value: "album", label: "Album", icon: LuImage, href: `/events/album${query}` },
    ];
  }, [currentFilters]);

  return (
    <>
      {views.map((view) => {
        const Icon = view.icon;
        return (
          <Link
            key={view.value}
            href={view.href}
            className={`join-item btn ${currentView === view.value ? "btn-accent" : ""}`}
            data-view={view.value}
            data-testid={`view-mode-${view.value}`}
            aria-label={view.label}
            data-astro-prefetch // TODO disable if it's too expensive
          >
            <Icon className="h-4 w-4" />
            {view.label}
          </Link>
        );
      })}
    </>
  );
}
