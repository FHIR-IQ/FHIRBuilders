import Anthropic from "@anthropic-ai/sdk";
import { MedicationResource, MedConflict } from "./medplum";

const DEFAULT_PROMPT = `
You are a clinical pharmacist AI. Analyze the following medication list for a patient and identify:
1. Potential drug-drug interactions.
2. Duplicate therapies (medications in the same class).
3. Potential allergies or sensitivities (if any are apparent).
4. Lab-medication conflicts (e.g., potassium-sparing drugs with high potassium labs).

Format your response as a JSON array of objects following this TypeScript interface:
interface MedConflict {
  id: string; // unique short ID like 'c1'
  type: "interaction" | "duplicate" | "allergy";
  severity: "high" | "moderate" | "low";
  description: string; // detailed clinical explanation
  resources: string[]; // IDs of the medications involved
  evidence?: string; // Clinical citation or rule (e.g. "Beers Criteria")
}

Return ONLY the JSON array.
`;

export async function analyzeMedicationsWithClaude(
    medications: MedicationResource[],
    apiKey: string,
    model = "claude-3-5-sonnet-20241022"
): Promise<MedConflict[]> {
    const anthropic = new Anthropic({
        apiKey,
    });

    const medListString = medications
        .map((m) => `- ${m.name} (${m.dosage}), ID: ${m.id}`)
        .join("\n");

    const response = await anthropic.messages.create({
        model,
        max_tokens: 1024,
        messages: [
            {
                role: "user",
                content: `${DEFAULT_PROMPT}\n\nPatient Medication List:\n${medListString}`,
            },
        ],
    });

    const content = response.content[0];
    if (content.type !== "text") {
        throw new Error("Unexpected response from Anthropic");
    }

    try {
        // Attempt to extract JSON if Claude wrapped it in text
        const jsonMatch = content.text.match(/\[[\s\S]*\]/);
        const jsonStr = jsonMatch ? jsonMatch[0] : content.text;
        return JSON.parse(jsonStr) as MedConflict[];
    } catch (error) {
        console.error("Failed to parse Claude response:", content.text);
        throw new Error("Failed to parse AI response into clinical conflicts");
    }
}
