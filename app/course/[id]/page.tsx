'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { TopBar } from '@/components/TopBar';
import { BottomNav } from '@/components/BottomNav';
import { WeatherIcon, WindArrow } from '@/components/WeatherIcon';
import { Course, WeatherData } from '@/lib/types';
import {
  getPlayabilityStatus,
  getPlayabilityColor,
  getWeatherInfo,
  getWindDirection,
  formatTime,
  formatDay,
} from '@/lib/weather';
import { getCourseById } from '@/lib/courses';

function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('golfvedur-favorites');
      if (stored) setFavorites(JSON.parse(stored));
    } catch {}
  }, []);

  const toggle = (id: string) => {
    setFavorites((prev) => {
      const next = prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id];
      localStorage.setItem('golfvedur-favorites', JSON.stringify(next));
      return next;
    });
  };

  return { favorites, toggle };
}

export default function CourseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const { favorites, toggle } = useFavorites();

  const course: Course | undefined = getCourseById(id);

  useEffect(() => {
    if (!course) return;
    fetch(`/api/weather?lat=${course.lat}&lon=${course.lon}`)
      .then((r) => r.json())
      .then((data) => {
        setWeather(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [course]);

  if (!course) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 px-6">
        <span className="material-symbols-outlined text-4xl text-outline">golf_course</span>
        <p className="font-headline text-xl text-on-surface-variant">Course not found</p>
        <button
          onClick={() => router.back()}
          className="px-6 py-3 bg-primary-container text-primary rounded-xl font-label font-semibold"
        >
          Go Back
        </button>
      </div>
    );
  }

  const isFav = favorites.includes(course.id);
  const imageUrl = `https://picsum.photos/seed/${course.id}/800/500`;
  const logoUrl = course.logoUrl ?? null;
  const status = weather ? getPlayabilityStatus(weather.current) : null;
  const statusColor = status ? getPlayabilityColor(status) : '';
  const today = weather?.daily[0];

  const daylightMinutes = today
    ? (new Date(today.sunset).getTime() - new Date(today.sunrise).getTime()) / 60000
    : 0;
  const daylightHours = Math.floor(daylightMinutes / 60);
  const daylightMins = Math.floor(daylightMinutes % 60);

  return (
    <div className="min-h-screen bg-background pb-28">
      <TopBar showBack />

      <main className="pt-16">
        {/* Hero Section */}
        <section className="relative h-[380px] overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt={course.name}
            className="absolute inset-0 w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />

          {/* Club logo badge */}
          {logoUrl && (
            <div className="absolute top-20 left-5 w-16 h-16 rounded-xl bg-surface-container/80 backdrop-blur-md flex items-center justify-center shadow-lg ring-1 ring-white/10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={logoUrl} alt={`${course.name} logo`} className="w-11 h-11 object-contain" />
            </div>
          )}

          {/* Favorite button */}
          <button
            onClick={() => toggle(course.id)}
            className="absolute top-5 right-5 p-2.5 glass-panel rounded-full transition-colors z-10"
            aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
          >
            <span
              className={`material-symbols-outlined text-[22px] ${isFav ? 'text-primary' : 'text-on-surface-variant'}`}
              style={{ fontVariationSettings: `'FILL' ${isFav ? 1 : 0}, 'wght' 400, 'GRAD' 0, 'opsz' 24` }}
            >
              favorite
            </span>
          </button>

          {/* Course info overlay */}
          <div className="absolute bottom-6 left-5 right-5 flex justify-between items-end">
            <div className="space-y-1">
              <h2 className="font-headline text-3xl font-bold tracking-tight text-on-surface uppercase">
                {course.shortName}
              </h2>
              <div className="flex items-center gap-1.5 text-tertiary">
                <span className="material-symbols-outlined text-[16px]">location_on</span>
                <span className="font-label text-xs font-semibold tracking-widest uppercase">
                  {course.location}, ISL
                </span>
              </div>
            </div>

            {loading ? (
              <div className="h-16 w-24 skeleton rounded-xl" />
            ) : weather ? (
              <div className="flex flex-col items-end gap-1.5">
                <div className="flex items-center gap-2">
                  <span className="font-headline text-6xl font-bold text-on-surface">
                    {weather.current.temperature}°
                  </span>
                  <WeatherIcon
                    code={weather.current.weatherCode}
                    className="text-tertiary text-4xl"
                    filled
                  />
                </div>
                <div className="flex gap-2">
                  {status && (
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusColor}`}>
                      {status}
                    </span>
                  )}
                  <span className="bg-primary-container px-3 py-1 rounded-full flex items-center gap-1">
                    <span
                      className="material-symbols-outlined text-[12px] text-on-primary-container"
                      style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
                    >
                      air
                    </span>
                    <span className="text-[10px] font-bold text-on-primary-container uppercase">
                      {weather.current.windSpeed} m/s
                    </span>
                  </span>
                </div>
              </div>
            ) : null}
          </div>
        </section>

        <div className="px-5 space-y-6 mt-4">
          {/* Course description */}
          <p className="text-on-surface-variant text-sm leading-relaxed">{course.description}</p>

          {/* Hourly Precision */}
          <section className="space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="label-meta text-outline">Hourly Precision</h3>
              <span className="text-[10px] font-bold text-primary tracking-widest uppercase">
                Next 12 Hours
              </span>
            </div>

            {loading ? (
              <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="flex-shrink-0 w-20 h-28 skeleton rounded-xl" />
                ))}
              </div>
            ) : weather ? (
              <div className="flex overflow-x-auto gap-3 hide-scrollbar pb-2">
                {weather.hourly.slice(0, 12).map((h, i) => (
                  <div
                    key={h.time}
                    className={`flex-shrink-0 w-20 p-3 rounded-xl flex flex-col items-center gap-2 ${
                      i === 0
                        ? 'glass-panel border border-primary/20'
                        : 'bg-surface-container-low'
                    }`}
                  >
                    <span className="text-[9px] font-bold text-outline uppercase tracking-wider">
                      {i === 0 ? 'Now' : formatTime(h.time)}
                    </span>
                    <WeatherIcon
                      code={h.weatherCode}
                      className={`text-[20px] ${i === 0 ? 'text-tertiary' : 'text-on-surface-variant'}`}
                    />
                    <span className="font-headline text-lg font-bold">{h.temperature}°</span>
                    <div className="flex flex-col items-center opacity-60">
                      <WindArrow
                        direction={h.windDirection}
                        className="text-[12px] text-outline"
                      />
                      <span className="text-[8px] font-bold">{h.windSpeed}m/s</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </section>

          {/* Key Metrics Bento */}
          {!loading && weather && (
            <section className="grid grid-cols-2 gap-3">
              {/* Wind Gusts */}
              <div className="bg-surface-container-high p-5 rounded-xl flex flex-col justify-between h-32 relative overflow-hidden">
                <span className="label-meta z-10">Wind Gusts</span>
                <span className="material-symbols-outlined absolute top-4 right-4 text-tertiary/20 text-4xl">
                  air
                </span>
                <div className="flex items-baseline gap-1 z-10">
                  <span className="font-headline text-3xl font-bold">
                    {weather.current.windSpeed}
                  </span>
                  <span className="text-outline text-xs font-medium">m/s</span>
                </div>
              </div>

              {/* Humidity */}
              <div className="bg-surface-container-high p-5 rounded-xl flex flex-col justify-between h-32 relative overflow-hidden">
                <span className="label-meta z-10">Humidity</span>
                <span className="material-symbols-outlined absolute top-4 right-4 text-tertiary/20 text-4xl">
                  humidity_mid
                </span>
                <div className="flex items-baseline gap-1 z-10">
                  <span className="font-headline text-3xl font-bold">
                    {weather.current.humidity}
                  </span>
                  <span className="text-outline text-xs font-medium">%</span>
                </div>
              </div>

              {/* Sunlight Hours */}
              {today && (
                <div className="col-span-2 bg-surface-container-high p-5 rounded-xl flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="label-meta">Sunlight Hours</span>
                    <div className="flex items-center gap-4 mt-1">
                      <div className="flex items-center gap-1.5 text-primary">
                        <span className="material-symbols-outlined text-sm">light_mode</span>
                        <span className="font-headline text-lg font-bold">
                          {formatTime(today.sunrise)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-tertiary">
                        <span className="material-symbols-outlined text-sm">bedtime</span>
                        <span className="font-headline text-lg font-bold">
                          {formatTime(today.sunset)}
                        </span>
                      </div>
                    </div>
                    <p className="label-meta mt-1">
                      {daylightHours}h {daylightMins}m of daylight
                    </p>
                  </div>
                  {/* Day length bar */}
                  <div className="h-10 w-20 bg-surface-container-lowest rounded-full relative overflow-hidden flex-shrink-0">
                    <div
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary/40 to-tertiary/40 rounded-full"
                      style={{ width: `${Math.min(100, (daylightMinutes / (24 * 60)) * 100)}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Wind Direction */}
              <div className="bg-surface-container-high p-5 rounded-xl flex flex-col justify-between h-28 relative overflow-hidden">
                <span className="label-meta z-10">Wind Dir.</span>
                <div className="flex items-center gap-2 z-10">
                  <WindArrow
                    direction={weather.current.windDirection}
                    className="text-tertiary text-2xl"
                  />
                  <span className="font-headline text-2xl font-bold">
                    {getWindDirection(weather.current.windDirection)}
                  </span>
                </div>
              </div>

              {/* Feels Like */}
              <div className="bg-surface-container-high p-5 rounded-xl flex flex-col justify-between h-28 relative overflow-hidden">
                <span className="label-meta z-10">Feels Like</span>
                <span className="material-symbols-outlined absolute top-4 right-4 text-primary/20 text-4xl">
                  thermostat
                </span>
                <div className="flex items-baseline gap-1 z-10">
                  <span className="font-headline text-3xl font-bold">
                    {weather.current.apparentTemperature}
                  </span>
                  <span className="text-outline text-xs font-medium">°C</span>
                </div>
              </div>
            </section>
          )}

          {/* 7-Day Outlook */}
          {!loading && weather && (
            <section className="space-y-3 pb-4">
              <h3 className="label-meta px-1">7-Day Outlook</h3>
              <div className="space-y-px">
                {weather.daily.map((day, i) => (
                  <div
                    key={day.date}
                    className={`flex items-center justify-between py-4 px-4 bg-surface-container-low ${
                      i === 0 ? 'rounded-t-xl' : ''
                    } ${i === weather.daily.length - 1 ? 'rounded-b-xl' : ''}`}
                  >
                    <span className="w-12 text-xs font-bold uppercase tracking-wider text-on-surface">
                      {i === 0 ? 'Today' : formatDay(day.date)}
                    </span>
                    <div className="flex items-center gap-2 w-1/3">
                      <WeatherIcon
                        code={day.weatherCode}
                        className={`text-[18px] ${
                          day.precipitationProbability > 30 ? 'text-tertiary' : 'text-primary'
                        }`}
                      />
                      {day.precipitationProbability > 5 && (
                        <span className="text-[10px] font-medium text-outline">
                          {day.precipitationProbability}%
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-headline text-sm font-bold text-outline">
                        {day.minTemp}°
                      </span>
                      <span className="font-headline text-sm font-bold text-on-surface">
                        {day.maxTemp}°
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
