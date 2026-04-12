'use client';

import { useEffect, useState, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { BottomNav } from '@/components/BottomNav';
import { CourseCard } from '@/components/CourseCard';
import { Course, CourseWithWeather } from '@/lib/types';
import { getDistanceKm } from '@/lib/courses';

async function loadWeather(course: Course): Promise<CourseWithWeather> {
  const res = await fetch(`/api/weather?lat=${course.lat}&lon=${course.lon}`);
  if (!res.ok) return course;
  const weather = await res.json();
  return { ...course, weather };
}

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get('q') ?? '';

  const [query, setQuery] = useState(initialQuery);
  const [courses, setCourses] = useState<CourseWithWeather[]>([]);
  const [loading, setLoading] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Get user location once
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
        () => {}
      );
    }
  }, []);

  // Search when query changes
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      if (abortRef.current) abortRef.current.abort();
      abortRef.current = new AbortController();

      try {
        const res = await fetch(`/api/courses?q=${encodeURIComponent(query)}`, {
          signal: abortRef.current.signal,
        });
        const { courses: list } = await res.json();
        setCourses(list.map((c: Course) => ({ ...c })));
        setLoading(false);

        // Load weather progressively
        list.forEach(async (course: Course) => {
          const withWeather = await loadWeather(course);
          setCourses((prev) =>
            prev.map((c) => (c.id === withWeather.id ? withWeather : c))
          );
        });
      } catch (err: unknown) {
        if (err instanceof Error && err.name !== 'AbortError') setLoading(false);
      }
    }, 300);
  }, [query]);

  // Update URL without navigating
  const handleQueryChange = (val: string) => {
    setQuery(val);
    const url = val ? `/search?q=${encodeURIComponent(val)}` : '/search';
    window.history.replaceState(null, '', url);
  };

  const sortedCourses = userLocation
    ? [...courses]
        .map((c) => ({
          ...c,
          distanceKm: getDistanceKm(userLocation.lat, userLocation.lon, c.lat, c.lon),
        }))
        .sort((a, b) => (a.distanceKm ?? 999) - (b.distanceKm ?? 999))
    : courses;

  return (
    <div className="min-h-screen bg-background pb-28">
      {/* Search TopBar */}
      <header className="fixed top-0 left-0 right-0 z-50 mx-auto max-w-md w-full">
        <div className="bg-surface/95 backdrop-blur-xl flex items-center gap-3 px-4 h-16 border-b border-outline-variant/10">
          <button
            onClick={() => router.back()}
            className="p-1 text-primary hover:bg-surface-container-high rounded-full transition-colors flex-shrink-0"
            aria-label="Go back"
          >
            <span className="material-symbols-outlined text-[22px]">arrow_back</span>
          </button>
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px] pointer-events-none">
              search
            </span>
            <input
              autoFocus
              type="text"
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              placeholder="Search golf courses…"
              className="w-full bg-surface-container-lowest rounded-xl py-3 pl-10 pr-4 text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all font-body text-sm"
            />
            {query && (
              <button
                onClick={() => handleQueryChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="pt-20 px-5 space-y-5">
        {/* Results header */}
        <div className="flex items-baseline justify-between px-1 pt-2">
          <div>
            {query ? (
              <>
                <span className="label-meta">Current Search</span>
                <h2 className="font-headline text-xl font-bold mt-0.5 capitalize">{query}</h2>
                {!loading && (
                  <p className="text-outline text-xs mt-0.5">
                    {sortedCourses.length} course{sortedCourses.length !== 1 ? 's' : ''} found
                    {userLocation ? ' in Iceland' : ''}
                  </p>
                )}
              </>
            ) : (
              <>
                <span className="label-meta">Browse All</span>
                <h2 className="font-headline text-xl font-bold mt-0.5">All Courses</h2>
                <p className="text-outline text-xs mt-0.5">
                  {sortedCourses.length} courses in Iceland
                </p>
              </>
            )}
          </div>
          {userLocation && (
            <div className="flex items-center gap-1.5 text-primary">
              <span className="material-symbols-outlined text-[14px]">location_on</span>
              <span className="label-meta text-primary">Near you</span>
            </div>
          )}
        </div>

        {/* Results list */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-4 p-4 bg-surface-container-low rounded-xl animate-pulse">
                <div className="w-20 h-20 skeleton rounded-lg flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 skeleton rounded w-3/4" />
                  <div className="h-3 skeleton rounded w-1/2" />
                  <div className="h-3 skeleton rounded w-1/3" />
                </div>
                <div className="h-10 w-16 skeleton rounded" />
              </div>
            ))}
          </div>
        ) : sortedCourses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <span className="material-symbols-outlined text-5xl text-outline">search_off</span>
            <p className="font-headline text-lg text-on-surface-variant">No courses found</p>
            <p className="text-outline text-sm text-center">
              Try searching by course name, location or region
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedCourses.map((course) => (
              <CourseCard key={course.id} course={course} variant="list" />
            ))}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense>
      <SearchContent />
    </Suspense>
  );
}
