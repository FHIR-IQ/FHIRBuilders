import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET — live activity counts for homepage signal
export async function GET() {
  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [projectsThisWeek, problemsThisWeek, totalUpvotes] = await Promise.all([
      prisma.sharedProject.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
      prisma.clinicalProblem.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
      prisma.upvoteEvent.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    ]);

    return NextResponse.json({ projectsThisWeek, problemsThisWeek, totalUpvotes });
  } catch {
    return NextResponse.json({ projectsThisWeek: 0, problemsThisWeek: 0, totalUpvotes: 0 });
  }
}
