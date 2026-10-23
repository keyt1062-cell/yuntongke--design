# Yuntong Ke Portfolio — Performance & Experience Audit

Audit date: 24 October 2026  
Scope: responsive layout, first-load performance, animation cost, artwork delivery, keyboard/accessibility semantics, SEO metadata, portfolio agent, lightbox interaction, and browser runtime errors.

## Outcome

The production build is healthy on the tested mobile and desktop profiles. Original high-resolution artwork remains in the repository; responsive WebP display files and thumbnails are used for normal browsing.

| Profile | Performance | Accessibility | Best practices | SEO | Initial transfer | FCP | LCP | CLS |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Mobile, before | 66 | 87 | 100 | 100 | 4,724 KiB | 3.8 s | 7.3 s | 0 |
| Mobile, verified | 92 | 100 | 100 | 100 | 615 KiB | 1.2 s | 3.4 s | 0 |
| Desktop, before | 82 | 92 | 100 | 100 | 4,724 KiB | 1.6 s | 2.2 s | 0 |
| Desktop, verified | 100 | 100 | 100 | 100 | 840 KiB | 0.3 s | 0.6 s | 0 |

Metrics were recorded with Lighthouse against the optimised production build. Real results vary with device, browser, network and cache state.

## Audited steps

1. **Desktop first impression — Healthy.** Hero composition, optical background, project carousel, navigation and Ask YK entry render without horizontal overflow at 1440 × 900.
2. **Mobile first impression — Healthy.** The 390 × 844 layout stays within the viewport; the hero, featured artwork, controls and compact agent entry remain usable.
3. **Artwork loading — Healthy.** Responsive display images and 420 px thumbnails replace full-resolution files during ordinary browsing; full-resolution assets remain available for high-detail viewing.
4. **Motion runtime — Healthy.** WebGL atmosphere and particles use reduced resolution/frame rates on mobile and pause automatically when the hero is off-screen or the page is hidden.
5. **Gallery and lightbox — Healthy.** Artwork navigation, thumbnail selection, fullscreen dialog, arrow navigation and close behaviour were exercised successfully.
6. **Portfolio agent — Healthy.** The public agent panel opens on mobile, stays inside the viewport, exposes its input correctly and retains its local-answer fallback.
7. **Responsive integrity — Healthy.** Tested pages report no horizontal document overflow on mobile or desktop.
8. **Accessibility semantics — Healthy for automated checks.** Button names, gallery grouping, visible-label matching and light-background contrast issues were corrected; Lighthouse accessibility score is 100. This is not a claim of full WCAG conformance.
9. **SEO and discovery — Healthy.** Canonical metadata, structured person data, robots.txt, sitemap.xml and llms.txt are present; Lighthouse SEO score is 100.
10. **Runtime stability — Healthy.** No browser warnings or errors were present during the final interaction pass.

## Implemented improvements

- Added responsive `srcset` delivery, display-sized WebP files and lightweight thumbnails while retaining original artwork.
- Replaced the full artwork favicon request with a dedicated 64 px favicon.
- Self-hosted and preloaded the two portfolio fonts to remove an external render-blocking request and font-driven layout shift.
- Reduced canvas resolution, particle count and animation frequency by device size; paused both canvases outside the hero.
- Corrected accessible names, gallery semantics and profile text contrast.
- Added robots, sitemap and LLM-readable portfolio summary files.

## Evidence

- `01-desktop-home.jpg` — desktop baseline
- `02-mobile-home-before.jpg` — mobile baseline
- `03-mobile-home-after.jpg` — mobile verification
- `04-desktop-home-after.jpg` — desktop verification

