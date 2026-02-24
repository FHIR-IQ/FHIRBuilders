// Zulip API client for cross-posting to FHIR Zulip (chat.fhir.org)

interface ZulipMessage {
  stream: string;
  topic: string;
  content: string;
}

export async function postToZulip({ stream, topic, content }: ZulipMessage): Promise<{ success: boolean; error?: string }> {
  const siteUrl = process.env.ZULIP_SITE_URL;
  const apiKey = process.env.ZULIP_API_KEY;
  const email = process.env.ZULIP_EMAIL;

  if (!siteUrl || !apiKey || !email) {
    return { success: false, error: "Zulip is not configured" };
  }

  try {
    const auth = Buffer.from(`${email}:${apiKey}`).toString("base64");

    const response = await fetch(`${siteUrl}/api/v1/messages`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        type: "stream",
        to: stream,
        topic,
        content,
      }),
    });

    if (!response.ok) {
      const data = await response.json();
      return { success: false, error: data.msg || "Zulip API error" };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Network error" };
  }
}
