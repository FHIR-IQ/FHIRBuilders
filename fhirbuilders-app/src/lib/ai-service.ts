import Anthropic from "@anthropic-ai/sdk";
import { MedicationResource, MedConflict } from "./medplum";

const DEFAULT_PROMPT = `
You are a clinical pharmacist AI with expertise in FHIR R4 medication resources.

Analyze the following medication list for a patient and identify:
1. Potential drug-drug interactions.
2. Duplicate therapies (medications in the same class).
3. Potential allergies or sensitivities (if any are apparent).
4. Lab-medication conflicts (e.g., potassium-sparing drugs with high potassium labs).

Context:
- Medications are FHIR R4 MedicationRequest resources coded with RxNorm (http://www.nlm.nih.gov/research/umls/rxnorm)
- MedicationRequest.status values: active | on-hold | cancelled | completed | entered-in-error | stopped | draft | unknown
- Resource references use FHIR format: "MedicationRequest/{id}"
- Drug interaction findings align with FHIR DetectedIssue resource (severity: high | moderate | low)

Format your response as a JSON array of objects following this TypeScript interface:
interface MedConflict {
  id: string; // unique short ID like 'c1'
  type: "interaction" | "duplicate" | "allergy";
  severity: "high" | "moderate" | "low"; // FHIR DetectedIssue.severity
  description: string; // detailed clinical explanation
  resources: string[]; // FHIR references: e.g. "MedicationRequest/med-101"
  evidence?: string; // Clinical citation (e.g. "Beers Criteria", "ISMP High-Alert List")
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
        .map((m) => `- ${m.name} (${m.dosage}), ID: MedicationRequest/${m.id}${m.rxNormCode ? `, RxNorm: ${m.rxNormCode}` : ''}`)
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
