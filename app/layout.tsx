import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Navigation } from "@/components/shared/Navigation";
import { Providers } from "@/components/shared/Providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = "https://figure.vlooong.top";
const SITE_TITLE = "Figure Painter - Scientific Figure Data Extraction & Plotting";
const SITE_DESCRIPTION = "Extract curve data from paper figures and create publication-quality plots with journal style templates (Nature, IEEE, ACS, Science)";

export const metadata: Metadata = {
  title: {
    default: SITE_TITLE,
    template: "%s | Figure Painter",
  },
  description: SITE_DESCRIPTION,
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: "/",
    languages: {
      "en": "/",
      "zh-CN": "/",
      "x-default": "/",
    },
  },
  keywords: [
    "figure data extraction",
    "scientific plotting",
    "paper figure",
    "curve digitizer",
    "publication-quality plots",
    "Nature style plot",
    "IEEE plot template",
    "time series benchmark",
    "chart data extractor",
  ],
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    siteName: "Figure Painter",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Figure Painter",
  url: SITE_URL,
  description: SITE_DESCRIPTION,
  applicationCategory: "UtilitiesApplication",
  operatingSystem: "Any",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  featureList: [
    "Extract data points from scientific chart images",
    "Create publication-quality plots with journal templates",
    "Search and compare time series algorithm benchmarks",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <Navigation />
          {children}
        </Providers>
      </body>
    </html>
  );
}
