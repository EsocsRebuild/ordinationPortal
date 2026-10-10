'use client';

import { useState, useEffect, useCallback } from 'react';

export function useDraftStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue;
    try {
      const saved = localStorage.getItem(`esocs_draft_${key}`);
      return saved ? JSON.parse(saved) : initialValue;
    } catch (e) {
      return initialValue;
    }
  });

  const [hasDraft, setHasDraft] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const saved = localStorage.getItem(`esocs_draft_${key}`);
      if (saved) {
        setHasDraft(true);
      }
    } catch (e) {}
  }, [key]);

  const saveDraft = useCallback(
    (newValue: T | ((prev: T) => T)) => {
      setValue((current) => {
        const resolved = typeof newValue === 'function' ? (newValue as any)(current) : newValue;
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem(`esocs_draft_${key}`, JSON.stringify(resolved));
            setHasDraft(true);
          } catch (e) {}
        }
        return resolved;
      });
    },
    [key]
  );

  const clearDraft = useCallback(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(`esocs_draft_${key}`);
        setHasDraft(false);
      } catch (e) {}
    }
  }, [key]);

  return { value, setValue: saveDraft, clearDraft, hasDraft };
}

