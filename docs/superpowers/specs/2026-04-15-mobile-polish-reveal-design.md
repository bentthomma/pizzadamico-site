# Mobile-Polish · Cinematic Overlays · Reveal Animations · Non-Scrollable Popups

**Status:** Design approved, pending spec review
**Date:** 2026-04-15
**Scope:** Mobile-UI-Refinement (Akt 3/5/6 cinematic treatment), reveal-animations, popup no-scroll

---

## 1 · Problem

Mobile-Design wirkt bisher „uninhabited":
- **Akt 5** Catering nimmt nur ~30 % des Viewports, Content schwimmt in der Mitte mit viel Leerraum oben/unten
- **Akt 3** Zutaten-Hero-Bild klein + unaufdringlich — kein cinematic-Moment
- **Akt 6** TWINT-Box dominiert, primäre Kontakt-CTA geht unter
- **Generell** keine Bewegung beim Scrollen — alles statisch, kein visueller Rhythmus
- **Popups** können content-abhängig scrollen, was sich umständlich anfühlt

## 2 · Ziel

1. Akt 3/5/6 auf Mobile cinematisch aufwerten ohne Desktop zu berühren
2. Subtile Reveal-Animationen über alle Sektionen für Bewegung beim Scroll
3. Popups passen idealerweise in 92 dvh ohne Scroll
4. Keine neuen `<header>/<footer>/<nav>` Tags oder Klassen mit „menu"/„header"/„footer" stem (Hoststar-Reset-safe)
5. Desktop-Layout unverändert lassen

## 3 · Scope / Non-Goals

**In Scope:**
- Akt 3 Mobile = full-bleed Hero-Pattern
- Akt 5 Mobile = subtle gradient-bg
- Akt 6 Mobile = Form-CTA prioritized, TWINT kompakter
- Reveal-Animationen über alle Akte (ausser Hero)
- Popup-Content-Kompaktierung für no-scroll
- `align-content`-Overrides pro Akt auf Mobile

**Non-Goals:**
- Keine Desktop-Layout-Änderungen bei Akt 2/3/5/6
- Keine neuen Images/Videos/Content
- Keine Änderung der Hero-Animation (akt1.js bleibt)
- Keine strukturelle HTML-Änderungen (nur CSS-gesteuerte Restrukturierung via Media Queries)

## 4 · Cinematic-Overlays (Mobile)

### Akt 3 · Zutaten — Full-Bleed Pattern

**Desktop** (unverändert): 2-col grid mit `.akt-3-hero` links + `.akt-3-content` rechts

**Mobile** (neu): `.akt-3-inner` wird zu einer Vollbild-Variante:
- `.akt-3-hero` absolut positioniert, `inset: 0`, `object-fit: cover`, nimmt ganze Section
- Gradient-Veil `linear-gradient(to top, inchiostro 0%, inchiostro 50% opacity 30%, transparent 70%)` unten
- `.akt-3-content` absolut positioniert am unteren Rand (bottom: `var(--sp-5)`) mit kicker + title + CTA, Farina-Text über Veil
- `.akt-3-title` Color Override auf Farina

**CSS-Umsetzung:**
```css
@media (max-width: 899px) {
  .akt-3 { overflow: hidden; position: relative; }
  .akt-3-inner { display: block; padding: 0; }
  .akt-3-hero { position: absolute; inset: 0; margin: 0; }
  .akt-3-hero picture, .akt-3-hero img {
    width: 100%; height: 100%; aspect-ratio: auto; object-fit: cover;
  }
  .akt-3::after {
    content: ""; position: absolute; inset: 0; pointer-events: none;
    background: linear-gradient(to top, var(--c-inchiostro) 0%, rgba(20,16,12,.4) 55%, transparent 80%);
  }
  .akt-3-content {
    position: absolute; bottom: var(--sp-4); left: var(--sp-viewport); right: var(--sp-viewport);
    z-index: 2; color: var(--c-farina);
  }
  .akt-3-content .kicker { color: var(--c-farina); opacity: 0.75; }
  .akt-3-title { color: var(--c-farina); }
  .site-modal-trigger { color: var(--c-farina); border-color: var(--c-farina); }
}
```

### Akt 5 · Catering — Subtle Gradient-BG

**Mobile** bekommt:
- `background: linear-gradient(135deg, var(--c-farina) 0%, color-mix(in srgb, var(--c-pane) 20%, var(--c-farina)) 100%)` — warmer Farbverlauf
- Optional: dezente elliptische Fuoco-Akzent-Form oben rechts (`::before` mit `radial-gradient`)
- `align-content: center` bleibt (Content ist schon mittig platziert)

**CSS:**
```css
@media (max-width: 899px) {
  .akt-5 {
    background: linear-gradient(135deg, var(--c-farina) 0%,
                color-mix(in srgb, var(--c-pane) 18%, var(--c-farina)) 100%);
  }
  .akt-5::before {
    content: ""; position: absolute; top: -20%; right: -30%;
    width: 80vw; aspect-ratio: 1; border-radius: 50%;
    background: radial-gradient(circle, color-mix(in srgb, var(--c-fuoco) 12%, transparent) 0%, transparent 60%);
    pointer-events: none; z-index: 0;
  }
  .akt-5 > * { position: relative; z-index: 1; }
}
```

