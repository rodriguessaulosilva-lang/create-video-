import { NextRequest, NextResponse } from "next/server";
import { createProject, listProjects } from "@/lib/store";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({ projects: listProjects() });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const project = createProject({ name: body.name, prompt: body.prompt });
  return NextResponse.json({ project });
}
