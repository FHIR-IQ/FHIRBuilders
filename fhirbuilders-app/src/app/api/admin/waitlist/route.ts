import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - List all waitlist entries
export async function GET() {
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
