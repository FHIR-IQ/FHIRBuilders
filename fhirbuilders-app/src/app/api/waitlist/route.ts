import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, persona, building, painPoint, lookingFor, canInterview } = body;

    // Validate required fields
    if (!email || !building) {
      return NextResponse.json(
        { error: "Email and project description are required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingEntry = await prisma.waitlist.findUnique({
      where: { email },
    });

    if (existingEntry) {
      // Update existing entry instead of creating duplicate
      await prisma.waitlist.update({
        where: { email },
        data: {
          persona: persona || null,
          building,
          painPoint: painPoint || null,
          lookingFor: lookingFor || null,
          canInterview: canInterview || false,
          updatedAt: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        message: "Your information has been updated",
      });
    }

    // Create new waitlist entry
    await prisma.waitlist.create({
      data: {
        email,
        persona: persona || null,
        building,
        painPoint: painPoint || null,
        lookingFor: lookingFor || null,
        canInterview: canInterview || false,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Successfully joined the waitlist",
    });
  } catch (error) {
    console.error("Waitlist API error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}

export async function GET() {
  // Simple health check / count endpoint with persona breakdown
  try {
    const total = await prisma.waitlist.count();
    const byPersona = await prisma.waitlist.groupBy({
      by: ["persona"],
      _count: { persona: true },
    });

    return NextResponse.json({
      count: total,
      byPersona: byPersona.reduce((acc, item) => {
        acc[item.persona || "unknown"] = item._count.persona;
        return acc;
      }, {} as Record<string, number>),
    });
  } catch (error) {
    console.error("Waitlist count error:", error);
    return NextResponse.json({ count: 0 });
  }
}
