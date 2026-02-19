"""
Generate 20 publication-quality SVG figures for the scientific figure gallery.
Each figure matches the exact colorPalette, chartType, and journalStyle
defined in lib/galleryData.ts.

Usage:
    python scripts/generate-gallery-figures.py

Output:
    gallery_output/*.svg  (20 SVG files)
"""

import os
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from matplotlib.gridspec import GridSpec
import seaborn as sns
from scipy import stats
from pathlib import Path

OUTPUT_DIR = Path(__file__).parent.parent / 'gallery_output'
OUTPUT_DIR.mkdir(exist_ok=True)

# Common settings for publication quality
plt.rcParams.update({
    'font.family': 'sans-serif',
    'font.sans-serif': ['Arial', 'DejaVu Sans', 'Helvetica'],
    'font.size': 11,
    'axes.linewidth': 1.2,
    'axes.labelsize': 12,
    'xtick.labelsize': 10,
    'ytick.labelsize': 10,
    'legend.fontsize': 9,
    'figure.dpi': 150,
    'savefig.bbox': 'tight',
    'savefig.pad_inches': 0.15,
})

np.random.seed(42)


def save(fig, name):
    path = OUTPUT_DIR / name
    fig.savefig(path, format='svg', bbox_inches='tight')
    plt.close(fig)
    print(f'  OK: {name}')


# ─────────────────────────────────────────────────────
# g-001: Multi-panel Time Series Comparison (Nature, muted)
# ─────────────────────────────────────────────────────
def g001():
    colors = ['#4E79A7', '#F28E2B', '#E15759', '#76B7B2', '#59A14F']
    fig, axes = plt.subplots(2, 2, figsize=(8, 6), sharex=True)
    x = np.linspace(0, 10, 100)
    titles = ['Dataset A', 'Dataset B', 'Dataset C', 'Dataset D']
    for idx, ax in enumerate(axes.flat):
        for i, c in enumerate(colors):
            noise = np.random.normal(0, 0.3, len(x))
            y = np.sin(x + i * 0.5 + idx) * (1 + idx * 0.2) + noise + i * 0.5
            ax.plot(x, y, color=c, linewidth=1.5, label=f'Method {i+1}')
        ax.set_title(titles[idx], fontsize=10, fontweight='bold')
        ax.spines['top'].set_visible(False)
        ax.spines['right'].set_visible(False)
        ax.grid(True, alpha=0.2, linewidth=0.5)
    axes[0, 0].legend(frameon=False, ncol=2, fontsize=7)
    axes[1, 0].set_xlabel('Time (s)')
    axes[1, 1].set_xlabel('Time (s)')
    axes[0, 0].set_ylabel('Value')
    axes[1, 0].set_ylabel('Value')
    fig.suptitle('Multi-panel Time Series Comparison', fontsize=13, fontweight='bold', y=1.01)
    fig.tight_layout()
    save(fig, 'nature-timeseries.svg')


# ─────────────────────────────────────────────────────
# g-002: Grouped Bar Chart with Error Bars (IEEE, cool)
# ─────────────────────────────────────────────────────
def g002():
    colors = ['#1F77B4', '#FF7F0E', '#2CA02C', '#D62728']
    methods = ['Method A', 'Method B', 'Method C', 'Method D']
    metrics = ['Accuracy', 'Precision', 'Recall', 'F1-Score', 'AUC']
    n_methods = len(methods)
    n_metrics = len(metrics)
    x = np.arange(n_metrics)
    width = 0.18
    fig, ax = plt.subplots(figsize=(8, 5))
    for i, (method, color) in enumerate(zip(methods, colors)):
        vals = np.random.uniform(0.7, 0.95, n_metrics)
        errs = np.random.uniform(0.01, 0.04, n_metrics)
        offset = (i - n_methods / 2 + 0.5) * width
        ax.bar(x + offset, vals, width, yerr=errs, label=method,
               color=color, edgecolor='white', linewidth=0.5,
               capsize=3, error_kw={'linewidth': 1})
    ax.set_ylabel('Score')
    ax.set_xticks(x)
    ax.set_xticklabels(metrics)
    ax.set_ylim(0.6, 1.05)
    ax.legend(frameon=True, edgecolor='#cccccc', fancybox=False)
    ax.spines['top'].set_visible(False)
    ax.spines['right'].set_visible(False)
    ax.grid(axis='y', alpha=0.2, linewidth=0.5)
    ax.set_title('Model Performance Comparison', fontsize=13, fontweight='bold')
    fig.tight_layout()
    save(fig, 'ieee-bar.svg')


