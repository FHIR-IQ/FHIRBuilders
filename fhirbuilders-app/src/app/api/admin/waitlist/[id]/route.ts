import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminAuth } from "@/lib/admin-auth";

// PATCH - Update a waitlist entry (ADMIN ONLY)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Verify admin authentication
  const authResult = await requireAdminAuth();
  if (!authResult.success) {
    return authResult.response;
  }

  try {
    const { id } = await params;
    const body = await request.json();

    // Allowed fields to update
    const allowedFields = [
      "status",
      "notes",
      "sandboxCreated",
      "welcomeEmailSent",
      "interviewCompleted",
      "feedbackReceived",
    ];

    // Filter to only allowed fields
    const updateData: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      );
    }

    const updated = await prisma.waitlist.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, entry: updated });
  } catch (error) {
    console.error("Admin waitlist PATCH error:", error);
    return NextResponse.json(
      { error: "Failed to update waitlist entry" },
      { status: 500 }
    );
  }
}

// GET - Get a single waitlist entry (ADMIN ONLY)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Verify admin authentication
  const authResult = await requireAdminAuth();
  if (!authResult.success) {
    return authResult.response;
  }

  try {
    const { id } = await params;
    const entry = await prisma.waitlist.findUnique({
      where: { id },
    });

    if (!entry) {
      return NextResponse.json(
        { error: "Entry not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ entry });
  } catch (error) {
    console.error("Admin waitlist GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch waitlist entry" },
      { status: 500 }
    );
  }
}

// DELETE - Remove a waitlist entry (ADMIN ONLY)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Verify admin authentication
  const authResult = await requireAdminAuth();
  if (!authResult.success) {
    return authResult.response;
  }

  try {
    const { id } = await params;
    await prisma.waitlist.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin waitlist DELETE error:", error);
    return NextResponse.json(
      { error: "Failed to delete waitlist entry" },
      { status: 500 }
    );
  }
}
