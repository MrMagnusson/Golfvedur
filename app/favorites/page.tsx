'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { TopBar } from '@/components/TopBar';
import { BottomNav } from '@/components/BottomNav';
import { WeatherIcon } from '@/components/WeatherIcon';
import { Course, CourseWithWeather } from '@/lib/types';
import { getPlayabilityStatus, getPlayabilityColor, formatTime } from '@/lib/weather';
import { getCourseById } from '@/lib/courses';
import { getCourseImageUrl } from '@/lib/courses';

async function loadWeather(course: Course): Promise<CourseWithWeather> {
  const res = await fetch(`/api/weather?lat=${course.lat}&lon=${course.lon}`);
  if (!res.ok) return course;
  const weather = await res.json();
  return { ...course, weather };
}

function FavoriteCourseCard({
  course,
  onRemove,
  isManaging,
}: {
  course: CourseWithWeather;
  onRemove: (id: string) => void;
  isManaging: boolean;
}) {
  const logoUrl = course.logoUrl ?? null;
  const fallbackUrl = getCourseImageUrl(course, 800, 400);
  const status = course.weather ? getPlayabilityStatus(course.weather.current) : null;
  const statusColor = status ? getPlayabilityColor(status) : '';

  return (
    <div className="relative rounded-2xl overflow-hidden bg-surface-container-low group animate-fade-in">
      {/* Remove button */}
      {isManaging && (
        <button
          onClick={() => onRemove(course.id)}
          className="absolute top-3 right-3 z-20 p-1.5 bg-error-container text-error rounded-full shadow-lg"
          aria-label={`Remove ${course.name}`}
        >
          <span className="material-symbols-outlined text-[16px]">remove</span>
        </button>
      )}

      <Link href={`/course/${course.id}`} className={isManaging ? 'pointer-events-none' : ''}>
        {/* Course image strip */}
        <div className="h-36 relative overflow-hidden">
          {logoUrl ? (
            /* Club logo on dark gradient background */
            <>
              <div className="absolute inset-0 bg-gradient-to-br from-[#0d2b1e] to-[#1a3d2b]" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={logoUrl}
                alt={`${course.name} logo`}
                className="absolute inset-0 m-auto w-20 h-20 object-contain drop-shadow-lg"
                style={{ top: 0, left: 0, right: 0, bottom: 0, margin: 'auto' }}
              />
            </>
          ) : (
            /* Fallback: picsum landscape photo */
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={fallbackUrl}
              alt={course.name}
              className="w-full h-full object-cover grayscale-[0.1] group-hover:grayscale-0 transition-all duration-500 opacity-70"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-surface-container-low via-transparent to-transparent" />

          {/* Temperature badge */}
          {course.weather && (
            <div className="absolute bottom-3 left-4 flex items-baseline gap-1">
              <span className="font-headline text-4xl font-bold text-on-surface">
                {course.weather.current.temperature}°
              </span>
              <WeatherIcon
                code={course.weather.current.weatherCode}
                className="text-tertiary text-2xl"
                filled
              />
            </div>
          )}

          {/* Status chip */}
          {status && (
            <div className="absolute top-3 left-3">
              <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md ${statusColor}`}>
                {status}
              </span>
            </div>
          )}
        </div>

        {/* Course info + hourly strip */}
        <div className="p-4 space-y-3">
          <div>
            <h3 className="font-headline text-lg font-bold">{course.name}</h3>
            <p className="text-outline text-xs mt-0.5 flex items-center gap-1">
              <span className="material-symbols-outlined text-[12px]">location_on</span>
              {course.location}
            </p>
          </div>

          {/* Next 4 hours mini-forecast */}
          {course.weather && (
            <div className="flex gap-2">
              {course.weather.hourly.slice(0, 4).map((h, i) => (
                <div
                  key={h.time}
                  className="flex-1 flex flex-col items-center gap-1 bg-surface-container-high rounded-xl py-2"
                >
                  <span className="text-[9px] font-bold text-outline uppercase tracking-wider">
                    {i === 0 ? 'Now' : formatTime(h.time)}
                  </span>
                  <WeatherIcon
                    code={h.weatherCode}
                    className="text-[16px] text-on-surface-variant"
                  />
                  <span className="font-headline text-sm font-bold">{h.temperature}°</span>
                </div>
              ))}
            </div>
          )}

          {!course.weather && (
            <div className="flex gap-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex-1 h-16 skeleton rounded-xl" />
              ))}
            </div>
          )}
        </div>
      </Link>
    </div>
  );
}

export default function FavoritesPage() {
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [courses, setCourses] = useState<CourseWithWeather[]>([]);
  const [isManaging, setIsManaging] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem('golfvedur-favorites');
      if (stored) {
        const ids: string[] = JSON.parse(stored);
        setFavoriteIds(ids);
        const found = ids.map(getCourseById).filter(Boolean) as Course[];
        setCourses(found.map((c) => ({ ...c })));

        // Load weather
        found.forEach(async (course) => {
          const withWeather = await loadWeather(course);
          setCourses((prev) =>
            prev.map((c) => (c.id === withWeather.id ? withWeather : c))
          );
        });
      }
    } catch {}
  }, []);

  const handleRemove = (id: string) => {
    const next = favoriteIds.filter((f) => f !== id);
    setFavoriteIds(next);
    setCourses((prev) => prev.filter((c) => c.id !== id));
    localStorage.setItem('golfvedur-favorites', JSON.stringify(next));
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-background pb-28">
      <TopBar showBack />

      <main className="pt-20 px-5 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between pt-2">
          <div>
            <span className="label-meta">Your Destinations</span>
            <h1 className="font-headline text-3xl font-bold mt-1">Favorites</h1>
          </div>
          {courses.length > 0 && (
            <button
              onClick={() => setIsManaging((m) => !m)}
              className={`mt-2 px-4 py-2 rounded-xl font-label text-xs font-semibold transition-colors ${
                isManaging
                  ? 'bg-error-container text-error'
                  : 'bg-surface-container-high text-primary'
              }`}
            >
              {isManaging ? 'Done' : 'Manage'}
            </button>
          )}
        </div>

        {/* Empty state */}
        {courses.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 gap-5">
            <div className="w-20 h-20 rounded-full bg-surface-container-high flex items-center justify-center">
              <span
                className="material-symbols-outlined text-4xl text-outline"
                style={{ fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 48" }}
              >
                favorite
              </span>
            </div>
            <div className="text-center">
              <h3 className="font-headline text-xl font-bold text-on-surface">No favorites yet</h3>
              <p className="text-on-surface-variant text-sm mt-2 max-w-xs">
                Tap the heart icon on any course to save it here for quick access.
              </p>
            </div>
            <Link
              href="/search"
              className="px-6 py-3 bg-primary text-on-primary rounded-xl font-label font-semibold text-sm"
            >
              Browse Courses
            </Link>
          </div>
        )}

        {/* Favorites list */}
        {courses.length > 0 && (
          <div className="space-y-4">
            {courses.map((course) => (
              <FavoriteCourseCard
                key={course.id}
                course={course}
                onRemove={handleRemove}
                isManaging={isManaging}
              />
            ))}
          </div>
        )}

        {/* Add course CTA */}
        {courses.length > 0 && !isManaging && (
          <Link
            href="/search"
            className="flex items-center justify-center gap-3 w-full py-4 border-2 border-dashed border-outline-variant/40 rounded-2xl text-outline hover:border-primary/40 hover:text-primary transition-all group"
          >
            <span className="material-symbols-outlined text-[20px] group-hover:rotate-90 transition-transform duration-200">
              add
            </span>
            <span className="font-label font-semibold text-sm uppercase tracking-wider">
              Add Course
            </span>
          </Link>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
