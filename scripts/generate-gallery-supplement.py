"""
Generate 10 supplemental gallery figures covering advanced scientific chart types.
These complement the original 20 figures with more specialized chart types
commonly seen in top-tier journals.

Usage:
    python scripts/generate-gallery-supplement.py

Output:
    gallery_output/*.svg  (10 additional SVG files)
"""

import os
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.gridspec import GridSpec
from matplotlib.colors import LinearSegmentedColormap
import seaborn as sns
from scipy import stats
from pathlib import Path

OUTPUT_DIR = Path(__file__).parent.parent / 'gallery_output'
OUTPUT_DIR.mkdir(exist_ok=True)

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

np.random.seed(2024)


def save(fig, name):
    path = OUTPUT_DIR / name
    fig.savefig(path, format='svg', bbox_inches='tight')
    plt.close(fig)
    print(f'  OK: {name}')


# ─────────────────────────────────────────────────────
# g-021: Volcano Plot (Bioinformatics, vibrant)
# ─────────────────────────────────────────────────────
def g021():
    """RNA-seq style volcano plot with three-color scheme"""
    colors = {'up': '#E64B35', 'down': '#3C5488', 'ns': '#B8B8B8'}
    fig, ax = plt.subplots(figsize=(7, 6))

    n = 5000
    log2fc = np.random.normal(0, 1.2, n)
    pval = 10 ** (-np.abs(log2fc) * np.random.uniform(0.5, 3, n))
    neg_log10p = -np.log10(pval)

    # Classify: |log2FC| > 1 and p < 0.05
    is_sig = (pval < 0.05) & (np.abs(log2fc) > 1)
    is_up = is_sig & (log2fc > 0)
    is_down = is_sig & (log2fc < 0)
    is_ns = ~is_sig

    ax.scatter(log2fc[is_ns], neg_log10p[is_ns], c=colors['ns'], s=8, alpha=0.4, edgecolors='none')
    ax.scatter(log2fc[is_down], neg_log10p[is_down], c=colors['down'], s=12, alpha=0.6, edgecolors='none', label=f'Down ({is_down.sum()})')
    ax.scatter(log2fc[is_up], neg_log10p[is_up], c=colors['up'], s=12, alpha=0.6, edgecolors='none', label=f'Up ({is_up.sum()})')

    ax.axhline(y=-np.log10(0.05), color='#666666', linestyle='--', linewidth=0.8, alpha=0.5)
    ax.axvline(x=-1, color='#666666', linestyle='--', linewidth=0.8, alpha=0.5)
    ax.axvline(x=1, color='#666666', linestyle='--', linewidth=0.8, alpha=0.5)

    # Label top genes
    top_idx = np.argsort(neg_log10p)[-8:]
    gene_names = [f'Gene{i}' for i in range(n)]
    for idx in top_idx:
        ax.annotate(gene_names[idx], (log2fc[idx], neg_log10p[idx]),
                    fontsize=7, ha='center', va='bottom',
                    arrowprops=dict(arrowstyle='-', color='#555555', lw=0.5))

    ax.set_xlabel(r'$\log_2$(Fold Change)')
    ax.set_ylabel(r'$-\log_{10}$(p-value)')
    ax.legend(frameon=True, edgecolor='#cccccc', fancybox=False, loc='upper right')
    ax.spines['top'].set_visible(False)
    ax.spines['right'].set_visible(False)
    ax.set_title('Volcano Plot — Differential Expression', fontsize=13, fontweight='bold')
    fig.tight_layout()
    save(fig, 'volcano-plot.svg')


# ─────────────────────────────────────────────────────
# g-022: UMAP / t-SNE Cluster Visualization (Cell, vibrant)
# ─────────────────────────────────────────────────────
def g022():
    """Single-cell style UMAP clustering"""
    colors = ['#E64B35', '#4DBBD5', '#00A087', '#3C5488', '#F39B7F',
              '#8491B4', '#91D1C2', '#DC9157', '#7E6148', '#B09C85']
    fig, ax = plt.subplots(figsize=(7, 6.5))

    n_clusters = 8
    n_per = 200
    for i in range(n_clusters):
        cx = np.random.uniform(-8, 8)
        cy = np.random.uniform(-8, 8)
        spread = np.random.uniform(0.5, 1.5)
        x = np.random.normal(cx, spread, n_per)
        y = np.random.normal(cy, spread, n_per)
        ax.scatter(x, y, c=colors[i], s=6, alpha=0.7, edgecolors='none',
                   label=f'Cluster {i+1}')

    ax.set_xlabel('UMAP-1')
    ax.set_ylabel('UMAP-2')
    ax.legend(frameon=True, edgecolor='#cccccc', fancybox=False,
              markerscale=3, fontsize=8, ncol=2, loc='upper right')
    ax.spines['top'].set_visible(False)
    ax.spines['right'].set_visible(False)
    ax.set_title('UMAP Cluster Visualization', fontsize=13, fontweight='bold')
    fig.tight_layout()
    save(fig, 'umap-clusters.svg')


