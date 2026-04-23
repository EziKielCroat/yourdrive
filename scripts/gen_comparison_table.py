"""
Clean document-style comparison table — judges edition.
Large readable text, no broken Unicode badges, auto-sized height.
Output → exports/Usporedba_s_Konkurencijom.png
"""
import os
import textwrap
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from matplotlib import font_manager

# Simboli ✓ / ✗ — DejaVu Sans (Avenir često nema glifove)
FP_SYM = font_manager.FontProperties(family='DejaVu Sans', weight='bold')

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'exports')
os.makedirs(OUT, exist_ok=True)

# ── Colours ───────────────────────────────────────────────────────────────────
BG      = '#FFFFFF'
DARK    = '#0F1A36'
MED     = '#475569'
LIGHT   = '#94A3B8'
TEAL    = '#3DC5A8'
NAVY    = '#0F1A36'
YD_DATA = '#EDF9F6'
SEC_BG  = '#F1F5F9'
ROW_A   = '#FFFFFF'
ROW_B   = '#F8FAFC'
C_YES   = '#15803D'
C_NO    = '#B91C1C'
C_PAR   = '#92400E'
C_NA    = '#94A3B8'

plt.rcParams.update({
    'font.family':       'sans-serif',
    'font.sans-serif':   ['Avenir Next', 'Helvetica Neue', 'Arial', 'DejaVu Sans'],
    'figure.facecolor':  BG,
    'axes.facecolor':    BG,
    'text.color':        DARK,
    'savefig.facecolor': BG,
    'savefig.edgecolor': 'none',
})

