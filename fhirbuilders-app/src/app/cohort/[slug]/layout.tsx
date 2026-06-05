import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { CohortSidebar } from "./_components/cohort-sidebar";

type LayoutProps = {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
};

export default async function CohortLayout({ children, params }: LayoutProps) {
  // Cohort routes require an account. Unauthenticated visitors are bounced to
  // /login with a callback back to whatever cohort sub-route they tried to
  // open — Home, Plan, Calendar, etc. — so the magic-link redirect lands them
  // exactly where they were going.
  const session = await auth();
  if (!session?.user) {
    const { slug } = await params;
    redirect(`/login?callbackUrl=${encodeURIComponent(`/cohort/${slug}`)}`);
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <CohortSidebar />
      <main className="flex-1 overflow-x-hidden">{children}</main>
    </div>
  );
}