# ─────────────────────────────────────────────────────
# g-003: Scatter Plot with Density Contours (Science, cool)
# ─────────────────────────────────────────────────────
def g003():
    colors = ['#3366CC', '#DC3912', '#FF9900', '#109618']
    fig, ax = plt.subplots(figsize=(7, 6))
    for i, c in enumerate(colors):
        n = 150
        cx, cy = np.random.uniform(-2, 2), np.random.uniform(-2, 2)
        x = np.random.normal(cx, 0.8, n)
        y = np.random.normal(cy, 0.8, n)
        ax.scatter(x, y, c=c, alpha=0.5, s=20, edgecolors='none', label=f'Group {i+1}')
        # density contour
        try:
            xmin, xmax = x.min() - 0.5, x.max() + 0.5
            ymin, ymax = y.min() - 0.5, y.max() + 0.5
            xx, yy = np.mgrid[xmin:xmax:50j, ymin:ymax:50j]
            positions = np.vstack([xx.ravel(), yy.ravel()])
            kernel = stats.gaussian_kde(np.vstack([x, y]))
            f = np.reshape(kernel(positions), xx.shape)
            ax.contour(xx, yy, f, levels=3, colors=[c], alpha=0.6, linewidths=1)
        except Exception:
            pass
    ax.set_xlabel('Principal Component 1')
    ax.set_ylabel('Principal Component 2')
    ax.legend(frameon=True, edgecolor='#cccccc', fancybox=False)
    ax.spines['top'].set_visible(False)
    ax.spines['right'].set_visible(False)
    ax.set_title('Scatter with Density Contours', fontsize=13, fontweight='bold')
    fig.tight_layout()
    save(fig, 'science-scatter.svg')


# ─────────────────────────────────────────────────────
# g-004: Heatmap with Hierarchical Clustering (Cell, cool)
# ─────────────────────────────────────────────────────
def g004():
    from scipy.cluster.hierarchy import linkage, dendrogram
    n_genes, n_samples = 30, 12
    data = np.random.randn(n_genes, n_samples)
    # add some structure
    data[:10, :4] += 2
    data[10:20, 4:8] += 2
    data[20:, 8:] += 2

    row_linkage = linkage(data, method='ward')
    col_linkage = linkage(data.T, method='ward')

    fig = plt.figure(figsize=(9, 7))
    gs = GridSpec(2, 2, width_ratios=[1, 5], height_ratios=[1, 5],
                  hspace=0.02, wspace=0.02)

    # Column dendrogram
    ax_col = fig.add_subplot(gs[0, 1])
    dendrogram(col_linkage, ax=ax_col, color_threshold=0, above_threshold_color='#555555')
    ax_col.set_axis_off()

    # Row dendrogram
    ax_row = fig.add_subplot(gs[1, 0])
    dendrogram(row_linkage, ax=ax_row, orientation='left', color_threshold=0,
               above_threshold_color='#555555')
    ax_row.set_axis_off()

    # Heatmap
    ax_heat = fig.add_subplot(gs[1, 1])
    from matplotlib.colors import LinearSegmentedColormap
    cmap = LinearSegmentedColormap.from_list('cell', ['#2166AC', '#F7F7F7', '#B2182B'])
    im = ax_heat.imshow(data, aspect='auto', cmap=cmap, vmin=-3, vmax=3)
    ax_heat.set_xlabel('Samples')
    ax_heat.set_ylabel('Genes')
    ax_heat.set_xticks(range(n_samples))
    ax_heat.set_xticklabels([f'S{i+1}' for i in range(n_samples)], fontsize=7)
    ax_heat.set_yticks([])

    # Colorbar
    cbar = fig.colorbar(im, ax=ax_heat, fraction=0.03, pad=0.02)
    cbar.set_label('Expression', fontsize=9)

    fig.suptitle('Hierarchical Clustering Heatmap', fontsize=13, fontweight='bold', y=0.95)
    save(fig, 'heatmap-cluster.svg')


