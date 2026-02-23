import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { applyRateLimit } from "@/lib/rate-limit";
import { generateSlug } from "@/lib/slug";

const VALID_CATEGORIES = [
  "AI_AGENT",
  "CLINICAL",
  "PATIENT_ENGAGEMENT",
  "ANALYTICS",
  "INTEGRATION",
  "TEMPLATE",
] as const;

// POST - Submit a new app to the showcase
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Unauthorized. Please sign in." },
      { status: 401 }
    );
  }

  const rateLimitResponse = await applyRateLimit(request, "projects");
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const body = await request.json();
    const {
      name,
      tagline,
      description,
      category,
      appType,
      fhirResources,
      fhirVersion,
      repoUrl,
      demoUrl,
      docsUrl,
      videoUrl,
      icon,
      builtWith,
    } = body;

    // Validate required fields
    if (!name || typeof name !== "string" || name.trim().length < 3 || name.trim().length > 100) {
      return NextResponse.json(
        { error: "Name is required (3-100 characters)" },
        { status: 400 }
      );
    }
    if (!tagline || typeof tagline !== "string" || tagline.trim().length < 10 || tagline.trim().length > 100) {
      return NextResponse.json(
        { error: "Tagline is required (10-100 characters)" },
        { status: 400 }
      );
    }
    if (!description || typeof description !== "string" || description.trim().length < 20 || description.trim().length > 5000) {
      return NextResponse.json(
        { error: "Description is required (20-5000 characters)" },
        { status: 400 }
      );
    }
    if (!category || !VALID_CATEGORIES.includes(category)) {
      return NextResponse.json(
        { error: "Valid category is required" },
        { status: 400 }
      );
    }

    // Validate optional URLs
    const urlRegex = /^https?:\/\/.+/;
    for (const [field, value] of Object.entries({ repoUrl, demoUrl, docsUrl, videoUrl, icon })) {
      if (value && typeof value === "string" && value.trim() && !urlRegex.test(value.trim())) {
        return NextResponse.json(
          { error: `Invalid URL for ${field}` },
          { status: 400 }
        );
      }
    }

    // Generate unique slug (retry on collision)
    let slug = generateSlug(name);
    const existing = await prisma.app.findUnique({ where: { slug } });
    if (existing) {
      slug = generateSlug(name);
    }

    const app = await prisma.app.create({
      data: {
        name: name.trim(),
        slug,
        tagline: tagline.trim(),
        description: description.trim(),
        category,
        appType: appType?.trim() || null,
        fhirResources: Array.isArray(fhirResources) ? fhirResources.slice(0, 20) : [],
        fhirVersion: fhirVersion?.trim() || "R4",
        repoUrl: repoUrl?.trim() || null,
        demoUrl: demoUrl?.trim() || null,
        docsUrl: docsUrl?.trim() || null,
        videoUrl: videoUrl?.trim() || null,
        icon: icon?.trim() || null,
        builtWith: Array.isArray(builtWith) ? builtWith.slice(0, 10) : [],
        status: "SUBMITTED",
        authorId: session.user.id,
      },
    });

    return NextResponse.json({ success: true, app: { id: app.id, slug: app.slug } });
  } catch (error) {
    console.error("Apps POST error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}

// GET - List approved/featured apps
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sort = searchParams.get("sort") || "popular";
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20")));

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {
      status: { in: ["APPROVED", "FEATURED", "SUBMITTED"] },
    };

    if (category && VALID_CATEGORIES.includes(category as typeof VALID_CATEGORIES[number])) {
      where.category = category;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { tagline: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    let orderBy;
    if (sort === "newest") {
      orderBy = { createdAt: "desc" as const };
    } else if (sort === "featured") {
      orderBy = [{ featured: "desc" as const }, { upvoteCount: "desc" as const }];
    } else {
      orderBy = { upvoteCount: "desc" as const };
    }

    const [apps, total] = await Promise.all([
      prisma.app.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          name: true,
          slug: true,
          tagline: true,
          category: true,
          appType: true,
          fhirResources: true,
          fhirVersion: true,
          repoUrl: true,
          demoUrl: true,
          icon: true,
          videoUrl: true,
          status: true,
          featured: true,
          upvoteCount: true,
          builtWith: true,
          createdAt: true,
          author: {
            select: {
              id: true,
              name: true,
              image: true,
              persona: true,
            },
          },
        },
      }),
      prisma.app.count({ where }),
    ]);

    return NextResponse.json({ apps, total, page, limit });
  } catch (error) {
    console.error("Apps GET error:", error);
    return NextResponse.json({ apps: [], total: 0, page: 1, limit: 20 });
  }
}
