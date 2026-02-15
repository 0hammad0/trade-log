"use client";

import { useEffect, useRef, useCallback } from "react";
import { LoadingSpinner } from "./loading-spinner";

interface ScrollLoaderProps {
  onLoadMore: () => void;
  hasMore: boolean;
  loading: boolean;
  threshold?: number;
}

export function ScrollLoader({
  onLoadMore,
  hasMore,
  loading,
  threshold = 100,
}: ScrollLoaderProps) {
  const observerRef = useRef<HTMLDivElement>(null);

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (entry.isIntersecting && hasMore && !loading) {
        onLoadMore();
      }
    },
    [hasMore, loading, onLoadMore]
  );

  useEffect(() => {
    const element = observerRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(handleObserver, {
      rootMargin: `${threshold}px`,
    });

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [handleObserver, threshold]);

  return (
    <div ref={observerRef} className="flex justify-center py-4">
      {loading && <LoadingSpinner size="md" />}
      {!hasMore && !loading && (
        <p className="text-sm text-muted-foreground">No more items to load</p>
      )}
    </div>
  );
}