# ─────────────────────────────────────────────────────
# g-005: Box Plot with Jitter Points (PNAS, vibrant)
# ─────────────────────────────────────────────────────
def g005():
    colors = ['#E64B35', '#4DBBD5', '#00A087', '#3C5488']
    groups = ['Control', 'Treatment A', 'Treatment B', 'Treatment C']
    fig, ax = plt.subplots(figsize=(7, 5.5))
    data_list = []
    for i in range(4):
        d = np.random.normal(loc=3 + i * 0.8, scale=0.8 + i * 0.1, size=50)
        data_list.append(d)

    bp = ax.boxplot(data_list, patch_artist=True, widths=0.5,
                    medianprops=dict(color='black', linewidth=1.5),
                    whiskerprops=dict(linewidth=1.2),
                    capprops=dict(linewidth=1.2))
    for patch, color in zip(bp['boxes'], colors):
        patch.set_facecolor(color)
        patch.set_alpha(0.6)
        patch.set_edgecolor(color)

    for i, (d, c) in enumerate(zip(data_list, colors)):
        jitter = np.random.uniform(-0.15, 0.15, len(d))
        ax.scatter(np.full_like(d, i + 1) + jitter, d, color=c,
                   alpha=0.6, s=18, edgecolors='white', linewidth=0.5, zorder=3)

    ax.set_xticklabels(groups)
    ax.set_ylabel('Measurement Value')
    ax.spines['top'].set_visible(False)
    ax.spines['right'].set_visible(False)
    ax.grid(axis='y', alpha=0.2, linewidth=0.5)
    ax.set_title('Distribution Comparison with Jitter', fontsize=13, fontweight='bold')
    fig.tight_layout()
    save(fig, 'boxplot-jitter.svg')


# ─────────────────────────────────────────────────────
# g-006: Violin Plot Comparison (Nature, muted)
# ─────────────────────────────────────────────────────
def g006():
    colors = ['#7570B3', '#D95F02', '#1B9E77']
    fig, ax = plt.subplots(figsize=(7, 5.5))
    groups = ['Metric A', 'Metric B', 'Metric C', 'Metric D', 'Metric E']
    data = [np.random.normal(loc=i * 0.5 + 2, scale=0.5 + i * 0.1, size=100) for i in range(5)]

    parts = ax.violinplot(data, positions=range(1, 6), showmeans=False,
                          showmedians=True, showextrema=False)
    for i, pc in enumerate(parts['bodies']):
        pc.set_facecolor(colors[i % len(colors)])
        pc.set_alpha(0.7)
        pc.set_edgecolor(colors[i % len(colors)])
    parts['cmedians'].set_color('#333333')
    parts['cmedians'].set_linewidth(1.5)

    ax.set_xticks(range(1, 6))
    ax.set_xticklabels(groups)
    ax.set_ylabel('Score')
    ax.spines['top'].set_visible(False)
    ax.spines['right'].set_visible(False)
    ax.grid(axis='y', alpha=0.2, linewidth=0.5)
    ax.set_title('Violin Plot Comparison', fontsize=13, fontweight='bold')
    fig.tight_layout()
    save(fig, 'violin-comparison.svg')


# ─────────────────────────────────────────────────────
# g-007: Stacked Area Chart (ACS, warm)
# ─────────────────────────────────────────────────────
def g007():
    colors = ['#E41A1C', '#377EB8', '#4DAF4A', '#984EA3', '#FF7F00']
    fig, ax = plt.subplots(figsize=(8, 5))
    x = np.arange(2015, 2026)
    n = len(x)
    raw = np.random.rand(5, n)
    raw = raw / raw.sum(axis=0)  # normalize to proportions
    labels = ['Component A', 'Component B', 'Component C', 'Component D', 'Component E']
    ax.stackplot(x, raw, labels=labels, colors=colors, alpha=0.85)
    ax.set_xlim(2015, 2025)
    ax.set_ylim(0, 1)
    ax.set_ylabel('Proportion')
    ax.set_xlabel('Year')
    ax.legend(loc='upper left', frameon=True, edgecolor='#cccccc', fontsize=8)
    ax.spines['top'].set_visible(False)
    ax.spines['right'].set_visible(False)
    ax.set_title('Composition Change Over Time', fontsize=13, fontweight='bold')
    fig.tight_layout()
    save(fig, 'acs-area.svg')


