import type { NextConfig } from "next";
import withPWA from 'next-pwa';


// const withPWA = require('next-pwa')({
//   // Enable PWA in production only
const withNextPWA = withPWA({
  dest: 'public', // destination directory for the PWA files
  disable: process.env.NODE_ENV === 'development', // disable PWA in development mode
  register: true, // register the PWA service worker
  skipWaiting: true, // skip waiting for service worker activation
  runtimeCaching: [
    {
      urlPattern: /^https?.*\.(js|css|woff2?)/, // Static assets
      handler: 'CacheFirst',  // Good for static assets that rarely change
      options: {
        cacheName: 'static-assets',
        expiration: {
          maxEntries: 50,     // Reduced since blogs typically have fewer static assets
          maxAgeSeconds: 30 * 24 * 60 * 60 // 30 days is good
        }
      }
    },
    {
      urlPattern: /^https?.*\.(png|jpg|jpeg|svg|gif)/, // Images
      handler: 'CacheFirst',
      options: {
        cacheName: 'images',
        expiration: {
          maxEntries: 100,    // Adjusted for typical blog image usage
          maxAgeSeconds: 90 * 24 * 60 * 60 // Extended to 90 days since blog images rarely change
        }
      }
    },
    {
      urlPattern: /^https?:\/\/[^/]+\/api\/.*$/, // API routes
      handler: 'NetworkFirst',  // Changed to NetworkFirst for fresher content
      options: {
        cacheName: 'api-cache',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 12 * 60 * 60 // Reduced to 12 hours for more frequent updates
        }
      }
    },
    {
      urlPattern: /^https?.*/, // Blog posts and other content
      handler: 'NetworkFirst',  // Better for frequently updated content
      options: {
        cacheName: 'content',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 24 * 60 * 60 // 24 hours is good for blog content
        }
      }
    },
  ]
})

// import path from 'path';

const nextConfig: NextConfig = {
  turbopack: {
    // root: path.join(__dirname, '..'),
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
  
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
      {
        source: '/service-worker.js',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/javascript; charset=utf-8',
          },
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self'",
          },
        ],
      },
    ]
  },
};

export default withNextPWA(nextConfig as any) as NextConfig; // Type assertion to satisfy Next.js type requirements
