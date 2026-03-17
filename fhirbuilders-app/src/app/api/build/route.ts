import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

const FHIR_SYSTEM_PROMPT = `You are an expert FHIR R4 application architect. When given a description of a healthcare application, you generate a complete, working Next.js TypeScript application that uses the Medplum FHIR SDK.

Your response MUST follow this exact format — output ONLY the file blocks below, nothing else:

FILE: package.json
\`\`\`json
{content}
\`\`\`

FILE: src/app/page.tsx
\`\`\`tsx
{content}
\`\`\`

(continue for all files)

Rules:
- Generate 8-14 files total
- Always include: package.json, tsconfig.json, src/app/layout.tsx, src/app/page.tsx, src/lib/fhir.ts
- Use @medplum/core for FHIR queries
- Use TypeScript strictly (no any)
- Use Tailwind CSS for styling
- Include realistic FHIR R4 resource types (Patient, Observation, MedicationRequest, Condition, Encounter, etc.)
- Make the code actually functional and deployable
- Add a README.md explaining what FHIR resources the app uses and how to connect it to a real endpoint
- At the very start, before FILE blocks, output exactly one line:
  DETECTED_RESOURCES: [comma-separated FHIR resource names used]
  ARTIFACT_TYPE: [one of: App, Agent, MCP Tool, CQL Measure]
  DESCRIPTION: [one sentence describing what this app does]`;

export async function POST(request: NextRequest) {
  const { prompt } = await request.json();

  if (!prompt || typeof prompt !== "string" || prompt.trim().length < 10) {
    return new Response(JSON.stringify({ error: "Prompt is required (min 10 chars)" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const response = await client.messages.create({
          model: "claude-sonnet-4-6",
          max_tokens: 8000,
          system: FHIR_SYSTEM_PROMPT,
          messages: [
            {
              role: "user",
              content: `Build this FHIR application: ${prompt.trim()}`,
            },
          ],
          stream: true,
        });

        for await (const event of response) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            const chunk = `data: ${JSON.stringify({ text: event.delta.text })}\n\n`;
            controller.enqueue(encoder.encode(chunk));
          }
        }

        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Generation failed";
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ error: msg })}\n\n`)
        );
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
