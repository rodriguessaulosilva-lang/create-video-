// Serve ilustrações geradas (data/projects/<id>/illustrations/<name>).

import { NextRequest } from "next/server";
import fs from "fs";
import path from "path";
import { projectDir } from "@/lib/paths";

export const runtime = "nodejs";

const MIME: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
};

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string; name: string } }
) {
  // Impede path traversal.
  const safeName = path.basename(params.name);
  const filePath = path.join(projectDir(params.id), "illustrations", safeName);

  if (!fs.existsSync(filePath)) return new Response("Not found", { status: 404 });

  const buf = fs.readFileSync(filePath);
  const ext = path.extname(safeName).toLowerCase();
  return new Response(buf, {
    status: 200,
    headers: {
      "Content-Type": MIME[ext] || "application/octet-stream",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
