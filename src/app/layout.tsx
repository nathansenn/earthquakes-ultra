import type { Metadata, Viewport } from "next";
import { Inter, Roboto_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { DynamicFooter } from "@/components/layout/DynamicFooter";
import { KeyboardShortcuts } from "@/components/ui/KeyboardShortcuts";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const robotoMono = Roboto_Mono({
  variable: "--font-roboto-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "https://quakeglobe.com"),
  title: {
    default: "QuakeGlobe — Real-Time Global Earthquake Monitoring",
    template: "%s | QuakeGlobe",
  },
  description:
    "Track earthquakes worldwide in real-time. Monitor M1+ seismic activity across the globe, from micro-tremors to major events. Every tremor. Everywhere.",
  keywords: [
    "earthquake tracker",
    "global earthquake",
    "earthquake monitor",
    "earthquake map",
    "earthquake alert",
    "seismic activity",
    "USGS earthquake",
    "earthquake near me",
    "earthquake safety",
    "Pacific Ring of Fire",
    "M1 earthquakes",
    "real-time earthquake",
    "world earthquake",
    "quake tracker",
    "live earthquake",
  ],
  authors: [{ name: "QuakeGlobe Team" }],
  creator: "QuakeGlobe",
  publisher: "QuakeGlobe",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://quakeglobe.com",
    siteName: "QuakeGlobe",
    title: "QuakeGlobe — Real-Time Global Earthquake Monitoring",
    description:
      "Track earthquakes worldwide in real-time. Monitor M1+ seismic activity across the globe. Every tremor. Everywhere.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "QuakeGlobe - Real-Time Global Earthquake Monitoring",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "QuakeGlobe — Real-Time Global Earthquake Monitoring",
    description:
      "Track earthquakes worldwide in real-time. M1+ global coverage and regional monitoring.",
    images: ["/og-image.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <head>
        {/* Apply the theme before first paint: avoids a flash of the wrong
            theme and honors the OS preference by default (no saved choice). */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');var d=t==='dark'||((!t||t==='system')&&window.matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.classList.toggle('dark',d);}catch(e){}})();`,
          }}
        />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body
        className={`${inter.variable} ${robotoMono.variable} antialiased min-h-screen flex flex-col bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100`}
      >
        {/* Keyboard/screen-reader users can jump straight to the content. */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:top-3 focus:left-3 focus:px-4 focus:py-2 focus:rounded-lg focus:bg-blue-600 focus:text-white focus:shadow-lg"
        >
          Skip to content
        </a>
        <Header />
        <main id="main-content" tabIndex={-1} className="flex-1 outline-none">{children}</main>
        <DynamicFooter pageType="home" />
        <KeyboardShortcuts />
      </body>
    </html>
  );
}
