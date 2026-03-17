import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// POST - Create a new shared project
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Unauthorized. Please sign in." },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const {
      title,
      description,
      repoUrl,
      demoUrl,
      tags,
      authorName,
      authorEmail,
      artifactType,
      status,
      lookingFor,
      makerComment,
      artifactMeta,
    } = body;

    if (!title || !description || !authorName || !artifactType) {
      return NextResponse.json(
        { error: "Title, description, author name, and artifact type are required" },
        { status: 400 }
      );
    }

    if (makerComment && typeof makerComment === "string" && makerComment.trim().length < 80) {
      return NextResponse.json(
        { error: "Maker comment must be at least 80 characters." },
        { status: 400 }
      );
    }

    const urlRegex = /^https?:\/\/.+/;
    if (repoUrl && !urlRegex.test(repoUrl)) {
      return NextResponse.json({ error: "Invalid repository URL" }, { status: 400 });
    }
    if (demoUrl && !urlRegex.test(demoUrl)) {
      return NextResponse.json({ error: "Invalid demo URL" }, { status: 400 });
    }

    const cleanRepoUrl = repoUrl?.trim() || null;
    const cleanMakerComment = makerComment?.trim() || null;

    const project = await prisma.sharedProject.create({
      data: {
        title: title.trim(),
        description: description.trim(),
        repoUrl: cleanRepoUrl,
        demoUrl: demoUrl?.trim() || null,
        tags: Array.isArray(tags) ? tags.slice(0, 5) : [],
        authorName: authorName.trim(),
        authorEmail: authorEmail?.trim() || null,
        artifactType: artifactType?.trim() || null,
        status: status?.trim() || null,
        lookingFor: Array.isArray(lookingFor) ? lookingFor : [],
        makerComment: cleanMakerComment,
        artifactMeta: artifactMeta ?? null,
      },
    });

    return NextResponse.json({ success: true, project });
  } catch (error) {
    console.error("Projects API error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}

// GET - List all shared projects
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sort = searchParams.get("sort") || "trending";

    const orderBy =
      sort === "newest"
        ? { createdAt: "desc" as const }
        : sort === "popular"
        ? { upvoteCount: "desc" as const }
        : { trendingScore: "desc" as const }; // default: trending

    const projects = await prisma.sharedProject.findMany({
      orderBy,
      select: {
        id: true,
        title: true,
        description: true,
        repoUrl: true,
        demoUrl: true,
        tags: true,
        artifactType: true,
        status: true,
        lookingFor: true,
        authorName: true,
        upvoteCount: true,
        forkCount: true,
        trendingScore: true,
        verified: true,
        makerComment: true,
        artifactMeta: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ projects });
  } catch (error) {
    console.error("Projects GET error:", error);
    return NextResponse.json({ projects: [] });
  }
}
