import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import type Fuse from "fuse.js";

import type { EventEnriched, ProcessedVenue } from "@/content";
import type { ResponsiveImageData } from "@/utils/responsiveImage";

export interface EventItem {
  id: string;
  title: string;
  date: string;
  topics?: string[];
  location?: string;
  venue?: ProcessedVenue;
  venueName?: string;
  poster?: ResponsiveImageData;
  slug: string;
  hasGallery?: boolean;
}

export interface EventFilters {
  search: string;
  topics: string[];
  location: string;
  sort: "date-desc" | "date-asc";
}

interface EventFilterContextType {
  items: EventItem[];
  currentFilters: EventFilters;
  availableFilters: {
    topics: string[];
    locations: string[];
  };
  sortOptions: Array<{ value: string; label: string }>;
  filteredItems: EventItem[];
  updateFilter: (filterType: keyof EventFilters, value: EventFilters[keyof EventFilters]) => void;
  clearFilter: (filterType: keyof EventFilters) => void;
  clearAllFilters: () => void;
  removeFilterValue: (filterType: string, value: string) => void;
}

const EventFilterContext = createContext<EventFilterContextType | undefined>(undefined);

export const useEventsFilter = () => {
  const context = useContext(EventFilterContext);
  if (!context) {
    throw new Error("useEventsFilter must be used within EventFilterProvider");
  }
  return context;
};

interface EventFilterProviderProps {
  children: ReactNode;
  events: EventEnriched[];
  onFiltersChange?: (filters: EventFilters, filteredItems: EventItem[]) => void;
}

