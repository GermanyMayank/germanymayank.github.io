# Solar-farm portfolio tour

The existing portfolio content is preserved in `index.html`. The page is a static GitHub Pages site with no package installation or runtime framework.

## Editing

- Profile, experience, achievements, skills, tools and projects: edit the semantic sections in `index.html`. Duplicate an existing project card or timeline item to add work.
- Appearance, spacing and responsive layouts: `tour.css`.
- Chapter names and the video source: `tour-config.js`. New chapter IDs must match actual section IDs.
- Background motion and video synchronization: `tour.js`.

## Video integration is pending

The uploaded file is **LONGi Case_ Qatar 800MW Solar Power Plant_24_28.mp4** (384,158 bytes). The current execution session could resolve it but could not download its bytes because outbound network access was disabled. No substitute footage is included.

Add the actual clip as `media/solar-tour.mp4`, then set `videoSrc: 'media/solar-tour.mp4'` in `tour-config.js`. Video seeking has been implemented but cannot be verified until that asset is available. Before release, inspect start/middle/end frames, forward and backward scrolling, rapid jumps, and iOS Safari. If the clip has sparse keyframes, re-encode for frequent keyframes or use a bounded frame sequence after testing. The project photograph remains the fallback on failed video loads and with reduced motion.

## Behavior

Scrolling is native: no intercepted mousewheel, touch, arrow, Page Down, or anchor behavior. A single animation loop interpolates background position only while necessary. Video seeks follow scroll progress, allow one in-flight seek, and catch up after a rapid jump. The video is decorative, muted and never autoplayed with sound. Content remains readable with JavaScript disabled.

The Pause motion control and operating-system reduced-motion setting disable landscape movement. Navigation and progress remain usable. The page has a keyboard skip link, visible focus indicators, responsive layouts and no third-party script dependencies.

## Release checks

This branch is a draft until the real clip is integrated and browser-tested. Existing statistics and employment descriptions are carried over from the live portfolio rather than inferred from unrelated conversation memory. The Qatar footage is visual scenery; it must not be presented as one of Mayank's own projects.
