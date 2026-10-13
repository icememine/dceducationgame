# Clickable prototype

`rong-dc-academy.html` is a single-file phone prototype of the investor journey: onboarding and risk
self-check, the 3-stage learning path with every lesson built in the app playable, the goal planner and compounding tools, AI
role-play practice with a coach, Hỏi Rồng, quests, league and profile.

**Build:** `npm run proto:build` assembles it from `prototype/src` (markup, styles and app code) plus the live
content: the Q&A library, glossary, fund facts, the fixed AI rules (`src/features/ai/guardrails.ts`) and
Rồng's voice guide (`content/ai/rong-voice.md`). Edit the voice guide, rebuild, and the prototype's Hỏi Rồng,
role-play characters and coach all pick up the new tone.

Open it in a browser. AI features call Claude only when the page runs inside the claude.ai artifact viewer
(`sample` capability); opened locally they fall back to scripted replies and a keyword search over the library.
Simulated NAV series in the lessons are illustrative, not real fund data. Lessons: five hand-built showcase lessons live in `prototype/src/app1.js` (risk check, lãi kép,
Nhà tiên tri, ba phản ứng, hồ sơ hỗ trợ); every other lesson is converted from `content/segments` at build time
(`scripts/build-prototype.ts`), so the prototype plays the same questions as the app. Rebuild after content changes.