# ── Data ─────────────────────────────────────────────────────────────────────
# Cijene / kapaciteti Nexa: packages/plans/src/index.ts (isto kao PlanSection / Plan.tsx)
# 'Y'=DA  'N'=NE  'P'=Djelomicno  '-'=dash  or plain string
ROWS = [
    ('PRIVATNOST', None, None, None, None, True),
    ('Self-hosting',                               'Y', 'N', 'N', 'N', False),
    ('Bez prikupljanja podataka',                  'Y', 'N', 'N', 'N', False),
    ('Otvoreni kod (OSS)',                         'Y', 'N', 'N', 'N', False),
    ('Bez vendor lock-ina',                        'Y', 'N', 'N', 'N', False),

    ('AUTENTIKACIJA', None, None, None, None, True),
    ('TOTP / MFA',                                 'Y', 'Y', 'Y', 'Y', False),
    ('TOTP backup kodovi',                         'Y', 'Y', 'N', 'N', False),
    ('Passkeys / WebAuthn',                        'Y', 'Y', 'Y', 'P', False),
    ('Zaštita od brute-force',                     'Y', 'Y', 'Y', 'Y', False),
    ('Enkripcija pohrane',                         'Y', 'Y', 'Y', 'Y', False),

    ('DATOTEKE', None, None, None, None, True),
    ('Pregled 10+ formata',                        'Y', 'Y', 'Y', 'P', False),
    ('Konverzija datoteka',                        'Y', 'P', 'P', 'N', False),
    ('Verzioniranje',                              'Y', 'P', 'Y', 'Y', False),
    ('Koš / Recycle Bin',                          'Y', 'Y', 'Y', 'Y', False),
    ('Zaključavanje datoteka',                     'Y', 'N', 'N', 'N', False),
    ('Favoriti',                                   'Y', 'P', 'P', 'P', False),

    ('DIJELJENJE', None, None, None, None, True),
    ('Link dijeljenje',                            'Y', 'Y', 'Y', 'Y', False),
    ('Lozinka na linku',                           'Y', 'N', 'N', 'Y', False),
    ('Istek linka',                                'Y', 'Y', 'Y', 'Y', False),
    ('Limit preuzimanja',                          'Y', 'N', 'N', 'N', False),
    ('Aktivnost dijeljenja',                       'Y', 'N', 'N', 'N', False),
    ('Komentari',                                  'Y', 'Y', 'P', 'N', False),

    ('UREĐAJI', None, None, None, None, True),
    ('Sesije / uređaji',                           'Y', 'Y', 'Y', 'Y', False),
    ('Remote lock',                                'Y', 'N', 'P', 'N', False),
    ('Remote wipe',                                'Y', 'N', 'Y', 'N', False),
    ('Limit pohrane / uređaj',                     'Y', 'N', 'N', 'N', False),

    ('POHRANA & AI', None, None, None, None, True),
    # Isto kao Free Plan na /pricing (packages/plans)
    ('Besplatni kapacitet (GB)',                   '30', '15', '5', '2', False),
    ('S3 / B2',                                    'Y', '-', '-', '-', False),
    ('AI asistent',                                'Y', 'Y', 'Y', 'N', False),
    ('Mobilna app',                                'P', 'Y', 'Y', 'Y', False),
    ('Uptime (demo)',                              '99.5 %', '99.9 %', '99.9 %', '99.9 %', False),

    ('CIJENE (cjenik)', None, None, None, None, True),
    ('Besplatno (Free)',                           '0 €', '0 €', '0 €', '0 €', False),
    ('Pro / mjesec',                               '5 €', '~2€*', '~7€*', '~12€*', False),
    ('Pro / godina',                               '50 €', '—', '—', '—', False),
    ('Pro kapacitet (GB)',                         '50', '—', '—', '—', False),
    ('Investor',                                   '?', '—', '—', '—', False),
    ('Edu / neprofit popust',                      'Y', 'Y', 'Y', 'N', False),
    ('Model',                                      'SaaS', 'SaaS', 'SaaS', 'SaaS', False),

    ('EDUKACIJA', None, None, None, None, True),
    ('Ankete korisnika',                           'Y', 'N', 'N', 'N', False),
    ('Suradnja s institucijama',                   'Y', 'Y', 'Y', 'P', False),
    ('Demo / trial',                               'Y', 'Y', 'Y', 'P', False),
    ('Fokus na edukaciju',                         'Y', 'P', 'P', 'N', False),
    ('Lokalna podrška',                            'Y', 'N', 'N', 'N', False),

    ('IZMJERENO (30 d.)', None, None, None, None, True),
    ('Zadovoljstvo',                               '4.5/5', '-', '-', '-', False),
    ('DAU/MAU',                                    '75 %', '~45%*', '~30%*', '~20%*', False),
    ('Retention 30 d.',                            '42 %', '~35%*', '-', '-', False),
    ('Gubitak podataka',                           '0', '-', '-', '-', False),
    ('Broj uploada',                               '1 013', '-', '-', '-', False),
]

# ── Layout: svi stupci užeg profila, jednaka logika „paddinga” (inset + uske frakcije)
# Visoka rezolucija za zum / projekciju (≈ 4× više piksela nego @200 DPI)
SAVE_DPI = 400
FW       = 8.85
ML, MR   = 0.14, 0.14
TW       = FW - ML - MR

# Uravnoteženo: značajke ~38 %, ostalo po ~15,5 % (uža kao podatkovni stupci)
CF       = [0.38, 0.155, 0.155, 0.155, 0.155]
CW       = [TW * f for f in CF]
CX       = [ML + sum(CW[:i]) for i in range(len(CW))]
GAP      = 0.001

# Lijevi inset u ćeliji značajke (vizualno isti red kao kod centriranih vrijednosti)
FEAT_PAD_L   = 0.052
FEAT_WRAP_W  = 22

# Sekcije: teal traka + jasan razmak prije naslova
SEC_STRIPE_W    = 0.055
SEC_AFTER_STRIPE = 0.10

HDRS     = [
    'Značajka',
    'Nexa\nCore',
    'Google\nDrive',
    'One\nDrive',
    'Drop\nbox',
]

H_CH     = 0.40
H_SEC    = 0.28


def _feat_wrap_lines(label):
    return textwrap.wrap(label, width=FEAT_WRAP_W, break_long_words=False, break_on_hyphens=True)


