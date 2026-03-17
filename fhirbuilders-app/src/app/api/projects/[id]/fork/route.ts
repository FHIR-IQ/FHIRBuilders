import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST - Increment fork count for a shared project
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const project = await prisma.sharedProject.update({
      where: { id },
      data: { forkCount: { increment: 1 } },
      select: { id: true, forkCount: true },
    });
    return NextResponse.json({ forkCount: project.forkCount });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
