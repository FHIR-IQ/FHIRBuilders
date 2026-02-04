import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { applyRateLimit } from "@/lib/rate-limit";
import { analyzeMedicationsWithClaude } from "@/lib/ai-service";
import { MedicationResource, MedConflict } from "@/lib/medplum";

/**
 * Generate mock conflicts for demo when no API key is configured
 * or when user is not authenticated.
 */
function getMockConflicts(medications: MedicationResource[]): MedConflict[] {
  const conflicts: MedConflict[] = [];
  const findMed = (term: string) => medications.find((m) => m.name.toLowerCase().includes(term));
  const fhirRef = (id: string) => `MedicationRequest/${id}`;

  // Check for common known interactions
  const warfarin = findMed("warfarin");
  const aspirin = findMed("aspirin");
  if (warfarin && aspirin) {
    conflicts.push({
      id: "c1",
      type: "interaction",
      severity: "high",
      description:
        "Concurrent use of warfarin and aspirin significantly increases the risk of bleeding. Monitor INR closely and watch for signs of hemorrhage.",
      resources: [fhirRef(warfarin.id), fhirRef(aspirin.id)],
      evidence: "ISMP High-Alert Medication List",
    });
  }

  const lisinopril = findMed("lisinopril");
  const potassium = findMed("potassium");
  if (lisinopril && potassium) {
    conflicts.push({
      id: "c2",
      type: "interaction",
      severity: "moderate",
      description:
        "ACE inhibitors like lisinopril can increase potassium levels. Combined with potassium supplements, this raises risk of hyperkalemia.",
      resources: [fhirRef(lisinopril.id), fhirRef(potassium.id)],
      evidence: "Lexicomp Drug Interactions",
    });
  }

  // Generic duplicate therapy detection (HMG-CoA reductase inhibitors)
  const statins = medications.filter((m) =>
    ["atorvastatin", "simvastatin", "rosuvastatin", "pravastatin"].some(
      (s) => m.name.toLowerCase().includes(s)
    )
  );
  if (statins.length > 1) {
    conflicts.push({
      id: "c3",
      type: "duplicate",
      severity: "moderate",
      description: `Duplicate statin therapy detected: ${statins.map((s) => s.name).join(", ")}. Using multiple statins increases risk of myopathy and rhabdomyolysis.`,
      resources: statins.map((s) => fhirRef(s.id)),
      evidence: "ACC/AHA Lipid Guidelines",
    });
  }

  // Fallback if no specific conflicts found
  if (conflicts.length === 0 && medications.length >= 2) {
    conflicts.push({
      id: "c1",
      type: "interaction",
      severity: "low",
      description: `No critical interactions detected among ${medications.length} medications. This is a demo analysis — use AI-powered analysis for comprehensive clinical review.`,
      resources: medications.slice(0, 2).map((m) => fhirRef(m.id)),
    });
  }

  return conflicts;
}

export async function POST(req: NextRequest) {
  // Authentication (optional - anonymous users get mock data)
  const session = await auth();
  const isAuthenticated = !!session?.user?.id;

  // Rate limiting - stricter for anonymous
  const rateLimitResult = applyRateLimit(req, isAuthenticated ? "api" : "demoAnalyze");
  if (rateLimitResult) return rateLimitResult;

  try {
    const body = await req.json();
    const { medications } = body;

    if (!medications || !Array.isArray(medications)) {
      return NextResponse.json(
        { error: "Missing medications array" },
        { status: 400 }
      );
    }

    // Anonymous users always get mock data - no real Claude calls
    if (!isAuthenticated) {
      const conflicts = getMockConflicts(medications as MedicationResource[]);
      return NextResponse.json({
        conflicts,
        mock: true,
        message: "Demo mode: Sign in for AI-powered analysis.",
      });
    }

    // Authenticated users: use real API key if available, else mock
    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      const conflicts = getMockConflicts(medications as MedicationResource[]);
      return NextResponse.json({
        conflicts,
        mock: true,
        message: "Demo mode: AI key not configured. Showing sample analysis.",
      });
    }

    const conflicts = await analyzeMedicationsWithClaude(
      medications as MedicationResource[],
      apiKey
    );

    return NextResponse.json({ conflicts });
  } catch (error: unknown) {
    console.error("AI Analysis Error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to analyze medications";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
