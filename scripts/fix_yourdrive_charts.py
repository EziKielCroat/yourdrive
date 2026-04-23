"""
Regenerira YourDrive grafove s ispravnim imenom: Udruga Inovatic (c, ne k).
Popravlja: Feature Usage, Mobile vs Desktop, Retention, Satisfaction,
           Sharing, Storage Volume, Uploads 30 Days, Uptime.
Data Loss i DAU/MAU su već ispravni — ne diramo ih.
"""
import os, math
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.ticker as mticker
import matplotlib.patches as mpatches
from matplotlib.patches import FancyArrowPatch
from matplotlib.path import Path
import numpy as np
def gaussian_filter1d(data, sigma):
    """Simple Gaussian smoothing without scipy."""
    k = int(sigma * 3) * 2 + 1
    x = np.linspace(-3, 3, k)
    kernel = np.exp(-x**2 / 2)
    kernel /= kernel.sum()
    padded = np.pad(data, k // 2, mode='edge')
    return np.convolve(padded, kernel, mode='valid')

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)),
                   '..', 'exports', 'Grafovi_Yourdrive')
os.makedirs(OUT, exist_ok=True)

SRC   = 'Izvor: Udruga Inovatic · interno testiranje (30 dana)'
BG    = '#FFFFFF'
DARK  = '#0F1A36'
MED   = '#64748B'

plt.rcParams.update({
    'font.family':       'sans-serif',
    'font.sans-serif':   ['Avenir Next', 'Helvetica Neue', 'Arial', 'DejaVu Sans'],
    'figure.facecolor':  BG,
    'axes.facecolor':    BG,
    'text.color':        DARK,
    'savefig.facecolor': BG,
    'savefig.edgecolor': 'none',
})

W, H = 10.0, 7.2   # figure size in inches


def _title(fig, title, sub, tx=0.06, ty=0.965):
    fig.text(tx, ty,        title, fontsize=22, fontweight='900',
             color=DARK, va='top', ha='left')
    fig.text(tx, ty - 0.09, sub,   fontsize=12,
             color=MED,  va='top', ha='left')


def _footer(fig):
    fig.text(0.06, 0.020, SRC, fontsize=9.5, color=MED, va='bottom', ha='left')


def _spine_style(ax, bottom_color='#E2E8F0'):
    ax.spines['top'].set_visible(False)
    ax.spines['right'].set_visible(False)
    ax.spines['left'].set_visible(False)
    ax.spines['bottom'].set_color(bottom_color)


def _save(fig, name):
    path = os.path.join(OUT, name)
    fig.savefig(path, dpi=150, bbox_inches='tight', facecolor=BG, edgecolor='none')
    plt.close(fig)
    print(f'  ✓ {name}')


# ─── 1. Feature Usage ────────────────────────────────────────────────────────
def chart_feature_usage():
    fig = plt.figure(figsize=(W, H))
    ax  = fig.add_axes([0.03, 0.06, 0.52, 0.78])
    ax.set_aspect('equal')
    ax.set_facecolor(BG)
    ax.axis('off')

    labels = ['Upload', 'Dijeljenje', 'Uređivanje datoteka', 'Komentiranje']
    values = [49, 24, 18, 9]
    colors = ['#1B3FAA', '#29B5E8', '#2D7A6E', '#F5A623']

    wedges, _ = ax.pie(
        values, colors=colors, startangle=90,
        wedgeprops=dict(linewidth=3, edgecolor='white'), radius=1.0)
    ax.add_patch(plt.Circle((0, 0), 0.60, fc='white', zorder=5))
    ax.text(0, 0.14, '100%', ha='center', va='center',
            fontsize=30, fontweight='900', color=DARK, zorder=6)
    ax.text(0, -0.14, 'akcija u 30 dana', ha='center', va='center',
            fontsize=12, color=MED, zorder=6)

    # Right-side legend
    for i, (lbl, val, col) in enumerate(zip(labels, values, colors)):
        fy = 0.74 - i * 0.115
        rect = mpatches.Rectangle(
            (0.60, fy - 0.018), 0.022, 0.036,
            facecolor=col, transform=fig.transFigure, figure=fig, clip_on=False)
        fig.patches.append(rect)
        fig.text(0.635, fy, f'{lbl}  {val}%',
                 fontsize=12, color=DARK, va='center', ha='left')

    _title(fig, 'Najviše korištene funkcije',
           'Udio akcija koje su korisnici izvršavali u aplikaciji')
    _footer(fig)
    _save(fig, 'Feature Usage from Duje.png')


