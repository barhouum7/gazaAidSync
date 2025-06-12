import type { Metadata } from "next";
// import { Geist, Geist_Mono } from "next/font/google";
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import '../styles/map.css';
import "./globals.css";
import { cn } from "@/lib/utils";
import { Inter } from "next/font/google";
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


export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  // Also supported but less commonly used
  // interactiveWidget: 'resizes-visual',
}

const inter = Inter({
  subsets: ["latin"],
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
  description: "Real-time tracking of humanitarian aid delivery and critical needs in Gaza",
  keywords: ["gaza aid sync", "humanitarian aid tracking", "gaza aid", "humanitarian aid", "gaza aid delivery", "humanitarian aid delivery", "gaza aid needs", "humanitarian aid needs", "gaza aid tracking", "humanitarian aid tracking"],
  authors: [{ name: "Gaza Aid Sync" }],
  creator: "Gaza Aid Sync",
  publisher: "Gaza Aid Sync",
  openGraph: {
    title: "Gaza Aid Sync - Humanitarian Aid Tracking",
    description: "Real-time tracking of humanitarian aid delivery and critical needs in Gaza",
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
    description: "Real-time tracking of humanitarian aid delivery and critical needs in Gaza",
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
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        // className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          inter.className
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Toaster />
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
                  <main className="flex flex-col overflow-y-auto gap-6 bg-muted/10">
                    <div className="flex-1 flex flex-col gap-6 p-4">{children}</div>
                  </main>

                  {/* Footer */}
                  <Footer />
                </MainContentWrapper>
              </div>
            </LayoutStateProvider>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
