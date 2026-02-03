import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * Result type for admin authentication check.
 * Uses discriminated union for type-safe handling.
 */
export type AdminAuthResult =
  | { success: true; userId: string; role: "ADMIN" | "SUPER_ADMIN" }
  | { success: false; response: NextResponse };

/**
 * Validates that the current user is authenticated and has admin privileges.
 * Returns user info on success, or a ready-to-return error response on failure.
 *
 * @example
 * const authResult = await requireAdminAuth();
 * if (!authResult.success) {
 *   return authResult.response;
 * }
 * // Now authResult.userId and authResult.role are available
 */
export async function requireAdminAuth(): Promise<AdminAuthResult> {
  const session = await auth();

  // Check if user is authenticated
  if (!session?.user?.id) {
    return {
      success: false,
      response: NextResponse.json(
        { error: "Unauthorized. Please sign in." },
        { status: 401 }
      ),
    };
  }

  // Fetch the user's role from database to verify admin status
  // We query the database directly to ensure we have the latest role
  // (in case it was changed after the session was created)
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  if (!user) {
    return {
      success: false,
      response: NextResponse.json(
        { error: "User not found." },
        { status: 401 }
      ),
    };
  }

  // Check if user has admin privileges
  if (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
    return {
      success: false,
      response: NextResponse.json(
        { error: "Forbidden. Admin access required." },
        { status: 403 }
      ),
    };
  }

  return {
    success: true,
    userId: session.user.id,
    role: user.role as "ADMIN" | "SUPER_ADMIN",
  };
}