_feat_max_lines = max(len(_feat_wrap_lines(r[0])) for r in ROWS if not r[5])
# Viši red ako se značajka lomi u 2+ retka (už stupac)
H_ROW = 0.27 + max(0, _feat_max_lines - 1) * 0.088

TITLE_H  = 1.38
FOOT_H   = 1.05

# Compute figure height from content
n_sec  = sum(1 for r in ROWS if r[5])
n_data = sum(1 for r in ROWS if not r[5])
TABLE_H = H_CH + n_sec * H_SEC + n_data * H_ROW
FH = TITLE_H + TABLE_H + FOOT_H + 0.20   # 0.20 = top/bottom padding

TABLE_TOP = FH - 0.12 - TITLE_H   # top of column-header row

print(f'  Rows: {n_data} data + {n_sec} sections | TABLE_H={TABLE_H:.2f}" | FH={FH:.2f}"')

# ── Helpers ────────────────────────────────────────────────────────────────────
def rect(ax, x, y, w, h, fc, ec='none', lw=0, z=1):
    ax.add_patch(mpatches.Rectangle((x, y), w, h,
        facecolor=fc, edgecolor=ec, linewidth=lw, zorder=z))


def hline(ax, y, c='#CBD5E1', lw=0.5):
    ax.plot([ML, ML + TW - GAP], [y, y], color=c, linewidth=lw, zorder=5)


def txt(ax, x, y, s, color=DARK, fs=12, fw='normal', ha='center', va='center', z=6):
    ax.text(x, y, s, color=color, fontsize=fs, fontweight=fw,
            ha=ha, va=va, zorder=z, clip_on=False)


def draw_value_cell(ax, cx, cy, v, is_nexa_col):
    """Samo Y/N imaju ✓/✗; ostalo tekst ili minimalno —."""
    if v == 'Y':
        ax.text(cx, cy, '\u2713', fontproperties=FP_SYM, fontsize=9.0,
                color=C_YES, ha='center', va='center', zorder=8)
    elif v == 'N':
        ax.text(cx, cy, '\u2717', fontproperties=FP_SYM, fontsize=9.0,
                color=C_NO, ha='center', va='center', zorder=8)
    elif v == 'P':
        txt(ax, cx, cy, '~', color=C_PAR, fs=8.0, fw='700')
    elif v in ('-', '—'):
        txt(ax, cx, cy, '\u2014', color=C_NA, fs=7.0, fw='normal')
    elif v:
        fw = '700' if is_nexa_col else 'normal'
        fs = 7.0 if is_nexa_col else 6.5
        txt(ax, cx, cy, v, color=DARK, fs=fs, fw=fw)


# ── Build figure ───────────────────────────────────────────────────────────────
fig = plt.figure(figsize=(FW, FH))
ax  = fig.add_axes([0, 0, 1, 1])
ax.set_xlim(0, FW)
ax.set_ylim(0, FH)
ax.axis('off')
fig.patch.set_facecolor(BG)

# ── Title block ────────────────────────────────────────────────────────────────
ty = FH - 0.10
txt(ax, ML, ty,
    'Nexa Core — Usporedba s konkurencijom',
    color=DARK, fs=16.5, fw='900', ha='left', va='top')

ty -= 0.44
txt(ax, ML, ty,
    'Ključne značajke i izmjereno  ·  2026',
    color=MED, fs=9.0, ha='left', va='top')

ty -= 0.24
rect(ax, ML, ty, 3.4, 0.038, TEAL, z=3)

# ── Column headers ─────────────────────────────────────────────────────────────
y = TABLE_TOP
for i, (cx, cw, hdr) in enumerate(zip(CX, CW, HDRS)):
    bg = TEAL if i == 1 else NAVY
    rect(ax, cx, y, cw - GAP, H_CH, bg, z=2)
    hfs = 7.4 if i == 0 else 6.9
    txt(ax, cx + cw / 2, y + H_CH / 2, hdr,
        color='white', fs=hfs, fw='800')

# thin separator below headers
hline(ax, y, c='#1a3a5c', lw=1.4)
y += H_CH   # move y to TOP of next row (we draw rows going down)

