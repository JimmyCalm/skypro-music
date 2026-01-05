'use client';

import { useState, useEffect, useCallback } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

interface FilterState {
  authors: string[];
  years: string[];
  genres: string[];
  searchQuery: string;
}

export const useFilters = (initialState?: Partial<FilterState>) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState<FilterState>({
    authors: [],
    years: [],
    genres: [],
    searchQuery: '',
    ...initialState,
  });

  const [activeFilter, setActiveFilter] = useState<
    'author' | 'year' | 'genre' | null
  >(null);

  // Сбрасываем фильтры при изменении пути
  useEffect(() => {
    setFilters({
      authors: [],
      years: [],
      genres: [],
      searchQuery: '',
    });
    setActiveFilter(null);
  }, [pathname]);

  // Восстанавливаем фильтры из URL при необходимости
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());

    const authors = params.get('authors');
    const years = params.get('years');
    const genres = params.get('genres');
    const search = params.get('search');

    if (authors || years || genres || search) {
      setFilters({
        authors: authors ? authors.split(',') : [],
        years: years ? years.split(',') : [],
        genres: genres ? genres.split(',') : [],
        searchQuery: search || '',
      });
    }
  }, [searchParams]);

  const updateFilters = useCallback((updates: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...updates }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({
      authors: [],
      years: [],
      genres: [],
      searchQuery: '',
    });
    setActiveFilter(null);
  }, []);

  const handleFilterToggle = (filterType: 'author' | 'year' | 'genre') => {
    setActiveFilter(activeFilter === filterType ? null : filterType);
  };

  const hasActiveFilters = () => {
    return (
      filters.authors.length > 0 ||
      filters.years.length > 0 ||
      filters.genres.length > 0 ||
      filters.searchQuery.trim() !== ''
    );
  };

  return {
    filters,
    activeFilter,
    updateFilters,
    resetFilters,
    handleFilterToggle,
    hasActiveFilters: hasActiveFilters(),
    setActiveFilter,
  };
};
