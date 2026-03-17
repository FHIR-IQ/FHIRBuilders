/**
 * SKILL.md Generator API
 *
 * POST /api/openclaw/generate-skill
 * Generates a complete SKILL.md file from a structured form description.
 * Streams the response using Claude claude-sonnet-4-6.
 */

import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const SYSTEM_PROMPT = `You are a SKILL.md file generator for OpenClaw (https://openclaw.ai), the open-source local AI agent runtime with 310k+ GitHub stars.

OpenClaw skills are SKILL.md files with YAML frontmatter and natural-language instructions that teach the agent how to do something. The instructions are written for the LLM that powers the agent, not for a developer.

You are generating a FHIR-focused skill. The skill MUST:

1. Have complete YAML frontmatter in this exact format:
\`\`\`yaml
---
name: kebab-case-skill-name
description: One-line description (max 120 chars)
version: 1.0.0
author: Community
homepage: https://fhirbuilders.com/openclaw
metadata: {"openclaw":{"emoji":"🏥","tags":["fhir","relevant-tags"],"requires":{"env":["ENV_VAR_1","ENV_VAR_2"]},"primaryEnv":"MAIN_ENV_VAR"}}
---
\`\`\`

2. Have a clear, specific ## Configuration section explaining each required environment variable.

3. Have detailed natural-language ## Instructions or procedural sections that the agent will follow step-by-step. Be specific about:
   - Exact FHIR API calls (method, URL pattern, parameters)
   - FHIR resource fields to extract
   - LOINC codes for lab observations, SNOMED codes for conditions, RxNorm for medications
   - How to handle pagination (_count, _page)
   - Output formatting

4. Include at least 2 concrete ## Examples sections showing the skill in action with:
   - User message
   - What the agent queries
   - Formatted reply

5. Have a ## Error handling section covering common failures (401 auth, 404 not found, empty results).

6. If proactive (heartbeat): specify exact schedule in a ## Heartbeat schedule section, and include instructions for logging to HEARTBEAT.md.

FHIR knowledge to apply:
- Lab Observations use LOINC codes (system: http://loinc.org)
- Conditions use SNOMED CT (system: http://snomed.info/sct) or ICD-10
- Medications use RxNorm (system: http://www.nlm.nih.gov/research/umls/rxnorm)
- Auth header: Authorization: Bearer <token>
- FHIR date filter: _sort=-date, _count=N, date=gt<ISO>, date=lt<ISO>
- FHIR search includes: _include, _revinclude

Output ONLY the SKILL.md file content. No preamble, no explanation, no code fences wrapping the entire output.`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      taskDescription,
      fhirEndpoint,
      authMethod,
      fhirVersion,
      fhirResources,
      isProactive,
      schedule,
      userApiKey,
    } = body;

    if (!taskDescription?.trim()) {
      return new Response(
        JSON.stringify({ error: "Task description is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Resolve API key
    const apiKey = userApiKey?.trim() || process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({
          error: "No Anthropic API key available. Add your key to generate skills.",
          requiresApiKey: true,
        }),
        { status: 503, headers: { "Content-Type": "application/json" } }
      );
    }

    const anthropic = new Anthropic({ apiKey });

    const userPrompt = `Generate a complete SKILL.md for an OpenClaw agent skill with the following requirements:

**Task description:** ${taskDescription}

**FHIR endpoint:** ${fhirEndpoint || "Configurable via FHIR_BASE_URL env var"}
**Auth method:** ${authMethod || "Bearer token"}
**FHIR version:** ${fhirVersion || "R4"}
**Primary FHIR resources:** ${fhirResources?.length ? fhirResources.join(", ") : "As appropriate for the task"}
**Execution mode:** ${isProactive ? `Proactive (heartbeat) — schedule: ${schedule || "daily at 7am"}` : "Reactive (runs when user sends a message)"}

Generate a production-ready SKILL.md file for this skill.`;

    const stream = anthropic.messages.stream({
      model: "claude-sonnet-4-6",
      max_tokens: 4000,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userPrompt }],
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            if (
              chunk.type === "content_block_delta" &&
              chunk.delta.type === "text_delta"
            ) {
              controller.enqueue(encoder.encode(chunk.delta.text));
            }
          }
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("generate-skill error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error. Please try again." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
