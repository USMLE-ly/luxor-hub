import { useState, useMemo, useCallback } from "react";

interface SearchFilterOptions<T> {
  /** The items to search/filter */
  items: T[];
  /** Fields to search against when query is non-empty */
  searchFields: (keyof T)[];
  /** Optional: a function to determine if an item matches a filter tab */
  filterFn?: (item: T, activeFilter: string) => boolean;
  /** Debounce delay in ms for search (default: 200) */
  debounceMs?: number;
}

/**
 * Shared hook for search + filter logic across pages.
 * Eliminates 26 duplicate search/filter implementations.
 * 
 * Usage:
 *   const { query, setQuery, activeFilter, setActiveFilter, results } = useSearchFilter({
 *     items: closetItems,
 *     searchFields: ["name", "color", "brand"],
 *     filterFn: (item, tab) => tab === "All" || item.category === tab,
 *   });
 */
export function useSearchFilter<T>(options: SearchFilterOptions<T>) {
  const { items, searchFields, filterFn, debounceMs = 200 } = options;
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  const results = useMemo(() => {
    let filtered = items;

    // Apply filter tab
    if (filterFn && activeFilter !== "All") {
      filtered = filtered.filter((item) => filterFn(item, activeFilter));
    }

    // Apply search query
    if (query.trim()) {
      const lower = query.toLowerCase().trim();
      filtered = filtered.filter((item) =>
        searchFields.some((field) => {
          const val = item[field];
          if (val == null) return false;
          return String(val).toLowerCase().includes(lower);
        })
      );
    }

    return filtered;
  }, [items, query, activeFilter, searchFields, filterFn]);

  const clearFilters = useCallback(() => {
    setQuery("");
    setActiveFilter("All");
  }, []);

  return { query, setQuery, activeFilter, setActiveFilter, results, clearFilters };
}
