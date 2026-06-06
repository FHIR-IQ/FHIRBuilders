import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { isCohortMember } from "@/lib/cohort/cohort-00";
import { CohortSidebar } from "./_components/cohort-sidebar";

type LayoutProps = {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
};

// Eugene + future admins always get cohort access regardless of signup roster.
// Same env-var pattern as /admin/cohort — keep them in sync.
function isAdmin(email: string | null | undefined): boolean {
  if (!email) return false;
  const admins = new Set(
    (process.env.ADMIN_EMAILS ?? "eugene.vestel@gmail.com")
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean),
  );
  return admins.has(email.toLowerCase());
}

export default async function CohortLayout({ children, params }: LayoutProps) {
  // Cohort routes require an account. Unauthenticated visitors are bounced to
  // /login with a callback back to whatever cohort sub-route they tried to
  // open — Home, Plan, Calendar, etc. — so the magic-link redirect lands them
  // exactly where they were going.
  const session = await auth();
  const { slug } = await params;

  if (!session?.user) {
    redirect(`/login?callbackUrl=${encodeURIComponent(`/cohort/${slug}`)}`);
  }

  // Account-linking gate: signed in, but not enrolled in this cohort. Bounce
  // to /cohort (public landing) which explains what the cohort is + offers a
  // waitlist for the next one. Admins bypass so Eugene can preview as anyone.
  const email = session.user.email;
  if (!isCohortMember(email, slug) && !isAdmin(email)) {
    redirect("/cohort");
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <CohortSidebar />
      <main className="flex-1 overflow-x-hidden">{children}</main>
    </div>
  );
}
