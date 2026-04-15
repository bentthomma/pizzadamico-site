# Mobile Popup-Sections + Section-Snap

**Status:** Design approved, pending spec review
**Date:** 2026-04-15
**Scope:** Mobile-Redesign für content-heavy Sections + Auto-Snap auf Mobile

---

## 1 · Problem

Auf Mobile passen die content-heavy Sections (Akt 3 Zutaten, Akt 5 Catering, Akt 6 Kontakt) schon nach Compaction zwar rechnerisch in 100vh, wirken aber gedrängt und chaotisch. Hero-Momente wie „Pizza à discrétion, CHF 25 pro Person." gehen unter im Detail-Noise (Menu-Tafel, Formula, Listen). Auto-Snap ist auf Mobile deaktiviert — User hat kein klares Section-Paging-Gefühl.

## 2 · Ziel

1. Jede Section auf Mobile zeigt eine klare Hero-Szene (Statement + CTA) in exakt `100dvh`
2. Detail-Content (Zutaten-Liste, Preis-Tafel, Kontakt-Form) wandert in Fullscreen-Popups
3. Auto-Snap wird auf Mobile aktiviert — identische Logik wie Desktop
4. Desktop bleibt komplett unverändert
5. Content existiert nur einmal im DOM (keine Duplizierung)

## 3 · Scope / Non-Goals

**In Scope:**
- Mobile-Layouts für Akt 3 (Zutaten), Akt 5 (Catering), Akt 6 (Kontakt)
- Shared Popup-Shell + generischer Modal-Handler
- Auto-Snap auf Mobile + `100dvh` Migration
- TWINT-App-Link-Button (Mobile-only)

**Non-Goals:**
- Desktop-Redesign der Zutaten (Hero-Bild mit Callout-Linien / MP4) — separate Session
- Akt 1 (Hero), Akt 2 (Pizza), Akt 4 (Foodtruck) — bleiben unverändert
- Footer- oder Header-Änderungen
- Neue Content-Inhalte — nur Re-Layout bestehender Informationen

## 4 · Architektur-Prinzip

Mobile-Sections folgen dem Muster **„Hero-Szene + CTA → Popup"**:

```
Mobile Section                      Popup (Mobile only)
┌─────────────────┐                 ┌─────────────────┐
│  Hero-Visual    │                 │  [close ×]      │
│  Statement      │   ──── CTA ──▶  │  Kicker         │
│  [CTA-Button]   │                 │  Title          │
└─────────────────┘                 │  Detail-Content │
                                    └─────────────────┘
```

Derselbe HTML-Content rendert auf Desktop inline, auf Mobile als Popup — umgeschaltet via CSS Media Query + `aria-hidden`.

## 5 · Section-Layouts (Mobile)

### Akt 3 · Zutaten

**Section (Mobile):**
- Hero-Bild (aspect-ratio 4/3, full-width)
- Kicker: „ATTO III · DIE ZUTATEN"
- Title: „Alles frisch. Vieles aus Italien." (kompakter)
- CTA: „Alle Zutaten ansehen →"

**Popup:**
- Close-X oben rechts
- Kicker + Display-Title
- Ingredients-Grid (Basis / Gemüse / Fleisch · Fisch · Käse) — bestehende Struktur mit min-height-Alignment

### Akt 5 · Catering

**Section (Mobile):**
- Kicker: „ATTO V · CATERING"
- Title: „Für jeden Anlass das passende Erlebnis."
- Lede (kurz): „Firmenfeier, Hochzeit, privates Fest …"
- Statement: „Pizza à discrétion, *CHF 25* pro Person."
- CTA: „Preise & Details →"

**Popup:**
- Close-X
- Kicker + Display-Title
- Menu-Tafel (5 Zeilen mit Leader-Dots)
- Inbegriffen-Zeile
- Formula-Callout (dunkel)
- Tax-Note

### Akt 6 · Kontakt

**Section (Mobile):**
- Kicker: „ATTO VI · KONTAKT"
- Title: „Schreibt uns."
- Lede (kurz): „Pietro meldet sich persönlich innerhalb von 48h."
- CTA: „Nachricht schreiben →"
- TWINT-Box (bleibt inline, kompakt):
  - Kicker: „ANZAHLUNG PER TWINT"
  - QR-Code (max 240px)
  - Button: „Mit TWINT App bezahlen →" (öffnet `https://go.twint.ch/...`)
  - Telefonnummer: „076 331 32 59"

