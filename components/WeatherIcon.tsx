'use client';

import { getWeatherInfo } from '@/lib/weather';

interface WeatherIconProps {
  code: number;
  className?: string;
  filled?: boolean;
}

export function WeatherIcon({ code, className = '', filled = false }: WeatherIconProps) {
  const { icon } = getWeatherInfo(code);
  const fillSetting = filled ? "'FILL' 1" : "'FILL' 0";

  return (
    <span
      className={`material-symbols-outlined ${className}`}
      style={{ fontVariationSettings: `${fillSetting}, 'wght' 400, 'GRAD' 0, 'opsz' 24` }}
    >
      {icon}
    </span>
  );
}

interface WindArrowProps {
  direction: number;
  className?: string;
}

export function WindArrow({ direction, className = '' }: WindArrowProps) {
  return (
    <span
      className={`material-symbols-outlined ${className}`}
      style={{ transform: `rotate(${direction}deg)`, display: 'inline-block' }}
    >
      navigation
    </span>
  );
}
