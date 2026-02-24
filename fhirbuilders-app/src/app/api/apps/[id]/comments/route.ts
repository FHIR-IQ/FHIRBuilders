import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { applyRateLimit } from "@/lib/rate-limit";

// GET - Fetch comments for an app (with threaded replies)
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

    // Fetch top-level comments with one level of replies
    const comments = await prisma.comment.findMany({
      where: {
        appId: app.id,
        parentId: null,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            persona: true,
          },
        },
        replies: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
                persona: true,
              },
            },
          },
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ comments });
  } catch (error) {
    console.error("Comments GET error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

// POST - Create a new comment
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Unauthorized. Please sign in to comment." },
      { status: 401 }
    );
  }

  const rateLimitResponse = await applyRateLimit(request, "projects");
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const { id } = await params;
    const body = await request.json();
    const { content, parentId } = body;

    // Validate content
    if (!content || typeof content !== "string") {
      return NextResponse.json(
        { error: "Comment content is required" },
        { status: 400 }
      );
    }

    const trimmed = content.trim();
    if (trimmed.length < 1 || trimmed.length > 2000) {
      return NextResponse.json(
        { error: "Comment must be 1-2000 characters" },
        { status: 400 }
      );
    }

    // Resolve app by slug or id
    const app = await prisma.app.findFirst({
      where: { OR: [{ slug: id }, { id }] },
      select: { id: true, status: true },
    });

    if (!app || !["APPROVED", "FEATURED", "SUBMITTED"].includes(app.status)) {
      return NextResponse.json({ error: "App not found" }, { status: 404 });
    }

    // If replying, verify parent exists and belongs to same app
    if (parentId) {
      const parent = await prisma.comment.findUnique({
        where: { id: parentId },
        select: { appId: true },
      });
      if (!parent || parent.appId !== app.id) {
        return NextResponse.json(
          { error: "Parent comment not found" },
          { status: 404 }
        );
      }
    }

    const comment = await prisma.comment.create({
      data: {
        content: trimmed,
        userId: session.user.id,
        appId: app.id,
        parentId: parentId || null,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            persona: true,
          },
        },
        replies: true,
      },
    });

    return NextResponse.json({ comment }, { status: 201 });
  } catch (error) {
    console.error("Comment POST error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
