# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Existing codebase: Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, shadcn/ui on Radix primitives, Zustand for state. Confirmed to stay on this stack — no framework migration (the spec document that prompted this project suggested Vite/React 19; that direction was explicitly rejected in favor of the existing Next.js 14/React 18 stack).

## Users

Primary: recruiters, hiring managers, and technical interviewers evaluating the creator's (Shivam Sourav's) engineering skill. The product's main job-to-be-done is to be an impressive, working portfolio centerpiece.

Secondary: real end-users who click into and use the individual studios as functioning tools — people asking questions over uploaded documents (Chat), engineers/analysts running natural-language queries against a connected database (SQL), people running exploratory data analysis on uploaded files (Analyst), and job seekers scoring/tailoring resumes against job descriptions (Career). The studios must hold up as genuinely usable products, not just decorative demos, because a recruiter will click into them.

## Product Purpose

Keystone (working name, see Brand Commitments) is a production-grade Retrieval-Augmented Generation platform. It exists to demonstrate hybrid-retrieval RAG engineering (BM25 + vector fusion, reranking, confidence scoring, PageIndex tree-search for complex reasoning) applied across four distinct real-world workflows rather than a single chatbot demo. Success = a visitor can tell, within the landing page and within one studio, that this is rigorously engineered and not an LLM wrapper — and can actually complete a real task in at least one studio without friction.

## Positioning

"One retrieval engine, four studios, no guessing." The mechanism a competing portfolio piece could not casually copy: confidence scores and evidence/citations are first-class, always-visible UI across every studio (not a hidden implementation detail), backed by a shared hybrid-retrieval core (BM25 + vector fusion + Cohere rerank, plus a document-tree "Think mode" for deep reasoning) that all four studios sit on top of.

## Operating Context

- **Public/marketing surface**: a landing page (`/`) and an "about the creator" page (`/developer`) — visitor arrives with no account, needs to be persuaded and then either explore the story or sign up/log in.
- **Chat / Knowledge studio**: upload documents, ask questions in Fast or Think mode, inspect sources/confidence/reasoning, manage conversation history.
- **SQL studio (currently "AuraSQL")**: connect a database, ask questions in natural language, review generated SQL before execution, explore results, manage saved connections/contexts, view query history.
- **Analyst studio (currently "Data Analyst"/analysis)**: upload a data file, configure and run an analysis job, watch it run, read the generated report.
- **Career studio (currently "Career Studio", legacy URL "Nexus")**: upload/create a resume, score it against a job description with evidence-grounded feedback, tailor a resume, generate a LaTeX resume export.
- Dark-mode-first visual environment throughout (light mode exists as a toggle but dark is the primary designed mode per existing `data-theme-mode` system).

## Capabilities and Constraints

- The backend REST API (`frontend/lib/api.ts`, ~50 endpoints across auth/chat/documents/AuraSQL/resume/analysis) is complete and considered out of scope for this work — this is a presentation-layer rebuild, not new backend functionality.
- No shared `Select`, `Tooltip`, `Popover`, `Switch`, or `Accordion` primitive currently exists in the design system; 10+ files use raw native `<select>` elements and hover-only tooltips (which fail on touch). These need to be added as part of establishing a consistent component system.
- Known dead/orphaned code exists from at least one earlier abandoned redesign attempt (an unused top nav `Header.tsx`/`Footer.tsx`, an unused `ConfidenceIndicator.tsx`, unused `WorkspaceSurface.tsx`/`CareerWorkspace.tsx`/`DataAnalystWorkspace.tsx`/`StudioPrimitives.tsx`, four unused files under `components/ui/` including an unwired `shader-animation.tsx`, and a fully-redirect-only `showcase/*` route tree). This should be cleaned up rather than designed around.
- Two competing page-chrome systems currently coexist (`CanvasHeader`/`ContextRibbon`/`FocusCanvas`/`Inspector` vs. an older `PageShell` pattern vs. ad hoc markup in AuraSQL pages) — the rebuild should converge on one system.
- Renaming is scoped to user-facing surfaces (nav labels, page titles/metadata, landing/in-app copy, URL slugs where reasonable). Backend service names, database table names, environment variable prefixes, and `CLAUDE.md`/internal engineering documentation are explicitly **not** in scope for this rename unless the user asks separately.
- The existing landing page's Three.js implementation (`CinematicScene`/`NexusAperture`/`FlagshipHero`) is being discarded and rebuilt from scratch visually (explicit user decision), not extended.

## Brand Commitments

- New name: **Keystone**. Tagline: "The reasoning layer that holds everything together." Positioning line: "One retrieval engine. Four studios. No guessing."
- Sub-studio names: Keystone Chat (was Knowledge Studio), Keystone SQL (was AuraSQL), Keystone Analyst (was Data Analyst Studio), Keystone Career (was Career Studio / legacy Nexus).
- User-volunteered visual direction for the brand: structural/engineering visual language (arches, load-bearing/keystone imagery, blueprint motifs) as the throughline connecting the name to the visual identity. Recorded as given; not yet expanded into a full design system (that belongs to the design-system/new-work phase).
- Existing typefaces already in use (Space Grotesk, Newsreader, IBM Plex Mono) and the existing dark-first theme are not yet confirmed as kept or replaced — open decision for the design phase.

## Evidence on Hand

- A real creator profile already exists in code (`CREATOR_PROFILE` used by `/developer` and the landing `CreatorStory` component) — reuse/adapt this real content; do not fabricate testimonials, customer logos, or usage metrics that don't exist.
- No third-party testimonials, press mentions, or case studies exist and none should be invented.

## Product Principles

1. Every answer shows its work — confidence scores, citations, and evidence stay visible as first-class UI in every studio, never hidden behind a "trust me."
2. One engine, four studios — Chat, SQL, Analyst, and Career should visually read as siblings built on the same reasoning core, not four disconnected apps bolted together.
3. Portfolio-grade craft everywhere a recruiter might click — the marketing page is not allowed to be the only polished screen.
4. Storytelling on the way in, efficiency once inside — the landing page can be expressive and cinematic; studio screens prioritize clarity, speed, and consistency over spectacle.
5. Presentation-layer rebuild — no backend/API changes required or expected as part of this work.

## Accessibility & Inclusion

`prefers-reduced-motion` support and WCAG AA contrast (4.5:1 minimum) are carried forward as hard requirements, particularly given planned motion/3D work on the landing page. Touch-only affordances (no hover-dependent-only interactions) are required given confirmed mobile gaps in the current implementation.