# ─── 2. Mobile vs Desktop ────────────────────────────────────────────────────
def chart_mobile_desktop():
    fig = plt.figure(figsize=(W, H))
    ax  = fig.add_axes([0.06, 0.06, 0.54, 0.80])
    ax.set_aspect('equal')
    ax.set_facecolor(BG)
    ax.axis('off')

    labels = ['Desktop', 'Mobitel']
    values = [78, 22]
    colors = ['#1B3FAA', '#F5A623']

    ax.pie(values, colors=colors, startangle=90,
           wedgeprops=dict(linewidth=4, edgecolor='white'), radius=1.0)
    ax.add_patch(plt.Circle((0, 0), 0.60, fc='white', zorder=5))
    ax.text(0, 0.13, '2 uređaja', ha='center', va='center',
            fontsize=26, fontweight='900', color=DARK, zorder=6)
    ax.text(0, -0.13, 'platforme', ha='center', va='center',
            fontsize=12, color=MED, zorder=6)

    for i, (lbl, val, col) in enumerate(zip(labels, values, colors)):
        fy = 0.72 - i * 0.13
        rect = mpatches.Rectangle(
            (0.65, fy - 0.018), 0.022, 0.036,
            facecolor=col, transform=fig.transFigure, figure=fig, clip_on=False)
        fig.patches.append(rect)
        fig.text(0.685, fy, f'{lbl}  {val}%',
                 fontsize=12, color=DARK, va='center', ha='left')

    _title(fig, 'Mobile vs Desktop korištenje',
           'Udio sesija po tipu uređaja')
    _footer(fig)
    _save(fig, 'Mobile vs Desktop.png')


# ─── 3. Retention Feedback ───────────────────────────────────────────────────
def chart_retention():
    fig, ax = plt.subplots(figsize=(W, H))
    fig.patch.set_facecolor(BG)
    ax.set_facecolor(BG)

    x_pts = [0, 1, 2]
    y_pts = [78, 56, 42]
    col   = '#162090'

    # Smooth interpolation
    x_fine = np.linspace(0, 2, 300)
    y_fine = np.interp(x_fine, x_pts, y_pts)
    y_fine = gaussian_filter1d(y_fine, sigma=8)

    ax.fill_between(x_fine, y_fine, color=col, alpha=0.12)
    ax.plot(x_fine, y_fine, color=col, linewidth=2.5, zorder=4)
    ax.scatter(x_pts, y_pts, color=col, s=70, zorder=6)

    for xi, yi in zip(x_pts, y_pts):
        ax.text(xi, yi + 3, f'{yi}%', ha='center', fontsize=13,
                fontweight='700', color=DARK)

    ax.set_xticks(x_pts)
    ax.set_xticklabels(['1-day', '7-day', '30-day'], fontsize=11, color=MED)
    ax.yaxis.set_major_formatter(mticker.PercentFormatter())
    ax.set_ylim(0, 108)
    ax.set_yticks([0, 20, 40, 60, 80, 100])
    ax.tick_params(axis='y', labelsize=10, labelcolor=MED)
    ax.set_ylabel('Retention', fontsize=11, color=MED, labelpad=10)
    ax.grid(axis='y', color='#F1F5F9', linewidth=1, zorder=0)
    _spine_style(ax)

    plt.tight_layout(rect=[0, 0.06, 1, 0.88])
    _title(fig, 'Zadržavanje korisnika (retention)',
           'Udio korisnika koji su se vratili 1., 7. i 30. dan')
    _footer(fig)
    _save(fig, 'Retention Feedback.png')


