# Unified Design System · Akt-Anatomie + Typo/Spacing-Tokens

**Status:** Design approved, pending spec review
**Date:** 2026-04-15
**Scope:** Visual-Uniformität über alle 6 Akte (Desktop + Mobile), einheitliche Typo-Scale + Spacing-Rhythm

---

## 1 · Problem

Die 6 Akte wurden inkrementell entwickelt — jeder hat eigene Title-Sizes (clamps unterschiedlich), eigene Paddings (sp-3 vs sp-4), eigene Kicker-Placements. Auf Mobile fühlt sich jeder Akt „anders" an. Abstände zwischen Kicker/Title/Lede sind nicht rhythmisch. Title-Höhen variieren (Akt 3: 22–30px, Akt 5: 26–36px, Akt 6: 28–40px auf Mobile).

## 2 · Ziel

1. Einheitliche Typo-Scale für alle Akte (`--fs-title`, `--fs-lede`, etc.)
2. Einheitlicher Vertikal-Rhythmus (`--sp-head-gap-1/2`, `--sp-head-body`)
3. Gemeinsame Section-Anatomie (`.akt-head` + `.akt-body`) — HTML-Struktur konsistent
4. Unique-Moments pro Akt (Hero-Brand, Foodtruck-Specs, Catering-Preis-Statement) bleiben via `--fs-statement`
5. Desktop und Mobile nutzen dieselben Tokens — Mobile skaliert via clamp() natürlich kleiner

## 3 · Scope / Non-Goals

**In Scope:**
- Neue Tokens in `tokens.css`
- Utility-Klassen `.akt-head`, `.akt-title`, `.akt-lede` in `base.css`
- Refactor aller 6 Akte im HTML: einheitliche `.akt-head` + `.akt-body` Struktur
- Entfernen akt-spezifischer Title-Size-Overrides in `acts.css`
- Anpassung Desktop + Mobile parallel

**Non-Goals:**
- Keine neuen Features
- Kein Redesign der Popup-Shell (bleibt wie letzter Spec definiert)
- Kein Ändern der Farben/Themes
- Kein Verändern der Unique-Moments-Inhalte (nur Typo-Scale)

## 4 · Typo-Scale

### Tokens (neu in `tokens.css`)

```css
:root {
  /* Typo Roles (semantic) */
  --fs-kicker: 11px;
  --fs-title: clamp(32px, 5vw, 72px);
  --fs-lede: clamp(16px, 1.2vw, 20px);
  --fs-statement: clamp(40px, 6.5vw, 108px);
  --fs-body: clamp(15px, 1.1vw, 17px);
  --fs-meta: 11px;
}
```

**Mapping zu bestehenden Tokens:**
- `--fs-kicker`: war bereits 11px — unverändert
- `--fs-title`: **NEU** — ersetzt verschiedene clamp(28..40px, ..., 48..80px) in den akt-Title-Klassen
- `--fs-lede`: war `--fs-lead: 19px` — jetzt responsive clamp
- `--fs-statement`: **NEU** — für Hero-Brand, Foodtruck-Title, Catering-Statement
- `--fs-body`: war `--fs-body: 18px` — jetzt responsive clamp
- `--fs-meta`: war inline 11px — jetzt semantic token

### Verwendung

| Element | Token | Rolle |
|---------|-------|-------|
| `.kicker` (bestehend) | `--fs-kicker` | Label „Atto X · …" |
| `.akt-title` (neu) | `--fs-title` | Standard-Akt-Überschrift |
| `.akt-lede` (neu) | `--fs-lede` | Standard-Lede |
| Hero-Brand (`.akt-1-brand`) | **eigene Scale** `clamp(52px, 8.5vw, 152px)` | unique Hero-only, bleibt dominant |
| Foodtruck-Title (`.akt-4-title`) | `--fs-statement` | unique Cinematic-Moment |
| Catering-Statement (`.akt-5-statement`) | `--fs-statement` | unique Preis-Moment |
| `.meta` (bestehend) | `--fs-meta` | Specs, Tax, kleine Infos |

**Statement-Moments** (Akt 4/5) nutzen `--fs-statement` (max 108px). Hero-Brand (Akt 1) ist noch grösser (max 152px, eigene Scale). Alle anderen Titles (Akt 2/3/5-Intro-Title/6) nutzen `--fs-title` (max 72px) — identisch gross.

