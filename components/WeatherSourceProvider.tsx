'use client';

import { useState, useEffect, useCallback, ReactNode } from 'react';
import { WeatherSource, SOURCE_META, WeatherSourceContext } from '@/lib/weatherSource';

const STORAGE_KEY = 'golfvedur-weather-source';

export function WeatherSourceProvider({ children }: { children: ReactNode }) {
  const [source, setSourceState] = useState<WeatherSource>('auto');
  const [sheetOpen, setSheetOpen] = useState(false);

  // Hydrate from localStorage after mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as WeatherSource | null;
      if (stored && stored in SOURCE_META) setSourceState(stored);
    } catch {}
  }, []);

  const setSource = useCallback((s: WeatherSource) => {
    setSourceState(s);
    try { localStorage.setItem(STORAGE_KEY, s); } catch {}
  }, []);

  const openPicker = useCallback(() => setSheetOpen(true), []);

  return (
    <WeatherSourceContext.Provider value={{ source, setSource, openPicker }}>
      {children}

      {/* Source picker bottom sheet */}
      {sheetOpen && (
        <div className="fixed inset-0 z-[100] flex flex-col justify-end mx-auto max-w-md w-full">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setSheetOpen(false)}
          />

          {/* Sheet */}
          <div className="relative bg-surface rounded-t-3xl shadow-2xl">
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 bg-outline-variant rounded-full" />
            </div>

            {/* Header */}
            <div className="px-5 pt-2 pb-4 flex items-center justify-between border-b border-surface-container">
              <div>
                <h3 className="font-headline text-lg font-bold text-on-surface">Weather Source</h3>
                <p className="text-outline text-xs mt-0.5">Choose which forecast data to use</p>
              </div>
              <button
                onClick={() => setSheetOpen(false)}
                className="p-2 rounded-full bg-surface-container text-outline"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Options */}
            <div className="px-4 py-4 space-y-3 pb-10">
              {(Object.entries(SOURCE_META) as [WeatherSource, typeof SOURCE_META[WeatherSource]][]).map(([key, meta]) => {
                const active = source === key;
                return (
                  <button
                    key={key}
                    onClick={() => { setSource(key); setSheetOpen(false); }}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all text-left ${
                      active
                        ? 'bg-primary-container border-primary/40'
                        : 'bg-surface-container-low border-transparent active:bg-surface-container'
                    }`}
                  >
                    {/* Icon */}
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      active ? 'bg-primary/20' : 'bg-surface-container-high'
                    }`}>
                      <span
                        className={`material-symbols-outlined text-[20px] ${active ? 'text-primary' : 'text-outline'}`}
                        style={{ fontVariationSettings: `'FILL' ${active ? 1 : 0}, 'wght' 400, 'GRAD' 0, 'opsz' 24` }}
                      >
                        {meta.icon}
                      </span>
                    </div>

                    {/* Label */}
                    <div className="flex-1 min-w-0">
                      <p className={`font-headline font-bold ${active ? 'text-primary' : 'text-on-surface'}`}>
                        {meta.label}
                      </p>
                      <p className="text-outline text-xs mt-0.5 truncate">{meta.subtitle}</p>
                    </div>

                    {/* Checkmark */}
                    {active && (
                      <span className="material-symbols-outlined text-primary text-[20px] flex-shrink-0"
                        style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>
                        check_circle
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </WeatherSourceContext.Provider>
  );
}
