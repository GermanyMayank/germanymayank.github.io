# Release and recovery process

## Stable checkpoint

| Release | Commit | Recovery reference | State |
| --- | --- | --- | --- |
| Solar farm v5 | d9dc99f1fb15537c5ab679ceaa9e3e6377141d40 | release/solar-farm-v5 | Deployed; direct click responses verified; floating markers and automatic greetings removed |
| Crew story v6 | aa02e8b2b9e79c3693e9a677f8d7319511e309c6 | release/crew-story-v6 | Deployed; five CI tests passed; preview inspected on desktop and phone; live crew speech verified |

Keep this checkpoint unchanged. Create a new named checkpoint for each later verified stable release.

Release 6 evidence: feature PR #5; isolated preview PR #4; successful Pages deployment for aa02e8b2b9e79c3693e9a677f8d7319511e309c6. Checked direct worker interaction, portfolio action, close/Escape, responsive dialogue and captured browser errors. Speech geometry and phone tap tolerance were refined after preview review. These checks are not a claim of exhaustive device coverage or guaranteed uptime.

## Definition of ready to release

1. The feature scope and acceptance criteria are written down.
2. Work is isolated on a feature branch and reviewed as a focused diff.
3. `node --test test.mjs` passes. Check changed behavior beyond these smoke tests.
4. For visual releases, inspect desktop and phone layouts, keyboard activation, scrolling, motion pause/resume and reduced motion. Check browser errors and direct model interactions when relevant.
5. Ensure resume, contact, navigation, project gallery and fallback still work. A CPU geometry test does not prove GPU rendering quality or frame rate.
6. Confirm the release can be reverted, update asset versions and merge the authorized change.
7. Confirm GitHub Pages deployment for the exact commit, then inspect the live page. Record the new stable release only after verification.

## Recovery

For one bad release commit, create a new commit reverting that commit, run the checks and deploy. If several commits contributed, restore only the affected files from the known stable checkpoint in a new commit. Preserve unrelated later work. Do not delete history or force push main.

When recovery uses the GitHub connector: inspect current main; fetch the stable tree; construct a new tree restoring the affected files while retaining unrelated files; create a commit parented to current main; update main with its expected head SHA; verify the resulting Pages deployment. Stop and re-read if the head changed.

For a local Git checkout, the equivalent single-commit procedure is:

```sh
git switch main
git pull --ff-only
git switch -c fix/restore-stable-release
git revert <bad-release-commit>
node --test test.mjs
# Open a PR, merge after checks, then verify Pages deployment.
```

If the site is unusable, recovery takes priority over feature work. Never promise zero failures: aim to catch failures early, limit their impact and make recovery predictable. This document is a procedure, not an automatic recovery service or uptime guarantee.


## CV alignment — 1 November 2026

Recovery baseline: `5db26c9b614d603de44ecd20b558238ce0be402a`, preserved as `checkpoint/before-cv-alignment-2026-11-01`. Do not move this checkpoint.

Source: Mayank_Vekariya_CV_Solar.docx uploaded 1 November 2026. Align the two experience entries, metrics, skills, education, languages, contact details and crew dialogue. Replace the old PDF route with a printable online résumé and remove the obsolete PDF. The user explicitly approved publication of the CV contact details.

Validation before release: all five tests passed locally. Browser preview was unavailable in the local environment; desktop/phone visual inspection remains a verification limit. Confirm CI and Pages deployment for the exact merge commit before reporting the release live.


## Forward journey — November 2026

Recovery: `checkpoint/before-depth-journey-2026-11-01` preserves `0b0f747996ef35472ca107846945f5ef1b29463c`. Keep it unchanged. Restore through a reviewed revert commit; do not force-push history.

Replace banner panels with transparent editorial text. Native scroll drives forward farm travel and a reading plane with arrival, a stationary readable interval and departure. Nine concise chapters retain the current CV facts; the full résumé remains available. Remove portfolio signboards; keep the existing working crew, vehicles and direct interactions. Reading view presents the full semantic document. Reduced motion starts with motion paused and reading view active; unsuitable viewport/text sizes use the ordinary document.

Validation: seven local tests pass. The isolated preview was checked on desktop and phone for text fit, transparent surfaces, native scroll, jump links, keyboard navigation, crew activation/Escape and the reduced-motion default. Browser testing caught reading-view chapter drift and viewport chapter drift; both were corrected before homepage release. CI and exact-commit Pages deployment must pass. This is not exhaustive device or performance coverage.