# ─────────────────────────────────────────────────────
# g-008: Radar Chart (Custom, vibrant)
# ─────────────────────────────────────────────────────
def g008():
    colors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0']
    categories = ['Accuracy', 'Speed', 'Memory', 'Scalability', 'Robustness', 'Usability']
    n_cats = len(categories)
    angles = np.linspace(0, 2 * np.pi, n_cats, endpoint=False).tolist()
    angles += angles[:1]

    fig, ax = plt.subplots(figsize=(7, 7), subplot_kw=dict(polar=True))
    methods = ['Model A', 'Model B', 'Model C', 'Model D']
    for i, (method, color) in enumerate(zip(methods, colors)):
        values = np.random.uniform(0.5, 1.0, n_cats).tolist()
        values += values[:1]
        ax.plot(angles, values, 'o-', linewidth=2, color=color, label=method, markersize=5)
        ax.fill(angles, values, alpha=0.15, color=color)

    ax.set_xticks(angles[:-1])
    ax.set_xticklabels(categories, fontsize=10)
    ax.set_ylim(0, 1.1)
    ax.set_yticks([0.25, 0.5, 0.75, 1.0])
    ax.set_yticklabels(['0.25', '0.5', '0.75', '1.0'], fontsize=8)
    ax.legend(loc='upper right', bbox_to_anchor=(1.25, 1.1), frameon=True, edgecolor='#cccccc')
    ax.set_title('Multi-metric Radar Evaluation', fontsize=13, fontweight='bold', pad=20)
    fig.tight_layout()
    save(fig, 'radar-eval.svg')


# ─────────────────────────────────────────────────────
# g-009: Dual Y-axis Plot (Nature, neutral)
# ─────────────────────────────────────────────────────
def g009():
    colors = ['#0072B2', '#D55E00', '#009E73', '#CC79A7']
    fig, ax1 = plt.subplots(figsize=(8, 5))
    x = np.linspace(0, 10, 60)
    y1 = np.cumsum(np.random.normal(0.1, 0.5, len(x)))
    y2 = np.sin(x) * 50 + 100 + np.random.normal(0, 5, len(x))

    ax1.plot(x, y1, color=colors[0], linewidth=2, label='Temperature (°C)')
    ax1.set_xlabel('Time (hours)')
    ax1.set_ylabel('Temperature (°C)', color=colors[0])
    ax1.tick_params(axis='y', labelcolor=colors[0])
    ax1.spines['top'].set_visible(False)

    ax2 = ax1.twinx()
    ax2.plot(x, y2, color=colors[1], linewidth=2, linestyle='--', label='Pressure (kPa)')
    ax2.set_ylabel('Pressure (kPa)', color=colors[1])
    ax2.tick_params(axis='y', labelcolor=colors[1])
    ax2.spines['top'].set_visible(False)

    lines1, labels1 = ax1.get_legend_handles_labels()
    lines2, labels2 = ax2.get_legend_handles_labels()
    ax1.legend(lines1 + lines2, labels1 + labels2, loc='upper left', frameon=True, edgecolor='#cccccc')

    ax1.set_title('Dual Y-axis: Temperature vs Pressure', fontsize=13, fontweight='bold')
    fig.tight_layout()
    save(fig, 'dual-yaxis.svg')


