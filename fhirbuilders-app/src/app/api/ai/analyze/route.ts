import { NextRequest, NextResponse } from "next/server";
import { analyzeMedicationsWithClaude } from "@/lib/ai-service";
import { MedicationResource } from "@/lib/medplum";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { medications, userApiKey } = body;

        if (!medications || !Array.isArray(medications)) {
            return NextResponse.json({ error: "Missing medications array" }, { status: 400 });
        }

        // Use user-provided key if available, otherwise fallback to system key
        const apiKey = userApiKey || process.env.ANTHROPIC_API_KEY;

        if (!apiKey) {
            return NextResponse.json(
                { error: "No Anthropic API key provided. Please set it in AI Settings (BYOAI)." },
                { status: 401 }
            );
        }

        const conflicts = await analyzeMedicationsWithClaude(medications as MedicationResource[], apiKey);

        return NextResponse.json({ conflicts });
    } catch (error: any) {
        console.error("AI Analysis Error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to analyze medications" },
            { status: 500 }
        );
    }
}
