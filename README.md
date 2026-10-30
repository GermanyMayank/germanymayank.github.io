# Mayank Vekariya — solar scroll portfolio

A static, dependency-free portfolio for the existing GitHub Pages URL. The HTML contains all portfolio content; JavaScript adds the scroll-controlled scene, chapter tracking, reading mode, mobile navigation and project dialogs.

## Run and edit

Requires Node.js 20 or later. No dependency installation is needed.

```sh
npm run build
npm test
npm start
```

Open the local URL printed by the server. Existing `images/` and `Resume.pdf` remain in the repository and are reused. When checking out this branch, those assets are inherited from main.

### Add information

Edit `content/portfolio.json` and run `npm run build`. Commit both the JSON and the generated `index.html`.

- `profile`: introduction, location, contact links and résumé path.
- `experience`: add a role, company, date and description.
- `projects`: add an entry with a unique lowercase `id`, title, description, relative image path, alt text and tags. The card and project dialog are generated automatically. Optional `source` and `credit` preserve attribution.
- `skills`, `tools`, `achievements`: add or reorder entries in each array.
- `tour`: media files, time range and section progress values. Values run from 0 to 1. Section positions are measured after layout and on resize, so adding content does not require hardcoded scroll distances.
- `assets/styles.css`: shared colour, spacing and typography tokens are at the top.

The build rejects invalid IDs, unsupported paths, unsafe link protocols and invalid tour ranges. Content is escaped when inserted into HTML.

## Integrate the supplied clip

Intended footage: the user-selected 00:24–00:28 segment of `https://youtu.be/R80wPNHAr4A` (LONGi Qatar solar plant). It is visual context, not a claim that this plant is a portfolio project. Attribution remains visible in the footer.

The Library download failed in the development workspace. **The actual video has not yet been integrated or visually verified.** The current build remains usable with the existing solar project photograph. Add the source clip locally and run:

```sh
npm run media -- --input /absolute/path/to/clip.mp4
npm run build
```

For the full-length source, append `--start 24 --end 28`. Do not trim an already-trimmed four-second clip again. Optional `--interpolate` creates 60 fps optical-flow frames; inspect panel edges for artefacts before using it.

The preparation script requires FFmpeg and FFprobe. It detects common locations or uses `FFMPEG_PATH` and `FFPROBE_PATH`. It produces muted H.264 with every frame as a keyframe and fast-start metadata, creates a poster, and updates the content configuration. Source files are not published. Commit `media/solar-tour.mp4` and `media/solar-poster.jpg` after processing.

The browser coalesces seeks, waits for the decoder, and follows the newest scroll position. It never prevents wheel or touch scrolling. A missing clip retains the photograph and all content. The last seek stays inside the clip duration.

## Accessibility and resilience

- Semantic headings, real anchor links, visible keyboard focus, skip link and native modal dialog.
- Reduced-motion preference starts with a still background and native scrolling. Reading mode is also available at any time; its preference is stored locally when browser storage is available.
- Projects and experience are readable without JavaScript. Optional controls are revealed only when supported.
- Image dimensions reserve space; project photographs load lazily. No external fonts, animation libraries, analytics, accounts or backend are required.
- All application URLs are relative, including media, scripts and résumé, for the `/mayank-portfolio/` GitHub Pages path.

## Review before release

Automated checks cover content rendering, escaping, validation, geometry-based timeline mapping, smoothing convergence, media boundaries, seek coalescing and decoder failure. They do not substitute for browser checks.

Browser automation was not available in the development session. Before merging: check Chrome/Edge, Firefox and Safari where available; desktop wheel/trackpad; mobile touch; keyboard and Escape; reading mode; restored scroll position; project dialogs; direct anchors; résumé/contact links; slow or failed media; and the actual footage through fast forward/reverse scrolls. Check readability and performance on a modest mobile device.

Existing career and project statements were imported from the current portfolio, not independently verified. Review dates, numerical achievements and the electric-bike target/specification wording before publication. No new professional achievements were invented.

## Publish and roll back

This branch uses the existing static GitHub Pages setup. After review, merge the pull request; GitHub Pages serves the checked-in `index.html` and assets. No hosting migration is required. Roll back by reverting the merge commit. Keep review work on the feature branch until media and browser checks are complete.
