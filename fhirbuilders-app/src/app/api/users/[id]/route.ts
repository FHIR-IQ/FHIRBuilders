import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Public user profile with their apps
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        image: true,
        bio: true,
        persona: true,
        skills: true,
        interests: true,
        lookingFor: true,
        githubUsername: true,
        huggingfaceUsername: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Fetch their public apps
    const apps = await prisma.app.findMany({
      where: {
        authorId: id,
        status: { in: ["APPROVED", "FEATURED", "SUBMITTED"] },
      },
      orderBy: { upvoteCount: "desc" },
      select: {
        id: true,
        name: true,
        slug: true,
        tagline: true,
        category: true,
        appType: true,
        fhirResources: true,
        icon: true,
        upvoteCount: true,
        builtWith: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ user, apps });
  } catch (error) {
    console.error("User profile GET error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
