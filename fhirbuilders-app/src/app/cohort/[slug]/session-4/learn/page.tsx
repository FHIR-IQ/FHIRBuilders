import { LearnGuide } from "@/app/cohort/[slug]/_components/learn/learn-guide";
import { CURRICULUM } from "./_data/curriculum";

type PageProps = { params: Promise<{ slug: string }> };

export default async function Session4LearnPage({ params }: PageProps) {
  const { slug } = await params;
  return (
    <LearnGuide
      cohortSlug={slug}
      sessionId="session-4"
      sessionKey="session4"
      title="Session 4 · Study Guide"
      subtitle="Reference this during and after Session 4. Six blocks — objectives, FAQ, examples, and one thing to try for each."
      backLabel="Session 4"
      blocks={CURRICULUM}
    />
  );
}
