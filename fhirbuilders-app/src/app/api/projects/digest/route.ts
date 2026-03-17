/**
 * GET /api/projects/digest
 *
 * Public digest endpoint for the fhirbuilders-digest OpenClaw skill.
 * Returns trending projects, new projects from the last 24h, and new OpenClaw skills.
 * Unauthenticated. Rate-limited to 60 req/hour per IP.
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Simple in-memory rate limiter: 60 req/hour per IP
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const window = 60 * 60 * 1000; // 1 hour
  const limit = 60;

  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + window });
    return true;
  }
  if (entry.count >= limit) return false;
  entry.count++;
  return true;
}

interface ProjectDigestItem {
  title: string;
  artifact_type: string | null;
  upvotes: number;
  upvotes_last_7_days: number;
  builder: string;
  url: string;
  one_line_description: string;
}

function toDigestItem(p: {
  id: string;
  title: string;
  description: string;
  artifactType: string | null;
  upvoteCount: number;
  authorName: string;
}): ProjectDigestItem {
  const slug = p.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  return {
    title: p.title,
    artifact_type: p.artifactType,
    upvotes: p.upvoteCount,
    // We don't track 7-day delta separately; use total as proxy for now
    upvotes_last_7_days: p.upvoteCount,
    builder: p.authorName,
    url: `https://fhir-builders.vercel.app/projects`,
    one_line_description: p.description.slice(0, 120),
  };
}

export async function GET(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Max 60 requests per hour." },
      {
        status: 429,
        headers: { "Retry-After": "3600" },
      }
    );
  }

  try {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const [trending, newLast24h, newSkills] = await Promise.all([
      // Trending: top 5 by upvotes
      prisma.sharedProject.findMany({
        orderBy: { upvoteCount: "desc" },
        take: 5,
        select: {
          id: true,
          title: true,
          description: true,
          artifactType: true,
          upvoteCount: true,
          authorName: true,
        },
      }),

      // New in last 24h
      prisma.sharedProject.findMany({
        where: { createdAt: { gte: oneDayAgo } },
        orderBy: { createdAt: "desc" },
        take: 10,
        select: {
          id: true,
          title: true,
          description: true,
          artifactType: true,
          upvoteCount: true,
          authorName: true,
        },
      }),

      // New OpenClaw skills
      prisma.sharedProject.findMany({
        where: {
          artifactType: "OpenClaw Skill",
          createdAt: { gte: oneDayAgo },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
        select: {
          id: true,
          title: true,
          description: true,
          artifactType: true,
          upvoteCount: true,
          authorName: true,
        },
      }),
    ]);

    return NextResponse.json(
      {
        generated_at: now.toISOString(),
        trending: trending.map(toDigestItem),
        new_last_24h: newLast24h.map(toDigestItem),
        new_skills: newSkills.map(toDigestItem),
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  } catch (error) {
    console.error("digest endpoint error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
