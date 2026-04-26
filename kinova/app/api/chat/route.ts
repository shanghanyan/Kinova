import { NextResponse } from "next/server";

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface ChatRequestBody {
  model?: string;
  messages?: ChatMessage[];
}

export async function POST(req: Request) {
  const apiKey = process.env.K2THINK_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Missing K2THINK_API_KEY" }, { status: 500 });
  }

  let body: ChatRequestBody;
  try {
    body = (await req.json()) as ChatRequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const model = body.model ?? "MBZUAI-IFM/K2-Think-v2";
  const messages = Array.isArray(body.messages) ? body.messages : [];
  if (!messages.length) {
    return NextResponse.json({ error: "messages are required" }, { status: 400 });
  }

  const upstream = await fetch("https://api.k2think.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages,
      stream: false,
    }),
  });

  if (!upstream.ok) {
    const text = await upstream.text();
    return NextResponse.json(
      { error: "Upstream chat request failed", details: text },
      { status: upstream.status },
    );
  }

  const payload = (await upstream.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  const reply = payload.choices?.[0]?.message?.content ?? "";
  return NextResponse.json({ reply });
}
