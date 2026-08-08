// ===========================================================================
// Wrapper de ffmpeg/ffprobe usando binários estáticos (ffmpeg-static / ffprobe-static),
// então não é preciso ter ffmpeg instalado no sistema.
// ===========================================================================

import { spawn } from "child_process";
import ffmpegStatic from "ffmpeg-static";
import ffprobeStatic from "ffprobe-static";

const FFMPEG_BIN: string =
  (ffmpegStatic as unknown as string) || "ffmpeg";
const FFPROBE_BIN: string =
  (ffprobeStatic as unknown as { path: string })?.path || "ffprobe";

function run(bin: string, args: string[]): Promise<string> {
  return new Promise((resolve, reject) => {
    const proc = spawn(bin, args);
    let stdout = "";
    let stderr = "";
    proc.stdout.on("data", (d) => (stdout += d.toString()));
    proc.stderr.on("data", (d) => (stderr += d.toString()));
    proc.on("error", reject);
    proc.on("close", (code) => {
      if (code === 0) resolve(stdout || stderr);
      else reject(new Error(`${bin} saiu com código ${code}:\n${stderr}`));
    });
  });
}

export interface ProbeResult {
  durationInSeconds: number;
  width: number;
  height: number;
  fps: number;
  videoCodec: string;
  audioCodec: string | null;
}

export async function probe(filePath: string): Promise<ProbeResult> {
  const out = await run(FFPROBE_BIN, [
    "-v",
    "quiet",
    "-print_format",
    "json",
    "-show_format",
    "-show_streams",
    filePath,
  ]);
  const json = JSON.parse(out);
  const streams: any[] = json.streams || [];
  const video = streams.find((s) => s.codec_type === "video");
  const audio = streams.find((s) => s.codec_type === "audio");

  let fps = 30;
  if (video?.r_frame_rate) {
    const [num, den] = String(video.r_frame_rate).split("/").map(Number);
    if (num && den) fps = num / den;
  }

  return {
    durationInSeconds: parseFloat(json.format?.duration ?? "0") || 0,
    width: video?.width ?? 0,
    height: video?.height ?? 0,
    fps,
    videoCodec: video?.codec_name ?? "unknown",
    audioCodec: audio?.codec_name ?? null,
  };
}

/**
 * Normaliza para H.264, CFR 30fps, yuv420p (converte HEVC/qualquer coisa).
 * Mantém proporção; não força resolução (o Remotion cuida do canvas).
 */
export async function normalizeToH264(
  input: string,
  output: string,
  fps = 30
): Promise<void> {
  await run(FFMPEG_BIN, [
    "-y",
    "-i",
    input,
    "-c:v",
    "libx264",
    "-preset",
    "veryfast",
    "-crf",
    "20",
    "-pix_fmt",
    "yuv420p",
    // CFR (constant frame rate) no fps alvo
    "-r",
    String(fps),
    "-vsync",
    "cfr",
    "-c:a",
    "aac",
    "-b:a",
    "192k",
    "-movflags",
    "+faststart",
    output,
  ]);
}

/** Extrai áudio (mono 16kHz WAV) — ideal para o Whisper. */
export async function extractAudio(
  input: string,
  output: string
): Promise<void> {
  await run(FFMPEG_BIN, [
    "-y",
    "-i",
    input,
    "-vn",
    "-ac",
    "1",
    "-ar",
    "16000",
    "-c:a",
    "pcm_s16le",
    output,
  ]);
}

export { FFMPEG_BIN, FFPROBE_BIN };
