import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Network } from "lucide-react";
import { WIKI } from "@/lib/wiki/graph";
import { WikiGraphView } from "./_components/graph-view";

export const metadata: Metadata = {
  title: "Wiki Graph",
  description:
    "Interactive force-directed view of the Healthcare AI Builders Wiki — categories cluster, edges show dependencies, click any node to open the topic.",
};

export default function WikiGraphPage() {
  return (
    <div className="container mx-auto max-w-7xl px-4 py-10 lg:px-8 lg:py-14">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <Button variant="ghost" size="sm" asChild className="-ml-3 mb-2 text-slate-600">
            <Link href="/wiki">
              <ArrowLeft className="mr-2 h-3.5 w-3.5" /> Back to index
            </Link>
          </Button>
          <div className="mb-2 flex items-center gap-2">
            <Badge variant="outline" className="border-slate-400 bg-slate-50">
              <Network className="mr-1 h-3 w-3" /> Graph view
            </Badge>
            <Badge variant="outline" className="border-emerald-300 bg-emerald-50 text-emerald-800">
              {WIKI.nodes.length} nodes
            </Badge>
            <Badge variant="outline" className="border-violet-300 bg-violet-50 text-violet-800">
              {WIKI.edges.length} edges
            </Badge>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            How it all connects
          </h1>
          <p className="mt-2 max-w-2xl text-slate-600">
            Force-directed layout — clusters of related topics drift together, edges show typed
            dependencies. Drag to rearrange, click any node to open the topic.
          </p>
        </div>
      </div>

      <WikiGraphView />

      <div className="mt-6 rounded-md border border-slate-200 bg-slate-50/50 px-4 py-3 text-xs text-slate-600">
        <strong>How to read this:</strong> color = category, dot size = number of incoming +
        outgoing edges (a proxy for &ldquo;how central is this topic to the domain?&rdquo;), line
        style = edge kind (solid = depends-on / extends / produces, dashed = see-also / alternative
        / discusses). Drag a node to see its neighborhood. Hover a line to see the relationship
        type.
      </div>
    </div>
  );
}