# ─────────────────────────────────────────────────────
# g-023: Ridge Plot / Joy Plot (Nature, muted)
# ─────────────────────────────────────────────────────
def g023():
    """Overlapping density ridges"""
    colors = ['#4E79A7', '#F28E2B', '#E15759', '#76B7B2', '#59A14F',
              '#EDC948', '#B07AA1', '#FF9DA7']
    n_groups = 8
    group_names = [f'Sample {chr(65+i)}' for i in range(n_groups)]

    fig, axes = plt.subplots(n_groups, 1, figsize=(8, 7), sharex=True)
    fig.subplots_adjust(hspace=-0.3)

    for i, (ax, name, color) in enumerate(zip(axes, group_names, colors)):
        data = np.random.normal(loc=i * 0.3, scale=1 + i * 0.1, size=500)
        x_grid = np.linspace(-5, 10, 300)
        kde = stats.gaussian_kde(data)
        density = kde(x_grid)

        ax.fill_between(x_grid, density, alpha=0.7, color=color)
        ax.plot(x_grid, density, color=color, linewidth=1.2)
        ax.set_yticks([])
        ax.set_ylabel(name, rotation=0, ha='right', va='center', fontsize=9)
        ax.spines['top'].set_visible(False)
        ax.spines['right'].set_visible(False)
        ax.spines['left'].set_visible(False)
        if i < n_groups - 1:
            ax.spines['bottom'].set_visible(False)
            ax.tick_params(bottom=False)
        ax.patch.set_alpha(0)

    axes[-1].set_xlabel('Value')
    fig.suptitle('Ridge Plot — Distribution Comparison', fontsize=13, fontweight='bold', y=0.98)
    save(fig, 'ridge-plot.svg')


# ─────────────────────────────────────────────────────
# g-024: Swarm/Beeswarm Plot (PNAS, vibrant)
# ─────────────────────────────────────────────────────
def g024():
    """Beeswarm plot using seaborn"""
    colors = ['#E64B35', '#4DBBD5', '#00A087', '#3C5488', '#F39B7F']
    fig, ax = plt.subplots(figsize=(7, 5.5))

    groups = ['Control', 'Drug A', 'Drug B', 'Drug C', 'Combo']
    data_frames = []
    import pandas as pd
    for i, g in enumerate(groups):
        n = 40
        vals = np.random.normal(loc=3 + i * 0.6, scale=0.6, size=n)
        df = pd.DataFrame({'Group': g, 'Response': vals})
        data_frames.append(df)
    data = pd.concat(data_frames, ignore_index=True)

    palette = dict(zip(groups, colors))
    sns.swarmplot(data=data, x='Group', y='Response', palette=palette, size=5, ax=ax, alpha=0.7)

    # Add summary stats
    for i, g in enumerate(groups):
        vals = data[data['Group'] == g]['Response']
        mean_val = vals.mean()
        ax.hlines(mean_val, i - 0.3, i + 0.3, color='black', linewidth=2)

    ax.spines['top'].set_visible(False)
    ax.spines['right'].set_visible(False)
    ax.grid(axis='y', alpha=0.15, linewidth=0.5)
    ax.set_ylabel('Response Value')
    ax.set_title('Beeswarm Plot with Mean Bars', fontsize=13, fontweight='bold')
    fig.tight_layout()
    save(fig, 'swarm-plot.svg')


