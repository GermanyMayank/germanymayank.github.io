# Mayank Vekariya — Solar walking portfolio

A static GitHub Pages portfolio with a ground-level, scroll-controlled solar farm. Scroll forward to walk between the arrays; scroll back to retrace the path. No video, paid services, build tools, cookies or runtime dependencies.

## Edit content

- `index.html`: profile, experience, achievements, expandable projects, skills and contact links. Add a section with a unique `id` and `data-stop="Chapter name"` to add a tour chapter automatically.
- `solar-tour.css`: colours, responsive layout and typography.
- `solar-scene.js`: farm geometry, perspective projection and near-plane clipping.
- `solar-tour.js`: scroll-to-distance mapping, navigation and motion controls.
- `Resume.pdf` and `images/`: retained from the existing portfolio.

The background is an illustrative scene. Project photographs and their attribution remain in the expandable gallery. The existing professional claims and contact details were retained from the prior website.

## Accessibility and performance

Semantic HTML keeps the portfolio usable with JavaScript disabled. There is a keyboard skip link, chapter navigation, visible focus indicators and a motion pause control. Reduced motion starts with a static scene. The renderer redraws on demand, pauses in hidden tabs, caches world geometry and limits canvas pixel density. Mobile layouts leave the path visible around readable text panels. Native browser scrolling is retained.

Publish from `main` at the repository root using GitHub Pages. No build command is required.