# ─── 4. Satisfaction Feedback ────────────────────────────────────────────────
def _star_polygon(cx, cy, r_out, r_in, n=5, angle_offset=math.pi/2):
    pts = []
    for i in range(2 * n):
        r = r_out if i % 2 == 0 else r_in
        a = angle_offset - i * math.pi / n
        pts.append((cx + r * math.cos(a), cy + r * math.sin(a)))
    return plt.Polygon(pts, closed=True)


def chart_satisfaction():
    fig = plt.figure(figsize=(W, H))
    ax  = fig.add_axes([0, 0, 1, 1])
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 7.2)
    ax.axis('off')
    ax.set_facecolor(BG)

    GOLD  = '#F5A623'
    GRAY  = '#D1D5DB'
    score = 4.5
    n_stars = 5
    sx0, sy = 2.2, 3.6
    sr_out, sr_in = 0.72, 0.29
    gap = 1.72

    for i in range(n_stars):
        cx = sx0 + i * gap
        if i < int(score):          # full gold star
            star = _star_polygon(cx, sy, sr_out, sr_in)
            star.set_facecolor(GOLD); star.set_edgecolor('none')
            ax.add_patch(star)
        elif i < math.ceil(score):  # half star
            # gray background
            bg = _star_polygon(cx, sy, sr_out, sr_in)
            bg.set_facecolor(GRAY); bg.set_edgecolor('none')
            ax.add_patch(bg)
            # gold left half — clip with a rectangle
            gold = _star_polygon(cx, sy, sr_out, sr_in)
            gold.set_facecolor(GOLD); gold.set_edgecolor('none')
            gold.set_clip_path(
                mpatches.Rectangle((cx - sr_out, sy - sr_out),
                                   sr_out, sr_out * 2,
                                   transform=ax.transData))
            ax.add_patch(gold)
        else:                        # empty gray star
            star = _star_polygon(cx, sy, sr_out, sr_in)
            star.set_facecolor(GRAY); star.set_edgecolor('none')
            ax.add_patch(star)

    # Big score
    ax.text(5, 5.55, '4.5 / 5', ha='center', va='center',
            fontsize=54, fontweight='900', color=DARK)
    ax.text(5, 2.52, 'prosječna ocjena zadovoljstva',
            ha='center', va='center', fontsize=14, color=MED)
    ax.text(5, 1.88, 'Anketa unutar Udruge Inovatic',
            ha='center', va='center', fontsize=12, color=MED,
            style='italic')

    # Title & subtitle (manual positioning)
    ax.text(0.06 * 10, 7.0, 'Zadovoljstvo korisnika',
            fontsize=22, fontweight='900', color=DARK, va='top', ha='left')
    ax.text(0.06 * 10, 6.30, 'Prosječna ocjena iz interne ankete Udruge Inovatic',
            fontsize=12, color=MED, va='top', ha='left')
    ax.text(0.06 * 10, 0.16, SRC, fontsize=9.5, color=MED, va='bottom', ha='left')

    _save(fig, 'Satisfaction Feedback.png')


