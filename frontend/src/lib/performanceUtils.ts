/**
 * Simple Performance Utilities for Shift-Planner
 *
 * Lightweight optimizations without overengineering
 */

import { useCallback, useMemo, useRef, useState, useEffect } from "react";

/**
 * Shallow equality check for objects
 */
export function shallowEqual<T extends Record<string, unknown>>(
  obj1: T,
  obj2: T
): boolean {
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) {
    return false;
  }

  for (const key of keys1) {
    if (obj1[key] !== obj2[key]) {
      return false;
    }
  }

  return true;
}

/**
 * Memoize callback with shallow comparison of dependencies
 */
export function useShallowCallback<T extends (...args: unknown[]) => unknown>(
  callback: T,
  deps: unknown[]
): T {
  const depsRef = useRef<unknown[]>(deps);
  const callbackRef = useRef<T>(callback);

  // Update only if dependencies actually changed
  if (!deps.every((dep, index) => dep === depsRef.current[index])) {
    depsRef.current = deps;
    callbackRef.current = callback;
  }

  return useCallback((...args: Parameters<T>) => {
    return callbackRef.current(...args);
  }, []) as T;
}

/**
 * Simple debounce hook for input handling
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Memoize table row data to prevent unnecessary re-renders
 */
export function useTableRowMemo<T>(
  data: T[],
  keyExtractor: (item: T, index: number) => string
) {
  return useMemo(() => {
    return data.map((item, index) => ({
      key: keyExtractor(item, index),
      data: item,
      index,
    }));
  }, [data, keyExtractor]);
}

/**
 * Create stable click handlers for table cells
 */
export function useStableCellHandler<T>(
  handler: (employee: string, date: string, ...args: T[]) => void
) {
  return useCallback(
    (employee: string, date: string) => {
      return (...args: T[]) => handler(employee, date, ...args);
    },
    [handler]
  );
}
