/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // WebP only. Every scene mounts its full-bleed plates at once, and
    // on-demand AVIF encoding of ten 1920x1080 sources costs minutes of CPU
    // on a cold cache — enough to starve the scroll loop on first visit.
    formats: ["image/webp"],
  },
};

export default nextConfig;
