import { Badge } from "@/components/ui/badge";
import { NotebookPen } from "lucide-react";

const FORM_URL =
  "https://docs.google.com/forms/d/15Z-vO8ncGRZeMeh9c1PQJXsZ5fu0Ab62PzM2xxz-lZc/viewform?embedded=true";

type PageProps = { params: Promise<{ slug: string }> };

export default async function ReflectPage({ params }: PageProps) {
  await params; // resolve slug (unused — form is shared across sessions)

  return (
    <div className="mx-auto max-w-3xl px-6 py-10 lg:px-10 lg:py-14">
      <div className="mb-6">
        <Badge variant="outline" className="mb-2 border-emerald-300 bg-emerald-50 text-emerald-700">
          <NotebookPen className="mr-1 h-3 w-3" /> Reflect
        </Badge>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Weekly reflection.
        </h1>
        <p className="mt-2 text-slate-600">
          Five sentences minimum. Eugene reads every one. Submit one per session week — you can
          submit again each week using the link at the bottom of the form.
        </p>
      </div>

      <iframe
        src={FORM_URL}
        className="h-[900px] w-full rounded-xl border border-slate-200"
        frameBorder="0"
        marginHeight={0}
        marginWidth={0}
        title="Weekly Reflection Form"
      >
        Loading…
      </iframe>
    </div>
  );
}
