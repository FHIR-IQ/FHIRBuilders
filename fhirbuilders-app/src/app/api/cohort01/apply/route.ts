import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { applyRateLimit } from "@/lib/rate-limit";

// Cohort 01 applications reuse the Waitlist table (no schema change):
//   persona    = "cohort-01-applicant"
//   building   = the "what will you build" answer
//   lookingFor = "cohort-01"
//   notes      = name / org / referral / Demo Day flag (structured text)
// Admin review happens in the existing /admin waitlist surface.
export async function POST(request: NextRequest) {
  const rateLimitResult = applyRateLimit(request, "waitlist");
  if (rateLimitResult) return rateLimitResult;

  try {
    const body = await request.json();
    const { name, email, orgRole, building, referredBy, keepMePosted } = body;

    if (!name || !email || !building) {
      return NextResponse.json(
        { error: "Name, email, and what you'll build are required" },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
    }

    const notes = [
      `Cohort 01 application — ${new Date().toISOString()}`,
      `name: ${String(name).slice(0, 120)}`,
      orgRole ? `org/role: ${String(orgRole).slice(0, 200)}` : null,
      referredBy ? `referred by: ${String(referredBy).slice(0, 120)}` : null,
      `ship log opt-in: ${keepMePosted ? "yes" : "no"}`,
    ]
      .filter(Boolean)
      .join("\n");

    const data = {
      persona: "cohort-01-applicant",
      building: String(building).slice(0, 2000),
      lookingFor: "cohort-01",
      notes,
    };

    const existing = await prisma.waitlist.findUnique({ where: { email } });
    if (existing) {
      await prisma.waitlist.update({
        where: { email },
        data: {
          ...data,
          // Keep any prior admin notes above the new application.
          notes: existing.notes ? `${existing.notes}\n---\n${notes}` : notes,
          updatedAt: new Date(),
        },
      });
    } else {
      await prisma.waitlist.create({ data: { email, ...data } });
    }

    return NextResponse.json({
      success: true,
      message: "Application received",
    });
  } catch (error) {
    console.error("Cohort 01 apply error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
