import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST — increment support count ("me too")
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const problem = await prisma.clinicalProblem.update({
      where: { id },
      data: { supportCount: { increment: 1 } },
      select: { id: true, supportCount: true },
    });
    return NextResponse.json({ supportCount: problem.supportCount });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
