"""
NEXA CORE — Survey Chart Generator
Produces 19 light-mode PNG charts organised in 5 section folders.
"""

import os
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
import numpy as np

# ── Palette ──────────────────────────────────────────────────────────────────
C = {
    'bg':       '#FFFFFF',
    'surface':  '#F8FAFC',
    'text':     '#0F172A',
    'subtext':  '#64748B',
    'border':   '#E2E8F0',
    'success':  '#22C55E',
    'warning':  '#F59E0B',
    'danger':   '#EF4444',
}

# Ordered chart palette — indigo family, muted
CHART_COLORS = [
    '#4F6AF5',  # indigo
    '#818CF8',  # violet-indigo
    '#38BDF8',  # sky
    '#6EE7B7',  # emerald
    '#FCD34D',  # amber
    '#F87171',  # red
]

# ── Global style ─────────────────────────────────────────────────────────────
plt.rcParams.update({
    'font.family':        'sans-serif',
    'font.sans-serif':    ['SF Pro Display', 'Helvetica Neue', 'Arial', 'DejaVu Sans'],
    'font.size':          11,
    'figure.facecolor':   C['bg'],
    'axes.facecolor':     C['bg'],
    'text.color':         C['text'],
    'axes.labelcolor':    C['subtext'],
    'xtick.color':        C['subtext'],
    'ytick.color':        C['subtext'],
    'xtick.labelsize':    9.5,
    'ytick.labelsize':    9.5,
    'axes.spines.top':    False,
    'axes.spines.right':  False,
    'axes.spines.left':   False,
    'axes.spines.bottom': True,
    'axes.grid':          False,
    'axes.axisbelow':     True,
})

# ── Output dirs ───────────────────────────────────────────────────────────────
BASE = os.path.join(os.path.dirname(__file__), '..', 'exports', 'nexa-core-survey')
DIRS = {
    '01': os.path.join(BASE, '01-demografija'),
    '02': os.path.join(BASE, '02-problemi'),
    '03': os.path.join(BASE, '03-privatnost'),
    '04': os.path.join(BASE, '04-ai'),
    '05': os.path.join(BASE, '05-validacija'),
}
for d in DIRS.values():
    os.makedirs(d, exist_ok=True)


# ── Helpers ───────────────────────────────────────────────────────────────────

def _title_block(fig, title, subtitle):
    """Render title + subtitle at the top of the figure."""
    fig.text(0.055, 0.97, title,
             fontsize=14, fontweight='700', color=C['text'],
             va='top', ha='left', linespacing=1.3)
    fig.text(0.055, 0.915, subtitle,
             fontsize=10, color=C['subtext'],
             va='top', ha='left')


def _save(fig, folder_key, filename):
    path = os.path.join(DIRS[folder_key], filename)
    fig.savefig(path, dpi=180, bbox_inches='tight',
                facecolor=C['bg'], edgecolor='none')
    plt.close(fig)
    print(f'  {path}')


def bar(title, subtitle, categories, values, folder,
        filename, horizontal=False, figsize=None):
    """Clean single-series bar chart."""
    n = len(categories)
    cols = CHART_COLORS[:n]
    x = np.arange(n)
    bw = 0.52

    if figsize is None:
        figsize = (9.5, 5.2) if not horizontal else (9.5, max(4.5, n * 0.78))

    fig, ax = plt.subplots(figsize=figsize)
    fig.patch.set_facecolor(C['bg'])
    ax.set_facecolor(C['bg'])

    if horizontal:
        bars = ax.barh(x, values, color=cols, height=bw, linewidth=0, zorder=3)
        ax.set_yticks(x)
        ax.set_yticklabels(categories, fontsize=10, color=C['subtext'])
        ax.set_xlim(0, max(values) * 1.28)
        ax.spines['bottom'].set_color(C['border'])
        ax.spines['left'].set_visible(False)
        ax.xaxis.set_visible(False)
        for bar_obj, val in zip(bars, values):
            ax.text(bar_obj.get_width() + max(values) * 0.025,
                    bar_obj.get_y() + bar_obj.get_height() / 2,
                    f'{val}%', va='center', ha='left',
                    fontsize=10.5, fontweight='600', color=C['text'])
    else:
        bars = ax.bar(x, values, color=cols, width=bw, linewidth=0, zorder=3)
        ax.set_xticks(x)
        # Wrap long labels
        wrapped = [
            c.replace(' ', '\n', 1) if len(c) > 16 else c
            for c in categories
        ]
        ax.set_xticklabels(wrapped, fontsize=9.5, color=C['subtext'])
        ax.set_ylim(0, max(values) * 1.32)
        ax.spines['bottom'].set_color(C['border'])
        ax.yaxis.set_visible(False)
        for bar_obj, val in zip(bars, values):
            ax.text(bar_obj.get_x() + bar_obj.get_width() / 2,
                    bar_obj.get_height() + max(values) * 0.025,
                    f'{val}%', ha='center', va='bottom',
                    fontsize=10.5, fontweight='600', color=C['text'])
        ax.axhline(y=0, color=C['border'], linewidth=1)

    _title_block(fig, title, subtitle)
    plt.tight_layout(rect=[0, 0, 1, 0.88])
    _save(fig, folder, filename)