### Akt 6 · Kontakt — Priority-Shift

**Mobile** verändert die Hierarchie:
- `.akt-6-title` bekommt `font-size: clamp(40px, 10vw, 56px)` — deutlich grösser als Standard-akt-title
- `.site-modal-trigger` in Akt-6 bekommt `padding: 14px 28px`, `font-size: 12px` — größerer Button
- `.akt-6-twint` kompakter: kleineres padding (`var(--sp-2)`), QR max-width 200px, note 11px, applink 10px

**CSS:**
```css
@media (max-width: 899px) {
  .akt-6-title { font-size: clamp(40px, 10vw, 56px); line-height: 1; }
  .akt-6 .site-modal-trigger { padding: 14px 28px; font-size: 12px; }
  .akt-6-twint { padding: var(--sp-2); gap: 6px; }
  .akt-6-twint-qr { max-width: 200px; padding: 8px; }
  .akt-6-twint-note { font-size: 11px; line-height: 1.35; }
  .akt-6-twint-applink { font-size: 10px; padding: 10px 16px; }
  .akt-6-direct a { font-size: 13px; }
}
```

## 5 · Spacings / Typo-Anpassungen (Mobile)

**align-content overrides pro Akt:**
```css
@media (max-width: 899px) {
  .akt { align-content: start; }
  .akt-1 { align-content: center; }  /* Hero bleibt zentriert */
  .akt-3 { align-content: center; }  /* Full-bleed, egal */
  .akt-4 { align-content: end; }      /* Foodtruck: Text unten im Bild */
  .akt-5, .akt-6 { align-content: center; }  /* kompakter Content, zentriert ok */
}
```

**Title bumps:**
- `--fs-title` bleibt global clamp(32,5vw,72)
- Akt 5 Statement (nur Mobile): clamp(40px, 9vw, 56px) — größer, bold
- Akt 6 Title (nur Mobile): clamp(40px, 10vw, 56px) — Statement-Level

## 6 · Reveal-Animationen

### Mechanik

**CSS-Klassen (`base.css`):**
```css
.reveal {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 600ms cubic-bezier(.2,.7,.1,1),
              transform 600ms cubic-bezier(.2,.7,.1,1);
  transition-delay: var(--reveal-delay, 0ms);
}
.reveal-in {
  opacity: 1;
  transform: translateY(0);
}
.reveal-image {
  opacity: 0;
  transform: scale(0.98);
  transition: opacity 800ms cubic-bezier(.2,.7,.1,1),
              transform 800ms cubic-bezier(.2,.7,.1,1);
}
.reveal-image.reveal-in {
  opacity: 1;
  transform: scale(1);
}
@media (prefers-reduced-motion: reduce) {
  .reveal, .reveal-image { opacity: 1; transform: none; transition: none; }
}
```

### JS · `src/js/reveal.js`

```js
export function initReveal() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.querySelectorAll('.reveal, .reveal-image').forEach(el => el.classList.add('reveal-in'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const targets = entry.target.querySelectorAll('.reveal, .reveal-image');
      targets.forEach((el, i) => {
        el.style.setProperty('--reveal-delay', `${i * 80}ms`);
        el.classList.add('reveal-in');
      });
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.2, rootMargin: '0px 0px -10% 0px' });

  document.querySelectorAll('.akt').forEach(akt => observer.observe(akt));
}
```

### Elemente mit `.reveal` Class

**Akt 2**: `.akt-head > *`, `.akt-2-media picture` (reveal-image)
**Akt 3**: `.akt-head > *`, `.site-modal-trigger`, `.akt-3-hero picture` (reveal-image)
**Akt 4**: `.akt-head > *`, `.akt-4-specs`, `.akt-4-bg` (reveal-image, aber gedämpft weil als bg)
**Akt 5**: `.akt-head > *`, `.akt-5-statement-block`, `.site-modal-trigger`
**Akt 6**: `.akt-head > *`, `.site-modal-trigger`, `.akt-6-twint` (als ganzes)

**Ausnahmen:**
- Akt 1 Hero: **keine** `.reveal`-Klassen — Hero soll sofort beim Page-Load sichtbar sein (akt1.js hat eigene Logik)
- Site-Header: keine reveal (soll beim Scroll-Event via scrolltrigger erscheinen, bestehende Logik)

### Stagger-Reihenfolge

Elemente innerhalb `.akt-head` werden in DOM-Reihenfolge animiert (kicker → title → lede). Nach `.akt-head` folgen `.akt-body`-children. Bilder sind separate `reveal-image` und starten gleich mit dem ersten Text (0ms delay).

## 7 · Non-scrollable Popups

### Zutaten-Popup

**Problem:** 3 Categories × bis zu 10 Listen-Items = viel vertikal.

**Fix:**
- Zutaten werden als **Chips/Pills** dargestellt statt als Listen. Jede Zutat ein kleines Pill (border, padding, wrap-flow). Spart ~40 % Höhe.
- Cat-Header bleibt als Section-Header darüber.

