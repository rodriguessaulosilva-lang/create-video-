"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { uploadVideo } from "@/lib/api";

export function UploadZone() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [prompt, setPrompt] = useState("");
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f && f.type.startsWith("video/")) setFile(f);
    else setError("Envie um arquivo de vídeo (MP4).");
  }, []);

  const submit = async () => {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const project = await uploadVideo(file, prompt.trim() || undefined);
      router.push(`/editor/${project.id}`);
    } catch (e: any) {
      setError(e.message || "Falha no upload");
      setBusy(false);
    }
  };

  return (
    <div className="glass-card p-6">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-12 text-center transition-all ${
          dragging
            ? "border-gold bg-gold/5"
            : "border-white/10 hover:border-white/20"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="video/*,.mp4,.mov,.m4v"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) setFile(f);
          }}
        />
        <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-gold-gradient text-3xl shadow-glow">
          🎬
        </div>
        {file ? (
          <div>
            <p className="text-lg font-semibold text-white">{file.name}</p>
            <p className="text-sm text-white/40">
              {(file.size / 1024 / 1024).toFixed(1)} MB — clique em processar
            </p>
          </div>
        ) : (
          <div>
            <p className="text-lg font-semibold text-white">
              Arraste seu vídeo bruto aqui
            </p>
            <p className="text-sm text-white/40">ou clique para escolher (MP4/MOV)</p>
          </div>
        )}
      </div>

      <div className="mt-5">
        <label className="label">Direção pra IA (opcional)</label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Ex.: tom energético, foco em apostas esportivas, cortar enrolação, CTA pra seguir o perfil…"
          rows={3}
          className="mt-2 w-full resize-none rounded-xl border border-white/10 bg-white/[0.02] p-4 text-white placeholder:text-white/25 focus:border-gold/50 focus:outline-none"
        />
      </div>

      {error && (
        <p className="mt-3 rounded-lg bg-red-500/10 p-3 text-sm text-red-300">
          {error}
        </p>
      )}

      <button
        onClick={submit}
        disabled={!file || busy}
        className="btn-gold mt-5 w-full"
      >
        {busy ? "Enviando…" : "Processar vídeo →"}
      </button>
    </div>
  );
}
