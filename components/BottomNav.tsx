'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { href: '/', label: 'Search', icon: 'search' },
  { href: '/favorites', label: 'Favorites', icon: 'favorite' },
  { href: '/search', label: 'Explore', icon: 'explore' },
];

export function BottomNav() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 mx-auto max-w-md w-full">
      <div
        className="bg-surface-container-low/90 backdrop-blur-xl flex justify-around items-center px-2 pb-safe pt-2 rounded-t-2xl"
        style={{ boxShadow: '0 -4px 24px rgba(26, 83, 25, 0.08)' }}
      >
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center px-6 py-2 rounded-xl transition-all active:scale-90 ${
                active
                  ? 'bg-primary-container text-primary'
                  : 'text-outline hover:text-on-surface-variant'
              }`}
            >
              <span
                className="material-symbols-outlined text-[22px]"
                style={{ fontVariationSettings: `'FILL' ${active ? 1 : 0}, 'wght' 400, 'GRAD' 0, 'opsz' 24` }}
              >
                {item.icon}
              </span>
              <span className="font-label text-[9px] uppercase tracking-widest font-semibold mt-0.5">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