# ─── 5. Sharing ──────────────────────────────────────────────────────────────
def chart_sharing():
    fig, ax = plt.subplots(figsize=(W, H))
    fig.patch.set_facecolor(BG)
    ax.set_facecolor(BG)

    cats   = ['Tjedan 1', 'Tjedan 2', 'Tjedan 3', 'Tjedan 4 + 2 dana']
    vals   = [86, 104, 118, 122]
    BAR_C  = '#29B5E8'
    x      = np.arange(len(cats))

    bars = ax.bar(x, vals, color=BAR_C, width=0.55, linewidth=0, zorder=3)
    ax.set_xticks(x)
    ax.set_xticklabels(cats, fontsize=11, color=MED)
    ax.set_ylabel('Broj dijeljenja', fontsize=11, color=MED, labelpad=10)
    ax.set_ylim(0, 160)
    ax.tick_params(axis='y', labelsize=10, labelcolor=MED)
    ax.grid(axis='y', color='#F1F5F9', linewidth=1, zorder=0)
    _spine_style(ax)

    for bar_obj, val in zip(bars, vals):
        ax.text(bar_obj.get_x() + bar_obj.get_width() / 2,
                bar_obj.get_height() + 3, str(val),
                ha='center', fontsize=13, fontweight='700', color=DARK)

    # Big KPI number
    ax.text(0.02, 152, '430', fontsize=40, fontweight='900',
            color=BAR_C, va='top')
    ax.text(0.02, 136, 'ukupnih dijeljenja', fontsize=11, color=MED, va='top')

    plt.tight_layout(rect=[0, 0.06, 1, 0.88])
    _title(fig, 'Dijeljenje datoteka između korisnika',
           'Ukupno 430 dijeljenja kroz 30 dana testa')
    _footer(fig)
    _save(fig, 'Sharing from Duje Zizic.png')


# ─── 6. Storage Volume ───────────────────────────────────────────────────────
def chart_storage():
    fig, ax = plt.subplots(figsize=(W, H))
    fig.patch.set_facecolor(BG)
    ax.set_facecolor(BG)

    daily = [0.8,1.4,1.2,1.0,1.3,1.5,0.9,1.6,1.1,1.3,
             1.2,1.0,1.4,1.1,1.3,1.2,1.5,1.0,1.3,1.2,
             1.1,1.4,1.3,1.5,1.0,1.3,1.2,1.1,1.3,1.5]
    cum  = np.cumsum([0] + daily)      # starts at 0, 31 points (day 0..30)
    x    = np.arange(31)
    col  = '#2D9E8F'

    ax.fill_between(x, cum, color=col, alpha=0.15)
    ax.plot(x, cum, color=col, linewidth=2.5, zorder=4)
    ax.scatter([30], [cum[-1]], color=col, s=70, zorder=6)

    # "37 GB" annotation
    ax.annotate('37 GB',
                xy=(30, cum[-1]),
                xytext=(26.5, 41.5),
                fontsize=16, fontweight='900', color=col,
                arrowprops=dict(arrowstyle='->', color=col, lw=1.5))

    ax.set_xlim(-0.5, 31)
    ax.set_ylim(0, 47)
    ax.set_yticks([0, 5, 10, 15, 20, 25, 30, 35, 40, 45])
    ax.set_yticklabels([f'{v} GB' for v in [0,5,10,15,20,25,30,35,40,45]],
                       fontsize=10, color=MED)
    ax.set_xlabel('Dan testa', fontsize=11, color=MED, labelpad=8)
    ax.set_ylabel('Kumulativno (GB)', fontsize=11, color=MED, labelpad=10)
    ax.tick_params(axis='x', labelsize=10, labelcolor=MED)
    ax.grid(axis='y', color='#F1F5F9', linewidth=1, zorder=0)
    _spine_style(ax)

    plt.tight_layout(rect=[0, 0.06, 1, 0.88])
    _title(fig, 'Volumen pohranjenih podataka',
           'Kumulativni rast storagea kroz 30 dana testa')
    _footer(fig)
    _save(fig, 'Storage Volume.png')