**Popup:**
- Close-X
- Kicker + Display-Title
- Contact-Form (E-Mail + Message + Senden) — bestehend, AJAX-Submit unverändert

**Success-Flow nach Form-Submit:**
1. AJAX-POST an FormSubmit.co (bestehender Handler)
2. Erfolgreiche Response → Kontakt-Popup schliesst (`closeModal('modal-kontakt')`)
3. Danach: Success-Overlay öffnet (bestehender `#contact-success`-Handler)
4. User sieht „Grazie!"-Dialog → schliesst mit OK

Die beiden Overlays sind separate Elemente, werden sequenziell geöffnet/geschlossen.

## 6 · Popup-Shell (shared)

### Markup-Struktur

```html
<div class="site-modal" id="modal-zutaten" aria-hidden="true" role="dialog" aria-modal="true" aria-labelledby="modal-zutaten-title">
  <div class="site-modal-backdrop" data-modal-close></div>
  <div class="site-modal-shell">
    <button class="site-modal-close" type="button" data-modal-close aria-label="Schliessen">×</button>
    <div class="site-modal-head">
      <div class="kicker">ATTO III · DIE ZUTATEN</div>
      <h3 class="display site-modal-title" id="modal-zutaten-title">Alles frisch.</h3>
    </div>
    <div class="site-modal-body">
      <!-- Content — bestehende Ingredients-Grid etc. -->
    </div>
  </div>
</div>
```

### CSS-Verhalten

**Desktop (≥900px):** Modal rendert als normaler inline-Content
- `.site-modal { position: static; display: block; }`
- Backdrop + Close-Button: `display: none`
- Shell: transparenter Hintergrund, volle Breite, kein Padding-Override
- `.site-modal-head` versteckt (Desktop nutzt den Akt-eigenen Kicker + Title)
- `.site-modal-trigger` Button versteckt

**Mobile (<900px):** Modal wird zu Fullscreen-Overlay
- `.site-modal { position: fixed; inset: 0; z-index: 120; display: grid; opacity: 0; visibility: hidden; pointer-events: none; }`
- `.site-modal[aria-hidden="false"] { opacity: 1; visibility: visible; pointer-events: auto; }`
- Shell: farina bg, runde Ecken, max-width: 92vw, max-height: 92dvh, scrollbar-body, transform-transition
- Close-Button + Backdrop: sichtbar
- `.site-modal-head`: sichtbar (Kicker + Title geben Kontext im Popup)
- `.site-modal-trigger` Button: sichtbar in der Akt-Section
- Die inline Detail-Content (Listen / Menu-Tafel / Form) — im Modal-Body — sind auf der Akt-Section selbst (via `.akt-3-content > .site-modal`) eh gerendert, aber durch das Overlay abgedeckt. Kein separates `display: none`-Toggle auf den Content-Elementen nötig

### JS-Handler (`site-modal.js`)

- `initSiteModal()` — findet alle `.site-modal-trigger[data-target]`, bindet Click-Handler
- `openModal(id)` — setzt `aria-hidden="false"`, `body.style.overflow="hidden"`, Fokus auf Close-Button
- `closeModal(id)` — setzt `aria-hidden="true"`, restauriert `body.style.overflow`
- Global: ESC schliesst offenes Modal, Backdrop-Click schliesst
- Focus-Trap innerhalb Modal (Tab cyclt zwischen fokussierbaren Elementen)

## 7 · Auto-Snap auf Mobile

### Änderungen in `scroll.js`

**Entfernen:**
```js
if (window.innerWidth < DESKTOP_BREAKPOINT) return;
```

**Bestehende Logik bleibt identisch:**
- `scrollend`-Event (nativ supported in Chrome/Safari/Firefox Mobile)
- Dominant-Section-Logik via `getBoundingClientRect`
- Programmatic-Lock während Smooth-Scroll (900ms)
- Footer-Near-End Exit (`fr.top < viewportH - 40`)
- Max-Scroll-Exit

### CSS in `layout.css`

