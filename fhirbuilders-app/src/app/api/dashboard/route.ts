import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - Fetch dashboard data for the authenticated user
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch user's data in parallel for performance
    const [generatedApps, projectMemberships, sandboxes, channels] =
      await Promise.all([
        // Generated Apps from OpenClaw
        prisma.generatedApp.findMany({
          where: { userId: session.user.id },
          orderBy: { createdAt: "desc" },
          take: 10,
          select: {
            id: true,
            prompt: true,
            status: true,
            fhirResources: true,
            githubRepoUrl: true,
            sandboxUrl: true,
            createdAt: true,
          },
        }),
        // Projects (where user is a member)
        prisma.projectMember.findMany({
          where: { userId: session.user.id },
          orderBy: { joinedAt: "desc" },
          take: 10,
          select: {
            role: true,
            project: {
              select: {
                id: true,
                name: true,
                slug: true,
                description: true,
                visibility: true,
                createdAt: true,
              },
            },
          },
        }),
        // Sandboxes
        prisma.sandbox.findMany({
          where: { userId: session.user.id },
          orderBy: { createdAt: "desc" },
          take: 10,
          select: {
            id: true,
            name: true,
            description: true,
            status: true,
            patientCount: true,
            dataModules: true,
            createdAt: true,
          },
        }),
        // Messaging Channels
        prisma.messagingChannel.findMany({
          where: { userId: session.user.id },
          orderBy: { createdAt: "desc" },
          take: 5,
          select: {
            id: true,
            name: true,
            type: true,
            status: true,
          },
        }),
      ]);

    // Calculate stats
    const stats = {
      generatedApps: generatedApps.length,
      completedApps: generatedApps.filter((a) => a.status === "COMPLETED")
        .length,
      projects: projectMemberships.length,
      sandboxes: sandboxes.length,
      activeChannels: channels.filter((c) => c.status === "ACTIVE").length,
    };

    // Transform project memberships to include role at top level
    const projects = projectMemberships.map((pm) => ({
      ...pm.project,
      role: pm.role,
    }));

    return NextResponse.json({
      stats,
      generatedApps,
      projects,
      sandboxes,
      channels,
    });
  } catch (error) {
    console.error("Dashboard API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
