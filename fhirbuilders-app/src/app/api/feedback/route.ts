import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { applyRateLimit } from "@/lib/rate-limit";

interface FeedbackEntry {
  id: string;
  email: string | null;
  easeOfUse: number | null;
  dataFit: string | null;
  whatBuilt: string | null;
  topRequest: string | null;
  nps: number | null;
  canShare: boolean;
  createdAt: Date;
}

export async function POST(request: NextRequest) {
  // Apply rate limiting (10 requests per minute)
  const rateLimitResult = applyRateLimit(request, "feedback");
  if (rateLimitResult) return rateLimitResult;

  try {
    const body = await request.json();
    const { email, easeOfUse, dataFit, whatBuilt, topRequest, nps, canShare } = body;

    // Validate email format if provided
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return NextResponse.json(
          { error: "Invalid email format" },
          { status: 400 }
        );
      }
    }

    // Create feedback entry
    await prisma.feedback.create({
      data: {
        email: email || null,
        easeOfUse: easeOfUse || null,
        dataFit: dataFit || null,
        whatBuilt: whatBuilt || null,
        topRequest: topRequest || null,
        nps: nps >= 0 ? nps : null,
        canShare: canShare || false,
      },
    });

    // If email provided, update waitlist entry to mark feedback received
    if (email) {
      try {
        await prisma.waitlist.update({
          where: { email },
          data: { feedbackReceived: true },
        });
      } catch {
        // Ignore if email not in waitlist
      }
    }

    return NextResponse.json({
      success: true,
      message: "Feedback submitted successfully",
    });
  } catch (error) {
    console.error("Feedback API error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}

// GET - Retrieve feedback summary (for admin)
export async function GET() {
  try {
    const feedback: FeedbackEntry[] = await prisma.feedback.findMany({
      orderBy: { createdAt: "desc" },
    });

    // Calculate NPS score
    const npsResponses = feedback.filter((f: FeedbackEntry) => f.nps !== null);
    const promoters = npsResponses.filter((f: FeedbackEntry) => f.nps! >= 9).length;
    const detractors = npsResponses.filter((f: FeedbackEntry) => f.nps! <= 6).length;
    const npsScore =
      npsResponses.length > 0
        ? Math.round(((promoters - detractors) / npsResponses.length) * 100)
        : null;

    // Calculate average ease of use
    const easeResponses = feedback.filter((f: FeedbackEntry) => f.easeOfUse !== null);
    const avgEase =
      easeResponses.length > 0
        ? easeResponses.reduce((sum: number, f: FeedbackEntry) => sum + f.easeOfUse!, 0) / easeResponses.length
        : null;

    return NextResponse.json({
      feedback,
      stats: {
        total: feedback.length,
        npsScore,
        avgEase: avgEase ? avgEase.toFixed(1) : null,
        canShare: feedback.filter((f: FeedbackEntry) => f.canShare).length,
      },
    });
  } catch (error) {
    console.error("Feedback GET error:", error);
    return NextResponse.json({ feedback: [], stats: {} });
  }
}
