import { LearnGuide } from "@/app/cohort/[slug]/_components/learn/learn-guide";
import { CURRICULUM } from "./_data/curriculum";

type PageProps = { params: Promise<{ slug: string }> };

export default async function Session5LearnPage({ params }: PageProps) {
  const { slug } = await params;
  return (
    <LearnGuide
      cohortSlug={slug}
      sessionId="session-5"
      sessionKey="session5"
      title="Session 5 · Study Guide"
      subtitle="Reference this during and after Session 5. Six blocks — objectives, FAQ, examples, and one thing to try for each."
      backLabel="Session 5"
      blocks={CURRICULUM}
    />
  );
}