# ─────────────────────────────────────────────────────
# g-025: Waterfall Chart (ACS, warm)
# ─────────────────────────────────────────────────────
def g025():
    """Waterfall chart showing cumulative changes"""
    fig, ax = plt.subplots(figsize=(8, 5))
    categories = ['Initial', 'Q1 Growth', 'Q2 Growth', 'Costs', 'Tax', 'Q3 Growth', 'Write-off', 'Final']
    values = [100, 25, 15, -30, -12, 20, -8, 110]

    cumulative = [0]
    for i in range(len(values) - 1):
        cumulative.append(cumulative[-1] + values[i])
    cumulative[-1] = 0  # Final is absolute

    bottoms = []
    for i in range(len(values)):
        if i == 0 or i == len(values) - 1:
            bottoms.append(0)
        elif values[i] >= 0:
            bottoms.append(cumulative[i])
        else:
            bottoms.append(cumulative[i] + values[i])

    bar_colors = []
    for i, v in enumerate(values):
        if i == 0 or i == len(values) - 1:
            bar_colors.append('#3C5488')
        elif v >= 0:
            bar_colors.append('#00A087')
        else:
            bar_colors.append('#E64B35')

    bars = ax.bar(categories, [abs(v) for v in values], bottom=bottoms,
                  color=bar_colors, edgecolor='white', linewidth=0.5, width=0.6)

    # Connector lines
    for i in range(len(values) - 1):
        if i == 0 or values[i] >= 0:
            y = cumulative[i] + values[i]
        else:
            y = cumulative[i] + values[i]
        if i < len(values) - 2:
            next_y = y
            ax.plot([i + 0.3, i + 0.7], [next_y, next_y], color='#888888',
                    linewidth=0.8, linestyle='--')

    # Value labels
    for i, (bar, v) in enumerate(zip(bars, values)):
        y_pos = bar.get_y() + bar.get_height() + 1
        ax.text(bar.get_x() + bar.get_width() / 2, y_pos,
                f'{v:+d}' if i > 0 and i < len(values) - 1 else str(v),
                ha='center', va='bottom', fontsize=9, fontweight='bold')

    ax.set_ylabel('Value')
    ax.spines['top'].set_visible(False)
    ax.spines['right'].set_visible(False)
    ax.set_xticklabels(categories, rotation=30, ha='right', fontsize=9)
    ax.grid(axis='y', alpha=0.15, linewidth=0.5)
    ax.set_title('Waterfall Chart — Financial Flow', fontsize=13, fontweight='bold')
    fig.tight_layout()
    save(fig, 'waterfall-chart.svg')


# ─────────────────────────────────────────────────────
# g-026: Bubble Chart (Science, cool)
# ─────────────────────────────────────────────────────
def g026():
    """Bubble scatter plot with size encoding"""
    colors = ['#3366CC', '#DC3912', '#FF9900', '#109618', '#990099']
    fig, ax = plt.subplots(figsize=(8, 6))

    n_groups = 5
    group_names = ['Physics', 'Chemistry', 'Biology', 'CS', 'Math']
    for i, (name, color) in enumerate(zip(group_names, colors)):
        n = 15
        x = np.random.uniform(1, 10, n)
        y = np.random.uniform(1, 10, n)
        sizes = np.random.uniform(50, 600, n)
        ax.scatter(x, y, s=sizes, c=color, alpha=0.5, edgecolors=color,
                   linewidth=1, label=name)

    ax.set_xlabel('Impact Factor')
    ax.set_ylabel('Citation Count (normalized)')
    ax.legend(frameon=True, edgecolor='#cccccc', fancybox=False,
              markerscale=0.5, fontsize=9)
    ax.spines['top'].set_visible(False)
    ax.spines['right'].set_visible(False)
    ax.grid(True, alpha=0.15, linewidth=0.5)
    ax.set_title('Bubble Chart — Publication Metrics', fontsize=13, fontweight='bold')
    fig.tight_layout()
    save(fig, 'bubble-chart.svg')