def donut(title, subtitle, labels, values, colors, folder, filename,
          figsize=(8.5, 6.2)):
    """Clean donut chart with legend below."""
    fig, ax = plt.subplots(figsize=figsize)
    fig.patch.set_facecolor(C['bg'])
    ax.set_facecolor(C['bg'])

    wedge_props = dict(linewidth=3, edgecolor='white')
    wedges, _, autotexts = ax.pie(
        values, colors=colors,
        autopct='%1.0f%%', startangle=90,
        wedgeprops=wedge_props,
        pctdistance=0.72,
        textprops=dict(color='white', fontsize=12, fontweight='700'),
    )
    # Donut hole
    ax.add_artist(plt.Circle((0, 0), 0.54, fc='white'))

    # Legend
    patches = [
        mpatches.Patch(color=colors[i], label=f'{labels[i]}  –  {values[i]}%')
        for i in range(len(labels))
    ]
    ax.legend(handles=patches, loc='lower center',
              bbox_to_anchor=(0.5, -0.10), ncol=len(labels),
              frameon=False, fontsize=10.5,
              labelcolor=C['subtext'])

    _title_block(fig, title, subtitle)
    plt.tight_layout(rect=[0, 0, 1, 0.88])
    _save(fig, folder, filename)


# ─────────────────────────────────────────────────────────────────────────────
#  01 · DEMOGRAFIJA I NAVIKE
# ─────────────────────────────────────────────────────────────────────────────
print('\n01 — Demografija i navike')

bar('Q1  Kojoj skupini pripadas?',
    'Raspodjela ispitanika po skupinama',
    ['Ucenik', 'Student', 'Freelancer', 'Zaposlenik', 'Ostalo'],
    [48, 32, 8, 10, 2],
    '01', 'q01-skupina.png')

bar('Q2  Ucestalost koristenja digitalnih datoteka',
    'Koliko cesto koristis digitalne datoteke?',
    ['Svakodnevno', 'Nekoliko puta tjedno', 'Rijetko'],
    [74, 22, 4],
    '01', 'q02-ucestalost.png')

bar('Q3  Broj alata za rad s datotekama',
    'Koliko razlicitih alata koristis za rad s datotekama?',
    ['1 alat', '2-3 alata', '4 ili vise'],
    [18, 52, 30],
    '01', 'q03-broj-alata.png')

bar('Q4  Pohrana datoteka',
    'Gdje najcesce cuvas datoteke? (visestuki odabir)',
    ['Google Drive', 'Lokalno', 'USB / Eksterni', 'OneDrive', 'Dropbox'],
    [68, 54, 27, 21, 16],
    '01', 'q04-pohrana.png',
    horizontal=True)


# ─────────────────────────────────────────────────────────────────────────────
#  02 · PROBLEMI S DATOTEKAMA
# ─────────────────────────────────────────────────────────────────────────────
print('\n02 — Problemi s datotekama')

bar('Q5  Ucestalost nemogucnosti pronalaska datoteke',
    'Koliko cesto ne mozes pronaci odredenu datoteku?',
    ['Ponekad', 'Cesto', 'Rijetko', 'Nikad'],
    [46, 34, 16, 4],
    '02', 'q05-pronalazak.png')

donut('Q6  Gubitak vazne datoteke',
      'Jesi li ikada izgubio/la vaznu datoteku?',
      ['Da — izgubio/la', 'Ne'],
      [58, 42],
      [C['danger'], C['success']],
      '02', 'q06-gubitak.png')

