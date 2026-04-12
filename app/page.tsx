'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { TopBar } from '@/components/TopBar';
import { BottomNav } from '@/components/BottomNav';
import { CourseCard } from '@/components/CourseCard';
import { Course, CourseWithWeather } from '@/lib/types';
import { getPlayabilityStatus, getWeatherInfo } from '@/lib/weather';
import { getDistanceKm } from '@/lib/courses';

async function loadWeather(course: Course): Promise<CourseWithWeather> {
  const res = await fetch(`/api/weather?lat=${course.lat}&lon=${course.lon}`);
  if (!res.ok) return course;
  const weather = await res.json();
  return { ...course, weather };
}

export default function HomePage() {
  const router = useRouter();
  const [courses, setCourses] = useState<CourseWithWeather[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);
  const loadedRef = useRef(false);

  // Load courses list
  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;

    fetch('/api/courses')
      .then((r) => r.json())
      .then(({ courses: list }: { courses: Course[] }) => {
        setCourses(list.map((c) => ({ ...c })));
        setLoading(false);

        // Load weather for first 6 courses (visible above fold)
        list.slice(0, 6).forEach(async (course) => {
          const withWeather = await loadWeather(course);
          setCourses((prev) =>
            prev.map((c) => (c.id === withWeather.id ? withWeather : c))
          );
        });

        // Then load remaining
        list.slice(6).forEach(async (course) => {
          const withWeather = await loadWeather(course);
          setCourses((prev) =>
            prev.map((c) => (c.id === withWeather.id ? withWeather : c))
          );
        });
      })
      .catch(() => setLoading(false));

    // Try to get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({ lat: pos.coords.latitude, lon: pos.coords.longitude });
        },
        () => {} // Silently ignore location errors
      );
    }
  }, []);

  // Sort by distance when location is available
  const sortedCourses = userLocation
    ? [...courses]
        .map((c) => ({
          ...c,
          distanceKm: getDistanceKm(userLocation.lat, userLocation.lon, c.lat, c.lon),
        }))
        .sort((a, b) => (a.distanceKm ?? 999) - (b.distanceKm ?? 999))
    : courses;

  // Compute overall condition from loaded weather
  const loadedWithWeather = sortedCourses.filter((c) => c.weather);
  const overallStatus =
    loadedWithWeather.length > 0
      ? getPlayabilityStatus(loadedWithWeather[0].weather!.current)
      : null;

  const heroTitle =
    overallStatus === 'Playable'
      ? 'Fresh Fairways'
      : overallStatus === 'Chilly'
      ? 'Bundle Up'
      : overallStatus === 'Wind Advisory'
      ? 'Wind Alert'
      : overallStatus === 'Arctic Exposure'
      ? 'Arctic Conditions'
      : 'Loading…';

  const heroDescription =
    overallStatus === 'Playable'
      ? 'Optimal playing conditions detected across Iceland.'
      : overallStatus === 'Chilly'
      ? 'Cooler temperatures today. Dress in layers for best comfort.'
      : overallStatus === 'Wind Advisory'
      ? 'Strong winds gusting across the courses. High ball flight not recommended.'
      : overallStatus === 'Arctic Exposure'
      ? 'Extreme conditions. Check each course before heading out.'
      : 'Fetching weather data for Icelandic golf courses…';

  const heroIcon =
    overallStatus === 'Playable'
      ? 'sunny'
      : overallStatus === 'Chilly'
      ? 'partly_cloudy_day'
      : overallStatus === 'Wind Advisory'
      ? 'air'
      : 'weather_snowy';

  // Wind advisory summary
  const windyCourses = loadedWithWeather.filter(
    (c) => c.weather!.current.windSpeed > 10
  );

  // Get today's sunrise/sunset from first loaded course
  const firstWithWeather = loadedWithWeather[0];
  const todaySunrise = firstWithWeather?.weather?.daily[0]?.sunrise;
  const todaySunset = firstWithWeather?.weather?.daily[0]?.sunset;
  const daylightHours = todaySunrise && todaySunset
    ? (() => {
        const mins = (new Date(todaySunset).getTime() - new Date(todaySunrise).getTime()) / 60000;
        return `${Math.floor(mins / 60)}h ${Math.floor(mins % 60)}m`;
      })()
    : null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-28">
      <TopBar showBack={false} />

      <main className="pt-20 px-5 space-y-8 max-w-md mx-auto">
        {/* Search bar */}
        <section>
          <form onSubmit={handleSearch} className="relative group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <span className="material-symbols-outlined text-outline text-[20px]">search</span>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search golf courses…"
              className="w-full bg-surface-container-lowest rounded-xl py-4 pl-12 pr-4 text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all font-body text-base"
            />
          </form>
        </section>

        {/* Hero Status Banner */}
        <section className="relative overflow-hidden rounded-3xl p-7 bg-gradient-to-br from-primary-container to-surface-container-low min-h-[200px] flex flex-col justify-end">
          <div className="absolute top-5 right-5 opacity-15">
            <span
              className="material-symbols-outlined text-[110px]"
              style={{ fontVariationSettings: "'FILL' 1, 'wght' 300, 'GRAD' 0, 'opsz' 48" }}
            >
              {heroIcon}
            </span>
          </div>
          <div className="relative z-10">
            <span className="label-meta text-primary mb-2 block">Current Condition</span>
            <h2 className="font-headline text-3xl font-bold text-on-surface">{heroTitle}</h2>
            <p className="text-on-surface-variant mt-1.5 text-sm max-w-xs">{heroDescription}</p>
          </div>
        </section>

        {/* Nearby Courses */}
        <section className="space-y-5">
          <div className="flex items-end justify-between px-1">
            <div className="space-y-0.5">
              <span className="label-meta">Telemetry</span>
              <h3 className="font-headline text-2xl font-semibold">
                {userLocation ? 'Nearby Courses' : 'All Courses'}
              </h3>
            </div>
            <Link href="/search" className="text-primary font-label text-sm font-semibold hover:underline">
              View All
            </Link>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-xl overflow-hidden bg-surface-container-low animate-pulse">
                  <div className="h-40 skeleton" />
                  <div className="p-4 space-y-3">
                    <div className="h-5 skeleton rounded w-2/3" />
                    <div className="grid grid-cols-2 gap-3">
                      <div className="h-14 skeleton rounded-lg" />
                      <div className="h-14 skeleton rounded-lg" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {sortedCourses.slice(0, 6).map((course) => (
                <CourseCard key={course.id} course={course} variant="grid" />
              ))}
            </div>
          )}
        </section>

        {/* Insights Row */}
        {!loading && loadedWithWeather.length > 0 && (
          <section className="grid grid-cols-2 gap-4">
            {/* Wind Advisory */}
            <div className="bg-surface-container-high rounded-3xl p-6 flex flex-col justify-between">
              <span className="material-symbols-outlined text-tertiary text-3xl mb-4">air</span>
              <div>
                <h3 className="font-headline text-xl font-bold mb-1">Wind Report</h3>
                <p className="text-on-surface-variant text-xs">
                  {windyCourses.length > 0
                    ? `${windyCourses.length} course${windyCourses.length > 1 ? 's' : ''} with gusts over 10 m/s today.`
                    : 'Calm conditions across all courses. Ideal for accurate ball flight.'}
                </p>
              </div>
            </div>

            {/* Daylight */}
            <div className="bg-surface-container-lowest rounded-3xl p-6 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <span className="material-symbols-outlined text-primary text-3xl">wb_sunny</span>
                {daylightHours && (
                  <span className="label-meta border border-outline-variant/30 px-2 py-1 rounded-lg">
                    {daylightHours}
                  </span>
                )}
              </div>
              <div>
                <h3 className="font-headline text-xl font-bold mb-1">Daylight</h3>
                <p className="text-outline text-xs">
                  {todaySunrise
                    ? `Sunrise ${new Date(todaySunrise).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Atlantic/Reykjavik' })} · Sunset ${new Date(todaySunset!).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Atlantic/Reykjavik' })}`
                    : 'Loading daylight data…'}
                </p>
              </div>
            </div>
          </section>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
