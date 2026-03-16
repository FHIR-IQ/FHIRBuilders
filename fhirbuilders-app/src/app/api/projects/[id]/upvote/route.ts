import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST - Increment upvote count for a shared project (anonymous, no dupe check needed for demo)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const project = await prisma.sharedProject.update({
      where: { id },
      data: { upvoteCount: { increment: 1 } },
      select: { id: true, upvoteCount: true },
    });
    return NextResponse.json({ upvoteCount: project.upvoteCount });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
