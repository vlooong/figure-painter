import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Scientific Plotting - Publication-Quality Charts",
  description:
    "Create publication-quality scientific plots with multiple style templates. Export as SVG or PNG.",
  alternates: {
    canonical: "/plot",
    languages: {
      "en": "/plot",
      "zh-CN": "/plot",
      "x-default": "/plot",
    },
  },
  openGraph: {
    title: "Scientific Plotting - Publication-Quality Charts",
    description:
      "Create publication-quality scientific plots with multiple style templates.",
    url: "/plot",
  },
};

export default function PlotLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
