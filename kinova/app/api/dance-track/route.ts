import { promises as fs } from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const TRACKS = {
  slow: "Airplane pt.2.mp3",
  fast: "Ariana Grande, Justin Bieber - Stuck with U (Official Lyric Video).mp3",
} as const;

export async function GET(req: Request) {
  const url = new URL(req.url);
  const mode = url.searchParams.get("mode") === "fast" ? "fast" : "slow";
  const fileName = TRACKS[mode];
  const filePath = path.join(process.cwd(), fileName);

  try {
    const data = await fs.readFile(filePath);
    return new Response(data, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": String(data.byteLength),
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return NextResponse.json(
      { error: `Missing dance track: ${fileName}` },
      { status: 404 },
    );
  }
}
