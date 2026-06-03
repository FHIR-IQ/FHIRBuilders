import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { NotebookPen } from "lucide-react";

const PROMPTS = [
  {
    n: "01",
    title: "What did you actually ship this week?",
    hint: "Link to commits, deployed URL, or video.",
  },
  {
    n: "02",
    title: "What got stuck?",
    hint: "The unblock you wanted from your pod or from Eugene.",
  },
  {
    n: "03",
    title: "What's the one thing you'd ask the group?",
    hint: "A question, a critique, an offer — gets read at the Friday call.",
  },
];

export default function ReflectPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-10 lg:px-10 lg:py-14">
      <div className="mb-8">
        <Badge variant="outline" className="mb-2 border-emerald-300 bg-emerald-50 text-emerald-700">
          <NotebookPen className="mr-1 h-3 w-3" /> Reflect
        </Badge>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Friday reflection.
        </h1>
        <p className="mt-2 max-w-2xl text-slate-600">
          Five sentences minimum. Public to your pod by default. Eugene reads every one.
          This is the surface that turns into your Cohort 00 testimonial after Demo Day.
        </p>
      </div>

      <Card className="border-dashed">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Opens Fri Jun 12, 5:00 PM ET</CardTitle>
            <Badge variant="outline" className="text-xs">
              Live · Week 1
            </Badge>
          </div>
          <CardDescription>
            Three prompts, due Sunday 11:59 PM ET. Below is the template — you&apos;ll fill these
            in here each week.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-2">
          {PROMPTS.map((p) => (
            <div
              key={p.n}
              className="rounded-md border border-dashed border-slate-300 bg-white px-4 py-3"
            >
              <div className="flex items-baseline gap-3">
                <span className="font-mono text-xs font-semibold text-emerald-600">{p.n}</span>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-slate-900">{p.title}</div>
                  <div className="mt-0.5 text-xs text-slate-500">{p.hint}</div>
                </div>
              </div>
            </div>
          ))}

          <div className="mt-4 text-xs text-slate-500">
            Reflections roll up into the Cohort 00 ship log on fhirbuilders.com/showcase/cohort-00
            after each week.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
