import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST - Create a new shared project
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, repoUrl, demoUrl, tags, authorName, authorEmail } = body;

    // Validate required fields
    if (!title || !description || !authorName) {
      return NextResponse.json(
        { error: "Title, description, and author name are required" },
        { status: 400 }
      );
    }

    // Validate URLs if provided
    const urlRegex = /^https?:\/\/.+/;
    if (repoUrl && !urlRegex.test(repoUrl)) {
      return NextResponse.json(
        { error: "Invalid repository URL" },
        { status: 400 }
      );
    }
    if (demoUrl && !urlRegex.test(demoUrl)) {
      return NextResponse.json(
        { error: "Invalid demo URL" },
        { status: 400 }
      );
    }

    // Create project
    const project = await prisma.sharedProject.create({
      data: {
        title: title.trim(),
        description: description.trim(),
        repoUrl: repoUrl?.trim() || null,
        demoUrl: demoUrl?.trim() || null,
        tags: Array.isArray(tags) ? tags.slice(0, 5) : [],
        authorName: authorName.trim(),
        authorEmail: authorEmail?.trim() || null,
      },
    });

    return NextResponse.json({
      success: true,
      project,
    });
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
    const sort = searchParams.get("sort") || "popular";

    const projects = await prisma.sharedProject.findMany({
      orderBy:
        sort === "newest"
          ? { createdAt: "desc" }
          : { upvoteCount: "desc" },
      select: {
        id: true,
        title: true,
        description: true,
        repoUrl: true,
        demoUrl: true,
        tags: true,
        authorName: true,
        upvoteCount: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ projects });
  } catch (error) {
    console.error("Projects GET error:", error);
    return NextResponse.json({ projects: [] });
  }
}
