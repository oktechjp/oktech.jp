import { LuArrowDownWideNarrow, LuArrowUpWideNarrow } from "react-icons/lu";

import { useEventsFilter } from "./EventsFilterProvider";

interface Props {
  "data-testid"?: string;
}

export default function EventsSortSelector({ "data-testid": dataTestId }: Props = {}) {
  const { currentFilters, updateFilter } = useEventsFilter();

  const toggleSort = () => {
    const newSort = currentFilters.sort === "date-desc" ? "date-asc" : "date-desc";
    updateFilter("sort", newSort);
  };

  const isNewestFirst = currentFilters.sort === "date-desc";

  return (
    <button
      type="button"
      className="btn btn-outline"
      onClick={toggleSort}
      data-testid={dataTestId}
      aria-label={`Sort by ${isNewestFirst ? "oldest" : "newest"} first`}
      title={isNewestFirst ? "Newest First" : "Oldest First"}
    >
      <span>{isNewestFirst ? "Newest" : "Oldest"}</span>
      {isNewestFirst ? (
        <LuArrowDownWideNarrow className="h-4 w-4" />
      ) : (
        <LuArrowUpWideNarrow className="h-4 w-4" />
      )}
    </button>
  );
}
