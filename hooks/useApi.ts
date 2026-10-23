'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

interface Result<T> {
  key: string;
  data?: T;
  error?: Error;
}

/**
 * Tiny data-fetching hook.
 * - `key` identifies the request; when it changes the fetcher runs again.
 * - By default the previous data stays visible while a new request loads (`loading` is true).
 */
export function useApi<T>(fetcher: () => Promise<T>, key: string, options: { keepPrevious?: boolean } = {}) {
  const keepPrevious = options.keepPrevious ?? true;
  const fetcherRef = useRef(fetcher);
  useEffect(() => {
    fetcherRef.current = fetcher;
  });

  const [tick, setTick] = useState(0);
  const [result, setResult] = useState<Result<T> | null>(null);
  const fullKey = `${key}#${tick}`;

  useEffect(() => {
    let cancelled = false;
    fetcherRef.current().then(
      (data) => {
        if (!cancelled) setResult({ key: fullKey, data });
      },
      (error: unknown) => {
        if (!cancelled) setResult({ key: fullKey, error: error instanceof Error ? error : new Error(String(error)) });
      },
    );
    return () => {
      cancelled = true;
    };
  }, [fullKey]);

  const settled = result !== null && result.key === fullKey;
  const reload = useCallback(() => setTick((t) => t + 1), []);

  return {
    data: settled ? result.data : keepPrevious ? result?.data : undefined,
    error: settled ? result.error : undefined,
    loading: !settled,
    reload,
  };
}
