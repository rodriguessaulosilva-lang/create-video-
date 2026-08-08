// ===========================================================================
// Transcrição via OpenAI Whisper API (verbose_json + timestamps de palavra).
// Constrói o array de `legendas` (segmentos) já com word-level timestamps
// e uma heurística de sentimento por palavra para as legendas TikTok.
// ===========================================================================

import fs from "fs";
import OpenAI from "openai";
import type { Legenda, Sentiment, Word } from "./types";

function client(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY não configurada (.env.local)");
  return new OpenAI({ apiKey });
}

// Heurística leve de sentimento em PT-BR para colorir palavras.
const POSITIVE = new Set([
  "sim", "ótimo", "otimo", "incrível", "incrivel", "melhor", "ganhar", "ganho",
  "lucro", "sucesso", "top", "sensacional", "certo", "vitória", "vitoria",
  "fácil", "facil", "rápido", "rapido", "sempre", "garantido", "grátis", "gratis",
]);
const NEGATIVE = new Set([
  "não", "nao", "nunca", "perder", "perda", "erro", "errado", "difícil", "dificil",
  "problema", "risco", "pior", "cuidado", "perigo", "golpe", "fracasso", "jamais",
]);

function classifyWord(raw: string): Sentiment {
  const w = raw.toLowerCase().replace(/[^a-zà-ú0-9%]/gi, "");
  if (!w) return "neutral";
  if (POSITIVE.has(w)) return "positive";
  if (NEGATIVE.has(w)) return "negative";
  // Palavras em CAPS ou terminadas em "!" viram ênfase.
  if (raw === raw.toUpperCase() && /[a-zà-ú]/i.test(raw) && raw.length > 2)
    return "emphasis";
  if (/[!?]$/.test(raw)) return "emphasis";
  return "neutral";
}

/**
 * Transcreve um arquivo de áudio/vídeo e retorna as legendas com word-level timing.
 */
export async function transcribe(
  filePath: string,
  language = "pt"
): Promise<{ legendas: Legenda[]; language: string; duration: number }> {
  const openai = client();
  const model = process.env.WHISPER_MODEL || "whisper-1";

  const res = await openai.audio.transcriptions.create({
    file: fs.createReadStream(filePath),
    model,
    language,
    response_format: "verbose_json",
    timestamp_granularities: ["segment", "word"],
  } as any);

  const data = res as any;
  const words: Array<{ word: string; start: number; end: number }> =
    data.words || [];
  const segments: Array<{ text: string; start: number; end: number }> =
    data.segments || [];

  // Distribui as palavras (com timestamp) dentro de cada segmento.
  let wordCursor = 0;
  const legendas: Legenda[] = segments.map((seg, index) => {
    const segWords: Word[] = [];
    while (
      wordCursor < words.length &&
      words[wordCursor].start < seg.end - 1e-3
    ) {
      const w = words[wordCursor];
      segWords.push({
        text: w.word.trim(),
        start: w.start,
        end: w.end,
        sentiment: classifyWord(w.word.trim()),
      });
      wordCursor++;
    }
    return {
      index,
      text: seg.text.trim(),
      start: seg.start,
      end: seg.end,
      words: segWords,
    };
  });

  return {
    legendas,
    language: data.language || language,
    duration: data.duration || (legendas.at(-1)?.end ?? 0),
  };
}
