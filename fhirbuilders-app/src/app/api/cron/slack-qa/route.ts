// Slack QA bot — runs every 2 hours, scans FHIRBuilders channels for unanswered
// questions, and posts AI answers in-thread. Covers both top-level messages and
// thread replies that haven't received a bot response yet.
//
// Channels scanned: help-build, all-fhir-builders, general
// Max answers per run: 5 (anti-spam guard)
// Look-back window: 2.5h (cron is 2h so there's 30min overlap)
//
// Auth: Vercel Cron sends `Authorization: Bearer <CRON_SECRET>`. In dev
// (no CRON_SECRET set), any caller is accepted for curl-testing.

import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

const SLACK_API = "https://slack.com/api";
const MAX_ANSWERS_PER_RUN = 5;
const LOOK_BACK_MS = 2.5 * 60 * 60 * 1000; // 2.5 hours

const TARGET_CHANNELS = ["help-build", "all-fhir-builders", "general"];

const SYSTEM_PROMPT = `You are a helpful assistant for FHIR IQ Cohort 00 — a cohort of healthcare builders learning to use Claude Code and build FHIR (Fast Healthcare Interoperability Resources) applications.

Builders are working on healthcare software projects using:
- Claude Code (AI-powered CLI coding tool by Anthropic, run via \`claude\` in terminal)
- FHIR R4 / US Core APIs and resources (Patient, Observation, Condition, MedicationRequest, etc.)
- Next.js, TypeScript, TailwindCSS, shadcn/ui
- Medplum (FHIR server / sandbox)
- Supabase, Vercel, GitHub, Resend

Common Claude Code issues:
- Always starts in wrong folder: \`cd /your/project && claude\` (CC uses current directory)
- Plugin install: run \`claude plugin marketplace add\` and \`claude plugin install\` in normal terminal, NOT inside a CC session
- Access rights errors: usually caused by being in the wrong directory; restart CC from the right folder
- \`claude update\` if any \`claude plugin\` command says "unknown command"
- CC sessions are per-project (keyed by working directory) — switching folders gives a fresh session

Answer guidelines:
- Be concise and practical — exact commands in backticks
- Slack markdown: *bold*, _italic_, \`code\`, \`\`\`code blocks\`\`\`
- Under 250 words
- If unsure, say so and suggest they post in #help-build for human help
- Don't use bullet-heavy formatting for simple answers — one clear paragraph is fine`;

type SlackMessage = {
  ts: string;
  thread_ts?: string;
  user?: string;
  bot_id?: string;
  text?: string;
  reply_count?: number;
  latest_reply?: string;
  subtype?: string;
  type: string;
};

async function slackGet<T>(method: string, params: Record<string, string>): Promise<T> {
  const token = process.env.SLACK_BOT_TOKEN;
  if (!token) throw new Error("SLACK_BOT_TOKEN not set");
  const q = new URLSearchParams(params).toString();
  const res = await fetch(`${SLACK_API}/${method}?${q}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  return (await res.json()) as T;
}

async function slackPost<T>(method: string, body: Record<string, unknown>): Promise<T> {
  const token = process.env.SLACK_BOT_TOKEN;
  if (!token) throw new Error("SLACK_BOT_TOKEN not set");
  const res = await fetch(`${SLACK_API}/${method}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  return (await res.json()) as T;
}

async function getBotUserId(): Promise<string | null> {
  type Resp = { ok: boolean; user_id?: string };
  const r = await slackGet<Resp>("auth.test", {});
  return r.ok ? (r.user_id ?? null) : null;
}

async function resolveChannelId(channel: string): Promise<string | null> {
  if (/^[CGD][A-Z0-9]+$/.test(channel)) return channel;
  type ListResp = {
    ok: boolean;
    channels?: Array<{ id: string; name: string }>;
    response_metadata?: { next_cursor?: string };
  };
  let cursor = "";
  for (let i = 0; i < 5; i++) {
    const r = await slackGet<ListResp>("conversations.list", {
      exclude_archived: "true",
      limit: "200",
      ...(cursor ? { cursor } : {}),
    });
    if (!r.ok) return null;
    const match = r.channels?.find((c) => c.name === channel.replace(/^#/, ""));
    if (match) return match.id;
    cursor = r.response_metadata?.next_cursor ?? "";
    if (!cursor) break;
  }
  return null;
}

async function fetchChannelMessages(channelId: string, oldest: number): Promise<SlackMessage[]> {
  type Resp = { ok: boolean; messages?: SlackMessage[] };
  const r = await slackGet<Resp>("conversations.history", {
    channel: channelId,
    oldest: String(oldest),
    limit: "30",
  });
  if (!r.ok || !r.messages) return [];
  return r.messages.filter((m) => m.type === "message" && !m.subtype && m.text && !m.bot_id);
}

async function fetchThreadReplies(channelId: string, threadTs: string): Promise<SlackMessage[]> {
  type Resp = { ok: boolean; messages?: SlackMessage[] };
  const r = await slackGet<Resp>("conversations.replies", {
    channel: channelId,
    ts: threadTs,
    limit: "20",
  });
  if (!r.ok || !r.messages) return [];
  return r.messages; // index 0 is parent
}

function looksLikeQuestion(text: string): boolean {
  if (text.length < 15) return false;
  const t = text.toLowerCase();
  return (
    text.includes("?") ||
    t.includes("how do i") ||
    t.includes("how can i") ||
    t.includes("why is") ||
    t.includes("why does") ||
    t.includes("why can") ||
    t.includes("what is") ||
    t.includes("what are") ||
    t.includes("can't") ||
    t.includes("cannot") ||
    /\berror\b/.test(t) ||
    t.includes("not working") ||
    t.includes("failing") ||
    t.includes("stuck") ||
    t.includes("issue with") ||
    t.includes("problem with") ||
    t.includes("help me") ||
    t.includes("access rights") ||
    t.includes("permission")
  );
}

// Returns the most recent unanswered question in a thread (sorted asc by ts).
// "Unanswered" = no bot reply exists AFTER the question in the thread.
function findUnansweredQuestion(
  replies: SlackMessage[], // includes parent at index 0
  botUserId: string | null,
  oldest: number,
): SlackMessage | null {
  const sorted = [...replies].sort((a, b) => parseFloat(a.ts) - parseFloat(b.ts));
  for (let i = sorted.length - 1; i >= 0; i--) {
    const msg = sorted[i];
    if (!msg.text || msg.bot_id) continue;
    if (botUserId && msg.user === botUserId) continue;
    if (parseFloat(msg.ts) < oldest) continue;
    if (!looksLikeQuestion(msg.text)) continue;
    // Check if any later message in the thread is from the bot
    const botRepliedAfter = sorted
      .slice(i + 1)
      .some((r) => r.bot_id || (botUserId && r.user === botUserId));
    if (!botRepliedAfter) return msg;
  }
  return null;
}

async function generateAnswer(
  question: string,
  parentContext?: string,
): Promise<string | null> {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const userContent = parentContext
    ? `Context (earlier in this thread):\n${parentContext}\n\nNew question:\n${question}`
    : question;
  try {
    const msg = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 512,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userContent }],
    });
    const block = msg.content[0];
    return block.type === "text" ? block.text.trim() : null;
  } catch {
    return null;
  }
}