# ─────────────────────────────────────────────────────
# g-027: Paired Dot Plot / Slope Chart (Lancet, warm)
# ─────────────────────────────────────────────────────
def g027():
    """Paired before-after dot plot with connecting lines"""
    colors = ['#AD002A', '#00468B']
    fig, ax = plt.subplots(figsize=(6, 6))

    n = 20
    before = np.random.normal(50, 10, n)
    after = before + np.random.normal(8, 5, n)

    for b, a in zip(before, after):
        color = '#00468B' if a > b else '#AD002A'
        ax.plot([0, 1], [b, a], color=color, linewidth=1, alpha=0.5)

    ax.scatter(np.zeros(n), before, c=colors[0], s=50, zorder=5,
               edgecolors='white', linewidth=0.8, label='Before')
    ax.scatter(np.ones(n), after, c=colors[1], s=50, zorder=5,
               edgecolors='white', linewidth=0.8, label='After')

    ax.set_xticks([0, 1])
    ax.set_xticklabels(['Before Treatment', 'After Treatment'], fontsize=11)
    ax.set_ylabel('Score')
    ax.set_xlim(-0.3, 1.3)
    ax.legend(frameon=True, edgecolor='#cccccc', fancybox=False)
    ax.spines['top'].set_visible(False)
    ax.spines['right'].set_visible(False)
    ax.grid(axis='y', alpha=0.15, linewidth=0.5)
    ax.set_title('Paired Comparison — Before vs After', fontsize=13, fontweight='bold')
    fig.tight_layout()
    save(fig, 'paired-dot-plot.svg')


# ─────────────────────────────────────────────────────
# g-028: Multi-panel Figure (Nature, muted)
# ─────────────────────────────────────────────────────
def g028():
    """Publication-style multi-panel figure with A/B/C/D labels"""
    colors = ['#4E79A7', '#F28E2B', '#E15759', '#76B7B2']
    fig = plt.figure(figsize=(10, 8))
    gs = GridSpec(2, 2, hspace=0.35, wspace=0.3)

    # Panel A: Line chart
    ax_a = fig.add_subplot(gs[0, 0])
    x = np.linspace(0, 10, 50)
    for i, c in enumerate(colors[:3]):
        y = np.sin(x + i) * (2 - i * 0.3) + np.random.normal(0, 0.2, len(x))
        ax_a.plot(x, y, color=c, linewidth=2, label=f'Condition {i+1}')
    ax_a.legend(frameon=False, fontsize=8)
    ax_a.set_xlabel('Time (s)')
    ax_a.set_ylabel('Signal')
    ax_a.spines['top'].set_visible(False)
    ax_a.spines['right'].set_visible(False)

    # Panel B: Bar chart
    ax_b = fig.add_subplot(gs[0, 1])
    cats = ['Ctrl', 'T1', 'T2', 'T3']
    vals = [3.2, 5.1, 4.8, 6.3]
    errs = [0.3, 0.5, 0.4, 0.6]
    ax_b.bar(cats, vals, yerr=errs, color=colors, edgecolor='white',
             capsize=4, error_kw={'linewidth': 1.2})
    ax_b.set_ylabel('Expression Level')
    ax_b.spines['top'].set_visible(False)
    ax_b.spines['right'].set_visible(False)

    # Panel C: Heatmap
    ax_c = fig.add_subplot(gs[1, 0])
    data = np.random.randn(8, 8)
    cmap = LinearSegmentedColormap.from_list('custom', ['#4E79A7', '#F7F7F7', '#E15759'])
    im = ax_c.imshow(data, cmap=cmap, aspect='auto', vmin=-2, vmax=2)
    ax_c.set_xlabel('Samples')
    ax_c.set_ylabel('Features')
    fig.colorbar(im, ax=ax_c, fraction=0.046, pad=0.04)

    # Panel D: Scatter
    ax_d = fig.add_subplot(gs[1, 1])
    for i, c in enumerate(colors):
        x = np.random.normal(i * 2, 1, 30)
        y = x * 0.8 + np.random.normal(0, 0.8, 30)
        ax_d.scatter(x, y, c=c, s=25, alpha=0.7, edgecolors='white', linewidth=0.5)
    ax_d.set_xlabel('Variable X')
    ax_d.set_ylabel('Variable Y')
    ax_d.spines['top'].set_visible(False)
    ax_d.spines['right'].set_visible(False)

    # Panel labels
    for ax, label in zip([ax_a, ax_b, ax_c, ax_d], ['A', 'B', 'C', 'D']):
        ax.text(-0.12, 1.08, label, transform=ax.transAxes,
                fontsize=16, fontweight='bold', va='top')

    fig.suptitle('Multi-panel Figure Layout', fontsize=14, fontweight='bold', y=1.01)
    save(fig, 'multi-panel.svg')


