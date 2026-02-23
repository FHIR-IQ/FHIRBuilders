import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// POST - Toggle upvote on an app
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Unauthorized. Please sign in to upvote." },
      { status: 401 }
    );
  }

  try {
    const { id } = await params;
    const userId = session.user.id;

    // Verify app exists and is visible
    const app = await prisma.app.findUnique({
      where: { id },
      select: { id: true, status: true },
    });

    if (!app || !["APPROVED", "FEATURED", "SUBMITTED"].includes(app.status)) {
      return NextResponse.json({ error: "App not found" }, { status: 404 });
    }

    // Check existing upvote
    const existing = await prisma.upvote.findUnique({
      where: {
        userId_appId: { userId, appId: id },
      },
    });

    if (existing) {
      // Remove upvote
      await prisma.$transaction([
        prisma.upvote.delete({
          where: { userId_appId: { userId, appId: id } },
        }),
        prisma.app.update({
          where: { id },
          data: { upvoteCount: { decrement: 1 } },
        }),
      ]);

      const updated = await prisma.app.findUnique({
        where: { id },
        select: { upvoteCount: true },
      });

      return NextResponse.json({
        upvoted: false,
        upvoteCount: updated?.upvoteCount ?? 0,
      });
    } else {
      // Add upvote
      await prisma.$transaction([
        prisma.upvote.create({
          data: { userId, appId: id },
        }),
        prisma.app.update({
          where: { id },
          data: { upvoteCount: { increment: 1 } },
        }),
      ]);

      const updated = await prisma.app.findUnique({
        where: { id },
        select: { upvoteCount: true },
      });

      return NextResponse.json({
        upvoted: true,
        upvoteCount: updated?.upvoteCount ?? 0,
      });
    }
  } catch (error) {
    console.error("Upvote error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