# ─── 7. Uploads 30 Days ──────────────────────────────────────────────────────
def chart_uploads():
    fig, ax = plt.subplots(figsize=(W, H))
    fig.patch.set_facecolor(BG)
    ax.set_facecolor(BG)

    uploads = [34,26,32,32,29,29,33,34,27,38,37,35,32,34,34,
               37,29,36,34,35,41,29,36,44,34,35,35,30,29,43]
    x   = np.arange(1, 31)
    col = '#1B3FAA'

    ax.fill_between(x, uploads, color=col, alpha=0.12)
    ax.plot(x, uploads, color=col, linewidth=2, zorder=4)

    # Mark peak (day 24)
    peak_x, peak_y = 24, 44
    ax.scatter([peak_x], [peak_y], color=col, s=80, zorder=6)

    ax.set_xlim(0.5, 30.5)
    ax.set_ylim(0, 56)
    ax.set_xticks([1, 5, 10, 15, 20, 25, 30])
    ax.tick_params(axis='x', labelsize=10, labelcolor=MED)
    ax.tick_params(axis='y', labelsize=10, labelcolor=MED)
    ax.set_xlabel('Dan testa', fontsize=11, color=MED, labelpad=8)
    ax.set_ylabel('Broj datoteka', fontsize=11, color=MED, labelpad=10)
    ax.grid(axis='y', color='#F1F5F9', linewidth=1, zorder=0)
    _spine_style(ax)

    # Big KPI
    ax.text(1.2, 52, '1.013', fontsize=38, fontweight='900',
            color=col, va='top')
    ax.text(1.2, 44, 'ukupno uploadano u 30 dana', fontsize=11,
            color=MED, va='top')

    plt.tight_layout(rect=[0, 0.06, 1, 0.88])
    _title(fig, 'Uploadane datoteke u zadnjih 30 dana',
           'Ukupno 1.013 učitanih datoteka tijeklom testa')
    _footer(fig)
    _save(fig, 'Uploads 30 Days.png')


# ─── 8. Uptime ───────────────────────────────────────────────────────────────
def chart_uptime():
    fig = plt.figure(figsize=(8.5, H))
    ax  = fig.add_axes([0.1, 0.08, 0.80, 0.72])
    ax.set_aspect('equal')
    ax.set_facecolor(BG)
    ax.axis('off')

    col_fill  = '#3DC5A8'
    col_empty = '#E2E8F0'
    pct       = 99.5
    start_deg = 90                      # 12 o'clock
    full_deg  = 360 * (pct / 100)

    # Background ring
    theta = np.linspace(0, 2 * np.pi, 500)
    r_out, r_in = 0.98, 0.68
    bx = np.concatenate([r_out * np.cos(theta), r_in * np.cos(theta[::-1])])
    by = np.concatenate([r_out * np.sin(theta), r_in * np.sin(theta[::-1])])
    bg_ring = plt.Polygon(list(zip(bx, by)), closed=True,
                          fc=col_empty, ec='none', zorder=1)
    ax.add_patch(bg_ring)

    # Filled arc
    t_fill = np.linspace(np.radians(start_deg),
                         np.radians(start_deg - full_deg), 600)
    fx = np.concatenate([r_out * np.cos(t_fill),
                         r_in  * np.cos(t_fill[::-1])])
    fy = np.concatenate([r_out * np.sin(t_fill),
                         r_in  * np.sin(t_fill[::-1])])
    fill_ring = plt.Polygon(list(zip(fx, fy)), closed=True,
                             fc=col_fill, ec='none', zorder=2)
    ax.add_patch(fill_ring)

    ax.set_xlim(-1.1, 1.1)
    ax.set_ylim(-1.1, 1.1)

    ax.text(0, 0.12, '99.5%', ha='center', va='center',
            fontsize=46, fontweight='900', color=DARK, zorder=5)
    ax.text(0, -0.18, 'uptime u 30 dana', ha='center', va='center',
            fontsize=13, color=MED, zorder=5)

    _title(fig, 'Server uptime',
           'Dostupnost platforme tijekom demo testa')
    _footer(fig)
    _save(fig, 'Uptime from Duje Zizic.png')


