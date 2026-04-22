'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useWeatherSource, SOURCE_META } from '@/lib/weatherSource';

interface TopBarProps {
  showBack?: boolean;
  showSearch?: boolean;
  title?: string;
}

export function TopBar({ showBack = false, showSearch = true, title = 'GolfVeður' }: TopBarProps) {
  const router = useRouter();
  const { source, openPicker } = useWeatherSource();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 mx-auto max-w-md w-full">
      <div className="bg-surface/95 backdrop-blur-xl flex justify-between items-center px-5 h-16 border-b border-outline-variant/10">
        <div className="flex items-center gap-3">
          {showBack && (
            <button
              onClick={() => router.back()}
              className="p-1 -ml-1 text-primary hover:bg-surface-container-high rounded-full transition-colors"
              aria-label="Go back"
            >
              <span className="material-symbols-outlined text-[22px]">arrow_back</span>
            </button>
          )}
          <Link href="/" className="group">
            <h1 className="font-headline text-lg font-bold tracking-[0.15em] text-primary uppercase">
              {title}
            </h1>
          </Link>
        </div>

        <div className="flex items-center gap-1">
          {showSearch && (
            <Link
              href="/search"
              className="p-2 text-primary hover:bg-surface-container-high rounded-full transition-colors"
              aria-label="Search courses"
            >
              <span className="material-symbols-outlined text-[22px]">search</span>
            </Link>
          )}
          {/* Weather source picker button — shows active source icon */}
          <button
            onClick={openPicker}
            className="p-2 text-outline hover:text-primary hover:bg-surface-container-high rounded-full transition-colors relative"
            aria-label="Weather source settings"
            title={`Source: ${SOURCE_META[source].label}`}
          >
            <span className="material-symbols-outlined text-[22px]">tune</span>
            {source !== 'auto' && (
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-primary" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
