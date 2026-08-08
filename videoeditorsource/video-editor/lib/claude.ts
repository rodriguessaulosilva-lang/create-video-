// ===========================================================================
// Análise de conteúdo com Claude (@anthropic-ai/sdk).
// Recebe as legendas (com índices) e devolve: formato narrativo, título,
// paleta de cores e a lista de cenas — cada cena ancorada em `startLeg`
// (o índice da legenda onde ela começa).
// ===========================================================================

import Anthropic from "@anthropic-ai/sdk";
import { v4 as uuidv4 } from "uuid";
import {
  DEFAULT_PALETTE,
  type Analysis,
  type Legenda,
  type Scene,
  type SceneType,
} from "./types";

function client(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY não configurada (.env.local)");
  return new Anthropic({ apiKey });
}

const SCENE_TYPES: SceneType[] = [
  "intro",
  "statement",
  "illustration",
  "quote",
  "list",
  "bignumber",
  "outro",
];

const SYSTEM_PROMPT = `Você é um diretor de arte e roteirista de vídeos curtos verticais (formato 9:16, estilo Reels/TikTok/Shorts).
Sua tarefa: transformar uma transcrição com legendas indexadas em um roteiro visual de CENAS animadas sincronizadas com a fala.

REGRAS CRÍTICAS DE TIMING:
- Você NUNCA calcula frames ou segundos.
- Cada cena é ancorada por "startLeg": o ÍNDICE da legenda onde a cena COMEÇA.
- As cenas devem cobrir todo o vídeo em ordem crescente de startLeg, sem sobreposição.
- A primeira cena deve ser type "intro" com startLeg 0.
- A última cena deve ser type "outro".
- Gere entre 6 e 16 cenas dependendo da duração.

TIPOS DE CENA disponíveis: ${SCENE_TYPES.join(", ")}.
- intro: abertura com título de impacto.
- statement: uma frase forte destacada (afirmação/gancho).
- illustration: cena com ilustração IA — inclua "imagePrompt" descritivo (em inglês, detalhado, estilo coerente com a paleta).
- quote: uma citação/fala em destaque.
- list: 2 a 4 itens curtos (campo "items").
- bignumber: um número/estatística de impacto (campos "number" e "numberLabel").
- outro: encerramento / call to action.

PALETA: crie uma paleta premium dark coerente com o conteúdo. O fundo deve ser bem escuro. Use dourado (#FFB800) como acento se combinar; senão escolha um acento vibrante.

Responda SOMENTE com JSON válido, sem markdown, no formato:
{
  "narrativeFormat": "string",
  "title": "string curto e forte",
  "summary": "string 1-2 frases",
  "palette": { "background": "#hex", "surface": "#hex", "primary": "#hex", "secondary": "#hex", "accent": "#hex", "text": "#hex", "muted": "#hex" },
  "scenes": [
    { "type": "intro", "startLeg": 0, "title": "...", "subtitle": "..." },
    { "type": "bignumber", "startLeg": 5, "number": "87%", "numberLabel": "..." },
    { "type": "illustration", "startLeg": 9, "title": "...", "imagePrompt": "..." }
  ]
}`;

function buildLegendasBlock(legendas: Legenda[]): string {
  return legendas
    .map((l) => `[${l.index}] (${l.start.toFixed(1)}s) ${l.text}`)
    .join("\n");
}

function coerceScene(raw: any): Scene | null {
  if (!raw || typeof raw !== "object") return null;
  const type: SceneType = SCENE_TYPES.includes(raw.type) ? raw.type : "statement";
  const startLeg = Number.isFinite(raw.startLeg) ? Math.max(0, Math.floor(raw.startLeg)) : 0;
  return {
    id: uuidv4(),
    type,
    startLeg,
    title: raw.title,
    subtitle: raw.subtitle,
    text: raw.text,
    items: Array.isArray(raw.items) ? raw.items.slice(0, 5).map(String) : undefined,
    number: raw.number ? String(raw.number) : undefined,
    numberLabel: raw.numberLabel ? String(raw.numberLabel) : undefined,
    imagePrompt: raw.imagePrompt ? String(raw.imagePrompt) : undefined,
    accentColor: raw.accentColor,
  };
}

function extractJSON(text: string): any {
  // Tenta parsear direto; se vier com cercas ou texto extra, extrai o objeto.
  try {
    return JSON.parse(text);
  } catch {
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start >= 0 && end > start) {
      return JSON.parse(text.slice(start, end + 1));
    }
    throw new Error("Resposta do Claude não contém JSON válido");
  }
}

export async function analyzeContent(
  legendas: Legenda[],
  userPrompt?: string
): Promise<Analysis> {
  const anthropic = client();
  const model = process.env.CLAUDE_MODEL || "claude-sonnet-5";

  const userContent = [
    userPrompt ? `Direção do criador (respeite): ${userPrompt}\n` : "",
    `Total de legendas: ${legendas.length}. Duração aproximada: ${
      legendas.at(-1)?.end.toFixed(1) ?? "?"
    }s.`,
    "\nLEGENDAS INDEXADAS:\n",
    buildLegendasBlock(legendas),
  ].join("\n");

  const msg = await anthropic.messages.create({
    model,
    max_tokens: 4096,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: userContent }],
  });

  const textBlock = msg.content.find((b) => b.type === "text");
  const text = textBlock && "text" in textBlock ? textBlock.text : "";
  const parsed = extractJSON(text);

  const scenes: Scene[] = Array.isArray(parsed.scenes)
    ? parsed.scenes.map(coerceScene).filter((s: Scene | null): s is Scene => !!s)
    : [];

  // Garante que exista pelo menos uma cena de intro em 0.
  if (scenes.length === 0 || scenes[0].startLeg !== 0) {
    scenes.unshift({
      id: uuidv4(),
      type: "intro",
      startLeg: 0,
      title: parsed.title || "Sem título",
    });
  }

  return {
    narrativeFormat: parsed.narrativeFormat || "indefinido",
    title: parsed.title || "Vídeo sem título",
    summary: parsed.summary || "",
    palette: { ...DEFAULT_PALETTE, ...(parsed.palette || {}) },
    scenes,
  };
}
