import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { applyRateLimit } from "@/lib/rate-limit";

// GET - Get ratings summary and list for an app
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Resolve app by slug or id
    const app = await prisma.app.findFirst({
      where: { OR: [{ slug: id }, { id }] },
      select: { id: true },
    });

    if (!app) {
      return NextResponse.json({ error: "App not found" }, { status: 404 });
    }

    // Get aggregate stats
    const agg = await prisma.rating.aggregate({
      where: { appId: app.id },
      _avg: { score: true },
      _count: true,
    });

    // Get distribution (1-5)
    const ratings = await prisma.rating.findMany({
      where: { appId: app.id },
      select: { score: true },
    });

    const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    for (const r of ratings) {
      distribution[r.score] = (distribution[r.score] || 0) + 1;
    }

    // Get reviews (ratings with text)
    const reviews = await prisma.rating.findMany({
      where: {
        appId: app.id,
        review: { not: null },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    // Check if current user has rated
    const session = await auth();
    let userRating = null;
    if (session?.user?.id) {
      userRating = await prisma.rating.findUnique({
        where: {
          appId_userId: {
            appId: app.id,
            userId: session.user.id,
          },
        },
      });
    }

    return NextResponse.json({
      average: agg._avg.score || 0,
      total: agg._count,
      distribution,
      reviews,
      userRating,
    });
  } catch (error) {
    console.error("Ratings GET error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

// POST - Create or update a rating
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Unauthorized. Please sign in to rate." },
      { status: 401 }
    );
  }

  const rateLimitResponse = await applyRateLimit(request, "projects");
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const { id } = await params;
    const body = await request.json();
    const { score, review } = body;

    // Validate score
    if (!score || typeof score !== "number" || score < 1 || score > 5 || !Number.isInteger(score)) {
      return NextResponse.json(
        { error: "Score must be an integer from 1 to 5" },
        { status: 400 }
      );
    }

    // Validate review if provided
    if (review !== undefined && review !== null) {
      if (typeof review !== "string" || review.trim().length > 2000) {
        return NextResponse.json(
          { error: "Review must be under 2000 characters" },
          { status: 400 }
        );
      }
    }

    // Resolve app
    const app = await prisma.app.findFirst({
      where: { OR: [{ slug: id }, { id }] },
      select: { id: true, status: true, authorId: true },
    });

    if (!app || !["APPROVED", "FEATURED", "SUBMITTED"].includes(app.status)) {
      return NextResponse.json({ error: "App not found" }, { status: 404 });
    }

    // Can't rate your own app
    if (app.authorId === session.user.id) {
      return NextResponse.json(
        { error: "You cannot rate your own app" },
        { status: 400 }
      );
    }

    // Upsert the rating
    const rating = await prisma.rating.upsert({
      where: {
        appId_userId: {
          appId: app.id,
          userId: session.user.id,
        },
      },
      update: {
        score,
        review: review?.trim() || null,
      },
      create: {
        score,
        review: review?.trim() || null,
        appId: app.id,
        userId: session.user.id,
      },
    });

    // Fetch updated aggregate
    const agg = await prisma.rating.aggregate({
      where: { appId: app.id },
      _avg: { score: true },
      _count: true,
    });

    return NextResponse.json({
      rating,
      average: agg._avg.score || 0,
      total: agg._count,
    });
  } catch (error) {
    console.error("Rating POST error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
