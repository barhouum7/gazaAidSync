import type { Metadata } from "next";
// import { Geist, Geist_Mono } from "next/font/google";
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import '../styles/map.css';
import "./globals.css";
import { Suspense } from "react";
import NextTopLoader from 'nextjs-toploader';
import { cn } from "@/lib/utils";
import { Cairo } from "next/font/google";
import { Toaster } from "sonner";
import Footer from "@/components/layout/footer";
import HeaderContainer from "@/components/layout/header-container";
import { ThemeProvider } from "next-themes";
import type { Viewport } from 'next'
import { LayoutStateProvider } from "@/providers/layout-state-provider";
import MainContentWrapper from "@/components/layout/main-content-wrapper";
import ResizableSidebar from "@/components/layout/resizable-sidebar";
import MapSidebar from "@/components/map/map-sidebar";
import SidebarWrapper from "@/components/sidebar-wrapper";
import LoaderBar from "@/components/ui/loader-bar";


export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  // Also supported but less commonly used
  // interactiveWidget: 'resizes-visual',
};


const cairo = Cairo({
  subsets: ["latin", "arabic"],
});

// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });



export const metadata: Metadata = {
  title: "Gaza Aid Sync - Humanitarian Aid Tracking",
  description:
    "Real-time tracking of humanitarian aid delivery and critical needs in Gaza",
  keywords: [
    "gaza aid sync",
    "humanitarian aid tracking",
    "gaza aid",
    "humanitarian aid",
    "gaza aid delivery",
    "humanitarian aid delivery",
    "gaza aid needs",
    "humanitarian aid needs",
    "gaza aid tracking",
    "humanitarian aid tracking",
  ],
  authors: [{ name: "Gaza Aid Sync" }],
  creator: "Gaza Aid Sync",
  publisher: "Gaza Aid Sync",
  openGraph: {
    title: "Gaza Aid Sync - Humanitarian Aid Tracking",
    description:
      "Real-time tracking of humanitarian aid delivery and critical needs in Gaza",
    type: "website",
    locale: "en",
    siteName: "Gaza Aid Sync",
    url: "https://gaza-aid-sync.vercel.app",
    images: [
      {
        url: "https://gaza-aid-sync.vercel.app/og-image.png",
        width: 1200,
        height: 630,
        alt: "Gaza Aid Sync - Humanitarian Aid Tracking",
      },
    ],
  },
  twitter: {
    title: "Gaza Aid Sync - Humanitarian Aid Tracking",
    description:
      "Real-time tracking of humanitarian aid delivery and critical needs in Gaza",
    card: "summary_large_image",
    images: [
      {
        url: "https://gaza-aid-sync.vercel.app/og-image.png",
        width: 1200,
        height: 630,
        alt: "Gaza Aid Sync - Humanitarian Aid Tracking",
      },
    ],
  },
  icons: {
    icon: "/favicon.ico",
  },
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning
      className="min-h-screen"
    >
      <body
        suppressHydrationWarning
        // className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          cairo.className
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Toaster />
          <Suspense
            fallback={<LoaderBar className="fixed top-0 left-0 w-screen" />}
          >
            <NextTopLoader
              // color="#2563eb" // Blue-600
              // color="#dc2626" // Red-600
              color="#16a34a" // Green-600
              // color="#f59e0b" // Amber-600
              // color="#4f46e5" // Indigo-600
              // color="#ec4899" // Pink-600
              // color="#ffffff" // White
              // color="#000000" // Black
              // color="#FFA500" // Orange
              // color="#FF69B4" // Hot Pink
              // color="#00FF7F" // Spring Green
              // color="#1d4ed8" // Blue-700
              // color="#3b82f6" // Blue-500
              // color="#6366f1" // Indigo-500
              // color="#8b5cf6" // Indigo-400
              // color="#a78bfa" // Purple-300
              // color="#c084fc" // Purple-200
              // color="#e879f9" // Pink-300
              // color="#f472b6" // Pink-400
              // color="#fcd34d" // Yellow-300
              // color="#fbbf24" // Yellow-400
              // color="#facc15" // Yellow-500
              // color="#fef08a" // Yellow-200
              // color="#fef9c3" // Yellow-100
              // color="#fef3c7" // Amber-200
              // color="#fef2c0" // Amber-100
              // color="#90caf9" // Light Blue
              // color="#1e40af" // Blue-800
              // color="#0f172a" // Gray-900
              // color="#111827" // Gray-900
              // color="#374151" // Gray-700
              // color="#1f2937" // Gray-800
              // color="#6b7280" // Gray-600
              // color="#f3f4f6" // Gray-200
              // color="#f8fafc" // Gray-50
              // color="#f9fafb" // Gray-100
              // color="#e5e7eb" // Gray-300
              // color="#d1d5db" // Gray-400
              // color="#9ca3af" // Gray-500
              // color="#f0f4f8" // Light Gray
              // color="#f3e8ff" // Lavender
              // color="#fef2f2" // Light Red
              // color="#fef9c3" // Light Yellow
              // color="#fef3c7" // Light Amber
              // color="#f0fdfa" // Light Cyan
              // color="#f3f4f6" // Light Gray
              // color="#f5f3ff" // Light Indigo
              // color="#fef9c3" // Light Yellow
              // color="#fef2f2" // Light Red
              // color="#f3e8ff" // Light Purple
              // color="#fef9c3" // Light Yellow
              // color="#fef3c7" // Light Amber
              // color="#f0f4f8" // Light Gray
              // shadow="0 0 10px #FF69B4,0 0 5px #FF69B4"
              // shadow="0 0 10px rgba(79, 70, 229, 0.5), 0 0 5px rgba(79, 70, 229, 0.5)"
              // shadow="0 0 10px rgba(22, 162, 74, 0.5), 0 0 5px rgba(22, 162, 74, 0.5)"
              // shadow="0 0 10px rgba(16, 16, 16, 0.5), 0 0 5px rgba(16, 16, 16, 0.5)"
              // shadow="0 0 10px rgba(255, 105, 180, 0.5), 0 0 5px rgba(255, 105, 180, 0.5)"
              shadow="0 0 10px rgba(220, 38, 38, 0.5), 0 0 5px rgba(220, 38, 38, 0.5)"
              // shadow="0 0 10px rgba(255, 255, 255, 0.5), 0 0 5px rgba(255, 255, 255, 0.5)"
              // shadow="0 0 10px rgba(255, 165, 0, 0.5), 0 0 5px rgba(255, 165, 0, 0.5)"
              initialPosition={0.08}
              crawlSpeed={200}
              height={3}
              crawl={true}
              showSpinner={true}
              easing="ease"
              speed={200}
              template='<div class="bar" role="bar"><div class="peg"></div></div> 
              <div class="spinner" role="spinner"><div class="spinner-icon"></div></div>'
              zIndex={1600}
              showAtBottom={false}
            />
            <div className="relative z-10">
              <LayoutStateProvider>
                {/* Sidebar */}
                <div className="flex-shrink-0">
                  {/* Sidebar content */}
                  <SidebarWrapper />
                </div>

                <div className="w-full">
                  <MainContentWrapper>
                    {/* Header */}
                    <HeaderContainer />

                    {/* Main Content */}
                    <main className="flex flex-col gap-6 p-4 bg-muted/10 min-h-screen"
                      style={{ backgroundImage: 'url("/assets/olive-branch.svg")', backgroundSize: 'cover' }}
                    >
                        {children}
                    </main>

                    {/* Footer */}
                    <Footer />
                  </MainContentWrapper>
                </div>
              </LayoutStateProvider>
            </div>
          </Suspense>
        </ThemeProvider>
      </body>
    </html>
  );
}
