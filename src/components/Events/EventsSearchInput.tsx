import { type ChangeEvent, useCallback, useEffect, useRef, useState } from "react";

import { LuSearch, LuX } from "react-icons/lu";

import { useEventsFilter } from "./EventsFilterProvider";

export default function EventsSearchInput() {
  const { currentFilters, updateFilter, clearFilter } = useEventsFilter();
  const [localValue, setLocalValue] = useState(currentFilters.search);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setLocalValue(currentFilters.search);
  }, [currentFilters.search]);

  const handleInputChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setLocalValue(value);

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(() => {
        updateFilter("search", value);
      }, 300);
    },
    [updateFilter],
  );

  const handleClear = useCallback(() => {
    setLocalValue("");
    clearFilter("search");
  }, [clearFilter]);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return (
    <label className="input input-bordered join-item flex w-full items-center gap-2">
      <LuSearch className="h-4 w-4 opacity-70" />
      <input
        type="search"
        className="grow"
        placeholder="Search events..."
        value={localValue}
        onChange={handleInputChange}
        data-testid="events-search-input"
      />
      {localValue && (
        <button
          type="button"
          className="btn btn-ghost btn-xs"
          onClick={handleClear}
          aria-label="Clear search"
        >
          <LuX className="h-4 w-4" />
        </button>
      )}
    </label>
  );
}
