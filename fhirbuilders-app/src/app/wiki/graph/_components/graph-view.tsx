"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  forceSimulation,
  forceLink,
  forceManyBody,
  forceCenter,
  forceCollide,
  type Simulation,
  type SimulationNodeDatum,
  type SimulationLinkDatum,
} from "d3-force";
import {
  CATEGORY_META,
  CATEGORY_ORDER,
  WIKI,
  type WikiCategory,
  type WikiNode,
  type WikiEdge,
} from "@/lib/wiki/graph";

type SimNode = SimulationNodeDatum & {
  slug: string;
  title: string;
  category: WikiCategory;
  degree: number;
};

type SimLink = SimulationLinkDatum<SimNode> & {
  kind: WikiEdge["kind"];
  note?: string;
};

// Tailwind class lookup → SVG hex (avoids JS doing class-to-color guesswork
// at runtime and keeps the legend consistent with the index cards).
const CATEGORY_FILL: Record<WikiCategory, string> = {
  "fhir-core": "#3b82f6",        // blue-500
  "fhir-ig": "#a855f7",          // purple-500
  terminology: "#f59e0b",        // amber-500
  "data-quality": "#10b981",     // emerald-500
  regulation: "#f43f5e",         // rose-500
  "ai-healthcare": "#d946ef",    // fuchsia-500
  "cms-initiative": "#14b8a6",   // teal-500
  community: "#64748b",          // slate-500
};

const SOLID_EDGE_KINDS = new Set<WikiEdge["kind"]>(["depends-on", "extends", "produces"]);