# ── Data rows ─────────────────────────────────────────────────────────────────
cur_y = TABLE_TOP   # we draw downward from TABLE_TOP
alt   = 0

for row in ROWS:
    label, yd, gd, od, db, is_sec = row

    if is_sec:
        h = H_SEC
        ry = cur_y - h
        rect(ax, ML, ry, TW - GAP, h, SEC_BG, z=2)
        rect(ax, ML, ry, SEC_STRIPE_W, h, TEAL, z=3)
        sec_lbl = '\n'.join(
            textwrap.wrap(label, width=36, break_long_words=False, break_on_hyphens=True))
        txt(ax, ML + SEC_STRIPE_W + SEC_AFTER_STRIPE, ry + h / 2, sec_lbl,
            color=MED, fs=7.8, fw='800', ha='left')
        hline(ax, ry, c='#CBD5E1', lw=0.5)
        cur_y = ry
    else:
        h = H_ROW
        ry = cur_y - h
        row_bg = ROW_A if alt % 2 == 0 else ROW_B
        alt += 1

        for i, (cx, cw) in enumerate(zip(CX, CW)):
            bg = YD_DATA if i == 1 else row_bg
            rect(ax, cx, ry, cw - GAP, h, bg, z=2)

        # Stupac značajki — už, s insetom i prijelomom retka
        lbl_wrapped = '\n'.join(_feat_wrap_lines(label))
        txt(ax, CX[0] + FEAT_PAD_L, ry + h / 2, lbl_wrapped,
            color=DARK, fs=9.0, fw='normal', ha='left')

        # Value cells (✓/✗ samo za Y/N)
        vals = [yd, gd, od, db]
        for i, (cx, cw, v) in enumerate(zip(CX[1:], CW[1:], vals)):
            cx_c = cx + cw / 2
            cy_c = ry + h / 2
            draw_value_cell(ax, cx_c, cy_c, v, is_nexa_col=(i == 0))

        hline(ax, ry, c='#E2E8F0', lw=0.4)
        cur_y = ry

# Bottom border
rect(ax, ML, cur_y - 0.030, TW - GAP, 0.030, '#94A3B8', z=3)

# ── Legend (simboli kao u tablici) ─────────────────────────────────────────────
ly1 = cur_y - 0.20
lx = ML
ax.text(lx, ly1, '\u2713', fontproperties=FP_SYM, fontsize=9, color=C_YES,
        ha='left', va='center', zorder=8)
txt(ax, lx + 0.20, ly1, '= da', color=MED, fs=7.2, ha='left')
lx += 1.55
ax.text(lx, ly1, '\u2717', fontproperties=FP_SYM, fontsize=9, color=C_NO,
        ha='left', va='center', zorder=8)
txt(ax, lx + 0.20, ly1, '= ne', color=MED, fs=7.2, ha='left')
lx += 1.45
txt(ax, lx, ly1, '~', color=C_PAR, fs=9, fw='700', ha='left')
txt(ax, lx + 0.14, ly1, '= djel.', color=MED, fs=7.2, ha='left')
lx += 1.35
txt(ax, lx, ly1, '\u2014', color=C_NA, fs=8, ha='left')
txt(ax, lx + 0.16, ly1, '= n/p', color=MED, fs=7.2, ha='left')

ly2 = cur_y - 0.38
txt(ax, ML, ly2,
    '* Konkurencija: procjene. Nexa: cjenik = web (30 GB free, Pro 5 €/mj, 50 GB, '
    'god. 50 € = 12×5 − 10 €). Izmjereno: 30 d.',
    color=LIGHT, fs=6.6, ha='left', va='top')

# ── Save ───────────────────────────────────────────────────────────────────────
out_path = os.path.join(OUT, 'Usporedba_s_Konkurencijom.png')
fig.savefig(out_path, dpi=SAVE_DPI, bbox_inches='tight', facecolor=BG, edgecolor='none')
plt.close(fig)
print(f'  Saved -> {out_path}')