# ─────────────────────────────────────────────────────
# g-010: Sankey Flow Diagram (Custom, vibrant)
# ─────────────────────────────────────────────────────
def g010():
    colors = ['#a6cee3', '#1f78b4', '#b2df8a', '#33a02c', '#fb9a99']
    fig, ax = plt.subplots(figsize=(8, 6))
    # Simulate a Sankey as alluvial/flow with filled polygons
    n_flows = 5
    labels_left = ['Source A', 'Source B', 'Source C', 'Source D', 'Source E']
    labels_right = ['Target 1', 'Target 2', 'Target 3', 'Target 4', 'Target 5']
    flow_matrix = np.random.randint(5, 30, (n_flows, n_flows))

    # Normalize flow heights
    left_heights = flow_matrix.sum(axis=1)
    right_heights = flow_matrix.sum(axis=0)
    total = left_heights.sum()
    gap = 0.02
    left_positions = []
    pos = 0
    for h in left_heights:
        left_positions.append(pos)
        pos += h / total + gap

    right_positions = []
    pos = 0
    for h in right_heights:
        right_positions.append(pos)
        pos += h / total + gap

    # Draw flows as curved bands
    for i in range(n_flows):
        ly = left_positions[i]
        for j in range(n_flows):
            ry = right_positions[j]
            fh = flow_matrix[i, j] / total
            x_pts = np.linspace(0, 1, 50)
            # Sigmoid curve
            upper = ly + (ry - ly) / (1 + np.exp(-10 * (x_pts - 0.5)))
            lower = upper + fh
            ax.fill_between(x_pts, upper, lower, alpha=0.5, color=colors[i % len(colors)], linewidth=0)
            ry_offset = flow_matrix[i, j] / total
            right_positions[j] += ry_offset
            ly += fh

    # Labels
    ly_label = 0
    for i, (label, h) in enumerate(zip(labels_left, left_heights)):
        mid = ly_label + h / total / 2
        ax.text(-0.05, mid, label, ha='right', va='center', fontsize=9, fontweight='bold')
        ly_label += h / total + gap

    ax.set_xlim(-0.2, 1.2)
    ax.set_axis_off()
    ax.set_title('Sankey Flow Diagram', fontsize=13, fontweight='bold')
    fig.tight_layout()
    save(fig, 'sankey-flow.svg')


# ─────────────────────────────────────────────────────
# g-011: Minimalist Line Chart (Custom, monochrome)
# ─────────────────────────────────────────────────────
def g011():
    colors = ['#333333', '#999999', '#CCCCCC']
    fig, ax = plt.subplots(figsize=(8, 4.5))
    x = np.linspace(0, 10, 80)
    for i, (c, lw) in enumerate(zip(colors, [2.5, 1.8, 1.2])):
        y = np.cumsum(np.random.normal(0, 0.5, len(x))) + i * 3
        ax.plot(x, y, color=c, linewidth=lw, label=f'Series {i+1}')

    ax.spines['top'].set_visible(False)
    ax.spines['right'].set_visible(False)
    ax.spines['bottom'].set_linewidth(0.8)
    ax.spines['left'].set_linewidth(0.8)
    ax.grid(False)
    ax.set_xlabel('Time')
    ax.set_ylabel('Value')
    ax.legend(frameon=False, fontsize=9)
    ax.set_title('Minimalist Line Chart', fontsize=13, fontweight='bold')
    fig.tight_layout()
    save(fig, 'minimal-line.svg')


# ─────────────────────────────────────────────────────
# g-012: Warm-toned Horizontal Bar Chart (Lancet, warm)
# ─────────────────────────────────────────────────────
def g012():
    colors = ['#AD002A', '#ED0000', '#00468B', '#42B540', '#0099B4']
    fig, ax = plt.subplots(figsize=(8, 5.5))
    categories = ['Approach E', 'Approach D', 'Approach C', 'Approach B', 'Approach A']
    values = np.random.uniform(40, 95, 5)
    errors = np.random.uniform(2, 8, 5)

    bars = ax.barh(categories, values, xerr=errors, height=0.55,
                   color=colors, edgecolor='white', linewidth=0.5,
                   capsize=4, error_kw={'linewidth': 1.2})

    ax.set_xlabel('Score (%)')
    ax.set_xlim(0, 110)
    ax.spines['top'].set_visible(False)
    ax.spines['right'].set_visible(False)
    ax.grid(axis='x', alpha=0.2, linewidth=0.5)

    for bar, val in zip(bars, values):
        ax.text(bar.get_width() + 3, bar.get_y() + bar.get_height() / 2,
                f'{val:.1f}%', va='center', fontsize=9)

    ax.set_title('Horizontal Bar Chart — Lancet Style', fontsize=13, fontweight='bold')
    fig.tight_layout()
    save(fig, 'warm-bar.svg')


