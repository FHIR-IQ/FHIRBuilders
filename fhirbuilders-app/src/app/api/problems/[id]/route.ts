import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const problem = await prisma.clinicalProblem.findUnique({ where: { id } });
    if (!problem) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ problem });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}

// PATCH — link a project to a problem
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { projectId } = await request.json();

    const problem = await prisma.clinicalProblem.findUnique({ where: { id } });
    if (!problem) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const linked = problem.linkedProjects.includes(projectId)
      ? problem.linkedProjects
      : [...problem.linkedProjects, projectId];

    const updated = await prisma.clinicalProblem.update({
      where: { id },
      data: {
        linkedProjects: linked,
        status: linked.length > 0 ? "being-built" : problem.status,
      },
    });

    return NextResponse.json({ problem: updated });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
