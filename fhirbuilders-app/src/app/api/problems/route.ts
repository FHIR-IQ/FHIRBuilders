import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET — list all clinical problems
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sort = searchParams.get("sort") || "newest";
    const category = searchParams.get("category") || "";
    const status = searchParams.get("status") || "";

    const where: Record<string, unknown> = {};
    if (category && category !== "All") where.category = category;
    if (status && status !== "All") {
      where.status = status === "Unclaimed" ? "unclaimed" : status === "Being Built" ? "being-built" : "solved";
    }

    const orderBy =
      sort === "popular"
        ? { supportCount: "desc" as const }
        : sort === "urgent"
        ? { createdAt: "asc" as const }
        : { createdAt: "desc" as const };

    const problems = await prisma.clinicalProblem.findMany({
      where,
      orderBy,
    });

    return NextResponse.json({ problems });
  } catch (error) {
    console.error("Problems GET error:", error);
    return NextResponse.json({ problems: [] });
  }
}

// POST — submit a new clinical problem
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      description,
      category,
      affectedRoles,
      frequency,
      postedByRole,
      contactEmail,
      willingToAdvise,
    } = body;

    if (!title || !description || !category || !postedByRole) {
      return NextResponse.json(
        { error: "Title, description, category, and your role are required" },
        { status: 400 }
      );
    }

    if (title.length > 80) {
      return NextResponse.json(
        { error: "Title must be 80 characters or fewer" },
        { status: 400 }
      );
    }

    const problem = await prisma.clinicalProblem.create({
      data: {
        title: title.trim(),
        description: description.trim(),
        category: category.trim(),
        affectedRoles: Array.isArray(affectedRoles) ? affectedRoles : [],
        frequency: frequency?.trim() || null,
        postedByRole: postedByRole.trim(),
        contactEmail: contactEmail?.trim() || null,
        willingToAdvise: !!willingToAdvise,
      },
    });

    return NextResponse.json({ success: true, problem });
  } catch (error) {
    console.error("Problems POST error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