# ─────────────────────────────────────────────────────
# g-013: Multi-dataset Scatter with Trendlines (IEEE, cool)
# ─────────────────────────────────────────────────────
def g013():
    colors = ['#0073C2', '#EFC000', '#868686', '#CD534C']
    fig, ax = plt.subplots(figsize=(7, 5.5))
    groups = ['Dataset 1', 'Dataset 2', 'Dataset 3', 'Dataset 4']
    for i, (group, color) in enumerate(zip(groups, colors)):
        n = 40
        x = np.random.uniform(0, 10, n)
        slope = 0.5 + i * 0.3
        y = slope * x + np.random.normal(0, 1.5, n) + i * 2
        ax.scatter(x, y, c=color, alpha=0.6, s=30, edgecolors='white', linewidth=0.5, label=group)
        # Trendline
        z = np.polyfit(x, y, 1)
        p = np.poly1d(z)
        x_line = np.linspace(0, 10, 50)
        ax.plot(x_line, p(x_line), color=color, linewidth=1.5, linestyle='--', alpha=0.8)

    ax.set_xlabel('Feature X')
    ax.set_ylabel('Response Y')
    ax.legend(frameon=True, edgecolor='#cccccc', fancybox=False)
    ax.spines['top'].set_visible(False)
    ax.spines['right'].set_visible(False)
    ax.grid(True, alpha=0.15, linewidth=0.5)
    ax.set_title('Scatter with Linear Trendlines', fontsize=13, fontweight='bold')
    fig.tight_layout()
    save(fig, 'scatter-trend.svg')


# ─────────────────────────────────────────────────────
# g-014: Donut/Pie Chart with Labels (Custom, vibrant)
# ─────────────────────────────────────────────────────
def g014():
    colors = ['#5470C6', '#91CC75', '#FAC858', '#EE6666', '#73C0DE']
    fig, ax = plt.subplots(figsize=(7, 7))
    labels = ['Category A', 'Category B', 'Category C', 'Category D', 'Category E']
    sizes = [28, 22, 20, 18, 12]
    explode = (0.03, 0.03, 0.03, 0.03, 0.03)

    wedges, texts, autotexts = ax.pie(
        sizes, explode=explode, labels=labels, colors=colors,
        autopct='%1.1f%%', startangle=90, pctdistance=0.78,
        wedgeprops=dict(width=0.45, edgecolor='white', linewidth=2))

    for t in autotexts:
        t.set_fontsize(10)
        t.set_fontweight('bold')
    for t in texts:
        t.set_fontsize(10)

    ax.set_title('Proportion Distribution', fontsize=13, fontweight='bold', pad=15)
    fig.tight_layout()
    save(fig, 'pie-labels.svg')


# ─────────────────────────────────────────────────────
# g-015: Confidence Band Line Plot (Nature Methods, muted)
# ─────────────────────────────────────────────────────
def g015():
    colors = ['#4E79A7', '#A0CBE8', '#F28E2B', '#FFBE7D']
    fig, ax = plt.subplots(figsize=(8, 5))
    x = np.linspace(0, 10, 80)

    for i in range(2):
        mean = np.sin(x * (1 + i * 0.3)) * (2 - i * 0.5) + i * 2
        std = 0.4 + np.random.uniform(0, 0.3, len(x))
        ax.plot(x, mean, color=colors[i * 2], linewidth=2, label=f'Method {i+1}')
        ax.fill_between(x, mean - std, mean + std, color=colors[i * 2 + 1], alpha=0.4)

    ax.set_xlabel('Epoch')
    ax.set_ylabel('Loss')
    ax.legend(frameon=True, edgecolor='#cccccc', fancybox=False)
    ax.spines['top'].set_visible(False)
    ax.spines['right'].set_visible(False)
    ax.grid(True, alpha=0.15, linewidth=0.5)
    ax.set_title('Training Curves with Confidence Bands', fontsize=13, fontweight='bold')
    fig.tight_layout()
    save(fig, 'confidence-band.svg')


