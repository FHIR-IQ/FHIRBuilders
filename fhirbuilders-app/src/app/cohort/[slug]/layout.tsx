import { CohortSidebar } from "./_components/cohort-sidebar";

export default function CohortLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <CohortSidebar />
      <main className="flex-1 overflow-x-hidden">{children}</main>
    </div>
  );
}
