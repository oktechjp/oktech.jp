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
    <>
      <div className="flex flex-col items-center justify-center gap-12">
        <div className="join flex w-full max-w-[40em]">
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
              className="btn btn-secondary join-item"
              onClick={clearAllFilters}
              data-testid="clear-all-filters"
            >
              Clear
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
      </div>
      <div className="bg-base-200 mt-16 pt-16">
        <Container>
          <div className="flex items-center justify-between">
            <div className="join flex items-center">
              <EventsViewModeSelector currentView={currentView} />
            </div>
            <div className="join flex items-center">
              <EventsSortSelector data-testid="sort-selector" />
            </div>
          </div>
        </Container>
      </div>
    </>
  );
}
