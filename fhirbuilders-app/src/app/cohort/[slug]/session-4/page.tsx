import { SessionOverview } from "@/app/cohort/[slug]/_components/learn/session-overview";
import { CURRICULUM } from "./learn/_data/curriculum";

type PageProps = { params: Promise<{ slug: string }> };

export default async function Session4Page({ params }: PageProps) {
  const { slug } = await params;
  return <SessionOverview cohortSlug={slug} sessionId="session-4" blocks={CURRICULUM} />;
}