# ─────────────────────────────────────────────────────
# g-016: High-contrast Accessibility Chart (Custom, neutral)
# ─────────────────────────────────────────────────────
def g016():
    colors = ['#000000', '#E69F00', '#56B4E9', '#009E73', '#F0E442']
    markers = ['o', 's', '^', 'D', 'v']
    linestyles = ['-', '--', '-.', ':', '-']
    fig, ax = plt.subplots(figsize=(8, 5))
    x = np.linspace(0, 10, 30)
    for i, (c, m, ls) in enumerate(zip(colors, markers, linestyles)):
        y = np.cumsum(np.random.normal(0.2, 0.4, len(x))) + i * 2
        ax.plot(x, y, color=c, marker=m, linestyle=ls, linewidth=2,
                markersize=6, markerfacecolor=c, markeredgecolor='white',
                markeredgewidth=0.5, label=f'Series {i+1}')

    ax.set_xlabel('X-axis')
    ax.set_ylabel('Y-axis')
    ax.legend(frameon=True, edgecolor='#cccccc', fancybox=False, ncol=2)
    ax.spines['top'].set_visible(False)
    ax.spines['right'].set_visible(False)
    ax.grid(True, alpha=0.15, linewidth=0.5)
    ax.set_title('Colorblind-friendly Chart with Markers', fontsize=13, fontweight='bold')
    fig.tight_layout()
    save(fig, 'accessible-chart.svg')


# ─────────────────────────────────────────────────────
# g-017: Gradient Heatmap Matrix (Science, monochrome)
# ─────────────────────────────────────────────────────
def g017():
    from matplotlib.colors import LinearSegmentedColormap
    fig, ax = plt.subplots(figsize=(7, 6))
    n = 10
    # Correlation-like matrix
    A = np.random.randn(50, n)
    corr = np.corrcoef(A.T)
    labels = [f'Var {i+1}' for i in range(n)]

    cmap = LinearSegmentedColormap.from_list('blues', ['#F7FBFF', '#6BAED6', '#08306B'])
    im = ax.imshow(corr, cmap=cmap, vmin=-1, vmax=1, aspect='equal')

    ax.set_xticks(range(n))
    ax.set_yticks(range(n))
    ax.set_xticklabels(labels, rotation=45, ha='right', fontsize=8)
    ax.set_yticklabels(labels, fontsize=8)

    # Annotate
    for i in range(n):
        for j in range(n):
            val = corr[i, j]
            color = 'white' if abs(val) > 0.5 else 'black'
            ax.text(j, i, f'{val:.2f}', ha='center', va='center', fontsize=7, color=color)

    cbar = fig.colorbar(im, ax=ax, fraction=0.046, pad=0.04)
    cbar.set_label('Correlation', fontsize=10)
    ax.set_title('Correlation Matrix Heatmap', fontsize=13, fontweight='bold')
    fig.tight_layout()
    save(fig, 'gradient-heatmap.svg')


# ─────────────────────────────────────────────────────
# g-018: Error Bar Comparison Chart (ACS, cool)
# ─────────────────────────────────────────────────────
def g018():
    colors = ['#1B9E77', '#D95F02', '#7570B3', '#E7298A']
    fig, ax = plt.subplots(figsize=(8, 5))
    methods = ['Baseline', 'Method A', 'Method B', 'Method C']
    metrics = ['MAE', 'RMSE', 'R²', 'MAPE']
    x_pos = np.arange(len(metrics))

    for i, (method, color) in enumerate(zip(methods, colors)):
        vals = np.random.uniform(0.5, 0.95, len(metrics))
        errs = np.random.uniform(0.02, 0.08, len(metrics))
        offset = (i - 1.5) * 0.15
        ax.errorbar(x_pos + offset, vals, yerr=errs, fmt='o', color=color,
                    markersize=8, capsize=5, capthick=1.5, linewidth=1.5,
                    label=method, markeredgecolor='white', markeredgewidth=0.8)

    ax.set_xticks(x_pos)
    ax.set_xticklabels(metrics)
    ax.set_ylabel('Score')
    ax.set_ylim(0.3, 1.1)
    ax.legend(frameon=True, edgecolor='#cccccc', fancybox=False)
    ax.spines['top'].set_visible(False)
    ax.spines['right'].set_visible(False)
    ax.grid(axis='y', alpha=0.2, linewidth=0.5)
    ax.set_title('Error Bar Method Comparison', fontsize=13, fontweight='bold')
    fig.tight_layout()
    save(fig, 'error-bar.svg')