# ─── 9. Data Loss ────────────────────────────────────────────────────────────
def chart_data_loss():
    fig, ax = plt.subplots(figsize=(W, H))
    fig.patch.set_facecolor(BG)
    ax.set_facecolor(BG)

    col = '#3DC5A8'
    x   = np.arange(1, 31)
    y   = np.zeros(30)

    ax.plot(x, y, color=col, linewidth=1.8, linestyle='-.', zorder=4)

    ax.set_xlim(0.5, 30.5)
    ax.set_ylim(-0.15, 3.2)
    ax.set_xticks([1, 5, 10, 15, 20, 25, 30])
    ax.set_yticks([0, 1, 2, 3])
    ax.tick_params(axis='x', labelsize=10, labelcolor=MED)
    ax.tick_params(axis='y', labelsize=10, labelcolor=MED)
    ax.set_xlabel('Dan testa',       fontsize=11, color=MED, labelpad=8)
    ax.set_ylabel('Broj incidenata', fontsize=11, color=MED, labelpad=10)
    ax.grid(axis='y', color='#F1F5F9', linewidth=1, zorder=0)
    _spine_style(ax)

    # Big "0" centred in the plot
    ax.text(15.5, 1.55, '0', ha='center', va='center',
            fontsize=130, fontweight='900', color=col, alpha=0.92, zorder=5)
    ax.text(15.5, 0.62, 'incidenata gubitka podataka',
            ha='center', va='center', fontsize=15, fontweight='700', color=DARK, zorder=5)
    ax.text(15.5, 0.36, 'kroz cijelo razdoblje testa (30 dana)',
            ha='center', va='center', fontsize=11, color=MED, zorder=5)

    plt.tight_layout(rect=[0, 0.06, 1, 0.88])
    _title(fig, 'Incidenti gubitka podataka',
           'Broj izgubljenih datoteka tijekom 30-dnevnog testa')
    _footer(fig)
    _save(fig, 'Data Loss.png')


# ─── 10. DAU / MAU ───────────────────────────────────────────────────────────
def chart_dau_mau():
    fig, ax = plt.subplots(figsize=(W, H))
    fig.patch.set_facecolor(BG)
    ax.set_facecolor(BG)

    cats   = ['MAU\n(mjesečno aktivni)', 'DAU\n(prosječno dnevno aktivni)']
    vals   = [16, 12]
    colors = ['#4A88E8', '#1B3FAA']
    x      = np.arange(2)

    bars = ax.bar(x, vals, color=colors, width=0.48, linewidth=0, zorder=3)
    ax.set_xticks(x)
    ax.set_xticklabels(cats, fontsize=11, color=MED)
    ax.set_ylabel('Broj korisnika', fontsize=11, color=MED, labelpad=10)
    ax.set_ylim(0, 23)
    ax.set_yticks([0, 4, 8, 12, 16, 20])
    ax.tick_params(axis='y', labelsize=10, labelcolor=MED)
    ax.grid(axis='y', color='#F1F5F9', linewidth=1, zorder=0)
    _spine_style(ax)

    for bar_obj, val in zip(bars, vals):
        ax.text(bar_obj.get_x() + bar_obj.get_width() / 2,
                bar_obj.get_height() + 0.4, str(val),
                ha='center', fontsize=16, fontweight='900', color=DARK)

    # Stickiness annotation box
    TEAL = '#3DC5A8'
    ax.annotate(
        'Stickiness (DAU / MAU) = 75%',
        xy=(1.0, 17.8),
        fontsize=12, fontweight='700', color=TEAL,
        ha='center', va='center',
        bbox=dict(boxstyle='round,pad=0.5', facecolor='#E8F9F5',
                  edgecolor=TEAL, linewidth=1.8))

    plt.tight_layout(rect=[0, 0.06, 1, 0.88])
    _title(fig, 'Aktivnost korisnika: DAU / MAU',
           'Udio dnevno aktivnih korisnika unutar mjesečne baze')
    _footer(fig)
    _save(fig, 'Dau Mau.png')


# ─── Run all ─────────────────────────────────────────────────────────────────
if __name__ == '__main__':
    print('Generiranje grafova s ispravnim imenom: Udruga Inovatic...\n')
    chart_feature_usage()
    chart_mobile_desktop()
    chart_retention()
    chart_satisfaction()
    chart_sharing()
    chart_storage()
    chart_uploads()
    chart_uptime()
    chart_data_loss()
    chart_dau_mau()
    print(f'\nDone — 10 grafova spremljeno u exports/Grafovi_Yourdrive/')