# ─────────────────────────────────────────────────────
# g-029: Correlation Matrix with Significance (Science, cool)
# ─────────────────────────────────────────────────────
def g029():
    """Lower-triangle correlation matrix with significance stars"""
    fig, ax = plt.subplots(figsize=(7, 6))
    n_vars = 8
    labels = [f'Var {i+1}' for i in range(n_vars)]

    # Generate correlated data
    A = np.random.randn(100, n_vars)
    A[:, 1] = A[:, 0] * 0.8 + np.random.randn(100) * 0.3
    A[:, 3] = A[:, 2] * -0.6 + np.random.randn(100) * 0.5
    corr = np.corrcoef(A.T)

    # Mask upper triangle
    mask = np.triu(np.ones_like(corr, dtype=bool), k=0)
    corr_masked = np.ma.array(corr, mask=mask)

    cmap = LinearSegmentedColormap.from_list('rdbu', ['#3366CC', '#FFFFFF', '#DC3912'])
    im = ax.imshow(corr, cmap=cmap, vmin=-1, vmax=1, aspect='equal')

    # Mask upper triangle visually
    for i in range(n_vars):
        for j in range(n_vars):
            if j >= i:
                ax.add_patch(plt.Rectangle((j - 0.5, i - 0.5), 1, 1,
                                           fill=True, facecolor='white', edgecolor='white'))
            else:
                val = corr[i, j]
                color = 'white' if abs(val) > 0.5 else 'black'
                stars = '***' if abs(val) > 0.7 else ('**' if abs(val) > 0.5 else ('*' if abs(val) > 0.3 else ''))
                ax.text(j, i, f'{val:.2f}\n{stars}', ha='center', va='center',
                        fontsize=8, color=color)

    ax.set_xticks(range(n_vars))
    ax.set_yticks(range(n_vars))
    ax.set_xticklabels(labels, rotation=45, ha='right', fontsize=9)
    ax.set_yticklabels(labels, fontsize=9)
    cbar = fig.colorbar(im, ax=ax, fraction=0.046, pad=0.04)
    cbar.set_label('Pearson r', fontsize=10)
    ax.set_title('Correlation Matrix with Significance', fontsize=13, fontweight='bold')
    fig.tight_layout()
    save(fig, 'correlation-significance.svg')


# ─────────────────────────────────────────────────────
# g-030: Stacked Percentage Bar Chart (IEEE, neutral)
# ─────────────────────────────────────────────────────
def g030():
    """Horizontal 100% stacked bar chart"""
    colors = ['#0072B2', '#D55E00', '#009E73', '#CC79A7', '#F0E442']
    fig, ax = plt.subplots(figsize=(8, 5))

    categories = ['Model A', 'Model B', 'Model C', 'Model D', 'Model E', 'Model F']
    n_cats = len(categories)
    components = ['Phase 1', 'Phase 2', 'Phase 3', 'Phase 4', 'Phase 5']

    data = np.random.rand(n_cats, 5)
    data = data / data.sum(axis=1, keepdims=True) * 100

    left = np.zeros(n_cats)
    for i, (comp, color) in enumerate(zip(components, colors)):
        ax.barh(categories, data[:, i], left=left, color=color,
                edgecolor='white', linewidth=0.5, label=comp, height=0.6)
        # Percentage labels
        for j in range(n_cats):
            if data[j, i] > 8:
                ax.text(left[j] + data[j, i] / 2, j,
                        f'{data[j, i]:.0f}%', ha='center', va='center',
                        fontsize=8, color='white', fontweight='bold')
        left += data[:, i]

    ax.set_xlabel('Percentage (%)')
    ax.set_xlim(0, 100)
    ax.legend(frameon=True, edgecolor='#cccccc', fancybox=False,
              fontsize=8, loc='lower right')
    ax.spines['top'].set_visible(False)
    ax.spines['right'].set_visible(False)
    ax.set_title('100% Stacked Bar — Component Breakdown', fontsize=13, fontweight='bold')
    fig.tight_layout()
    save(fig, 'stacked-percentage.svg')


# ─────────────────────────────────────────────────────
# Main
# ─────────────────────────────────────────────────────
if __name__ == '__main__':
    generators = [
        g021, g022, g023, g024, g025,
        g026, g027, g028, g029, g030,
    ]
    print(f'Generating {len(generators)} supplemental gallery figures into {OUTPUT_DIR}/ ...\n')
    for fn in generators:
        name = fn.__name__
        print(f'[{name}]', end=' ')
        try:
            fn()
        except Exception as e:
            print(f'  FAIL: {e}')
    print(f'\nDone! {len(generators)} additional SVGs saved to {OUTPUT_DIR}/')