export function WikiGraphView() {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [hoveredEdge, setHoveredEdge] = useState<number | null>(null);
  const [tick, setTick] = useState(0);

  // Pre-compute node degree so we can size nodes by centrality. Then build
  // mutable copies the force simulation can mutate in place.
  const { nodes, links } = useMemo(() => {
    const degreeMap = new Map<string, number>();
    for (const e of WIKI.edges) {
      degreeMap.set(e.from, (degreeMap.get(e.from) ?? 0) + 1);
      degreeMap.set(e.to, (degreeMap.get(e.to) ?? 0) + 1);
    }
    // Also count `related` edges (they're informal but real connections)
    for (const n of WIKI.nodes) {
      for (const r of n.related ?? []) {
        degreeMap.set(n.slug, (degreeMap.get(n.slug) ?? 0) + 0.5);
        degreeMap.set(r, (degreeMap.get(r) ?? 0) + 0.5);
      }
    }
    const nodes: SimNode[] = WIKI.nodes.map((n: WikiNode) => ({
      slug: n.slug,
      title: n.title,
      category: n.category,
      degree: degreeMap.get(n.slug) ?? 0,
    }));
    const slugIndex = new Map(nodes.map((n, i) => [n.slug, i]));
    const links: SimLink[] = WIKI.edges
      .filter((e) => slugIndex.has(e.from) && slugIndex.has(e.to))
      .map((e) => ({
        source: slugIndex.get(e.from)!,
        target: slugIndex.get(e.to)!,
        kind: e.kind,
        note: e.note,
      }));
    return { nodes, links };
  }, []);

  // Run the force simulation in an effect — settles deterministically, no
  // ongoing animation needed for a graph this size.
  useEffect(() => {
    const width = 1100;
    const height = 700;
    const sim: Simulation<SimNode, SimLink> = forceSimulation(nodes)
      .force(
        "link",
        forceLink<SimNode, SimLink>(links)
          .id((d) => d.slug)
          .distance(110)
          .strength(0.4),
      )
      .force("charge", forceManyBody().strength(-360))
      .force("center", forceCenter(width / 2, height / 2))
      .force("collide", forceCollide<SimNode>().radius((d) => 14 + d.degree * 0.6));

    // Tick fewer times than default — we just need a settled-ish layout.
    sim.alpha(1).alphaDecay(0.04);
    let frame = 0;
    sim.on("tick", () => {
      frame++;
      // Update React state every ~6 frames so we re-render without thrashing
      if (frame % 6 === 0) setTick((t) => t + 1);
    });
    sim.on("end", () => setTick((t) => t + 1));

    return () => {
      sim.stop();
    };
  }, [nodes, links]);

  // Edge endpoints — d3-force mutates source/target into node objects in place
  function edgeXY(link: SimLink) {
    const s = link.source as SimNode;
    const t = link.target as SimNode;
    return {
      x1: s.x ?? 0,
      y1: s.y ?? 0,
      x2: t.x ?? 0,
      y2: t.y ?? 0,
    };
  }

  return (
    <div className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm">
      {/* Legend strip */}
      <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 bg-slate-50 px-4 py-2 text-[11px]">
        {CATEGORY_ORDER.map((cat) => {
          const meta = CATEGORY_META[cat];
          return (
            <div key={cat} className="flex items-center gap-1.5">
              <span
                className="inline-block h-2.5 w-2.5 rounded-full"
                style={{ background: CATEGORY_FILL[cat] }}
              />
              <span className="text-slate-700">{meta.label}</span>
            </div>
          );
        })}
        <div className="ml-auto flex items-center gap-3 text-slate-500">
          <span className="inline-flex items-center gap-1">
            <span className="inline-block h-px w-4 bg-slate-400" /> depends-on / extends / produces
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="inline-block h-px w-4 border-t border-dashed border-slate-400" />
            see-also / alternative / discusses
          </span>
        </div>
      </div>

      {/* SVG canvas */}
      <svg
        ref={svgRef}
        viewBox="0 0 1100 700"
        className="block h-[700px] w-full bg-[radial-gradient(ellipse_at_center,white,white_70%,#f8fafc)]"
      >
        {/* Edges first so nodes paint on top */}
        <g>
          {links.map((link, i) => {
            const { x1, y1, x2, y2 } = edgeXY(link);
            const solid = SOLID_EDGE_KINDS.has(link.kind);
            const hovered = hoveredEdge === i;
            const dimmed =
              hoveredNode !== null &&
              (link.source as SimNode).slug !== hoveredNode &&
              (link.target as SimNode).slug !== hoveredNode;
            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={hovered ? "#e11d48" : "#94a3b8"}
                strokeOpacity={dimmed ? 0.08 : hovered ? 0.95 : 0.45}
                strokeWidth={hovered ? 2 : 1}
                strokeDasharray={solid ? undefined : "4 3"}
                onMouseEnter={() => setHoveredEdge(i)}
                onMouseLeave={() => setHoveredEdge(null)}
              />
            );
          })}
        </g>

        {/* Edge hover tooltip */}
        {hoveredEdge !== null && (
          <g pointerEvents="none">
            {(() => {
              const link = links[hoveredEdge];
              const { x1, y1, x2, y2 } = edgeXY(link);
              const mx = (x1 + x2) / 2;
              const my = (y1 + y2) / 2;
              const label = link.note ? `${link.kind} · ${link.note}` : link.kind;
              return (
                <g>
                  <rect
                    x={mx - 5 - label.length * 3}
                    y={my - 12}
                    width={label.length * 6 + 12}
                    height={20}
                    rx={4}
                    fill="rgba(15, 23, 42, 0.92)"
                  />
                  <text
                    x={mx}
                    y={my + 2}
                    textAnchor="middle"
                    fontSize={10}
                    fontFamily="ui-monospace, monospace"
                    fill="#fff"
                  >
                    {label}
                  </text>
                </g>
              );
            })()}
          </g>
        )}

        {/* Nodes */}
        <g>
          {nodes.map((n) => {
            const r = 7 + Math.sqrt(n.degree) * 2.3;
            const isHovered = hoveredNode === n.slug;
            const dimmed = hoveredNode !== null && !isHovered &&
              !links.some(
                (l) =>
                  ((l.source as SimNode).slug === hoveredNode &&
                    (l.target as SimNode).slug === n.slug) ||
                  ((l.target as SimNode).slug === hoveredNode &&
                    (l.source as SimNode).slug === n.slug),
              );
            return (
              <g
                key={n.slug}
                transform={`translate(${n.x ?? 0}, ${n.y ?? 0})`}
                onMouseEnter={() => setHoveredNode(n.slug)}
                onMouseLeave={() => setHoveredNode(null)}
                style={{ cursor: "pointer" }}
              >
                <Link href={`/wiki/${n.slug}`} legacyBehavior>
                  <a>
                    <circle
                      r={r}
                      fill={CATEGORY_FILL[n.category]}
                      fillOpacity={dimmed ? 0.2 : 0.9}
                      stroke={isHovered ? "#0f172a" : "#fff"}
                      strokeWidth={isHovered ? 2 : 1.5}
                    />
                  </a>
                </Link>
              </g>
            );
          })}
        </g>

        {/* Hovered node label */}
        {hoveredNode !== null && (() => {
          const node = nodes.find((n) => n.slug === hoveredNode);
          if (!node) return null;
          const x = node.x ?? 0;
          const y = node.y ?? 0;
          const w = node.title.length * 6.5 + 16;
          return (
            <g pointerEvents="none">
              <rect
                x={x - w / 2}
                y={y - 32}
                width={w}
                height={20}
                rx={4}
                fill="rgba(15, 23, 42, 0.95)"
              />
              <text
                x={x}
                y={y - 18}
                textAnchor="middle"
                fontSize={11}
                fontWeight={500}
                fill="#fff"
              >
                {node.title}
              </text>
            </g>
          );
        })()}
      </svg>

      {/* Tick is the simulation rendering trigger; show ticks in dev for visibility */}
      <div className="hidden">tick: {tick}</div>
    </div>
  );
}
