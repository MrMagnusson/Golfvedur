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
  // direction is wind_from_direction; add 180° so the arrow points
  // where the wind is blowing TO (direction of travel)
  const toDeg = (direction + 180) % 360;
  return (
    <span
      className={`material-symbols-outlined ${className}`}
      style={{ transform: `rotate(${toDeg}deg)`, display: 'inline-block' }}
    >
      navigation
    </span>
  );
}
