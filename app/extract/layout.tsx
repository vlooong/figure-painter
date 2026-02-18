import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Data Extraction - Extract Curve Data from Paper Figures",
  description:
    "Upload scientific chart images, calibrate axes, pick curve colors, and auto-extract data points into CSV. Supports line charts, scatter plots, and more.",
  alternates: {
    canonical: "/extract",
    languages: {
      "en": "/extract",
      "zh-CN": "/extract",
      "x-default": "/extract",
    },
  },
  openGraph: {
    title: "Data Extraction - Extract Curve Data from Paper Figures",
    description:
      "Upload scientific chart images, calibrate axes, pick curve colors, and auto-extract data points into CSV.",
    url: "/extract",
  },
};

export default function ExtractLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
