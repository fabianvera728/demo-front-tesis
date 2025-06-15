import { useState, useCallback } from 'react';

export interface PaginationState {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  offset: number;
}

export interface PaginationActions {
  goToPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  setPageSize: (size: number) => void;
  setTotalItems: (count: number) => void;
}

export interface UsePaginationReturn extends PaginationState, PaginationActions {}

export const usePagination = (
  initialPageSize: number = 10,
  initialPage: number = 1,
  initialTotalItems: number = 0
): UsePaginationReturn => {
  const [pagination, setPagination] = useState<PaginationState>({
    currentPage: initialPage,
    pageSize: initialPageSize,
    totalItems: initialTotalItems,
    totalPages: Math.max(1, Math.ceil(initialTotalItems / initialPageSize)),
    offset: (initialPage - 1) * initialPageSize
  });

  const goToPage = useCallback((page: number) => {
    setPagination(prev => {
      const newPage = Math.max(1, Math.min(page, prev.totalPages));
      return {
        ...prev,
        currentPage: newPage,
        offset: (newPage - 1) * prev.pageSize
      };
    });
  }, []);

  const nextPage = useCallback(() => {
    setPagination(prev => {
      if (prev.currentPage >= prev.totalPages) return prev;
      const newPage = prev.currentPage + 1;
      return {
        ...prev,
        currentPage: newPage,
        offset: (newPage - 1) * prev.pageSize
      };
    });
  }, []);

  const prevPage = useCallback(() => {
    setPagination(prev => {
      if (prev.currentPage <= 1) return prev;
      const newPage = prev.currentPage - 1;
      return {
        ...prev,
        currentPage: newPage,
        offset: (newPage - 1) * prev.pageSize
      };
    });
  }, []);

  const setPageSize = useCallback((size: number) => {
    setPagination(prev => {
      const newPageSize = Math.max(1, size);
      const newTotalPages = Math.max(1, Math.ceil(prev.totalItems / newPageSize));
      const newPage = Math.min(prev.currentPage, newTotalPages);
      return {
        ...prev,
        pageSize: newPageSize,
        currentPage: newPage,
        totalPages: newTotalPages,
        offset: (newPage - 1) * newPageSize
      };
    });
  }, []);

  const setTotalItems = useCallback((count: number) => {
    setPagination(prev => {
      const newTotalItems = Math.max(0, count);
      const newTotalPages = Math.max(1, Math.ceil(newTotalItems / prev.pageSize));
      const newPage = Math.min(prev.currentPage, newTotalPages);
      return {
        ...prev,
        totalItems: newTotalItems,
        totalPages: newTotalPages,
        currentPage: newPage,
        offset: (newPage - 1) * prev.pageSize
      };
    });
  }, []);

  return {
    ...pagination,
    goToPage,
    nextPage,
    prevPage,
    setPageSize,
    setTotalItems
  };
}; 