export function EventFilterProvider({
  children,
  events,
  onFiltersChange,
}: EventFilterProviderProps) {
  // Transform events to items and extract filters
  const { items, availableFilters, sortOptions } = useMemo(() => {
    const allTopics = new Set<string>();
    const allLocations = new Set<string>();

    const eventItems: EventItem[] = events.map((event) => {
      event.data.topics?.forEach((topic) => allTopics.add(topic));

      const location = ["osaka", "kyoto"].includes(event.venue?.city || "")
        ? (event.venue?.city as string)
        : "other";

      allLocations.add(location);

      return {
        id: event.id,
        title: event.data.title,
        date: event.data.dateTime.toISOString(),
        topics: event.data.topics || [],
        location,
        venue: event.venue,
        venueName: event.venue?.title || "",
        poster: event.data.cover,
        slug: event.id,
        hasGallery: event.galleryImages && event.galleryImages.length > 0,
      };
    });

    return {
      items: eventItems,
      availableFilters: {
        topics: Array.from(allTopics).sort(),
        locations: Array.from(allLocations).sort(),
      },
      sortOptions: [
        { value: "date-desc", label: "Newest First" },
        { value: "date-asc", label: "Oldest First" },
      ],
    };
  }, [events]);
  const [currentFilters, setCurrentFilters] = useState<EventFilters>(() => {
    // Only parse URL params on client side
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      return {
        search: urlParams.get("search") || "",
        topics: urlParams.get("topics")?.split(",").filter(Boolean) || [],
        location: urlParams.get("location") || "",
        sort: (urlParams.get("sort") as "date-desc" | "date-asc") || "date-desc",
      };
    }

    // Default filters for SSR
    return {
      search: "",
      topics: [],
      location: "",
      sort: "date-desc",
    };
  });

  const fuseRef = useRef<Fuse<EventItem> | null>(null);

  const initializeFuse = useCallback(async () => {
    if (!fuseRef.current) {
      const { default: Fuse } = await import("fuse.js");
      fuseRef.current = new Fuse(items, {
        keys: [
          { name: "title", weight: 2 },
          { name: "topics", weight: 1.5 },
          { name: "venueName", weight: 1.5 },
          { name: "location", weight: 0.5 },
        ],
        threshold: 0.4,
        includeScore: true,
        ignoreLocation: true,
        findAllMatches: true,
        minMatchCharLength: 2,
      });
    }
    return fuseRef.current;
  }, [items]);

  const sortItems = useCallback(
    (itemsToSort: EventItem[]): EventItem[] => {
      const sorted = [...itemsToSort];

      if (currentFilters.sort === "date-asc") {
        return sorted.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      } else {
        return sorted.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      }
    },
    [currentFilters.sort],
  );

  const getFilteredItems = useCallback(async (): Promise<EventItem[]> => {
    let filtered = [...items];

    if (currentFilters.search) {
      const fuse = await initializeFuse();
      const results = fuse.search(currentFilters.search);
      filtered = results.map((result) => result.item);
    }

    if (currentFilters.topics.length > 0) {
      filtered = filtered.filter((item) =>
        item.topics?.some((topic) => currentFilters.topics.includes(topic)),
      );
    }

    if (currentFilters.location) {
      filtered = filtered.filter(
        (item) => item.location?.toLowerCase() === currentFilters.location.toLowerCase(),
      );
    }

    return sortItems(filtered);
  }, [items, currentFilters, initializeFuse, sortItems]);

  const [filteredItems, setFilteredItems] = useState<EventItem[]>(() => {
    // Initialize with sorted items for SSR/first load
    const sorted = [...items];
    if (currentFilters.sort === "date-asc") {
      return sorted.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    } else {
      return sorted.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }
  });

  useEffect(() => {
    const updateFilteredItems = async () => {
      const filtered = await getFilteredItems();
      setFilteredItems(filtered);
    };
    updateFilteredItems();
  }, [getFilteredItems]);
  const isInitialMountRef = useRef(true);

  const updateURL = useCallback((filters: EventFilters) => {
    if (typeof window === "undefined") return; // Skip on SSR

    // Updating URL with filters
    const url = new URL(window.location.href);

    // Clear only filter-related params, preserve others like 'view'
    url.searchParams.delete("search");
    url.searchParams.delete("topics");
    url.searchParams.delete("location");
    url.searchParams.delete("sort");

    if (filters.search) {
      url.searchParams.set("search", filters.search);
    }
    if (filters.topics.length > 0) {
      url.searchParams.set("topics", filters.topics.join(","));
    }
    if (filters.location) {
      url.searchParams.set("location", filters.location);
    }
    if (filters.sort !== "date-desc") {
      url.searchParams.set("sort", filters.sort);
    }

    // Reason: Astro View Transitions already handle history, so we should only use replaceState
    // to avoid duplicate history entries that cause the back button issue
    window.history.replaceState(filters, "", url.toString());
  }, []);

  useEffect(() => {
    // Effect triggered for filter changes
    if (onFiltersChange) {
      onFiltersChange(currentFilters, filteredItems);
    }
    // Always update URL but use replaceState on initial mount
    updateURL(currentFilters);

    // Mark initial mount as complete after first run
    if (isInitialMountRef.current) {
      isInitialMountRef.current = false;
    }
  }, [currentFilters, filteredItems, onFiltersChange, updateURL]);

  const updateFilter = useCallback(
    (filterType: keyof EventFilters, value: EventFilters[keyof EventFilters]) => {
      setCurrentFilters((prev) => {
        const newFilters = { ...prev };

        if (filterType === "search") {
          newFilters.search = value as string;
        } else if (filterType === "sort") {
          newFilters.sort = value as "date-desc" | "date-asc";
        } else if (filterType === "topics") {
          if (Array.isArray(value)) {
            newFilters.topics = value;
          } else {
            if (newFilters.topics.includes(value)) {
              newFilters.topics = newFilters.topics.filter((t) => t !== value);
            } else {
              newFilters.topics = [...newFilters.topics, value];
            }
          }
        } else if (filterType === "location") {
          newFilters.location = value as string;
        }

        return newFilters;
      });
    },
    [],
  );

  const clearFilter = useCallback((filterType: keyof EventFilters) => {
    setCurrentFilters((prev) => ({
      ...prev,
      [filterType]: filterType === "topics" ? [] : filterType === "sort" ? "date-desc" : "",
    }));
  }, []);

  const clearAllFilters = useCallback(() => {
    setCurrentFilters({
      search: "",
      topics: [],
      location: "",
      sort: "date-desc",
    });
  }, []);

  const removeFilterValue = useCallback((filterType: string, value: string) => {
    setCurrentFilters((prev) => {
      const newFilters = { ...prev };

      if (filterType === "search") {
        newFilters.search = "";
      } else if (filterType === "topic") {
        newFilters.topics = newFilters.topics.filter((t) => t !== value);
      } else if (filterType === "location") {
        newFilters.location = "";
      }

      return newFilters;
    });
  }, []);

  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      if (e.state) {
        setCurrentFilters(e.state);
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const value: EventFilterContextType = {
    items,
    currentFilters,
    availableFilters,
    sortOptions,
    filteredItems,
    updateFilter,
    clearFilter,
    clearAllFilters,
    removeFilterValue,
  };

  return <EventFilterContext.Provider value={value}>{children}</EventFilterContext.Provider>;
}
