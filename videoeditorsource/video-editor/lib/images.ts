// ===========================================================================
// Geração de ilustrações IA via OpenAI Images (gpt-image-1).
// Salva o PNG no diretório do projeto e retorna o caminho relativo servível.
// ===========================================================================

import fs from "fs";
import path from "path";
import OpenAI from "openai";
import { ensureProjectDir } from "./paths";

function client(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY não configurada (.env.local)");
  return new OpenAI({ apiKey });
}

const STYLE_SUFFIX =
  ", cinematic, high contrast, premium dark background, subtle golden rim light, vertical 9:16 composition, no text, no watermark";

/**
 * Gera uma ilustração e a salva em data/projects/<id>/illustrations/<sceneId>.png.
 * Retorna { fileName, filePath }.
 */
export async function generateIllustration(
  projectId: string,
  sceneId: string,
  prompt: string
): Promise<{ fileName: string; filePath: string }> {
  const openai = client();
  const model = process.env.IMAGE_MODEL || "gpt-image-1";

  const res = await openai.images.generate({
    model,
    prompt: `${prompt}${STYLE_SUFFIX}`,
    size: "1024x1536", // proporção próxima de 9:16
    n: 1,
  } as any);

  const b64 = res.data?.[0]?.b64_json;
  if (!b64) throw new Error("Geração de imagem não retornou dados");

  const dir = path.join(ensureProjectDir(projectId), "illustrations");
  fs.mkdirSync(dir, { recursive: true });
  const fileName = `${sceneId}.png`;
  const filePath = path.join(dir, fileName);
  fs.writeFileSync(filePath, Buffer.from(b64, "base64"));

  return { fileName, filePath };
}
