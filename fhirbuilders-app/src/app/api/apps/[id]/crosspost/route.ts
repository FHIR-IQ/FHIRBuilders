import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { postToZulip } from "@/lib/zulip";
import { applyRateLimit } from "@/lib/rate-limit";

const CATEGORY_LABELS: Record<string, string> = {
  AI_AGENT: "AI Agent",
  CLINICAL: "Clinical",
  PATIENT_ENGAGEMENT: "Patient Engagement",
  ANALYTICS: "Analytics",
  INTEGRATION: "Integration",
  TEMPLATE: "Template",
};

// POST - Cross-post app to FHIR Zulip (author only)
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

  const rateLimitResponse = await applyRateLimit(request, "projects");
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const { id } = await params;

    const app = await prisma.app.findFirst({
      where: { OR: [{ slug: id }, { id }] },
      include: {
        author: {
          select: { name: true },
        },
      },
    });

    if (!app) {
      return NextResponse.json({ error: "App not found" }, { status: 404 });
    }

    // Only author can cross-post
    if (app.authorId !== session.user.id) {
      return NextResponse.json(
        { error: "Only the app author can cross-post" },
        { status: 403 }
      );
    }

    // Build Zulip message
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;
    const appUrl = `${baseUrl}/showcase/${app.slug}`;

    const lines: string[] = [
      `**${app.name}** — ${app.tagline}`,
      "",
      `Category: ${CATEGORY_LABELS[app.category] || app.category}${app.appType ? ` | Type: ${app.appType}` : ""}`,
    ];

    if (app.fhirResources.length > 0) {
      lines.push(`FHIR Resources: ${app.fhirResources.join(", ")}`);
    }

    if (app.builtWith.length > 0) {
      lines.push(`Built with: ${app.builtWith.join(", ")}`);
    }

    lines.push("");

    if (app.demoUrl) lines.push(`[Live Demo](${app.demoUrl})`);
    if (app.repoUrl) lines.push(`[Source Code](${app.repoUrl})`);
    lines.push(`[View on FHIRBuilders](${appUrl})`);

    lines.push("");
    lines.push(`— ${app.author.name || "A FHIRBuilder"}`);

    const result = await postToZulip({
      stream: "social",
      topic: `FHIRBuilders Showcase: ${app.name}`,
      content: lines.join("\n"),
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to post to Zulip" },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true, message: "Posted to FHIR Zulip" });
  } catch (error) {
    console.error("Crosspost error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
