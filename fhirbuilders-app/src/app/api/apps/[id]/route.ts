import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET - Get a single app by ID or slug
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();

    // Try finding by slug first, then by ID
    const app = await prisma.app.findFirst({
      where: {
        OR: [{ slug: id }, { id }],
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
            persona: true,
            bio: true,
            githubUsername: true,
          },
        },
        _count: {
          select: {
            comments: true,
            ratings: true,
            upvotes: true,
          },
        },
      },
    });

    if (!app) {
      return NextResponse.json({ error: "App not found" }, { status: 404 });
    }

    // Only show non-approved apps to their author
    if (
      !["APPROVED", "FEATURED", "SUBMITTED"].includes(app.status) &&
      app.authorId !== session?.user?.id
    ) {
      return NextResponse.json({ error: "App not found" }, { status: 404 });
    }

    // Check if the current user has upvoted
    let hasUpvoted = false;
    if (session?.user?.id) {
      const upvote = await prisma.upvote.findUnique({
        where: {
          userId_appId: {
            userId: session.user.id,
            appId: app.id,
          },
        },
      });
      hasUpvoted = !!upvote;
    }

    // Calculate average rating
    const ratingAgg = await prisma.rating.aggregate({
      where: { appId: app.id },
      _avg: { score: true },
      _count: true,
    });

    return NextResponse.json({
      app: {
        ...app,
        hasUpvoted,
        averageRating: ratingAgg._avg.score || 0,
        ratingCount: ratingAgg._count,
      },
    });
  } catch (error) {
    console.error("App GET error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
