import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { generateShareToken } from "@/lib/share-token";

// POST - Generate a shareable link for an app (author only)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const { id } = await params;

    const app = await prisma.app.findFirst({
      where: { OR: [{ slug: id }, { id }] },
      select: { id: true, slug: true, authorId: true },
    });

    if (!app) {
      return NextResponse.json({ error: "App not found" }, { status: 404 });
    }

    // Only author can generate share links
    if (app.authorId !== session.user.id) {
      return NextResponse.json(
        { error: "Only the app author can generate share links" },
        { status: 403 }
      );
    }

    const token = generateShareToken(app.id);
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;
    const shareUrl = `${baseUrl}/showcase/${app.slug}?token=${token}`;

    return NextResponse.json({ shareUrl, expiresIn: "7 days" });
  } catch (error) {
    console.error("Share token error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
