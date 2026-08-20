import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { applyRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs"; // Prisma + outbound fetch; not edge-compatible

const FROM = "FHIRBuilders <notifications@fhirbuilders.com>";
const REPLY_TO = "eugene.vestel@gmail.com";

function confirmationHtml(): string {
  return `<div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;max-width:560px;margin:0 auto;color:#16191c;line-height:1.6;">
  <p style="font-size:12px;letter-spacing:.18em;text-transform:uppercase;color:#878f96;margin:0 0 16px;">Healthcare AI Builders</p>
  <h1 style="font-size:22px;margin:0 0 12px;">You're on the list.</h1>
  <p style="margin:0 0 16px;">Thanks for joining. You'll get the Cohort 01 syllabus and be first to know when enrollment opens &mdash; plus the occasional resource worth your time. Nothing else.</p>
  <p style="margin:0 0 16px;">Cohort 01 is a paid, 12-week build cohort: weekly Friday demos, your own agents, real FHIR data. Here's the program:</p>
  <p style="margin:0 0 24px;"><a href="https://fhirbuilders.com/cohort-01" style="display:inline-block;background:#0b5a63;color:#fff;text-decoration:none;padding:12px 22px;font-weight:600;">See the Cohort 01 program &rarr;</a></p>
  <p style="margin:0 0 8px;">What are you building? Just reply to this email &mdash; it comes straight to me.</p>
  <p style="margin:0;">&mdash; Eugene<br/>Healthcare AI Builders</p>
</div>`;
}

function confirmationText(): string {
  return `Healthcare AI Builders

You're on the list.

Thanks for joining. You'll get the Cohort 01 syllabus and be first to know when enrollment opens — plus the occasional resource worth your time. Nothing else.

Cohort 01 is a paid, 12-week build cohort: weekly Friday demos, your own agents, real FHIR data. See the program:
https://fhirbuilders.com/cohort-01

What are you building? Just reply to this email — it comes straight to me.

— Eugene
Healthcare AI Builders`;
}

// Best-effort confirmation for lightweight email captures. Never throws — a mail
// failure must not break the signup. Sends from the verified fhirbuilders.com
// domain via the Resend REST API (same pattern as scripts/send-cohort-nudge.ts),
// and BCCs Eugene so he keeps a record of every capture.
async function sendCaptureConfirmation(email: string, source: string): Promise<void> {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.warn("RESEND_API_KEY missing — skipping capture confirmation email");
    return;
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: FROM,
        to: [email],
        bcc: [REPLY_TO],
        reply_to: REPLY_TO,
        subject: "You're on the Healthcare AI Builders list",
        html: confirmationHtml(),
        text: confirmationText(),
      }),
    });
    if (!res.ok) {
      console.error(`Capture confirmation failed (${source}):`, res.status, await res.text());
    }
  } catch (err) {
    console.error(`Capture confirmation error (${source}):`, err);
  }
}

export async function POST(request: NextRequest) {
  // Apply rate limiting (5 requests per minute)
  const rateLimitResult = applyRateLimit(request, "waitlist");
  if (rateLimitResult) return rateLimitResult;

  try {
    const body = await request.json();
    const { email, persona, building, painPoint, lookingFor, canInterview, source } = body;

    // Email is the only hard requirement. The full /early-access form still
    // sends `building`; lightweight captures send only email + a `source` tag.
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
    }

    const resolvedBuilding =
      building || (source ? `Email capture · ${source}` : "Not specified");

    const existingEntry = await prisma.waitlist.findUnique({ where: { email } });

    if (existingEntry) {
      // Update in place; preserve fields the caller didn't send (a lightweight
      // capture must not wipe an existing early-access submission's detail).
      await prisma.waitlist.update({
        where: { email },
        data: {
          persona: persona || existingEntry.persona,
          building: building || existingEntry.building,
          painPoint: painPoint || existingEntry.painPoint,
          lookingFor: lookingFor || existingEntry.lookingFor,
          canInterview: canInterview ?? existingEntry.canInterview,
          updatedAt: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        message: "You're already on the list — updated.",
      });
    }

    await prisma.waitlist.create({
      data: {
        email,
        persona: persona || null,
        building: resolvedBuilding,
        painPoint: painPoint || null,
        lookingFor: lookingFor || null,
        canInterview: canInterview || false,
        notes: source ? `source: ${source}` : null,
      },
    });

    // Only confirm lightweight captures (source present). The /early-access flow
    // has its own success UX and shouldn't start emailing existing form-fillers.
    if (source) {
      await sendCaptureConfirmation(email, String(source));
    }

    return NextResponse.json({
      success: true,
      message: "Successfully joined the list",
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
