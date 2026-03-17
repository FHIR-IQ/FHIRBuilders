import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Recompute trending score: (7d upvotes × 3) + (30d upvotes × 1) + (forkCount × 5)
async function recomputeTrending(projectId: string, forkCount: number) {
  const now = new Date();
  const ago7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const ago30d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [upvotes7d, upvotes30d] = await Promise.all([
    prisma.upvoteEvent.count({ where: { projectId, createdAt: { gte: ago7d } } }),
    prisma.upvoteEvent.count({ where: { projectId, createdAt: { gte: ago30d } } }),
  ]);

  return upvotes7d * 3 + upvotes30d * 1 + forkCount * 5;
}

// POST - Increment upvote count and record timestamp event
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Fetch current project to get forkCount
    const current = await prisma.sharedProject.findUnique({
      where: { id },
      select: { forkCount: true, upvoteCount: true, makerComment: true, repoUrl: true },
    });
    if (!current) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Create upvote event + increment counter atomically
    await prisma.$transaction([
      prisma.upvoteEvent.create({ data: { projectId: id } }),
      prisma.sharedProject.update({
        where: { id },
        data: { upvoteCount: { increment: 1 } },
      }),
    ]);

    const newCount = current.upvoteCount + 1;
    const trendingScore = await recomputeTrending(id, current.forkCount);

    // Auto-compute verified: upvotes >= 5, has repoUrl, has makerComment
    const verified =
      newCount >= 5 &&
      !!current.repoUrl?.trim() &&
      !!current.makerComment?.trim();

    await prisma.sharedProject.update({
      where: { id },
      data: { trendingScore, verified },
    });

    return NextResponse.json({ upvoteCount: newCount, trendingScore, verified });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
