import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Persona } from "@prisma/client";

// GET - Fetch current user's profile
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        bio: true,
        persona: true,
        skills: true,
        interests: true,
        lookingFor: true,
        githubUsername: true,
        huggingfaceUsername: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Profile GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH - Update user profile
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      bio,
      persona,
      skills,
      interests,
      lookingFor,
      githubUsername,
      huggingfaceUsername,
    } = body;

    // Build update data with validation
    const updateData: Record<string, unknown> = {};

    // Validate and set name
    if (name !== undefined) {
      if (typeof name !== "string") {
        return NextResponse.json(
          { error: "Name must be a string" },
          { status: 400 }
        );
      }
      const trimmedName = name.trim();
      if (trimmedName.length < 1) {
        return NextResponse.json(
          { error: "Name cannot be empty" },
          { status: 400 }
        );
      }
      if (trimmedName.length > 100) {
        return NextResponse.json(
          { error: "Name must be 100 characters or less" },
          { status: 400 }
        );
      }
      updateData.name = trimmedName;
    }

    // Validate and set bio
    if (bio !== undefined) {
      if (typeof bio !== "string") {
        return NextResponse.json(
          { error: "Bio must be a string" },
          { status: 400 }
        );
      }
      if (bio.length > 500) {
        return NextResponse.json(
          { error: "Bio must be 500 characters or less" },
          { status: 400 }
        );
      }
      updateData.bio = bio.trim() || null;
    }

    // Validate and set persona
    if (persona !== undefined) {
      const validPersonas = Object.values(Persona);
      if (!validPersonas.includes(persona)) {
        return NextResponse.json(
          { error: "Invalid persona" },
          { status: 400 }
        );
      }
      updateData.persona = persona;
    }

    // Validate and set skills array
    if (skills !== undefined) {
      if (!Array.isArray(skills)) {
        return NextResponse.json(
          { error: "Skills must be an array" },
          { status: 400 }
        );
      }
      if (!skills.every((s) => typeof s === "string")) {
        return NextResponse.json(
          { error: "All skills must be strings" },
          { status: 400 }
        );
      }
      if (skills.length > 20) {
        return NextResponse.json(
          { error: "Maximum 20 skills allowed" },
          { status: 400 }
        );
      }
      updateData.skills = skills
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(0, 20);
    }

    // Validate and set interests array
    if (interests !== undefined) {
      if (!Array.isArray(interests)) {
        return NextResponse.json(
          { error: "Interests must be an array" },
          { status: 400 }
        );
      }
      if (!interests.every((i) => typeof i === "string")) {
        return NextResponse.json(
          { error: "All interests must be strings" },
          { status: 400 }
        );
      }
      if (interests.length > 20) {
        return NextResponse.json(
          { error: "Maximum 20 interests allowed" },
          { status: 400 }
        );
      }
      updateData.interests = interests
        .map((i) => i.trim())
        .filter(Boolean)
        .slice(0, 20);
    }

    // Validate and set lookingFor array
    if (lookingFor !== undefined) {
      if (!Array.isArray(lookingFor)) {
        return NextResponse.json(
          { error: "lookingFor must be an array" },
          { status: 400 }
        );
      }
      if (!lookingFor.every((l) => typeof l === "string")) {
        return NextResponse.json(
          { error: "All lookingFor items must be strings" },
          { status: 400 }
        );
      }
      if (lookingFor.length > 10) {
        return NextResponse.json(
          { error: "Maximum 10 lookingFor items allowed" },
          { status: 400 }
        );
      }
      updateData.lookingFor = lookingFor
        .map((l) => l.trim())
        .filter(Boolean)
        .slice(0, 10);
    }

    // Validate and set githubUsername
    if (githubUsername !== undefined) {
      if (githubUsername !== null && typeof githubUsername !== "string") {
        return NextResponse.json(
          { error: "GitHub username must be a string" },
          { status: 400 }
        );
      }
      updateData.githubUsername =
        typeof githubUsername === "string"
          ? githubUsername.trim() || null
          : null;
    }

    // Validate and set huggingfaceUsername
    if (huggingfaceUsername !== undefined) {
      if (
        huggingfaceUsername !== null &&
        typeof huggingfaceUsername !== "string"
      ) {
        return NextResponse.json(
          { error: "Hugging Face username must be a string" },
          { status: 400 }
        );
      }
      updateData.huggingfaceUsername =
        typeof huggingfaceUsername === "string"
          ? huggingfaceUsername.trim() || null
          : null;
    }

    // Check if there's anything to update
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      );
    }

    // Perform the update
    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        bio: true,
        persona: true,
        skills: true,
        interests: true,
        lookingFor: true,
        githubUsername: true,
        huggingfaceUsername: true,
      },
    });

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Profile PATCH error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
