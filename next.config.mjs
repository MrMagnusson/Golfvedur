/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'ivswzdjgcsociqyoomki.supabase.co' },
      { protocol: 'https', hostname: 'golfvedur.is' },
    ],
  },
};

export default nextConfig;
