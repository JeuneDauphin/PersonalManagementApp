// Custom hooks for data fetching and state management
import { useState, useEffect } from 'react';
import { apiService } from '../api/Api';

// Generic hook for data fetching
export function useApi<T>(
  apiCall: () => Promise<T[]>,
  dependencies: any[] = []
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await apiCall();
        setData(result);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, dependencies);

  const refresh = async () => {
    try {
      setLoading(true);
      const result = await apiCall();
      setData(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, refresh };
}

// Specific hooks for each entity
export function useTasks() {
  return useApi(() => apiService.getTasks(), []);
}

export function useProjects() {
  return useApi(() => apiService.getProjects(), []);
}

export function useEvents() {
  return useApi(() => apiService.getEvents(), []);
}

export function useContacts() {
  return useApi(() => apiService.getContacts(), []);
}

export function useLessons() {
  return useApi(() => apiService.getLessons(), []);
}

export function useTests() {
  return useApi(() => apiService.getTests(), []);
}

export function useNotifications() {
  return useApi(() => apiService.getNotifications(), []);
}

// Hook for local storage
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  };

  return [storedValue, setValue] as const;
}

// Hook for filtering and sorting
export function useFilter<T>(
  data: T[],
  filterFn: (item: T, searchTerm: string) => boolean
) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState<keyof T | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const filteredData = data.filter(item =>
    searchTerm === '' || filterFn(item, searchTerm)
  );

  const sortedData = sortKey
    ? [...filteredData].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    })
    : filteredData;

  return {
    filteredData: sortedData,
    searchTerm,
    setSearchTerm,
    sortKey,
    setSortKey,
    sortDirection,
    setSortDirection,
  };
}

// Enhanced hook for filtering with advanced filters and search
export function useAdvancedFilter<T>(
  data: T[],
  searchFn: (item: T, searchTerm: string) => boolean,
  filterFn?: (item: T, filters: Record<string, string[]>) => boolean
) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<Record<string, string[]>>({});
  const [sortKey, setSortKey] = useState<keyof T | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const filteredData = data.filter(item => {
    // Apply search filter
    const matchesSearch = searchTerm === '' || searchFn(item, searchTerm);

    // Apply advanced filters
    const matchesFilters = !filterFn || Object.keys(filters).length === 0 || filterFn(item, filters);

    return matchesSearch && matchesFilters;
  });

  const sortedData = sortKey
    ? [...filteredData].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    })
    : filteredData;

  return {
    filteredData: sortedData,
    searchTerm,
    setSearchTerm,
    filters,
    setFilters,
    sortKey,
    setSortKey,
    sortDirection,
    setSortDirection,
  };
}

// Hook for pagination
export function usePagination<T>(data: T[], itemsPerPage: number = 10) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(data.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = data.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const goToNext = () => goToPage(currentPage + 1);
  const goToPrevious = () => goToPage(currentPage - 1);

  return {
    currentData,
    currentPage,
    totalPages,
    goToPage,
    goToNext,
    goToPrevious,
    hasNext: currentPage < totalPages,
    hasPrevious: currentPage > 1,
  };
}
