'use client';

import Link from 'next/link';
import { CourseWithWeather, PlayabilityStatus } from '@/lib/types';
import { getPlayabilityStatus, getPlayabilityColor, getWeatherInfo } from '@/lib/weather';
import { WeatherIcon } from './WeatherIcon';
import { getCourseImageUrl } from '@/lib/courses';

interface CourseCardProps {
  course: CourseWithWeather;
  variant?: 'grid' | 'list';
}

function PlayabilityChip({ status }: { status: PlayabilityStatus }) {
  const colorClass = getPlayabilityColor(status);
  return (
    <span
      className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md ${colorClass}`}
    >
      {status}
    </span>
  );
}

function SkeletonCard({ variant }: { variant: 'grid' | 'list' }) {
  if (variant === 'list') {
    return (
      <div className="flex items-center gap-4 p-4 bg-surface-container-low rounded-xl animate-pulse">
        <div className="w-20 h-20 rounded-lg skeleton flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 skeleton rounded w-3/4" />
          <div className="h-3 skeleton rounded w-1/2" />
          <div className="h-3 skeleton rounded w-1/3" />
        </div>
        <div className="h-8 w-16 skeleton rounded" />
      </div>
    );
  }
  return (
    <div className="rounded-xl overflow-hidden bg-surface-container-low animate-pulse">
      <div className="h-40 skeleton" />
      <div className="p-5 space-y-3">
        <div className="h-5 skeleton rounded w-2/3" />
        <div className="grid grid-cols-2 gap-3">
          <div className="h-14 skeleton rounded-lg" />
          <div className="h-14 skeleton rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export function CourseCard({ course, variant = 'grid' }: CourseCardProps) {
  const logoUrl = course.logoUrl ?? null;
  const fallbackUrl = getCourseImageUrl(course, 800, 400);

  if (!course.weather) {
    return <SkeletonCard variant={variant} />;
  }

  const { weather } = course;
  const status = getPlayabilityStatus(weather.current);
  const weatherInfo = getWeatherInfo(weather.current.weatherCode);

  if (variant === 'list') {
    return (
      <Link href={`/course/${course.id}`} className="block group animate-fade-in">
        <div className="flex items-center gap-4 p-4 bg-surface-container-low hover:bg-surface-container-high rounded-xl transition-all duration-200">
          {/* Thumbnail */}
          <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 relative bg-[#0d2b1e] flex items-center justify-center">
            {logoUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={logoUrl} alt={`${course.shortName} logo`} className="w-14 h-14 object-contain" />
            ) : (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={fallbackUrl} alt={course.name} className="w-full h-full object-cover grayscale-[0.1] group-hover:grayscale-0 transition-all duration-300" />
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h3 className="font-headline text-base font-bold truncate">{course.shortName}</h3>
              <PlayabilityChip status={status} />
            </div>
            <p className="text-outline text-xs mb-1">{course.location}</p>
            {course.distanceKm !== undefined && (
              <p className="label-meta">{course.distanceKm} km away</p>
            )}
          </div>

          {/* Weather */}
          <div className="flex flex-col items-end gap-1 flex-shrink-0">
            <WeatherIcon code={weather.current.weatherCode} className="text-tertiary text-[20px]" />
            <span className="font-headline text-2xl font-bold">
              {weather.current.temperature}°
            </span>
            <span className="text-[10px] text-outline">{weather.current.windSpeed} m/s</span>
          </div>
        </div>
      </Link>
    );
  }

  // Grid variant (default)
  return (
    <Link href={`/course/${course.id}`} className="block group animate-fade-in">
      <div className="flex flex-col rounded-xl overflow-hidden bg-surface-container-low hover:bg-surface-container-high transition-all duration-300">
        {/* Course image / logo */}
        <div className="h-40 relative overflow-hidden">
          {logoUrl ? (
            <>
              <div className="absolute inset-0 bg-gradient-to-br from-[#0d2b1e] to-[#1a3d2b]" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={logoUrl} alt={`${course.shortName} logo`} className="absolute inset-0 m-auto w-24 h-24 object-contain drop-shadow-lg" style={{ top: 0, left: 0, right: 0, bottom: 0, margin: 'auto' }} />
            </>
          ) : (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={fallbackUrl} alt={course.name} className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-500" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-surface-container-low via-transparent to-transparent" />
          <div className="absolute top-3 right-3">
            <PlayabilityChip status={status} />
          </div>
          <div className="absolute bottom-3 left-3">
            <WeatherIcon
              code={weather.current.weatherCode}
              className="text-tertiary text-[18px]"
              filled
            />
          </div>
        </div>

        {/* Metrics */}
        <div className="p-4 space-y-3">
          <h4 className="font-headline text-lg font-bold tracking-tight">{course.shortName}</h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="glass-panel p-3 rounded-lg flex flex-col">
              <span className="label-meta mb-1">Temperature</span>
              <div className="flex items-baseline gap-0.5">
                <span className="font-headline text-2xl font-semibold">
                  {weather.current.temperature}
                </span>
                <span className="text-primary text-sm">°C</span>
              </div>
            </div>
            <div className="glass-panel p-3 rounded-lg flex flex-col">
              <span className="label-meta mb-1">Wind Speed</span>
              <div className="flex items-baseline gap-0.5">
                <span className="font-headline text-2xl font-semibold">
                  {weather.current.windSpeed}
                </span>
                <span className="text-tertiary text-sm">m/s</span>
              </div>
            </div>
          </div>
          {course.distanceKm !== undefined && (
            <p className="label-meta">{course.distanceKm} km away</p>
          )}
          {weatherInfo.label && (
            <p className="text-on-surface-variant text-xs">{weatherInfo.label}</p>
          )}
        </div>
      </div>
    </Link>
  );
}
