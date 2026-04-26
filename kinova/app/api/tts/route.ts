import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

interface TtsBody {
  text?: string;
}

function runPiper(text: string, outputPath: string): Promise<void> {
  const bin = process.env.PIPER_BIN || "piper";
  const model = process.env.PIPER_MODEL;
  const config = process.env.PIPER_CONFIG;

  if (!model) {
    return Promise.reject(new Error("Missing PIPER_MODEL env variable"));
  }

  const args = ["--model", model, "--output_file", outputPath];
  if (config) args.push("--config", config);

  return new Promise((resolve, reject) => {
    const child = spawn(bin, args, { stdio: ["pipe", "pipe", "pipe"] });
    let stderr = "";

    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });
    child.on("error", (err) => reject(err));
    child.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(stderr || `piper exited with code ${code ?? "unknown"}`));
    });

    child.stdin.write(text);
    child.stdin.end();
  });
}

export async function POST(req: Request) {
  let body: TtsBody;
  try {
    body = (await req.json()) as TtsBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const text = (body.text || "").trim();
  if (!text) {
    return NextResponse.json({ error: "text is required" }, { status: 400 });
  }

  const tmpPath = path.join(os.tmpdir(), `kinova-tts-${randomUUID()}.wav`);

  try {
    await runPiper(text, tmpPath);
    const audio = await fs.readFile(tmpPath);
    return new Response(audio, {
      status: 200,
      headers: {
        "Content-Type": "audio/wav",
        "Content-Length": String(audio.byteLength),
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Piper synthesis failed", details: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  } finally {
    void fs.unlink(tmpPath).catch(() => undefined);
  }
}
