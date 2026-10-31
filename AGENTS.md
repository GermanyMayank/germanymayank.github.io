# Portfolio working rules

## Product purpose
Help hiring managers understand Mayank's verified experience and contact him. The living solar farm is an immersive introduction. Reading, navigation, resume access and contact links take priority over decoration.

## Required delivery process
- Inspect the current main branch and relevant files before editing. Preserve concurrent work.
- Start substantive work on a feature branch. Describe the intended outcome and scope before implementation.
- Keep animation, behavior, presentation and portfolio content modular.
- Run `node --test test.mjs` and appropriate additional checks. Browser-test changed interactions and responsive layouts. Clearly report verification gaps; never claim a test that was not performed.
- Use a preview for substantial visual changes before production rollout. Record a stable rollback reference before each release. A checkpoint must not be moved to newer work.
- Keep commits focused and use a pull request with the problem, final behavior, validation and material limitations. Merge and deploy authorized changes after checks pass.
- Verify deployment for the exact commit. Check the deployed page and asset versions. Report what changed, the test result and the live URL.
- If a release breaks critical functionality, stop adding features and recover the stable version. Use a new revert/restore commit, never a force push over shared history.

## Animation and accessibility
- Native scrolling stays responsive. No scroll locks, head bob or forced camera shake.
- Workers do their jobs continuously. No automatic greetings, popups, floating plus markers or visible crew menus.
- Reactions happen only after a direct click/tap or deliberate keyboard activation; cool down and resume the task.
- Preserve reduced-motion support, the pause control, visible keyboard focus and semantic portfolio content.
- Keep the canvas fallback usable when WebGL or the pinned CDN fails. Pause hidden-tab rendering and cap pixel density. Use shared geometry for repeated elements.

## Content and creative direction
- The workers are Mayank's friendly advocates: highlight real evidence, guide visitors to relevant work, and add optional humor.
- Never invent qualifications, achievements, endorsements, testimonials or employment details. Resolve conflicting facts before changing factual copy.
- Make humor warm, professional and short. No insults, pressure, automatic audio, obstructive jokes or interruptions to reading.
- Keep worker speech short and anchored to the speaker. Present substantial portfolio text at a stable readable size, with mobile layouts and uncluttered surroundings.
- New tools or accounts are justified by the experience and maintenance cost; do not add infrastructure for novelty.

See `RELEASES.md` for the rollback procedure and `CREATIVE_BRIEF.md` for the next visual direction.
