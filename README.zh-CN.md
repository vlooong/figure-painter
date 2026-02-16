# Figure Painter

基于浏览器的科研论文图表数据提取、出版级绘图与 Benchmark 结果查询工具 —— 纯客户端，无需服务器。

**在线使用: [figure.vlooong.top](https://figure.vlooong.top)**

[English](./README.md)

## 为什么选择 Figure Painter？

- **从论文图表中提取数据** —— 上传图表图片，标定坐标轴，采样曲线颜色，自动提取数据点。告别手动读取图表数值。
- **生成期刊级图表** —— 内置 Nature、IEEE、ACS、Science 等期刊风格模板。导出高 DPI PNG 或 SVG，直接用于投稿。
- **即时查询 Benchmark 结果** —— 搜索时序算法在标准数据集上的性能指标。一键复制对比表格为 LaTeX、TSV 或 Markdown，直接粘贴到论文中。
- **完全浏览器端运行** —— 零服务器依赖。数据通过 IndexedDB 保存在本地。首次加载后可离线使用。

## 功能特性

### 数据提取
- **图片上传** —— 支持 PNG、JPG、BMP、WebP，可缩放和平移
- **坐标轴标定** —— 4 点标定系统，支持线性和对数坐标
- **基于颜色的提取** —— 采样曲线颜色并调节容差，自动提取数据点
- **手动绘制** —— 当自动提取不适用时，沿曲线手动放置数据点
- **叠图验证** —— 将提取的曲线叠加到原图上进行对比验证
- **数据导出** —— CSV、Excel，或直接发送到绘图模块

### 科研绘图
- **ECharts 引擎** —— 交互式渲染，实时预览
- **期刊模板** —— Default、Nature、IEEE、ACS、Science，以及色盲安全配色（鲜明、柔和、高对比）
- **多数据集** —— 每图数据集数量无限制，双 Y 轴，一键复制数据集
- **精细控制** —— 标记形状/大小、图例位置、网格样式、线条类型、平滑曲线、坐标轴字号
- **数据点拖拽** —— 在图表上直接拖拽数据点调整数值（可关闭以获得干净的导出图）
- **图表导出** —— PNG 或 SVG，DPI 可配置（72–600）

### Benchmark 查询
- **数据集搜索** —— 12 个时序基准数据集，支持关键词过滤
- **任务类别** —— 长期/短期预测、异常检测、分类、缺失值填充
- **算法对比** —— MSE/MAE 指标，支持多预测长度（96、192、336、720），最优值高亮
- **论文链接** —— 每个算法结果均提供 arXiv 直链
- **复制到论文** —— 一键导出为 LaTeX、TSV 或 Markdown 表格

### 通用特性
- **双语界面** —— 完整的中英文支持
- **纯客户端** —— 所有处理均在浏览器端完成，数据不离开本机
- **本地持久化** —— 数据集通过 IndexedDB (Dexie) 保存在本地

## 技术栈

| 分类 | 技术 |
|------|------|
| 框架 | [Next.js 16](https://nextjs.org/)（静态导出） |
| UI 组件 | [shadcn/ui](https://ui.shadcn.com/) + [Radix UI](https://www.radix-ui.com/) |
| 样式 | [Tailwind CSS 4](https://tailwindcss.com/) |
| 图表 | [ECharts 6](https://echarts.apache.org/) |
| 状态管理 | [Zustand 5](https://zustand.docs.pmnd.rs/) |
| 本地数据库 | [Dexie 4](https://dexie.org/)（IndexedDB） |
| CSV/Excel | [PapaParse](https://www.papaparse.com/) + [SheetJS](https://sheetjs.com/) |
| 测试 | [Vitest](https://vitest.dev/) + [Playwright](https://playwright.dev/) |

## 快速开始

```bash
git clone https://github.com/your-username/figure-painter.git
cd figure-painter
npm install
npm run dev
```

在浏览器中打开 [http://localhost:3000](http://localhost:3000)。

### 生产构建

```bash
npm run build
```

静态站点导出到 `out/` 目录，可部署到任意静态托管服务。

## 项目结构

```
figure-painter/
├── app/                    # Next.js 页面（首页、提取、绘图、Benchmark）
├── components/
│   ├── benchmark/          # Benchmark 查询组件
│   ├── extract/            # 数据提取组件
│   ├── plot/               # 绘图组件
│   ├── shared/             # 导航栏、Provider、语言切换
│   └── ui/                 # shadcn/ui 基础组件
├── hooks/                  # 自定义 React Hooks（useECharts 等）
├── lib/
│   ├── i18n/               # 国际化（英文、中文）
│   ├── benchmarkData.ts    # Benchmark 数据集与算法数据
│   ├── templates.ts        # 图表风格模板
│   └── types.ts            # TypeScript 类型定义
├── stores/                 # Zustand 状态管理（提取、数据集、绘图）
└── services/               # 导出服务（CSV、Excel、PNG、SVG）
```

## 许可证

MIT
