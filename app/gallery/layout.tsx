import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Figure Gallery - Scientific Figure Style Reference",
  description:
    "Browse curated scientific figure styles from top journals. Find inspiration for your next publication-quality chart with color palettes and style references.",
  alternates: {
    canonical: "/gallery",
    languages: {
      en: "/gallery",
      "zh-CN": "/gallery",
      "x-default": "/gallery",
    },
  },
  openGraph: {
    title: "Figure Gallery - Scientific Figure Style Reference",
    description:
      "Browse curated scientific figure styles from top journals for plotting inspiration.",
    url: "/gallery",
  },
};

export default function GalleryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