```css
.akt {
  min-height: 100dvh; /* modern browsers */
}
```

Die bestehende Doppel-Deklaration (`100dvh` + `100vh` Fallback) reicht — kein weiterer Change nötig.

### Popup-Interaktion

Wenn ein Modal offen ist (`body.style.overflow = "hidden"`), scrollt die Page nicht → Auto-Snap inaktiv by default. Nach Close: Scroll-Position restauriert, Auto-Snap wieder aktiv.

### Reduced-Motion

Unverändert — User mit `prefers-reduced-motion: reduce` bekommt kein Auto-Snap.

## 8 · TWINT-App-Link

Mobile-only: unter dem QR-Code erscheint ein Button „Mit TWINT App bezahlen →" mit `href="https://go.twint.ch/1/e/tw?tw=..."`. Tap öffnet die TWINT-App direkt. Auf Desktop ist der Button hidden (User scannt QR). Der Payment-Link ist derselbe wie im TWINT-QR hinterlegt — kommt aus Bens alten Infos.

CSS: `.akt-6-twint-applink { display: none; }` auf Desktop, `display: inline-flex` auf Mobile.

## 9 · Migration / File-Changes

### Neu
- `src/css/site-modal.css` — Shared Shell + responsive Umschaltung
- `src/js/site-modal.js` — Generischer Modal-Handler

### Geändert
- `index.html` — CTA-Trigger in Akt 3/5/6, Modal-Wrapper um Detail-Content, TWINT-App-Link-Button
- `src/css/acts.css` — Mobile-Section-Layouts via `@media (max-width: 899px)`
- `src/css/layout.css` — (unverändert, `100dvh` ist schon drin)
- `src/js/scroll.js` — Mobile-Breakpoint-Check entfernen
- `src/js/main.js` — `initSiteModal()` Import + Init
- `src/js/contact-form.js` — Success-Overlay öffnet nach Close des Kontakt-Popups
- `src/css/modal.css` — Success-Overlay behält eigene Styles (separate Komponente mit abweichendem Layout: kleinere Modal-Card für kurze Bestätigungsnachricht, kein scroll-body). Keine Fusion mit site-modal nötig

### Entfällt
- Die alten inline-Details auf Mobile (Listen / Menu-Tafel / Form) werden durch CSS `display: none` beim Akt-Section ausgeblendet — derselbe DOM-Content rendert via Modal.

## 10 · Testing

**Manuell via Chrome-DevTools-MCP:**

1. **Desktop (1680×980):**
   - Alle 3 Sections rendern inline wie bisher (keine visuelle Änderung)
   - CTA-Buttons versteckt
   - Auto-Snap funktioniert wie bisher

2. **Mobile (390×844):**
   - Alle 6 Akte fitten exakt in 100dvh (= viewport-Höhe)
   - Akt 3/5/6 zeigen Hero-Szene + CTA
   - Tap auf CTA → Popup öffnet, Content scrollbar wenn > viewport
   - Close-X, Backdrop-Click, ESC schliessen Popup
   - Auto-Snap: swipe zwischen Sections → nach momentum end → snap zur dominanten
   - TWINT-App-Link (Akt 6 mobile): Click → öffnet TWINT-App (auf Desktop versteckt)

3. **Edge-Cases:**
   - Popup offen + swipe: kein Scroll-Leak
   - Orientation-Change: Section-Heights re-compute
   - Reduced-Motion: kein Auto-Snap

**Keine automatisierten Tests** — kein Test-Framework im Projekt.

## 11 · Offene Punkte / Risiken

- **Focus-Trap** auf Mobile: Implementation muss ohne Library sauber sein. Minimal-Trap via Tab-Key-Listener, keyboard-Fokus cyclisch.
- **URL-Bar-Toggle** auf Mobile Safari: `100dvh` sollte handlen, aber iOS Safari kann bei scroll-direction-change URL-Bar rein/rausfahren → Auto-Snap könnte unerwartet triggern. Toleranz via `scrollend`-Debounce bleibt wie aktuell.
- **Akt 3 Zutaten auf Desktop** bleibt unverändert — das aktuelle 2-col Layout (Bild links, Content rechts) bleibt bestehen. Eine separate Session wird das Desktop-Design mit Callout-Linien / MP4 angehen.
