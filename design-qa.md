# Design QA — Living Glass / Perception Field

## Evidence

- Source visual truth: `/Users/ke/.codex/generated_images/01a074b0-103b-7113-9f1c-ba46f4d4784d/exec-d771ef52-5991-415d-85c2-595e9cccf209.png`
- Source pixels: 1672 × 941.
- Implementation URL: `http://127.0.0.1:4173/`
- Implementation screenshot: `/Users/ke/Documents/Codex/2026-09-06/zhi-q/work/yuntongke-design/design-qa-implementation.png`
- Full-view comparison: `/Users/ke/Documents/Codex/2026-09-06/zhi-q/work/yuntongke-design/design-qa-comparison.jpg`
- Focused comparison: `/Users/ke/Documents/Codex/2026-09-06/zhi-q/work/yuntongke-design/design-qa-focus.jpg`
- Implementation pixels: 1672 × 942; CSS viewport 1672 × 942; device scale factor 1. No density normalization was required.
- State: desktop dark theme, top of page, Emotional Weather Bureau selected.
- Additional responsive evidence: 390 × 844 mobile viewport.
- Primary interactions tested: next-project switching, direct project selection, active metadata updates, Ask YK panel open/close, keyboard-accessible controls, and responsive navigation.
- Browser console: no warnings or errors after desktop and mobile interaction tests.

## Full-view comparison evidence

The source and implementation are combined in `design-qa-comparison.jpg` at equal pixel width. Both use the same fixed identity/navigation bar, two-line editorial hero, dark liquid optical field, dominant central artwork specimen, partially visible neighbouring projects, inset metadata rail, minimal project progress, and bottom-right portfolio agent. The implementation intentionally keeps the live shader calmer than the static concept so the portfolio remains readable and performant.

## Focused-region comparison evidence

`design-qa-focus.jpg` compares the artwork stage and metadata at the same crop. The authentic project image remains the dominant object, the metadata is attached to the specimen, the asymmetric rounded glass edge is retained, and the title/category/year hierarchy stays legible. The generated source's impossible organic refraction mask is translated into a live caustic shader, curved glass frame, pointer-responsive highlight, and refractive metadata surface rather than a static raster effect.

## Findings

No actionable P0, P1, or P2 findings remain.

- Fonts and typography: passed. Libre Caslon Display and DM Sans preserve the source's editorial serif/interface sans contrast. Desktop size, line height, wrapping, uppercase tracking, and tabular metadata are aligned; mobile no longer overlaps the supporting statement.
- Spacing and layout rhythm: passed. Header height, hero margins, headline-to-stage overlap, dominant specimen scale, metadata attachment, and project controls follow the source composition. At 390 × 844 the page has no horizontal overflow.
- Colors and visual tokens: passed. Near-black navy, ivory type, cold cyan refraction, restrained coral highlights, translucent borders, and dimmed secondary projects match the selected direction while preserving accessible text contrast.
- Image quality and asset fidelity: passed. All visible project images are Yuntong Ke's original assets. The featured image is sharper and more saturated than the previous iteration, remains fully framed in galleries, and no placeholder or simulated artwork was introduced.
- Copy and content: passed. Existing English portfolio copy, real project titles, role/method/outcome data, contact details, profile, and recognition remain intact.
- Interaction and accessibility: passed. Project controls update the active state and live metadata, the glass field responds to pointer movement, Ask YK opens and closes correctly, focus styles remain visible, and `prefers-reduced-motion` disables nonessential animation.
- Performance direction: passed. The 19 MB background video is no longer requested or stored in either production or source assets. The replacement is a low-resolution, low-power WebGL field with capped device pixel ratio and static reduced-motion behaviour.

## Comparison history

### Iteration 1

- Earlier P2: the first implementation kept the stage too tall at common 720 px desktop heights, cutting off the artwork title and controls.
- Earlier P2: the mobile grid placed the supporting statement in an implicit second column, overlapping the multi-line headline.
- Fixes: reduced the desktop stage and specimen height, preserved the complete artwork title/control line, changed the mobile heading to a single block flow, increased mobile hero height, and tightened header navigation.
- Post-fix evidence: the 1672 × 942 capture shows the complete specimen and controls; the 390 × 844 capture shows a readable headline, statement, artwork, and controls with `scrollWidth === innerWidth`.

### Iteration 2

- Earlier P2: the featured artwork appeared flatter and more muted than the selected concept.
- Fixes: increased authentic artwork saturation/contrast, moved the bottom shade lower, strengthened the live caustic field and glass-edge highlights, and added a persistent refractive sweep to the active specimen.
- Post-fix evidence: `design-qa-implementation.png` and `design-qa-focus.jpg` show a brighter project image, clearer glass separation, and stronger optical depth without obscuring metadata.

## Follow-up polish

- P3: the source mock uses a highly irregular static liquid silhouette. The implementation uses a reproducible live shader and rounded refractive frame, an intentional performance and maintainability trade-off.
- P3: neighbouring project titles are deliberately clipped at the viewport edges to signal horizontal exploration; their full titles remain available through accessible labels and after selection.

## Implementation checklist

- [x] Selected Living Glass direction recreated with authentic portfolio assets
- [x] Background video removed and replaced with live optical shader
- [x] Project switching and metadata rail working
- [x] Ask YK preserved and tested
- [x] Desktop and mobile layouts verified
- [x] Reduced-motion behaviour retained
- [x] Production build completed
- [x] Browser console clean

final result: passed
