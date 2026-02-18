import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Benchmark Query - Time Series Algorithm Performance",
  description:
    "Search and compare time series algorithm performance across 12 standard datasets. Browse forecasting, classification, and anomaly detection benchmarks.",
  alternates: {
    canonical: "/benchmark",
    languages: {
      "en": "/benchmark",
      "zh-CN": "/benchmark",
      "x-default": "/benchmark",
    },
  },
  openGraph: {
    title: "Benchmark Query - Time Series Algorithm Performance",
    description:
      "Search and compare time series algorithm performance across 12 standard datasets.",
    url: "/benchmark",
  },
};

export default function BenchmarkLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
