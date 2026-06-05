# Wiki module — template + fork guide

A reusable, LLM-curated wiki graph for any domain. Healthcare AI Builders is the seed instance — fork the module, swap the data, and you have a categorized + cross-referenced knowledge graph for your own domain.

Inspired by [Karpathy's LLM-wiki concept](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f) — a co-built `index.md` + `log.md` knowledge surface that grows over time. This module is the concrete Next.js + TypeScript implementation.

## What's in the module

| File / directory | What it does |
|---|---|
| `src/lib/wiki/graph.ts` | Schema (WikiNode, WikiEdge, WikiLogEntry) + the seed data. The contract. |
| `src/lib/wiki/signal.ts` | Read helpers for the WikiSignal table (live community signal). |
| `src/content/wiki/topics/<slug>.mdx` | Long-form topic bodies. Opt-in per node via `useMdx: true`. |
| `src/app/wiki/page.tsx` | Index — categorized cards + Live Signal + nav to graph view + log. |
| `src/app/wiki/[slug]/page.tsx` | Topic detail — header, MDX body, external links, related topics. |
| `src/app/wiki/graph/page.tsx` | Force-directed graph view (d3-force + SVG). |
| `src/app/wiki/log/page.tsx` | Chronological change log. |
| `src/app/api/cron/wiki-slack-digest/route.ts` | Daily Slack → WikiSignal ingestion (Vercel Cron). |
| `src/app/api/admin/wiki-signal/route.ts` | Manual signal entry for sources without bot access. |
| `vercel.json` (`crons[]`) | Cron schedule (daily 14:00 UTC). |

## Forking for a new domain

1. **Copy the module.** Drop `src/lib/wiki/`, `src/app/wiki/`, `src/content/wiki/`, and the two API routes into your Next.js 16 / React 19 / Tailwind 4 / shadcn project. Make sure `d3-force`, `@types/d3-force`, and `next-mdx-remote` are in your `package.json`.

2. **Edit `graph.ts`.** Update `WikiCategory` to your taxonomy, populate `NODES` and `EDGES`. Keep the schema the same — that's the contract every renderer in the module depends on. The `lastReviewed` field is your honesty tracker; the `status` field tells readers whether a topic is `seed` (stub), `draft` (written but unreviewed), or `stable` (reviewed + linked).

3. **Add a first log entry.** Lead with a v0.1 entry summarizing the seed and listing every slug in `changes[]`. Future you (or a forking team) will thank you.

4. **Migrate any topic over ~300 words to MDX.** Set `useMdx: true` on the node and create `src/content/wiki/topics/<slug>.mdx`. The MDX components in `src/app/wiki/[slug]/page.tsx` style the standard tags (h2/h3/p/ul/table/code/pre/blockquote/a) consistently with the rest of the site.

5. **Wire your own community sources.** In `src/app/api/cron/wiki-slack-digest/route.ts`, replace the `TARGETS` array with your Slack channels and the topic slugs to auto-tag. For workspaces you don't have a bot in (other people's communities), use the manual entry endpoint at `/api/admin/wiki-signal`.

6. **Schedule the cron.** `vercel.json` carries the cron config. Vercel Cron requires (for Hobby plan) ≤2 daily crons; bump the schedule if you need more frequent ingestion on Pro+.

## Schema invariants the renderers depend on

- Every `WikiNode.slug` is URL-safe + globally unique.
- Every `WikiEdge.from` and `WikiEdge.to` references an existing node slug.
- Every node has a `category` in `WikiCategory` (extend that union + `CATEGORY_META` + `CATEGORY_ORDER` together when adding categories).
- `status` strictly takes one of `seed | draft | stable` (extend `STATUS_META` if you add more).
- Either `body` (inline) or `useMdx: true` (file) — never both. Inline `body` falls back through a tiny markdown shim; MDX uses the full component set.

If you keep those, every page in the module renders cleanly without touching the render code.

## The growth pattern

The Karpathy operating model — co-build with the LLM, log the why, ratchet status up — works as a discipline:

1. **Edit nodes/edges incrementally.** Don't try to land a complete wiki on day one. Drop seeds that fill out over time.
2. **Status-ratchet on review.** `seed → draft` when you write the body. `draft → stable` when you've used the topic to teach someone or cross-referenced it from three other nodes without finding a gap.
3. **Append to the log every commit.** The log is institutional memory. When v0.2 lands six months later, the log is how you know what was already covered and what changed.
4. **Stale review = re-review.** The `lastReviewed` field on stable nodes is your honesty signal. Anything older than ~6 months on a fast-moving topic should drop to `draft` until re-verified.

## Why this isn't a generic CMS

A CMS makes you fill in fields. A wiki graph makes you encode _structure_ — what depends on what, what supersedes what, what's discussed where. That structure is the value. The bodies are secondary; you can write them later. But the graph being right matters from day one because it's what tells the reader the lay of the land.

You're optimizing for a reader who lands on one topic and wants to know "what's adjacent and what's underneath." A flat CMS can't tell them. A graph can.

## License

This module is part of [FHIRBuilders](https://fhirbuilders.com) (MIT). Copy, fork, sell — go build.