# ─────────────────────────────────────────────────────
# g-019: Dark Theme Dashboard Chart (Custom, vibrant)
# ─────────────────────────────────────────────────────
def g019():
    colors = ['#00DDFF', '#37A2DA', '#67E0E3', '#FFDB5C', '#FF9F7F']
    dark_bg = '#1a1a2e'
    grid_color = '#333355'

    fig, axes = plt.subplots(1, 3, figsize=(12, 4.5))
    fig.patch.set_facecolor(dark_bg)

    for ax in axes:
        ax.set_facecolor(dark_bg)
        ax.tick_params(colors='#aaaaaa')
        ax.spines['bottom'].set_color('#555577')
        ax.spines['left'].set_color('#555577')
        ax.spines['top'].set_visible(False)
        ax.spines['right'].set_visible(False)
        ax.xaxis.label.set_color('#cccccc')
        ax.yaxis.label.set_color('#cccccc')
        ax.title.set_color('#eeeeee')

    # Chart 1: Line
    x = np.linspace(0, 10, 50)
    for i, c in enumerate(colors[:3]):
        y = np.sin(x + i) * (2 + i * 0.5) + np.random.normal(0, 0.3, len(x))
        axes[0].plot(x, y, color=c, linewidth=2)
    axes[0].set_title('Real-time Metrics', fontsize=11, fontweight='bold')
    axes[0].grid(True, color=grid_color, alpha=0.5, linewidth=0.5)

    # Chart 2: Bar
    cats = ['A', 'B', 'C', 'D', 'E']
    vals = np.random.uniform(20, 80, 5)
    axes[1].bar(cats, vals, color=colors, edgecolor=dark_bg, linewidth=1)
    axes[1].set_title('Category Distribution', fontsize=11, fontweight='bold')
    axes[1].grid(axis='y', color=grid_color, alpha=0.5, linewidth=0.5)

    # Chart 3: Area
    x = np.arange(12)
    for i, c in enumerate(colors[:3]):
        y = np.random.uniform(10, 40, 12) + i * 10
        axes[2].fill_between(x, y, alpha=0.4, color=c)
        axes[2].plot(x, y, color=c, linewidth=1.5)
    axes[2].set_title('Trend Overview', fontsize=11, fontweight='bold')
    axes[2].grid(True, color=grid_color, alpha=0.5, linewidth=0.5)

    fig.suptitle('Dark Theme Dashboard', fontsize=14, fontweight='bold', color='#eeeeee', y=1.02)
    fig.tight_layout()
    save(fig, 'dark-dashboard.svg')


# ─────────────────────────────────────────────────────
# g-020: Pastel Multi-series Area (PNAS, muted)
# ─────────────────────────────────────────────────────
def g020():
    colors = ['#AEC7E8', '#FFBB78', '#98DF8A', '#FF9896', '#C5B0D5']
    fig, ax = plt.subplots(figsize=(8, 5))
    x = np.linspace(0, 10, 80)
    labels = ['Series A', 'Series B', 'Series C', 'Series D', 'Series E']

    for i, (c, label) in enumerate(zip(colors, labels)):
        base = np.sin(x * (0.5 + i * 0.2)) * 2 + i * 1.5 + 5
        noise = np.random.normal(0, 0.3, len(x))
        y = base + noise
        ax.fill_between(x, y - 0.8, y + 0.8, alpha=0.4, color=c)
        ax.plot(x, y, color=c, linewidth=1.8, label=label)

    ax.set_xlabel('Time')
    ax.set_ylabel('Intensity')
    ax.legend(frameon=True, edgecolor='#cccccc', fancybox=False, fontsize=8)
    ax.spines['top'].set_visible(False)
    ax.spines['right'].set_visible(False)
    ax.grid(True, alpha=0.15, linewidth=0.5)
    ax.set_title('Pastel Multi-series Area Chart', fontsize=13, fontweight='bold')
    fig.tight_layout()
    save(fig, 'pastel-area.svg')


# ─────────────────────────────────────────────────────
# Main
# ─────────────────────────────────────────────────────
if __name__ == '__main__':
    generators = [
        g001, g002, g003, g004, g005,
        g006, g007, g008, g009, g010,
        g011, g012, g013, g014, g015,
        g016, g017, g018, g019, g020,
    ]
    print(f'Generating {len(generators)} gallery figures into {OUTPUT_DIR}/ ...\n')
    for fn in generators:
        name = fn.__name__
        print(f'[{name}]', end=' ')
        try:
            fn()
        except Exception as e:
            print(f'  FAIL: {e}')
    print(f'\nDone! {len(generators)} SVGs saved to {OUTPUT_DIR}/')