async function postThreadReply(
  channelId: string,
  threadTs: string,
  text: string,
): Promise<boolean> {
  type Resp = { ok: boolean; error?: string };
  const r = await slackPost<Resp>("chat.postMessage", {
    channel: channelId,
    thread_ts: threadTs,
    text: `${text}\n\n_🤖 Auto-answered · React 🙋 if this missed the mark_`,
  });
  return r.ok;
}

type AnswerTarget = {
  channelId: string;
  threadTs: string;
  question: string;
  parentContext?: string;
};

export async function GET(req: Request) {
  const expected = process.env.CRON_SECRET;
  if (expected) {
    const auth = req.headers.get("authorization") ?? "";
    if (auth !== `Bearer ${expected}`) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  }

  if (!process.env.SLACK_BOT_TOKEN) {
    return NextResponse.json({ error: "SLACK_BOT_TOKEN not set" }, { status: 503 });
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY not set" }, { status: 503 });
  }

  const botUserId = await getBotUserId();
  const oldest = Math.floor((Date.now() - LOOK_BACK_MS) / 1000);

  const targets: AnswerTarget[] = [];

  for (const channelName of TARGET_CHANNELS) {
    const channelId = await resolveChannelId(channelName);
    if (!channelId) continue;

    const messages = await fetchChannelMessages(channelId, oldest);

    for (const msg of messages) {
      if (!msg.text) continue;
      const threadTs = msg.thread_ts ?? msg.ts;
      const hasReplies = (msg.reply_count ?? 0) > 0;
      const threadHadRecentActivity =
        hasReplies && msg.latest_reply && parseFloat(msg.latest_reply) >= oldest;

      if (!hasReplies) {
        // Top-level message with no replies — check if it's a question
        if (looksLikeQuestion(msg.text)) {
          targets.push({ channelId, threadTs: msg.ts, question: msg.text });
        }
      } else if (threadHadRecentActivity) {
        // Thread with recent activity — look for unanswered question in thread
        const thread = await fetchThreadReplies(channelId, threadTs);
        const unanswered = findUnansweredQuestion(thread, botUserId, oldest);
        if (unanswered?.text) {
          // Use the parent message as context (truncated)
          const parentText = thread[0]?.text ?? "";
          const parentContext =
            parentText && parentText !== unanswered.text
              ? parentText.slice(0, 300)
              : undefined;
          targets.push({
            channelId,
            threadTs,
            question: unanswered.text,
            parentContext,
          });
        }
      }
    }
  }

  const result = {
    answered: 0,
    skipped: targets.length,
    errors: [] as string[],
    ranAt: new Date().toISOString(),
  };

  for (const target of targets.slice(0, MAX_ANSWERS_PER_RUN)) {
    const answer = await generateAnswer(target.question, target.parentContext);
    if (!answer) {
      result.errors.push(`Failed to generate answer for thread ${target.threadTs}`);
      continue;
    }
    const posted = await postThreadReply(target.channelId, target.threadTs, answer);
    if (posted) {
      result.answered++;
      result.skipped--;
    } else {
      result.errors.push(`Failed to post reply to thread ${target.threadTs}`);
    }
  }

  return NextResponse.json({ ok: true, ...result });
}
