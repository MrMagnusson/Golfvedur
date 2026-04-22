import type { Metadata, Viewport } from 'next';
import { WeatherSourceProvider } from '@/components/WeatherSourceProvider';
import './globals.css';

export const metadata: Metadata = {
  title: 'GolfVeður — Iceland Golf Weather',
  description: 'Real-time weather conditions for all Icelandic golf courses. Plan your round with confidence.',
  keywords: ['golf', 'weather', 'Iceland', 'golf course', 'veður'],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#121414',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-background antialiased">
        <div className="mx-auto max-w-md w-full min-h-screen relative">
          <WeatherSourceProvider>
            {children}
          </WeatherSourceProvider>
        </div>
      </body>
    </html>
  );
}
