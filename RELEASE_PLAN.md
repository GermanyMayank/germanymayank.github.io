# Release 6: a guided working site

## Outcome
Make the farm communicate the portfolio through readable site boards and optional conversations with fictional crew members. Retain native scrolling and the quiet working scene.

## Scope
- Reframe the existing six content sections as commissioning log, site method, planning board, control room, equipment cabinet and site office. Preserve factual biography and project copy.
- Add matching clickable 3D boards along the path. Their destinations also remain available through semantic navigation links and the normal page.
- Add a separate crew-story module with nine short role-specific introductions and relevant portfolio/resume actions. No new achievement metrics or third-party endorsements.
- Anchor dialogue to the projected speaker, avoid important text, clamp to desktop/mobile viewports, and keep it readable while hovered/focused. Add dismiss and Escape support.
- Preserve click-only reactions, cooldowns, reduced motion, keyboard controls, pause, WebGL/CDN fallback and existing project/contact/resume routes.

## Acceptance and release evidence
- Five automated smoke tests must pass, including dialogue destinations and responsive placement.
- Inspect desktop and phone preview; test direct worker click, related action, close/Escape, idle silence, board presentation and project expansion.
- Check browser errors and a successful deployment for the exact release commit.
- Roll back to `release/solar-farm-v5` if the primary portfolio, interaction or rendering paths break. Use a restore/revert commit; preserve history.

## Later ideas (not part of this release)
- More individual work routines and character-specific discoveries.
- An optional quick recruiter route through three selected highlights.
- A verified, concise project case-study format: challenge, contribution, evidence, result.
- Measured animation performance on additional physical devices before adding visual complexity.

Avoid autoplay narration, new accounts, external AI runtime services, popups or floating interaction icons.
