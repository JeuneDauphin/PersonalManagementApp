// Custom hooks for data fetching and state management
import { useState, useEffect } from 'react';
import { apiService } from '../api/Api';
import {
  Task,
  Project,
  Contact,
  Lesson,
  Test,
  CalendarEvent,
  Notification
} from '../interfaces/interfaces';
import { mockTasks, mockEvents, mockProjects } from '../data/mockData';

// Generic hook for data fetching
export function useApi<T>(
  apiCall: () => Promise<T[]>,
  dependencies: any[] = [],
  mockData?: T[]
) {
  const [data, setData] = useState<T[]>(mockData || []);
  const [loading, setLoading] = useState(false); // Start with mock data loaded
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (mockData) {
      // Use mock data immediately
      setData(mockData);
      setLoading(false);
      return;
    }

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
    if (mockData) {
      // For mock data, just reset to mock data
      setData(mockData);
      return;
    }

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
  return useApi(() => apiService.getTasks(), [], mockTasks);
}

export function useProjects() {
  return useApi(() => apiService.getProjects(), [], mockProjects);
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

export function useEvents() {
  return useApi(() => apiService.getEvents(), [], mockEvents);
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