**CSS:**
```css
.site-modal .ingredients-grid {
  grid-template-columns: 1fr;
  gap: var(--sp-2);
}
.site-modal .ingredients-list {
  display: flex; flex-wrap: wrap; gap: 4px 6px;
}
.site-modal .ingredients-list li {
  padding: 4px 10px;
  border: 1px solid color-mix(in srgb, var(--c-fg) 20%, transparent);
  border-radius: 999px;
  font-size: 12px; font-family: var(--ff-mono);
  letter-spacing: 0.5px;
  line-height: 1.2;
}
.site-modal .ingredients-cat {
  font-size: 10px; letter-spacing: 2px;
  margin-bottom: 4px; min-height: auto;
  padding-bottom: 0; border-bottom: 0;
  color: var(--c-pane); opacity: 1;
}
```

**Resultat Höhe:** ~450 px statt ~700 px → passt in 92 dvh mit Luft.

### Catering-Popup

**Kompaktierung:**
- Menu-label font 14px, padding 3px 0 (war 17px, 4px 0)
- Menu-sub weg auf Mobile (details sind im Ambient-Wissen)
- Formula smaller (13px), tax in eine Zeile, schmaler font

```css
@media (max-width: 899px) {
  .site-modal .akt-5-menu .menu-label { font-size: 14px; }
  .site-modal .akt-5-menu .menu-sub { display: none; }
  .site-modal .akt-5-menu .menu-price { font-size: 15px; }
  .site-modal .akt-5-menu .menu-line { padding: 3px 0; }
  .site-modal .akt-5-formula { padding: 10px 14px; }
  .site-modal .akt-5-formula-expr { font-size: 13px; }
  .site-modal .akt-5-tax { font-size: 11px; line-height: 1.3; }
  .site-modal .akt-5-included { font-size: 10px; letter-spacing: 1.5px; }
}
```

**Resultat Höhe:** ~500 px statt ~700 px.

### Kontakt-Popup

**Passt bereits.** Zusatz: textarea rows=3 statt 5 auf Mobile.

```css
@media (max-width: 899px) {
  .site-modal .contact-form textarea { min-height: 60px; rows: 3; }
}
```

### Shell

- `max-height: 92dvh` bleibt als safety-net
- `overflow-y: auto` bleibt — triggert nur im edge-case (extreme font-scale-settings)

## 8 · File-Changes

**Neu:**
- `src/js/reveal.js` — IntersectionObserver + stagger-reveal

**Geändert:**
- `src/css/base.css` — `.reveal`, `.reveal-in`, `.reveal-image` utilities
- `src/css/layout.css` — `.akt { align-content: start; }` mobile + per-akt overrides
- `src/css/acts.css`
  - Akt 3 Mobile full-bleed block
  - Akt 5 Mobile gradient-bg + elliptical accent
  - Akt 6 Mobile title bump + TWINT compaction + CTA bump
  - Kontakt-modal textarea rows shrink
- `src/css/site-modal.css` — popup content compaction mobile (ingredients pills, menu kompakt)
- `src/js/main.js` — `initReveal()` import + call
- `index.html` — `.reveal` / `.reveal-image` classes on targets

**Unverändert:** scroll.js, site-modal.js, contact-form.js, footer.css, site-header.css, tokens.css

## 9 · Verifizierung

**Mobile 390×844 via Chrome-DevTools-MCP:**

1. Akt 3: Vollbild-Bild sichtbar, dark veil unten, Kicker+Title+CTA in Farina lesbar
2. Akt 5: warmer Gradient-BG erkennbar, Content nicht mehr „leer" wirkend
3. Akt 6: Title deutlich größer, CTA prominent, TWINT kompakt aber lesbar
4. Alle Akte: reveal-Stagger sichtbar beim ersten Scroll zu jeder Section (test via scrollIntoView)
5. Popups: Zutaten (Chips) + Catering (kompakt) passen in viewport ohne scrollbar
6. `prefers-reduced-motion: reduce` simulieren → Animationen deaktiviert, content sofort visible

**Desktop 1680×980:**
- Akt 2/3/4/5/6 unverändert (screenshot-compare mit vorigen Snaps)
- Reveal-Animationen auch auf Desktop aktiv (konsistentes Erlebnis)

## 10 · Risiken

- **Akt 3 full-bleed auf Mobile**: Wechsel vom bisherigen 1-col layout zu absolut positioniertem pattern. Kann visuell grösser wirken — Hero-Image-Qualität wird prominenter geprüft
- **Reveal-delays mit vielen Elementen**: Wenn eine Section viele `.reveal`-Elemente hat (zB Akt 4 mit specs), kann Stagger lang werden. 80ms × 6 Elemente = 480ms — OK, aber wenn mehr → eventuell reduzieren
- **Popup-Chips auf Zutaten**: Visuelle Veränderung vs bisheriger Listen. Desktop bleibt Listen (via media query scope), Mobile wird Chips — bewusste UX-Trennung
- **Akt 5 Gradient** könnte in Kombi mit anderen brace-hintergründen unsauber wirken. Test visuell