bar('Q7  Samoocjena organizacije datoteka  (1-5)',
    'Kako bi ocijenio/la organizaciju svojih datoteka?',
    ['1 — lose', '2', '3 — srednje', '4', '5 — odlicno'],
    [12, 24, 38, 18, 8],
    '02', 'q07-organizacija.png')

bar('Q8  Ometanost korištenjem vise aplikacija  (1-5)',
    'Koliko ti smeta koristenje vise aplikacija?',
    ['1 — nimalo', '2', '3', '4', '5 — jako smeta'],
    [6, 10, 22, 34, 28],
    '02', 'q08-vise-aplikacija.png')


# ─────────────────────────────────────────────────────────────────────────────
#  03 · PRIVATNOST I POVJERENJE
# ─────────────────────────────────────────────────────────────────────────────
print('\n03 — Privatnost i povjerenje')

bar('Q9  Vaznost privatnosti podataka  (1-5)',
    'Koliko ti je vazna privatnost podataka?',
    ['1 — nevazno', '2', '3', '4', '5 — iznimno vazno'],
    [2, 6, 18, 32, 42],
    '03', 'q09-privatnost.png')

donut('Q10  Povjerenje u velike cloud servise',
      'Imas li povjerenja u velike cloud servise?',
      ['Djelomicno', 'Da — potpuno', 'Ne'],
      [50, 28, 22],
      [C['warning'], C['success'], C['danger']],
      '03', 'q10-povjerenje-cloud.png')


# ─────────────────────────────────────────────────────────────────────────────
#  04 · AI FUNKCIONALNOSTI
# ─────────────────────────────────────────────────────────────────────────────
print('\n04 — AI funkcionalnosti')

bar('Q11  Korisnost AI organizacije datoteka',
    'Koliko bi ti bilo korisno da AI organizira datoteke?',
    ['Vrlo korisno', 'Donekle korisno', 'Nije potrebno'],
    [61, 31, 8],
    '04', 'q11-ai-korisnost.png')

donut('Q12  Otvorenost za AI platformu',
      'Bi li koristio AI platformu?',
      ['Da', 'Mozda', 'Ne'],
      [57, 34, 9],
      [C['success'], C['warning'], C['danger']],
      '04', 'q12-ai-platforma.png')

bar('Q13  Povjerenje u AI sustav',
    'Bi li vjerovao AI sustavu?',
    ['Djelomicno', 'Da', 'Ne'],
    [48, 36, 16],
    '04', 'q13-ai-povjerenje.png')

bar('Q14  Zeljene AI funkcionalnosti',
    'Koju AI funkcionalnost zelis? (visestruki odabir)',
    ['Pametno pretrazivanje', 'Auto. sortiranje', 'Preporuke', 'Auto. imenovanje'],
    [64, 58, 41, 29],
    '04', 'q14-ai-funkcionalnosti.png',
    horizontal=True)

bar('Q15  Vaznost privatnosti AI sustava  (1-5)',
    'Koliko je vazna privatnost AI sustava?',
    ['1 — nevazno', '2', '3', '4', '5 — iznimno vazno'],
    [2, 5, 15, 33, 45],
    '04', 'q15-ai-privatnost.png')


# ─────────────────────────────────────────────────────────────────────────────
#  05 · VALIDACIJA IDEJE
# ─────────────────────────────────────────────────────────────────────────────
print('\n05 — Validacija ideje')

donut('Q16  Interes za NEXA CORE platformu',
      'Bi li koristio platformu poput NEXA CORE?',
      ['Da', 'Mozda', 'Ne'],
      [63, 29, 8],
      [C['success'], C['warning'], C['danger']],
      '05', 'q16-interes.png')

bar('Q17  Spremnost na placanje',
    'Bi li bio spreman platiti za NEXA CORE?',
    ['Samo besplatna verzija', 'Da, platiti', 'Ne'],
    [52, 24, 24],
    '05', 'q17-placanje.png')

bar('Q18  Prihvatljiva cijena pretplate',
    'Koliko bi bio spreman platiti?',
    ['0 EUR', '1-5 EUR / mj.', '5-10 EUR / mj.', '10 EUR+ / mj.'],
    [22, 46, 24, 8],
    '05', 'q18-cijena.png')

bar('Q19  Utroseno vrijeme na organizaciju datoteka',
    'Koliko vremena trosIS na organizaciju datoteka?',
    ['Malo', 'Puno', 'Gotovo nista'],
    [44, 38, 18],
    '05', 'q19-vrijeme.png')


print('\nDone — 19 charts saved to exports/nexa-core-survey/')
