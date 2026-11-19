# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Primary:** recruiters and hiring managers screening candidates for **co-op and internship** security roles. They skim in under a minute, usually on a laptop, sometimes on a phone from a LinkedIn or résumé link. Their job: decide whether Imanuel is worth an interview, and find proof fast (projects, research, experience, contact).
- **Secondary:** security peers and engineers who read writeups end to end and judge technical credibility from specifics (tools, payloads, reasoning).

## Product Purpose

Personal portfolio of Imanuel Chatur, Honours BISc (Cyber Security) student at Sheridan College. It exists to turn a recruiter's quick look into a co-op/internship conversation, and to host long-form technical writeups that prove the work is real. Success: a visitor reaches Contact (email, GitHub, LinkedIn) with a clear idea of what Imanuel does.

## Positioning

**AI security first, application security second.** Imanuel researches how LLMs and AI coding agents behave (LLM evaluation, prompt framing, prompt injection against coding agents) as an AI researcher at Sheridan, and builds security-first web apps. The specific mechanism no generic "cyber student" portfolio can copy: a prompt-injection testbed that scores whether AI coding agents introduce or catch OWASP-style vulnerabilities, plus real research on model behavioural consistency.

## Operating Context

- Visitors arrive from résumés, LinkedIn, GitHub, and job applications.
- Pages: Home (hero, "currently" strip, featured projects, recent writeups, CTA), About (bio, experience, education, skill groups, certifications), Projects (list + detail), Writeups (list + detail, long-form Markdown with code blocks), Contact.
- Content is authored as Markdown with front matter in `public/content/{projects,writeups}/`, indexed at build time by `scripts/build-content-index.mjs`. `draft: true` hides an item.

## Capabilities and Constraints

- Angular 22 (standalone components, signals, `httpResource`), Angular Material as the component and theming foundation, SCSS.
- Deployed as a static site on **GitHub Pages** as a project site: `https://imanuelchatur.github.io/Portfolio2026/`. Base href `/Portfolio2026/`; client-side routes need a `404.html` SPA fallback. All asset and content URLs must be base-relative.
- Must keep: light/dark support (system default, user toggle persisted), route view transitions (`withViewTransitions`), and `prefers-reduced-motion` handling.
- Must be fast on a static host (no server, no runtime CMS).
- Undecided / absent: certifications (none yet; section stays hidden until real entries exist), a longer bio (leave as is for now), writeup bodies (ISSessions CTF 2026 is a draft).

## Brand Commitments

- Name: **Imanuel Chatur** (header short form "Imanuel").
- Voice: plain, specific, first person, credible. No em-dashes in site copy.
- Look: must read as cyber security (user, 2026-11-18: the paper look "looks like some marketing shenanigans"). Security-tool console feel, tasteful, not hacker cosplay.
- Explicitly rejected: neon green on black, matrix rain, blinking cursors, `>` prompt logos, `#` section-title prefixes, glowing hover cards, pill-tag soup, generic SaaS hero, Inter, stock Google Material look.

## Evidence on Hand

- Projects (`public/content/projects/`): AI Coding Agent Security Testbed (Flask, Docker, OWASP), Bonker Banker (Flask, Gemini, AWS EC2, 1M+ transactions), DICOM Medical Image Integrity System (Python, NumPy, cryptography).
- Writeups (`public/content/writeups/`): ISSessions CTF 2026 (draft).
- Experience and education (`src/app/data/about.ts`): AI Researcher at Sheridan (Sep 2026 to present), ISSessions CTF participant (Feb 2026), Honours BISc Cyber Security, 3.56 GPA, expected Apr 2028.
- Contact: email, GitHub (github.com/ImanuelChatur), LinkedIn (linkedin.com/in/imanuel-chatur). No PGP key.
- Absent, never fabricate: certifications, testimonials, stats, employer logos, photos.

## Product Principles

1. **Proof over adjectives.** Every claim points at a project, a writeup, or a role. Specific tools and outcomes beat buzzwords.
2. **Recruiter in 30 seconds, peer in 30 minutes.** The first viewport says who, what focus, and what they want; the writeups reward deep reading.
3. **Reading is the product.** Long-form technical text and code blocks must be comfortable at any width and in both themes.
4. **Credible, not costumed.** Security is shown through rigor and precision, not terminal aesthetics.
5. **Static and fast.** Nothing that needs a server; nothing that makes a phone on a weak connection wait.

## Accessibility & Inclusion

WCAG 2.2 AA. Full keyboard operation (including the mobile nav), visible strong focus indicators, AA contrast in both themes, reduced motion respected for view transitions and component animations. Lighthouse Accessibility ≥ 95.
