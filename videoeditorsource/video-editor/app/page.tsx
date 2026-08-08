import Link from "next/link";
import { listProjects } from "@/lib/store";
import { UploadZone } from "@/components/UploadZone";

export const dynamic = "force-dynamic";

const STAGE_LABEL: Record<string, string> = {
  created: "Criado",
  uploaded: "Enviado",
  normalized: "Normalizado",
  transcribed: "Transcrito",
  analyzed: "Analisado",
  reviewed: "Em revisão",
  rendered: "Renderizado",
  error: "Erro",
};

export default function Home() {
  const projects = listProjects();

  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <header className="mb-12 text-center">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-gold/20 bg-gold/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-gold">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-gold" />
          Edição automática com IA
        </div>
        <h1 className="text-5xl font-extrabold tracking-tight md:text-6xl">
          Do <span className="text-gold-gradient">bruto</span> ao{" "}
          <span className="text-gold-gradient">pronto</span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-white/50">
          Suba um vídeo. A IA transcreve, analisa, monta cenas animadas e
          renderiza. Você só revisa — se quiser.
        </p>
      </header>

      <UploadZone />

      {/* Pipeline steps */}
      <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-6">
        {[
          ["1", "Upload"],
          ["2", "Normalização"],
          ["3", "Transcrição"],
          ["4", "Análise IA"],
          ["5", "Revisão"],
          ["6", "Render"],
        ].map(([n, label]) => (
          <div key={n} className="glass rounded-xl p-4 text-center">
            <div className="text-gold-gradient text-2xl font-extrabold">{n}</div>
            <div className="mt-1 text-xs font-medium text-white/50">{label}</div>
          </div>
        ))}
      </div>

      {projects.length > 0 && (
        <section className="mt-16">
          <h2 className="label mb-4">Seus projetos</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {projects.map((p) => (
              <Link
                key={p.id}
                href={`/editor/${p.id}`}
                className="glass-card group flex items-center justify-between p-5 transition-all hover:border-gold/30"
              >
                <div className="min-w-0">
                  <p className="truncate font-semibold text-white group-hover:text-gold">
                    {p.name}
                  </p>
                  <p className="text-sm text-white/40">
                    {new Date(p.updatedAt).toLocaleString("pt-BR")}
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                    p.stage === "error"
                      ? "bg-red-500/15 text-red-300"
                      : p.stage === "rendered"
                      ? "bg-green-500/15 text-green-300"
                      : "bg-gold/10 text-gold"
                  }`}
                >
                  {STAGE_LABEL[p.stage] || p.stage}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
