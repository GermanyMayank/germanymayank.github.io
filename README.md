# Mayank Vekariya — Solar walking portfolio

A static GitHub Pages portfolio with a ground-level, scroll-controlled solar farm. Scroll forward to walk between the arrays; scroll back to retrace the path. No video, paid services, build tools, cookies or account requirements.

## Living farm

The enhanced world uses pinned Three.js 0.180.0 from jsDelivr. It includes six original jointed workers, a forklift with a lifting pallet, delivery truck, operating crane, control cabin, site office, windsocks, birds and equipment. The crew works quietly until clicked. There are no floating interaction icons, crew menus or automatic greetings. Click a person or vehicle directly: repeated clicks progress from friendly to puzzled to grumpy, then cool down and resume work. A fifth consecutive click reveals a small extra joke. Keyboard users can Tab to focus-only interaction controls and press Enter. All dialogue is silent text.

`farm-behaviour.js` holds reaction and route rules. `living-farm.js` holds the original models and GPU renderer. `solar-tour.js` owns a single time-based animation loop, including pause/reduced-motion handling, hidden-tab suspension and adaptive pixel density. Repeated panels use instancing. No head bob or camera shake. If the CDN or WebGL is unavailable, the existing canvas walking scene remains usable.

Run `node --test test.mjs` for content, fallback projection, actor behaviour and dialogue placement checks. All models are created in code; no third-party character assets or model-generation service is used.

## Guided site experience

`crew-story.js` holds the nine fictional host profiles, related portfolio actions and speech-card placement rules. Click a worker or vehicle to open a short conversation; the close control and Escape dismiss it. Hover/focus gives more reading time. Speech tracks the speaker and avoids key content where space allows. Six matching site boards introduce the existing content sections and offer clickable 3D destinations without adding floating markers. Desktop and phone layouts retain stable, semantic HTML for reading.

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
