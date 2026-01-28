import type { Metadata, Viewport } from "next";
import { Inter, Roboto_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

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
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "https://lindol.ph"),
  title: {
    default: "Lindol.ph - Philippines Earthquake Tracker | Real-time Alerts & Data",
    template: "%s | Lindol.ph - Philippines Earthquake Tracker",
  },
  description:
    "Track earthquakes in the Philippines in real-time. Get instant alerts, view interactive maps, see historical data, and access earthquake preparedness information for every city and municipality.",
  keywords: [
    "Philippines earthquake",
    "earthquake tracker",
    "lindol",
    "PHIVOLCS",
    "seismic activity",
    "earthquake map",
    "earthquake alert",
    "Manila earthquake",
    "Davao earthquake",
    "Cebu earthquake",
    "fault line",
    "Philippine fault",
  ],
  authors: [{ name: "Lindol.ph Team" }],
  creator: "Lindol.ph",
  publisher: "Lindol.ph",
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
    locale: "en_PH",
    url: "https://lindol.ph",
    siteName: "Lindol.ph - Philippines Earthquake Tracker",
    title: "Lindol.ph - Philippines Earthquake Tracker | Real-time Alerts & Data",
    description:
      "Track earthquakes in the Philippines in real-time. Get instant alerts, view interactive maps, see historical data, and access earthquake preparedness information.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Lindol.ph - Philippines Earthquake Tracker",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Lindol.ph - Philippines Earthquake Tracker",
    description:
      "Track earthquakes in the Philippines in real-time. Get instant alerts and access earthquake preparedness information.",
    images: ["/og-image.png"],
  },
  alternates: {
    canonical: "https://lindol.ph",
  },
  verification: {
    google: "your-google-verification-code",
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
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body
        className={`${inter.variable} ${robotoMono.variable} antialiased min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100`}
      >
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
