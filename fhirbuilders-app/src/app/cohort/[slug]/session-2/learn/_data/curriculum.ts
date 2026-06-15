export type DocLink = { label: string; href: string };

export type Example = {
  title: string;
  lang: "bash" | "typescript" | "python" | "markdown" | "json" | "text";
  code: string;
  note?: string;
};

export type FAQ = { q: string; a: string };

export type CurriculumBlock = {
  id: string;
  n: number;
  title: string;
  objectives: [string, string];
  faq: [FAQ, FAQ, FAQ];
  examples: [Example, Example];
  tryIt: string;
  docs: DocLink[];
};

export const CURRICULUM: CurriculumBlock[] = [
  {
    id: "mcp-protocol",
    n: 1,
    title: "MCP Protocol — How It Actually Works",
    objectives: [
      "Explain what an MCP server exposes and why CC can use it without you writing fetch() calls.",
      "Distinguish between stdio transport (local) and SSE transport (remote/hosted).",
    ],
    faq: [
      {
        q: "What does MCP give me that a regular API call doesn't?",
        a: "A regular API call is code you write and ship. An MCP tool is something Claude Code calls live, mid-conversation, as part of reasoning — no code to write, no deploy cycle. When you add a Medplum MCP server, CC can search patients, fetch observations, and read clinical notes as natural tool calls while helping you build. The protocol handles schema, auth, and error handling; you just wire it once.",
      },
      {
        q: "What's the difference between stdio and SSE MCP servers?",
        a: "Stdio servers run as a subprocess on your local machine — CC spawns the process, talks to it over stdin/stdout. They're the default for local dev tools (filesystem, GitHub, Supabase CLI). SSE (Server-Sent Events) servers run remotely over HTTP — you give CC a URL and it connects. Remote MCP servers let you share a single server across a team or deploy one on Railway. For FHIR in production, SSE is the right model.",
      },
      {
        q: "How does CC know what tools an MCP server provides?",
        a: "On connection, CC asks the server to list its tools. Each tool has a name, a description, and a JSON Schema for its parameters. CC uses the description to decide when to call it and the schema to know what to pass. A well-written tool description is the key to CC using it correctly — 'search_patients(query: string)' is worse than 'Search patients by name, DOB, or MRN. Returns FHIR Patient bundle.'",
      },
    ],
    examples: [
      {
        title: "Add an MCP server and see its tools",
        lang: "bash",
        code: `# Add the official Supabase MCP server:
claude mcp add supabase

# List all configured MCP servers:
claude mcp list
# supabase   stdio   ✓ connected (12 tools)
# github     stdio   ✓ connected (8 tools)

# Inside a CC session, ask what tools are available:
# "What can you do with Supabase right now?"
# CC lists: query, insert, update, list_tables, run_migration...`,
      },
      {
        title: "Inspect what a tool actually sends over the wire",
        lang: "json",
        code: `// When CC calls an MCP tool, it sends:
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "search_patients",
    "arguments": {
      "query": "Smith",
      "count": 10
    }
  }
}

// The server responds:
{
  "result": {
    "content": [
      { "type": "text", "text": "[{\"resourceType\":\"Patient\",\"id\":\"p123\",...}]" }
    ]
  }
}`,
        note: "CC handles this exchange transparently — you only see the result in the conversation.",
      },
    ],
    tryIt:
      "Run `claude mcp list` in your terminal. If you have no servers, add one: `claude mcp add github`. Then open a CC session and ask 'What GitHub tools do you have?' — CC should list them from the server's schema.",
    docs: [
      { label: "MCP introduction", href: "https://modelcontextprotocol.io/introduction" },
      { label: "Claude Code + MCP", href: "https://docs.anthropic.com/en/docs/claude-code/mcp" },
      { label: "MCP spec", href: "https://spec.modelcontextprotocol.io" },
    ],
  },
  {
    id: "first-mcp-server",
    n: 2,
    title: "Build Your First MCP Server in 15 Minutes",
    objectives: [
      "Scaffold a working MCP server with one FHIR tool using FastMCP (Python) or the TypeScript SDK.",
      "Connect it to Claude Code locally via stdio and call it from a CC session.",
    ],
    faq: [
      {
        q: "Python or TypeScript for an MCP server?",
        a: "Python with FastMCP is the fastest path to a working server — decorators handle the schema, the library handles the protocol. TypeScript with @modelcontextprotocol/sdk is better if your FHIR logic is already in Node (e.g., calling Medplum's JS client). For Session 2, start with whichever language you're faster in. Both work identically from CC's perspective.",
      },
      {
        q: "Does my MCP server need to be deployed to work with CC?",
        a: "No — for local development, CC spawns it as a subprocess over stdio. Your server lives on your machine, CC starts it when it needs it, and it exits when CC exits. You only need to deploy (Railway, Fly.io, etc.) when you want to share it across machines or team members. Local stdio is the right default for building and testing.",
      },
      {
        q: "How do I handle auth in an MCP server that calls a FHIR API?",
        a: "Read credentials from environment variables — never hardcode them. In your server code, read process.env.MEDPLUM_CLIENT_SECRET (Node) or os.environ['MEDPLUM_CLIENT_SECRET'] (Python). CC reads your .env.local when it starts, so those vars are available in subprocesses it spawns. Add the var to your .claude/settings.json env block to guarantee it's passed to the MCP subprocess.",
      },
    ],
    examples: [
      {
        title: "Minimal FHIR MCP server with FastMCP (Python)",
        lang: "python",
        code: `# pip install fastmcp httpx
# server.py

import os
import httpx
from fastmcp import FastMCP

mcp = FastMCP("fhir-server")

MEDPLUM_URL = os.environ.get("MEDPLUM_BASE_URL", "https://api.medplum.com")
TOKEN = os.environ.get("MEDPLUM_ACCESS_TOKEN", "")

@mcp.tool()
async def search_patients(name: str, count: int = 10) -> str:
    """Search FHIR patients by name. Returns a JSON array of Patient resources."""
    async with httpx.AsyncClient() as client:
        r = await client.get(
            f"{MEDPLUM_URL}/fhir/R4/Patient",
            params={"name": name, "_count": count},
            headers={"Authorization": f"Bearer {TOKEN}"},
        )
        r.raise_for_status()
        return r.text

if __name__ == "__main__":
    mcp.run()`,
        note: "Save as server.py. Register with: claude mcp add fhir -- python server.py",
      },
      {
        title: "TypeScript MCP server with @modelcontextprotocol/sdk",
        lang: "typescript",
        code: `// npm install @modelcontextprotocol/sdk @medplum/core
// server.ts

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { MedplumClient } from "@medplum/core";

const medplum = new MedplumClient({ baseUrl: process.env.MEDPLUM_BASE_URL! });
await medplum.startClientLogin(
  process.env.MEDPLUM_CLIENT_ID!,
  process.env.MEDPLUM_CLIENT_SECRET!
);

const server = new Server({ name: "fhir-server", version: "1.0.0" }, {
  capabilities: { tools: {} },
});

server.setRequestHandler("tools/list", async () => ({
  tools: [{
    name: "search_patients",
    description: "Search FHIR patients by name, DOB, or MRN.",
    inputSchema: {
      type: "object",
      properties: { query: { type: "string" } },
      required: ["query"],
    },
  }],
}));

server.setRequestHandler("tools/call", async (req) => {
  const bundle = await medplum.search("Patient", req.params.arguments.query);
  return { content: [{ type: "text", text: JSON.stringify(bundle) }] };
});

await server.connect(new StdioServerTransport());`,
      },
    ],
    tryIt:
      "Pick Python or TypeScript and build the minimal FHIR search server above. Register it with `claude mcp add fhir -- python server.py` (or `-- npx tsx server.ts`). Then ask CC: 'Search for patients named Smith' and verify it calls your server.",
    docs: [
      { label: "FastMCP (Python)", href: "https://github.com/jlowin/fastmcp" },
      { label: "MCP TypeScript SDK", href: "https://github.com/modelcontextprotocol/typescript-sdk" },
      { label: "MCP server examples", href: "https://github.com/modelcontextprotocol/servers" },
      { label: "Medplum JS client", href: "https://www.medplum.com/docs/sdk/overview" },
    ],
  },
  {
    id: "fhir-mcp-tools",
    n: 3,
    title: "FHIR as Live Tools — Medplum MCP",
    objectives: [
      "Add the Medplum FHIR server to CC and use it to read Patient and Observation resources in a session.",
      "Write a CC prompt that retrieves a patient's labs and summarizes trends without writing any fetch() code.",
    ],
    faq: [
      {
        q: "What FHIR resources should I expose as MCP tools?",
        a: "Start with the resources your app actually uses. For most Session 2 projects: Patient (identity + demographics), Observation (vitals, labs), Condition (diagnoses), MedicationRequest (prescriptions), DocumentReference (clinical notes). Don't expose everything — a smaller, well-described tool set outperforms a complete but noisy one. CC picks better tools when there are fewer to choose from.",
      },
      {
        q: "How is this different from CC just reading my Medplum API code?",
        a: "When CC reads your API code, it knows how to write more code that calls Medplum. When you give CC an MCP tool, it can call Medplum live, during the conversation, and use the real data in its reasoning. For a debugging session: 'The patient's potassium is 2.8 mEq/L in the last lab' is far more useful than 'here's how to write the fetch call to get that value.'",
      },
      {
        q: "My Medplum sandbox has demo patients. How do I seed realistic data?",
        a: "Two options: (1) Use Medplum's built-in synthetic patient generator in the admin console (Project → Bots → seed-synthea). (2) Run Synthea locally (Block 8 in this guide) and POST the output Bundle to your Medplum instance. Realistic data — with multiple visits, lab trends, and medication changes — makes MCP tools and vector search dramatically more useful than single-resource demo data.",
      },
    ],
    examples: [
      {
        title: "Query patient labs via MCP in a CC session",
        lang: "text",
        code: `# After adding your FHIR MCP server, ask CC:

"Find patient John Smith (DOB 1975-03-14) and show me his
 potassium and creatinine trend over the last 6 months."

# CC calls: search_patients(name="John Smith")
# CC calls: get_observations(patientId="p123", code="2823-3", date="ge2025-12-01")
# CC calls: get_observations(patientId="p123", code="2160-0", date="ge2025-12-01")

# CC responds:
# Potassium trend: 4.1 → 3.8 → 3.2 → 2.8 mEq/L (declining — flag for review)
# Creatinine trend: 0.9 → 1.1 → 1.4 mg/dL (rising — possible CKD progression)`,
        note: "No fetch() written. CC reasoned over live FHIR data via your MCP tools.",
      },
      {
        title: "Register the FHIR server in CC settings",
        lang: "json",
        code: `// .claude/settings.json
{
  "mcpServers": {
    "fhir": {
      "command": "python",
      "args": ["./mcp-servers/fhir/server.py"],
      "env": {
        "MEDPLUM_BASE_URL": "https://api.medplum.com",
        "MEDPLUM_ACCESS_TOKEN": ""
      }
    }
  }
}`,
        note: "Leave the token value empty in settings.json — read it from .env.local instead. CC merges both.",
      },
    ],
    tryIt:
      "Ask CC to use your FHIR MCP server to answer a clinical question about a patient in your sandbox. Try: 'What conditions does [patient name] have and when were they diagnosed?' If CC calls your tools, the integration works.",
    docs: [
      { label: "Medplum FHIR API", href: "https://www.medplum.com/docs/api/fhir" },
      { label: "FHIR R4 search parameters", href: "https://www.hl7.org/fhir/search.html" },
      { label: "LOINC codes (lab codes)", href: "https://loinc.org/search/" },
    ],
  },
  {
    id: "vector-db-concept",
    n: 4,
    title: "Vector Databases — The 3-Minute Concept",
    objectives: [
      "Explain what an embedding is and why semantic search beats keyword search for clinical text.",
      "Name the three operations in every vector DB workflow: embed, store, search.",
    ],
    faq: [
      {
        q: "What's an embedding and why does it matter for FHIR?",
        a: "An embedding is a list of numbers (a vector) that represents the meaning of a piece of text. Two pieces of text with similar meaning have vectors that are mathematically close to each other — even if they use completely different words. In clinical text, 'SOB' and 'shortness of breath' and 'dyspnea' all mean the same thing. Keyword search misses two of these; semantic search with embeddings finds all three.",
      },
      {
        q: "Which embedding model should I use?",
        a: "For getting started: OpenAI text-embedding-3-small — fast, cheap ($0.02/1M tokens), and works extremely well on clinical text. For a fully local/private option: nomic-embed-text via Ollama (no API key, no data leaves your machine — important for real PHI). Whichever you use, stay consistent — mixing embedding models in the same vector store breaks semantic search because the vector spaces are incompatible.",
      },
      {
        q: "When does vector search beat a FHIR search parameter?",
        a: "FHIR search parameters are perfect for structured data: 'give me all MedicationRequests for Patient/123 where status=active.' Vector search is better for unstructured text: 'find clinical notes that describe symptoms similar to acute pancreatitis.' The pattern in production: use FHIR search to get the structured data, vector search to reason over the free text. They're complementary, not competing.",
      },
    ],
    examples: [
      {
        title: "Embed a clinical note with OpenAI",
        lang: "typescript",
        code: `import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function embed(text: string): Promise<number[]> {
  const res = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text,
  });
  return res.data[0].embedding; // 1536-dimensional vector
}

// Embed a FHIR clinical note:
const note = "Patient presents with SOB, orthopnea, and bilateral leg edema. " +
             "Suspect decompensated CHF. BNP ordered.";

const vector = await embed(note);
console.log(vector.length); // 1536
// Store this vector alongside the note's DocumentReference ID`,
        note: "1536 floats per embedding at text-embedding-3-small. Costs ~$0.00002 per note.",
      },
      {
        title: "The three-step vector workflow",
        lang: "text",
        code: `STEP 1 — EMBED
  Take text (clinical note, FHIR Observation value, problem list)
  Call embedding API → get a vector (array of 1536 floats)
  Store: { id, text, vector, fhir_resource_id, patient_id }

STEP 2 — STORE
  Insert into pgvector (Supabase), Pinecone, Weaviate, or Chroma
  Index the vector column for fast ANN (approximate nearest neighbor) search

STEP 3 — SEARCH
  Take a user query: "chest pain with exertion"
  Embed it → get a query vector
  Find the top-K stored vectors with smallest cosine distance
  Return the matching texts/FHIR IDs

  SELECT id, text, 1 - (vector <=> $query_vec) AS similarity
  FROM clinical_notes
  ORDER BY vector <=> $query_vec
  LIMIT 10;`,
      },
    ],
    tryIt:
      "Call the OpenAI embeddings API with a clinical note from your Medplum sandbox (or a made-up one). Print the length of the returned array (should be 1536). You've created your first embedding.",
    docs: [
      { label: "OpenAI embeddings guide", href: "https://platform.openai.com/docs/guides/embeddings" },
      { label: "Nomic embed (local)", href: "https://ollama.com/library/nomic-embed-text" },
      { label: "Vector search explained", href: "https://www.pinecone.io/learn/vector-embeddings/" },
    ],
  },
  {
    id: "pgvector-supabase",
    n: 5,
    title: "pgvector + Supabase — Semantic FHIR Search",
    objectives: [
      "Enable the pgvector extension in Supabase and create a table for FHIR note embeddings.",
      "Write a semantic search query that finds clinically similar notes using cosine distance.",
    ],
    faq: [
      {
        q: "Why pgvector instead of a dedicated vector DB like Pinecone?",
        a: "pgvector runs inside your existing Postgres database — no new service to manage, no separate API key, no egress fees. For datasets under ~1M vectors, performance is excellent. Supabase bundles pgvector by default, so if you're already using Supabase for auth and app state, adding semantic search is just an extension + a column. Use Pinecone or Weaviate when you need multi-billion-vector scale or advanced filtering across many tenants.",
      },
      {
        q: "How do I handle vectors for different FHIR resource types?",
        a: "One approach: a single embeddings table with a resource_type column (Patient, Observation, DocumentReference, Condition) and a resource_id column pointing back to the FHIR ID. This lets you query across all resource types or filter by type. Another approach: a separate embeddings table per resource type. The single-table pattern is simpler to start and easier to query with Claude Code; you can always migrate later.",
      },
      {
        q: "How many tokens can I embed at once?",
        a: "text-embedding-3-small has an 8,191 token limit (~6,000 words). Most clinical notes fit comfortably. For longer documents (discharge summaries, full encounter transcripts), chunk first: split at paragraph or section boundaries, embed each chunk, and store each chunk with a reference to the parent document. When searching, retrieve the top-K chunks and reconstruct context from them.",
      },
    ],
    examples: [
      {
        title: "Create the embeddings table in Supabase",
        lang: "bash",
        code: `-- Run in Supabase SQL editor:

-- Enable pgvector extension (if not already enabled)
create extension if not exists vector;

-- Embeddings table for FHIR clinical notes
create table clinical_embeddings (
  id           uuid primary key default gen_random_uuid(),
  patient_id   text not null,
  resource_type text not null,      -- 'DocumentReference', 'Observation', etc.
  resource_id  text not null,       -- FHIR resource ID in Medplum
  content      text not null,       -- the text that was embedded
  embedding    vector(1536),        -- text-embedding-3-small dimension
  created_at   timestamptz default now()
);

-- HNSW index for fast approximate nearest neighbor search
create index on clinical_embeddings
  using hnsw (embedding vector_cosine_ops);`,
      },
      {
        title: "Insert and query embeddings from TypeScript",
        lang: "typescript",
        code: `import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);
const openai  = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function indexNote(patientId: string, resourceId: string, text: string) {
  const [{ embedding }] = (await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text,
  })).data;

  await supabase.from("clinical_embeddings").insert({
    patient_id: patientId,
    resource_type: "DocumentReference",
    resource_id: resourceId,
    content: text,
    embedding,
  });
}

async function semanticSearch(query: string, topK = 5) {
  const [{ embedding }] = (await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: query,
  })).data;

  const { data } = await supabase.rpc("match_notes", {
    query_embedding: embedding,
    match_count: topK,
  });
  return data; // array of { resource_id, content, similarity }
}`,
        note: "Create the match_notes RPC in Supabase SQL editor using <=> cosine distance operator.",
      },
    ],
    tryIt:
      "Enable the vector extension in your Supabase project (SQL editor → `create extension if not exists vector`). Create the clinical_embeddings table. Then insert one note embedding and run a cosine search. You should get back the note with similarity close to 1.0.",
    docs: [
      { label: "pgvector in Supabase", href: "https://supabase.com/docs/guides/ai/vector-columns" },
      { label: "Supabase AI & vectors", href: "https://supabase.com/docs/guides/ai" },
      { label: "pgvector README", href: "https://github.com/pgvector/pgvector" },
    ],
  },
  {
    id: "graphiti",
    n: 6,
    title: "Graphiti — Temporal Knowledge Graphs for Agents",
    objectives: [
      "Explain what a temporal knowledge graph adds over flat vector search for multi-visit clinical reasoning.",
      "Add Graphiti to a project and insert a patient timeline with at least two clinical episodes.",
    ],
    faq: [
      {
        q: "What's Graphiti and why is it different from a regular knowledge graph?",
        a: "Graphiti (by Zep) is an open-source library that builds knowledge graphs with time-aware edges. Every relationship has a valid_at and invalid_at timestamp. This matters enormously in healthcare: a patient's hypertension was diagnosed in 2019, their beta-blocker was started in 2021, and it was switched to a CCB in 2024. A regular graph stores all three as 'has medication'; Graphiti stores which was true when and how they relate causally.",
      },
      {
        q: "When should I use Graphiti instead of pgvector?",
        a: "Use pgvector when you need to find similar text fast — 'find notes similar to this presentation.' Use Graphiti when you need to reason over a patient's history as a connected timeline — 'what changed between the admission in March and the readmission in June, and which events preceded the deterioration?' Graphiti is better for agent memory and multi-visit reasoning; pgvector is better for similarity retrieval. In a production FHIR app, you'll likely use both.",
      },
      {
        q: "Does Graphiti need a separate database?",
        a: "Graphiti uses Neo4j as its graph backend by default. You can run Neo4j locally with Docker in under 2 minutes. Zep also offers a hosted Graphiti service if you'd rather not manage the graph DB. For the cohort, local Docker Neo4j is the fastest setup — one docker run command, and Graphiti connects to it automatically.",
      },
    ],
    examples: [
      {
        title: "Start Neo4j and init Graphiti",
        lang: "bash",
        code: `# Start Neo4j locally with Docker:
docker run -d \
  --name neo4j \
  -p 7474:7474 -p 7687:7687 \
  -e NEO4J_AUTH=neo4j/password \
  neo4j:latest

# Install Graphiti:
pip install graphiti-core

# Quick start script:
python -c "
from graphiti_core import Graphiti
import asyncio

async def main():
    g = Graphiti('bolt://localhost:7687', 'neo4j', 'password')
    await g.build_indices_and_constraints()
    print('Graphiti ready')

asyncio.run(main())
"`,
        note: "Neo4j browser at http://localhost:7474 — username: neo4j, password: password.",
      },
      {
        title: "Insert a patient timeline into Graphiti",
        lang: "python",
        code: `from graphiti_core import Graphiti
from graphiti_core.nodes import EpisodeType
from datetime import datetime

g = Graphiti("bolt://localhost:7687", "neo4j", "password")

# Add clinical episodes for patient p123
episodes = [
    {
        "name": "HTN Diagnosis",
        "episode_body": "Patient p123 diagnosed with essential hypertension. BP 158/94. Started lisinopril 10mg.",
        "source_description": "Encounter 2022-03-15",
        "reference_time": datetime(2022, 3, 15),
    },
    {
        "name": "CHF Diagnosis",
        "episode_body": "Patient p123 new CHF diagnosis. EF 35%. Added furosemide 40mg. Lisinopril dose increased to 20mg.",
        "source_description": "Encounter 2024-11-02",
        "reference_time": datetime(2024, 11, 2),
    },
]

for ep in episodes:
    await g.add_episode(
        name=ep["name"],
        episode_body=ep["episode_body"],
        source=EpisodeType.text,
        source_description=ep["source_description"],
        reference_time=ep["reference_time"],
    )

# Query the graph:
results = await g.search("What medications has patient p123 been on?")
for r in results:
    print(r.fact, r.valid_at)`,
        note: "Graphiti extracts entities and relationships from the episode text automatically using an LLM.",
      },
    ],
    tryIt:
      "Start Neo4j with Docker and run `pip install graphiti-core`. Add two clinical episodes for a patient — a diagnosis and a medication change. Query the graph for the patient's medication history. You should see both episodes with their timestamps.",
    docs: [
      { label: "Graphiti GitHub", href: "https://github.com/getzep/graphiti" },
      { label: "Graphiti docs", href: "https://help.getzep.com/graphiti" },
      { label: "Neo4j Docker", href: "https://neo4j.com/docs/operations-manual/current/docker/introduction/" },
    ],
  },
  {
    id: "karpathy-wiki",
    n: 7,
    title: "The Karpathy Wiki Pattern — LLM-Extracted Knowledge Graphs",
    objectives: [
      "Describe the pattern: feed unstructured text to an LLM → extract entities and edges → build a browsable knowledge graph.",
      "Adapt the FHIRBuilders wiki schema to represent clinical knowledge from FHIR resources.",
    ],
    faq: [
      {
        q: "What is the 'Karpathy wiki' pattern?",
        a: "Andrei Karpathy popularized the idea of using LLMs to read large text corpora and extract structured knowledge into a graph — nodes for concepts, edges for relationships, each with a confidence score and source citation. The result is a machine-readable, human-browsable knowledge base built from documents that were never designed to be structured. In healthcare: feed clinical notes, guidelines, and research abstracts → extract disease-drug-symptom relationships → build a navigable clinical knowledge graph.",
      },
      {
        q: "How is this different from RAG?",
        a: "RAG (Retrieval-Augmented Generation) retrieves relevant text chunks and hands them to the LLM at query time. The Karpathy wiki pattern pre-processes the corpus into a graph structure — entities, relationships, and confidence scores — so the knowledge is explorable without running a query. Both approaches are complementary: use RAG for 'find me notes similar to this presentation,' use the wiki graph for 'show me all the conditions that co-occur with CHF in this patient population.'",
      },
      {
        q: "The FHIRBuilders wiki is already built this way — how does it work?",
        a: "The FHIRBuilders wiki (lib/wiki/graph.ts) uses WikiNode objects (concept nodes with a slug, category, and status) and WikiEdge objects (directed relationships between nodes). A cron job reads Slack messages and clinical discussions, sends them to Claude, and extracts new nodes and edges. The app renders the graph at /wiki/graph. You can adapt this exact pattern for a patient population graph: nodes are conditions, medications, and lab values; edges are co-occurrences, causal relationships, and treatment responses.",
      },
    ],
    examples: [
      {
        title: "Extract a knowledge graph from clinical notes with Claude",
        lang: "typescript",
        code: `import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

async function extractGraph(clinicalNote: string) {
  const msg = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1024,
    messages: [{
      role: "user",
      content: \`Extract a knowledge graph from this clinical note.
Return JSON with { nodes: [{id, label, type}], edges: [{from, to, relation}] }.
Types: condition, medication, lab, symptom, procedure.

Clinical note:
\${clinicalNote}\`,
    }],
  });

  const text = msg.content[0].type === "text" ? msg.content[0].text : "";
  const jsonMatch = text.match(/\\{[\\s\\S]+\\}/);
  return jsonMatch ? JSON.parse(jsonMatch[0]) : null;
}

const note = \`Patient has Type 2 diabetes managed with metformin 1000mg BID.
HbA1c 7.8%. Recent fasting glucose 182. Started on semaglutide 0.5mg weekly.
Hypertension controlled on lisinopril 20mg. BMI 31.2.\`;

const graph = await extractGraph(note);
// { nodes: [{id:"dm2", label:"Type 2 Diabetes", type:"condition"}, ...],
//   edges: [{from:"dm2", to:"metformin", relation:"treated_by"}, ...] }`,
      },
      {
        title: "FHIRBuilders wiki schema adapted for clinical knowledge",
        lang: "typescript",
        code: `// Adapting lib/wiki/graph.ts for a clinical knowledge graph

type ClinicalNode = {
  id: string;
  label: string;
  type: "condition" | "medication" | "lab" | "symptom" | "procedure";
  icd10?: string;
  loinc?: string;
  rxnorm?: string;
  patientCount?: number;  // how many patients in your cohort have this
  status: "stable" | "emerging" | "deprecated";
};

type ClinicalEdge = {
  from: string;
  to: string;
  relation:
    | "treated_by"
    | "indicates"
    | "complicates"
    | "co_occurs_with"
    | "contraindicates";
  confidence: number;  // 0-1, based on evidence in source notes
  sourceIds: string[]; // FHIR DocumentReference IDs
};

// Build this graph incrementally:
// 1. For each new clinical note → extractGraph() → upsert nodes/edges
// 2. Render at /cohort/[slug]/lab or a dedicated /graph route
// 3. Query it: "What conditions co-occur with CHF in your patient data?"`,
      },
    ],
    tryIt:
      "Copy the extractGraph() function above. Run it on a clinical note from your Medplum sandbox (or write a synthetic one). Print the resulting nodes and edges. Try two different notes and merge the graphs — what shared nodes appear?",
    docs: [
      { label: "FHIRBuilders wiki source", href: "https://github.com/FHIR-IQ/FHIRBuilders/blob/main/fhirbuilders-app/src/lib/wiki/graph.ts" },
      { label: "Claude claude-haiku-4-5-20251001 (fast extraction)", href: "https://docs.anthropic.com/en/docs/about-claude/models/overview" },
      { label: "Karpathy on knowledge graphs", href: "https://x.com/karpathy" },
    ],
  },
  {
    id: "synthea",
    n: 8,
    title: "Synthea — Realistic Synthetic FHIR Patients",
    objectives: [
      "Generate a cohort of synthetic patients with Synthea and load them into Medplum.",
      "Seed your pgvector table with embedded clinical notes from the synthetic patient bundle.",
    ],
    faq: [
      {
        q: "What is Synthea and why does it matter?",
        a: "Synthea is an open-source synthetic patient generator that produces realistic, clinically coherent FHIR R4 Bundles. Each patient has a complete longitudinal record: birth → childhood vaccinations → adult conditions → medications → encounters → death if applicable. Unlike stub data, Synthea patients have plausible lab trends, medication interactions, and comorbidity patterns — which makes your MCP tools, vector search, and knowledge graph actually interesting to query.",
      },
      {
        q: "How do I load Synthea output into Medplum?",
        a: "Synthea outputs JSON files, one Bundle per patient. POST each Bundle to your Medplum instance at /fhir/R4 (the transaction endpoint). Medplum processes the Bundle transactionally — all resources in one patient's file land atomically. Use Medplum's bulk import CLI for large cohorts: `medplum bulk-upload --format ndjson ./synthea-output/`. For small tests (10–50 patients), a simple Node script that POSTs each file works fine.",
      },
      {
        q: "Which Synthea modules produce the most useful FHIR data for my app?",
        a: "Synthea ships with disease modules that control which conditions get generated. Relevant FHIR modules: `heart_disease.json` (CHF, CAD, hypertension), `diabetes.json` (T2DM with lab trends), `asthma.json`, `copd.json`, `chronic_kidney_disease.json`. Generate with: `./run_synthea -m heart_disease diabetes -p 100 Massachusetts` — this produces 100 patients in MA with cardiac and metabolic conditions. The lab values follow realistic trends, making time-series analysis actually meaningful.",
      },
    ],
    examples: [
      {
        title: "Generate patients and load into Medplum",
        lang: "bash",
        code: `# Requires Java 11+
# Download: https://github.com/synthetichealth/synthea/releases

# Generate 20 patients in Boston with heart disease + diabetes:
java -jar synthea-with-dependencies.jar \
  -p 20 \
  -m heart_disease,diabetes \
  Massachusetts "Boston"

# Output is in ./output/fhir/ — one Bundle.json per patient

# Load into Medplum using the Medplum CLI:
npm install -g @medplum/cli
medplum login
medplum bulk-upload --format bundle ./output/fhir/

# Verify in Medplum console:
medplum get Patient?_count=5`,
      },
      {
        title: "Seed pgvector with Synthea clinical notes",
        lang: "typescript",
        code: `import { MedplumClient } from "@medplum/core";
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";

const medplum = new MedplumClient({ baseUrl: process.env.MEDPLUM_BASE_URL! });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);

async function seedVectorStore() {
  // Get all clinical notes from Medplum
  const bundle = await medplum.search("DocumentReference", "_count=100");

  for (const doc of bundle.entry ?? []) {
    const ref = doc.resource as fhir4.DocumentReference;
    const content = ref.content?.[0]?.attachment?.data;
    if (!content) continue;

    const text = atob(content); // base64 decode
    const patientId = ref.subject?.reference?.split("/")[1] ?? "";

    // Embed and store
    const [{ embedding }] = (await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: text.slice(0, 8000), // stay under token limit
    })).data;

    await supabase.from("clinical_embeddings").insert({
      patient_id: patientId,
      resource_type: "DocumentReference",
      resource_id: ref.id,
      content: text,
      embedding,
    });
    console.log("indexed", ref.id);
  }
}

await seedVectorStore();`,
      },
    ],
    tryIt:
      "Generate 5–10 Synthea patients (`-p 10` flag). Load them into your Medplum sandbox. Then run the seed script to embed their clinical notes into pgvector. Query your vector store with a clinical phrase and confirm you get back relevant notes.",
    docs: [
      { label: "Synthea GitHub", href: "https://github.com/synthetichealth/synthea" },
      { label: "Synthea disease modules", href: "https://github.com/synthetichealth/synthea/wiki/Module-Builder" },
      { label: "Medplum bulk import", href: "https://www.medplum.com/docs/app/bulk-import" },
    ],
  },
  {
    id: "rag-clinical",
    n: 9,
    title: "RAG for Clinical Text — The Full Pipeline",
    objectives: [
      "Build a complete RAG pipeline: FHIR notes → chunk → embed → pgvector → retrieve → Claude.",
      "Write a CC prompt that uses your vector store to answer a clinical question about your patient population.",
    ],
    faq: [
      {
        q: "What does a RAG pipeline actually do step by step?",
        a: "Retrieval-Augmented Generation: (1) Ingestion — chunk your documents, embed each chunk, store in the vector DB. (2) Query — embed the user's question, find the top-K most similar chunks via cosine search, retrieve their text. (3) Generation — pass the retrieved chunks + the question to Claude as context, Claude generates an answer grounded in your actual documents rather than hallucinating. For clinical text, RAG dramatically reduces hallucination because Claude cites specific notes rather than inventing facts.",
      },
      {
        q: "How should I chunk FHIR clinical notes for best retrieval?",
        a: "For FHIR DocumentReference: chunk by section (Chief Complaint, Assessment, Plan are natural boundaries) rather than arbitrary character counts. For long encounter notes, 300–500 token chunks with 50-token overlaps between chunks work well — the overlap ensures you don't split a sentence across chunk boundaries and lose context. For Observation narratives, one observation per chunk is usually right. Always store the patientId and resourceId with each chunk so you can hydrate the full FHIR resource after retrieval.",
      },
      {
        q: "How do I stop RAG from returning irrelevant results?",
        a: "Two levers: (1) Similarity threshold — only return chunks above a minimum cosine similarity (0.75 is a reasonable start for clinical text). (2) Metadata filtering — filter by patient_id, date range, or resource_type before the vector search so you're only searching the relevant subset. In Supabase, pass these as filter conditions to your RPC alongside the query embedding. Never do a full-corpus search when you already know the patient — always filter by patient_id first.",
      },
    ],
    examples: [
      {
        title: "Complete RAG query pipeline in TypeScript",
        lang: "typescript",
        code: `import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";

const claude   = new Anthropic();
const openai   = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);

async function ragQuery(question: string, patientId?: string) {
  // 1. Embed the question
  const [{ embedding }] = (await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: question,
  })).data;

  // 2. Retrieve top-5 similar notes (optionally filtered by patient)
  const { data: chunks } = await supabase.rpc("match_notes", {
    query_embedding: embedding,
    match_count: 5,
    filter: patientId ? { patient_id: patientId } : undefined,
  });

  // 3. Build context string
  const context = chunks
    .map((c: any, i: number) => \`[Note \${i+1}] \${c.content}\`)
    .join("\n\n---\n\n");

  // 4. Generate answer with Claude
  const msg = await claude.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 512,
    messages: [{
      role: "user",
      content: \`Answer based only on these clinical notes. Cite [Note N] for each claim.

Notes:
\${context}

Question: \${question}\`,
    }],
  });

  return msg.content[0].type === "text" ? msg.content[0].text : "";
}

const answer = await ragQuery(
  "What heart failure medications is this patient on and when were they started?",
  "patient-123"
);
console.log(answer);`,
      },
      {
        title: "Add the RAG pipeline as an MCP tool",
        lang: "python",
        code: `# Wrap RAG as an MCP tool so CC can call it conversationally
from fastmcp import FastMCP
# (import your rag_query function from above)

mcp = FastMCP("clinical-rag")

@mcp.tool()
async def query_patient_notes(question: str, patient_id: str) -> str:
    """Answer a clinical question about a specific patient using their notes.
    Returns a cited answer grounded in the patient's documented history.
    patient_id: the FHIR Patient resource ID."""
    return await rag_query(question, patient_id)

if __name__ == "__main__":
    mcp.run()

# Now CC can call this live:
# "What does the patient's history say about their kidney function?"
# CC calls: query_patient_notes(question="kidney function", patient_id="p123")`,
        note: "Combine this with your FHIR MCP server from Block 3 — structured data + semantic search in one CC session.",
      },
    ],
    tryIt:
      "Run the ragQuery() function against your Synthea-seeded vector store. Ask a clinical question about heart failure or diabetes. Verify that the answer cites specific notes and sounds grounded rather than hallucinated. If similarity is too low, lower the threshold to 0.6 for testing.",
    docs: [
      { label: "Supabase vector search RPC", href: "https://supabase.com/docs/guides/ai/semantic-search" },
      { label: "Anthropic prompt caching (RAG optimization)", href: "https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching" },
      { label: "RAG best practices", href: "https://www.anthropic.com/research/rag" },
    ],
  },
  {
    id: "phi-before-embedding",
    n: 10,
    title: "Production Patterns — PHI Before It Hits the Vector Store",
    objectives: [
      "Apply HealthClawGuardrails PHI redaction to a clinical note before embedding it.",
      "Describe the two-tier pattern: raw FHIR in Medplum, redacted embeddings in pgvector.",
    ],
    faq: [
      {
        q: "Do I need to redact PHI before embedding?",
        a: "In production with real patient data: yes, absolutely. Embedding vectors can be reversed (approximately) using vector inversion attacks, and embedding APIs send your text to external servers. The safe pattern: raw FHIR resources stay in Medplum (your trusted FHIR store), redacted versions go to the embedding API and vector DB. For the cohort sandbox with Synthea synthetic data: no PHI, no real concern — but practice the pattern now so it's a habit when you touch real data.",
      },
      {
        q: "What does the HealthClawGuardrails redaction script actually do?",
        a: "The r6/redaction.py script (github.com/aks129/HealthClawGuardrails) strips: (1) names → initials, (2) SSN/MRN/insurance IDs → masked, (3) street addresses → city/state only, (4) birthdates → year only, (5) phone/fax numbers → removed, (6) email addresses → removed. What it preserves: clinical terms, diagnoses, lab values, medication names, dates relative to events. The result is a note that's clinically useful for semantic search but can't re-identify an individual.",
      },
      {
        q: "What's the two-tier data model for a production FHIR app?",
        a: "Tier 1 — FHIR server (Medplum): stores raw, identified FHIR resources. This is your source of truth. Access is controlled by SMART on FHIR scopes. Tier 2 — Vector store (pgvector): stores redacted text embeddings with pointers back to FHIR resource IDs. Never stores raw PHI. Semantic search queries hit tier 2; when a result needs to be shown to a clinician, you hydrate the full resource from tier 1 using the stored FHIR ID. This keeps your vector DB PHI-free while still enabling semantic search over clinical meaning.",
      },
    ],
    examples: [
      {
        title: "Redact a clinical note before embedding (Python)",
        lang: "python",
        code: `# From HealthClawGuardrails r6/redaction.py pattern:
# pip install presidio-analyzer presidio-anonymizer spacy
# python -m spacy download en_core_web_lg

from presidio_analyzer import AnalyzerEngine
from presidio_anonymizer import AnonymizerEngine

analyzer = AnalyzerEngine()
anonymizer = AnonymizerEngine()

def redact_for_embedding(clinical_text: str) -> str:
    """Strip PHI but preserve clinical meaning for semantic search."""
    results = analyzer.analyze(
        text=clinical_text,
        entities=["PERSON", "DATE_TIME", "LOCATION", "PHONE_NUMBER",
                  "EMAIL_ADDRESS", "US_SSN", "MEDICAL_LICENSE", "URL"],
        language="en",
    )
    redacted = anonymizer.anonymize(
        text=clinical_text,
        analyzer_results=results,
    )
    return redacted.text

# Use BEFORE embedding:
raw_note = """
John Smith (DOB: 03/14/1975, MRN: 847291) was seen on 2024-11-15.
Chief complaint: shortness of breath for 3 days.
Assessment: Decompensated CHF. BNP 1840. Started IV Lasix.
"""

safe_note = redact_for_embedding(raw_note)
# "[PERSON] (DOB: [DATE_TIME], MRN: [MEDICAL_LICENSE]) was seen on [DATE_TIME].
#  Chief complaint: shortness of breath for 3 days.
#  Assessment: Decompensated CHF. BNP 1840. Started IV Lasix."

# Now safe to embed and store in pgvector`,
      },
      {
        title: "Two-tier pipeline: raw FHIR → redact → embed → store",
        lang: "typescript",
        code: `// Full pipeline with PHI gate
async function ingestDocumentReference(doc: fhir4.DocumentReference) {
  const rawText = atob(doc.content?.[0]?.attachment?.data ?? "");
  const patientId = doc.subject?.reference?.split("/")[1] ?? "";

  // Step 1: Redact PHI (call Python redaction service or port to Node)
  const redactedText = await redactService.redact(rawText);

  // Step 2: Embed the REDACTED text (never the raw)
  const [{ embedding }] = (await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: redactedText,
  })).data;

  // Step 3: Store redacted text + embedding (no raw PHI in pgvector)
  await supabase.from("clinical_embeddings").insert({
    patient_id: patientId,
    resource_type: "DocumentReference",
    resource_id: doc.id,        // pointer back to Medplum
    content: redactedText,      // clinical meaning preserved
    embedding,
  });

  // Tier 1 (Medplum) has the raw note.
  // Tier 2 (pgvector) has the redacted embedding.
  // To show a clinician the full note: fetch doc.id from Medplum, not pgvector.
}`,
        note: "This pattern is required for any production deployment touching real PHI.",
      },
    ],
    tryIt:
      "Install `presidio-analyzer` and `presidio-anonymizer` (Python). Run the redact_for_embedding() function on a synthetic note containing a fake name, DOB, and address. Verify the output strips the identifiers but keeps the clinical terms (diagnoses, medications, lab values).",
    docs: [
      { label: "HealthClawGuardrails (PHI redaction)", href: "https://github.com/aks129/HealthClawGuardrails/blob/main/r6/redaction.py" },
      { label: "Microsoft Presidio", href: "https://microsoft.github.io/presidio/" },
      { label: "HIPAA safe harbor method", href: "https://www.hhs.gov/hipaa/for-professionals/privacy/special-topics/de-identification/index.html" },
      { label: "FHIRBuilders PHI FAQ", href: "https://fhirbuilders.com/faq#phi-records" },
    ],
  },
];
