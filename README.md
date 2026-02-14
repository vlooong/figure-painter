# Figure Painter

A web-based tool for extracting data from scientific paper figures and creating publication-quality plots.

[中文文档](./README.zh-CN.md)

## Features

### Data Extraction
- **Image Upload** — Upload figure images (PNG, JPG, BMP, WebP) with zoom and pan
- **Axis Calibration** — 4-point calibration system with linear/log scale support
- **Color Picker** — Sample curve colors from the image with adjustable tolerance
- **Curve Extraction** — Automatically extract data points by color matching
- **Interactive Editing** — Drag points on canvas or edit values in the data table
- **Overlay Verification** — Overlay extracted curve on original image to verify accuracy
- **Export** — Export data as CSV or Excel, or send directly to the plotting module

### Scientific Plotting
- **ECharts Engine** — Interactive chart rendering with real-time preview
- **Multi-Dataset** — Overlay multiple datasets on the same plot with dual Y-axis support
- **Style Templates** — Built-in academic journal styles:
  - **Default** — Clean general-purpose style
  - **Nature** — Compact style for Nature journal figures
  - **IEEE** — Column-width style for IEEE publications
  - **ACS** — ACS single-column figure style
  - **Science** — Minimal style for Science journal figures
- **Custom Overrides** — Adjust title font size, line width, colors, grid visibility
- **Chart Export** — Export as PNG or SVG with configurable DPI (72–600)

### General
- **i18n** — Full Chinese and English language support
- **Client-Side** — All processing happens in the browser, no server required
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
| CSV Parsing | [PapaParse](https://www.papaparse.com/) |
| Excel Export | [SheetJS](https://sheetjs.com/) |
| Testing | [Vitest](https://vitest.dev/) + [Playwright](https://playwright.dev/) |

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm

### Install & Run

```bash
# Clone the repository
git clone https://github.com/your-username/figure-painter.git
cd figure-painter

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
```

The static site is exported to the `out/` directory and can be deployed to any static hosting service.

## Project Structure

```
figure-painter/
├── app/                    # Next.js pages (home, extract, plot)
├── components/
│   ├── extract/            # Data extraction components
│   ├── plot/               # Plotting components
│   ├── shared/             # Navigation, Providers, LanguageSwitcher
│   └── ui/                 # shadcn/ui primitives
├── lib/
│   ├── i18n/               # Internationalization (en, zh)
│   ├── templates.ts        # Chart style templates
│   └── types.ts            # TypeScript type definitions
├── stores/                 # Zustand stores
│   ├── extractStore.ts     # Extraction state
│   ├── datasetStore.ts     # Dataset persistence (Dexie)
│   └── plotStore.ts        # Plot configuration state
└── services/               # Export services (CSV, Excel)
```

## License

MIT