## 5 · Spacing-Rhythm

### Tokens (neu in `tokens.css`)

```css
:root {
  /* Section Rhythm */
  --sp-akt-y: var(--sp-6);       /* padding-block desktop (88px) */
  --sp-akt-y-mobile: var(--sp-4); /* padding-block mobile (36px) */
  --sp-head-gap-1: var(--sp-1);  /* kicker → title (8px) */
  --sp-head-gap-2: var(--sp-2);  /* title → lede (16px) */
  --sp-head-body: var(--sp-3);   /* .akt-head → .akt-body (24px) */
  --sp-body-gap: var(--sp-3);    /* zwischen .akt-body children */
}
```

### Regeln

- Alle Akte: `padding-block: var(--sp-akt-y)` (Desktop) / `var(--sp-akt-y-mobile)` (Mobile)
- `.akt-head > .kicker + .akt-title` → `margin-top: var(--sp-head-gap-1)` (via gap in grid)
- `.akt-head > .akt-title + .akt-lede` → `margin-top: var(--sp-head-gap-2)`
- `.akt-head + .akt-body` → `margin-top: var(--sp-head-body)` (via gap in grid)
- `.akt-body` interne gap: `var(--sp-body-gap)`

**Ausnahmen (Unique-Akte):**
- Akt 1 (Hero): kein padding-block (Video fills viewport), content center-aligned
- Akt 4 (Foodtruck): padding-block auf `.akt-4-overlay` (bottom-overlay), nicht auf `.akt`

## 6 · Section-Anatomie

### HTML-Template

```html
<section class="akt" data-theme="...">
  <div class="akt-inner">
    <header class="akt-head">
      <div class="kicker">Atto X · Label</div>
      <h2 class="akt-title">Headline</h2>
      <p class="akt-lede">Optional lede text.</p>
    </header>
    <div class="akt-body">
      <!-- Akt-spezifischer Content -->
    </div>
  </div>
</section>
```

### Utility-Klassen (neu in `base.css`)

```css
.akt-head {
  display: grid;
  gap: var(--sp-head-gap-1);  /* kicker → title base */
  /* title → lede wird via nth-of-type handled */
}
.akt-head .akt-title {
  font-family: 'Bricolage Grotesque', 'Bricolage-Fallback', ui-sans-serif, system-ui, sans-serif;
  font-variation-settings: 'opsz' 96, 'wdth' 78, 'wght' 650;
  font-size: var(--fs-title);
  line-height: 1.02;
  letter-spacing: -1.2px;
  margin: 0;
}
.akt-head .akt-lede {
  font-family: 'Newsreader', 'Newsreader-Fallback', Georgia, serif;
  font-size: var(--fs-lede);
  line-height: 1.55;
  max-width: 62ch;
  margin: var(--sp-head-gap-2) 0 0;
  font-variation-settings: 'opsz' 18;
}
.akt-body {
  margin-top: var(--sp-head-body);
  display: grid;
  gap: var(--sp-body-gap);
}
```

### Per-Akt Anwendung

| Akt | Head-Alignment | Body-Content |
|-----|----------------|--------------|
| **1 Hero** | Center, title = Brand (statement-scale) | — (kein body) |
| **2 Pizza** | Left | 2 figures grid (`.akt-2-pizza-grid`) |
| **3 Zutaten** | Left, nach Hero-Bild | `.site-modal-trigger` + Modal (mobile) / `.ingredients-grid` (desktop) |
| **4 Foodtruck** | Bottom-overlay, title statement-scale | 4 specs `.akt-4-specs` |
| **5 Catering** | Left | `.akt-5-statement` (statement-scale) + `.site-modal-trigger` + Modal |
| **6 Kontakt** | Left | `.site-modal-trigger` + Modal + `.akt-6-twint` |

## 7 · File-Changes

### Neu / Geändert

**`src/css/tokens.css`:**
- Neue Tokens: `--fs-title`, `--fs-lede`, `--fs-statement`, `--fs-body`, `--fs-meta`, `--sp-akt-y`, `--sp-akt-y-mobile`, `--sp-head-gap-1`, `--sp-head-gap-2`, `--sp-head-body`, `--sp-body-gap`
- Bestehende `--fs-body: 18px` wird zu `clamp(15px, 1.1vw, 17px)` — ggf. leichte visuelle Veränderung (leicht kleiner auf Desktop von 18→17), aber konsistenter

