# Way2fast

A clickable, front-end-only pedestrian route prototype for wheelchair users and people using walking aids in central Tallinn.

**Demo notice:** All destinations, routes, barriers, and winter alerts live in `src/data/routes.json`. State is kept in React state only (no backend, no login, no `localStorage`, no analytics, no cookies).

## Run locally

Requires Node.js 20+ and npm:

```sh
npm install
npm run dev
```

Run unit tests:

```sh
npm test
```

## Screens

1. **Welcome** (`/`) — Purpose, EN / ET language switch, Start button.
2. **Mobility profile** (`/profile`) — Aid choice, max slope slider (3–12%), cobblestones & dropped-kerb toggles.
3. **Destination** (`/destination`) — Search filter over 4 central Tallinn preset places (shop, clinic, tram stop, library).
4. **Route options** (`/routes`) — OpenStreetMap (`react-leaflet`) view with solid/dashed/dotted route polylines and dynamic ratings.
5. **Route detail** (`/route/$routeId`) — Active & expired winter alerts, step-by-step surface/slope/barrier list, `"Last checked"` + source, and an `"Unknown: crossing condition not verified"` row.
6. **Report a barrier** (`/report`) — Barrier type, description, local photo placeholder (not uploaded), and interactive map picker.
7. **Report status** (`/report-status`) — 4-stage stepper (`Received → Under review → Verified → Rechecked`) with `aria-live` announcements.

## Deploy to GitHub Pages

This project uses **TanStack Start** (`@tanstack/react-router`) rather than `react-router-dom` `HashRouter`. To host it as a static site on GitHub Pages under `https://<username>.github.io/<repo>/`:

1. Push the repository to GitHub (e.g. `https://github.com/vicunila/TMJ3300_MOCK`).
2. In `src/router.tsx`, pass `history: createHashHistory()` (imported from `@tanstack/react-router`) when building for static GitHub Pages, and configure `vite.base: "./"` in a static Vite build or enable TanStack Start static prerendering with a `404.html` fallback pointing to `index.html`.
3. Build the static output (`npm run build`) and publish the static client bundle via **Settings → Pages → GitHub Actions**.

## Accessibility features implemented (WCAG 2.2 AA)

- **Contrast ≥ 4.5:1**: High-contrast Nordic civic palette (`Atkinson Hyperlegible Next` typeface) verified on all text, badges, banners, and expired alerts.
- **Never colour alone**: Every route rating combines a colour-blind-safe palette, text label (`Easy` / `Manageable` / `Avoid`), distinct geometric icon (`CheckCircle2` / `TriangleAlert` / `OctagonX`), and map line pattern (`solid` / `dashed` / `dotted`).
- **Keyboard navigation & focus**: Skip-to-main-content link, visible `3px` `:focus-visible` outlines, full keyboard operation across forms/sliders/toggles, plus North/South/West/East keyboard coordinate controls on the barrier location map.
- **Touch targets ≥ 44×44 px**: All buttons, icon buttons, toggle buttons, bottom navigation actions, and form rows meet or exceed 44×44 px.
- **Semantic landmarks & ARIA**: Single `<main>`, `<header>`, `<nav>`, `aria-label` on icon buttons, `aria-current="step"` on the active stepper item, and `aria-live="polite"` status announcements for language changes, profile updates, form submission, and report status stages.
- **Reduced motion**: Respects `@media (prefers-reduced-motion: reduce)`.
- **Plain, honest wording**: Avoids claims such as "safe" or "fully accessible"; explicitly labels `"Last checked"`, `"Unknown"`, `"Reported"`, `"Expired"`, and `"Demo data – not real conditions"`.
