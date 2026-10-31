# Living portfolio: the crew as Mayank's advocates

## Intent
An enjoyable guided site visit that helps a hiring manager remember Mayank's strengths. The crew works quietly and shares a short, useful recommendation only when the visitor interacts.

## Characters
- The site engineer points visitors toward a verified example of coordination or planning.
- The technician explains how a relevant skill helped solve a real engineering problem.
- The supervisor introduces a project case study and its evidence.
- The delivery crew adds a short logistics joke, then returns to work.
- The office guide offers the resume or contact details when asked.

The characters are fictional hosts. Their statements must not be presented as genuine coworker testimonials or third-party endorsements. Personalize dialogue around verified facts and avoid generic self-praise.

## Interaction pattern
Work loop -> visitor clicks -> character turns/responds -> optional related portfolio action -> response closes -> work resumes. Repeated clicks add a short playful reaction. Never auto-open dialogue or block scrolling.

## Planned immersive content
Entrance sign for the introduction; a planning board for experience; commissioning milestone board for achievements; equipment cabinet for skills; control-cabin display for projects; site office for contact and resume. Nearby props introduce each section, while the opened content remains stable, readable and accessible.

## Next visual release acceptance criteria
- Speech follows the visible speaker, stays within the viewport and does not cover essential content.
- Each substantial portfolio panel is associated with a clear location and has concise preview content plus optional detail.
- All factual statements are verified against an agreed source; existing conflicting biography details are not silently rewritten.
- Phone users can read comfortably and interact without precision tapping.
- No floating plus markers, automatic greetings, visible crew menus, automatic audio or forced navigation.
- Existing motion controls, fallback, resume and contact routes remain functional.

The release 6 implementation uses `crew-story.js`, matching site boards and readable semantic panels. See `RELEASE_PLAN.md` for the scope, acceptance criteria and later ideas; deployment verification determines when a version becomes a stable release.
