'use client';

import { createContext, useContext } from 'react';

export type WeatherSource = 'auto' | 'metno' | 'vedur';

export const SOURCE_META: Record<WeatherSource, { label: string; subtitle: string; icon: string }> = {
  auto:   { label: 'Auto',    subtitle: 'met.no primary · vedur.is fallback',     icon: 'auto_awesome' },
  metno:  { label: 'met.no',  subtitle: 'Norwegian Met · HARMONIE-AROME Arctic',  icon: 'public' },
  vedur:  { label: 'vedur.is', subtitle: 'Icelandic Met Office · always reachable', icon: 'flag' },
};

export interface WeatherSourceCtx {
  source: WeatherSource;
  setSource: (s: WeatherSource) => void;
  openPicker: () => void;
}

export const WeatherSourceContext = createContext<WeatherSourceCtx>({
  source: 'auto',
  setSource: () => {},
  openPicker: () => {},
});

export function useWeatherSource() {
  return useContext(WeatherSourceContext);
}
