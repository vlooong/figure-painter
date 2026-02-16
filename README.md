# Figure Painter

A browser-based toolkit for scientific paper figure data extraction, publication-quality plotting, and benchmark result querying — all client-side, no server required.

**Live Demo: [figure.vlooong.top](https://figure.vlooong.top)**

[中文文档](./README.zh-CN.md)

## Why Figure Painter?

- **Extract data from paper figures** — Upload a chart image, calibrate axes, pick curve colors, and automatically extract data points. No more manual reading of graph values.
- **Create journal-ready plots** — Built-in style templates for Nature, IEEE, ACS, Science and more. Export as high-DPI PNG or SVG, ready for submission.
- **Query benchmark results instantly** — Search time series algorithm performance across standard datasets. Copy comparison tables as LaTeX, TSV, or Markdown directly into your paper.
- **Everything in the browser** — Zero server dependency. Data stays on your machine via IndexedDB. Works offline after first load.

## Features

### Data Extraction
- **Image Upload** — PNG, JPG, BMP, WebP with zoom and pan
- **Axis Calibration** — 4-point system with linear/log scale support
- **Color-Based Extraction** — Sample curve colors with adjustable tolerance, auto-extract data points
- **Manual Drawing** — Place points along curves manually when auto-extraction isn't suitable
- **Overlay Verification** — Superimpose extracted curve on the original image for accuracy check
- **Export** — CSV, Excel, or send directly to the plotting module

### Scientific Plotting
- **ECharts Engine** — Interactive rendering with real-time preview
- **Journal Templates** — Default, Nature, IEEE, ACS, Science, plus color-blind safe palettes (Vibrant, Muted, High Contrast)
- **Multi-Dataset** — Unlimited datasets per chart, dual Y-axis, dataset duplication
- **Fine Control** — Symbol shape/size, legend position, grid style, line type, smooth curves, axis font size
- **Draggable Points** — Adjust data values by dragging points directly on the chart (toggleable for clean exports)
- **Export** — PNG or SVG with configurable DPI (72–600)

### Benchmark Query
- **Dataset Search** — 12 time series benchmark datasets with keyword filtering
- **Task Categories** — Long/short-term forecasting, anomaly detection, classification, imputation
- **Algorithm Comparison** — MSE/MAE metrics across prediction horizons (96, 192, 336, 720) with best-value highlighting
- **Paper Links** — Direct arXiv links for every algorithm result
- **Copy to Paper** — One-click export as LaTeX, TSV, or Markdown table

### General
- **Bilingual** — Full Chinese and English interface
- **Client-Side Only** — All processing in the browser, no data leaves your machine
- **Persistent Storage** — Datasets saved locally via IndexedDB (Dexie)

## Tech Stack

| Category | Technology |
|----------|-----------|
| Framework | [Next.js 16](https://nextjs.org/) (Static Export) |
| UI Components | [shadcn/ui](https://ui.shadcn.com/) + [Radix UI](https://www.radix-ui.com/) |
| Styling | [Tailwind CSS 4](https://tailwindcss.com/) |
| Charts | [ECharts 6](https://echarts.apache.org/) |
| State Management | [Zustand 5](https://zustand.docs.pmnd.rs/) |
| Local Database | [Dexie 4](https://dexie.org/) (IndexedDB) |
| CSV/Excel | [PapaParse](https://www.papaparse.com/) + [SheetJS](https://sheetjs.com/) |
| Testing | [Vitest](https://vitest.dev/) + [Playwright](https://playwright.dev/) |

## Getting Started

```bash
git clone https://github.com/your-username/figure-painter.git
cd figure-painter
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
```

Static site exports to `out/` — deploy to any static hosting service.

## Project Structure

```
figure-painter/
├── app/                    # Next.js pages (home, extract, plot, benchmark)
├── components/
│   ├── benchmark/          # Benchmark query components
│   ├── extract/            # Data extraction components
│   ├── plot/               # Plotting components
│   ├── shared/             # Navigation, Providers, LanguageSwitcher
│   └── ui/                 # shadcn/ui primitives
├── hooks/                  # Custom React hooks (useECharts, etc.)
├── lib/
│   ├── i18n/               # Internationalization (en, zh)
│   ├── benchmarkData.ts    # Benchmark dataset & algorithm data
│   ├── templates.ts        # Chart style templates
│   └── types.ts            # TypeScript type definitions
├── stores/                 # Zustand stores (extract, dataset, plot)
└── services/               # Export services (CSV, Excel, PNG, SVG)
```

## License

MIT
