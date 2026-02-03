import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminAuth } from "@/lib/admin-auth";

// GET - List all waitlist entries (ADMIN ONLY)
export async function GET() {
  // Verify admin authentication
  const authResult = await requireAdminAuth();
  if (!authResult.success) {
    return authResult.response;
  }

  try {
    const entries = await prisma.waitlist.findMany({
      orderBy: [
        { canInterview: "desc" }, // Prioritize those open to interviews
        { createdAt: "desc" },
      ],
    });

    return NextResponse.json({ entries });
  } catch (error) {
    console.error("Admin waitlist GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch waitlist entries" },
      { status: 500 }
    );
  }
}