**`src/css/base.css`:**
- Utility-Klassen `.akt-head`, `.akt-title`, `.akt-lede` hinzufügen
- `.akt-body` utility
- Bestehende `.display` / `.lede` / `.kicker` bleiben (werden für Statements/Sonderfälle weitergenutzt)

**`src/css/acts.css`:**
- Alle akt-spezifischen Title-Size-Overrides entfernen:
  - `.akt-2-title { font-size: clamp(...) }` → entfernen (nutzt `--fs-title` via `.akt-title`)
  - `.akt-3-title`, `.akt-5-title`, `.akt-6-title` → entfernen
- Akt-spezifische lede-Overrides entfernen:
  - `.akt-2-lede`, `.akt-5-lede`, `.akt-6-lede` → nur noch Spezial-Styling (z.B. max-width Override), keine Size
- Alte akt-spezifische `gap`/`padding` in den akt-innern auf Tokens umstellen
- Mobile-Overrides: die `@media (max-width: 899px)` Regeln für Sections werden stark reduziert (Tokens kümmern sich selbst via clamp)
- Mobile akt-5-statement: nutzt `--fs-statement` (clamp responsive) — keine extra mobile-Override nötig

**`index.html`:**
- Alle 6 Akte bekommen `.akt-head` + `.akt-body` Wrapper
- Akt 1 Hero: `.akt-head` um den bestehenden `.akt-1-hero` (bestehende Brand-Typo)
- Akt 4 Foodtruck: `.akt-head` ersetzt `.akt-4-overlay` Kicker+Title+Lede (weiterhin im bottom-overlay Layout)
- Bestehende class-Namen (`.akt-2-title`, `.akt-5-statement` etc.) bleiben — sind nur keine Size-Definitionen mehr, können aber weiter für akt-spezifische Layout-Positionierung genutzt werden

### Unverändert
- `site-modal.css`, `site-modal.js`
- `scroll.js`, `main.js`, `contact-form.js`
- `footer.css`, `site-header.css`
- `layout.css`

## 8 · Verifizierung

**Desktop (1680×980) + Mobile (390×844) via Chrome-DevTools-MCP:**

1. **Typo-Konsistenz:** Title-Höhen in Akt 2/3/5-Intro-Title/6 sind exakt identisch (measure `.akt-title` font-size)
2. **Statement-Höhe:** Akt 1-Brand, Akt 4-Title, Akt 5-Statement nutzen dieselbe `--fs-statement` scale
3. **Spacing-Rhythm:** Gap Kicker→Title, Title→Lede, Head→Body ist in allen Akten gleich (measure offsetTop-Differenzen)
4. **Section-Heights:** Mobile ≤ 100dvh (832px), Desktop ≤ 100vh bei normalem Content-Volumen
5. **Auto-Snap:** funktioniert wie bisher
6. **Popups:** unverändert, öffnen/schliessen wie bisher
7. **Kein Visual-Bruch:** Desktop-Screenshots vor/nach: die Hero-, Foodtruck-, Catering-Unique-Momente sehen identisch aus (gleiche Brand-Typo, gleiche Statement-Scale)

## 9 · Risiken / Offene Punkte

- **`--fs-body: 18px → clamp(15,1.1vw,17px)`** ist leichte Desktop-Verkleinerung (18→17px bei 1.1vw=~17px). Das sollte OK sein, da aktuelle Lede-Zeilen eher gross wirkten.
- **Existing `--fs-lead: 19px`** vs neues `--fs-lede clamp(16,1.2vw,20px)` — bei 1680px ist 1.2vw=20px, also faktisch gleich; auf Mobile kleiner (16px statt 19px). Das passt zum Uniform-Gefühl.
- **Akt 1 Brand** behält eigene Scale `clamp(52px, 8.5vw, 152px)` — Hero = absolut unique, grösser als andere Statements. Nutzt NICHT `--fs-statement`.
- **`--fs-lede` Mobile-Reduktion**: von 19px auf 16px auf Mobile — ist bewusst für Uniformität.
