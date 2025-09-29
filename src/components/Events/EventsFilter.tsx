import { LuX } from "react-icons/lu";

import Container from "../Common/Container";
import EventsFilterDropdown from "./EventsFilterDropdown";
import { useEventsFilter } from "./EventsFilterProvider";
import type { EventsOrganizerViews } from "./EventsOrganizer";
import EventsSearchInput from "./EventsSearchInput";
import EventsSortSelector from "./EventsSortSelector";
import { EventsViewModeSelector } from "./EventsViewModeSelector";

interface EventsFilterProps {
  currentView: EventsOrganizerViews;
  availableFilters: {
    topics: string[];
    locations: string[];
  };
}

export function EventsFilter({ availableFilters, currentView }: EventsFilterProps) {
  const { currentFilters, clearAllFilters } = useEventsFilter();

  const hasActiveFilters =
    currentFilters.search || currentFilters.topics.length > 0 || currentFilters.location;

  return (
    <Container wide>
      <div className="flex flex-col gap-6 md:flex-row md:gap-12">
        <div className="join flex w-full">
          {availableFilters.locations.length > 0 && (
            <EventsFilterDropdown
              id="location"
              label="Location"
              options={availableFilters.locations}
              data-testid="location-filter-dropdown"
            />
          )}
          <EventsSearchInput />
          {hasActiveFilters && (
            <button
              type="button"
              className="btn btn-outline join-item"
              onClick={clearAllFilters}
              data-testid="clear-all-filters"
            >
              <LuX className="-ml-1" />
            </button>
          )}
          {/* TODO: Add topics back in */}
          {false && availableFilters.topics.length > 0 && (
            <EventsFilterDropdown
              id="topics"
              label="Topics"
              options={availableFilters.topics}
              data-testid="topics-filter-dropdown"
            />
          )}
        </div>
        <div className="flex items-center justify-between gap-4">
          <EventsSortSelector data-testid="sort-selector" />
          <EventsViewModeSelector currentView={currentView} />
        </div>
      </div>
    </Container>
  );
}
