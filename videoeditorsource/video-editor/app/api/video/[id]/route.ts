// Serve o vídeo do projeto com suporte a HTTP Range Requests (seek no player).
// ?which=raw|normalized|output  (default: normalized -> raw)

import { NextRequest } from "next/server";
import fs from "fs";
import path from "path";
import { getProject } from "@/lib/store";

export const runtime = "nodejs";

function pickFile(
  project: NonNullable<ReturnType<typeof getProject>>,
  which: string | null
): string | undefined {
  if (which === "raw") return project.files.raw;
  if (which === "output") return project.files.output;
  if (which === "normalized") return project.files.normalized;
  // default: melhor disponível
  return project.files.normalized || project.files.raw;
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const project = getProject(params.id);
  if (!project) return new Response("Not found", { status: 404 });

  const which = req.nextUrl.searchParams.get("which");
  const rel = pickFile(project, which);
  if (!rel) return new Response("No video", { status: 404 });

  const filePath = path.resolve(process.cwd(), rel);
  if (!fs.existsSync(filePath)) return new Response("File missing", { status: 404 });

  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  const range = req.headers.get("range");
  const contentType = "video/mp4";

  // Sem Range → devolve o arquivo inteiro, mas sinaliza suporte a range.
  if (!range) {
    const stream = fs.createReadStream(filePath);
    return new Response(stream as any, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Length": String(fileSize),
        "Accept-Ranges": "bytes",
        "Cache-Control": "no-store",
      },
    });
  }

  // Parse "bytes=start-end"
  const match = /bytes=(\d*)-(\d*)/.exec(range);
  let start = match && match[1] ? parseInt(match[1], 10) : 0;
  let end = match && match[2] ? parseInt(match[2], 10) : fileSize - 1;

  if (Number.isNaN(start) || start < 0) start = 0;
  if (Number.isNaN(end) || end >= fileSize) end = fileSize - 1;

  if (start > end || start >= fileSize) {
    return new Response("Range Not Satisfiable", {
      status: 416,
      headers: { "Content-Range": `bytes */${fileSize}` },
    });
  }

  const chunkSize = end - start + 1;
  const stream = fs.createReadStream(filePath, { start, end });

  return new Response(stream as any, {
    status: 206,
    headers: {
      "Content-Type": contentType,
      "Content-Range": `bytes ${start}-${end}/${fileSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": String(chunkSize),
      "Cache-Control": "no-store",
    },
  });
}
