# 🎬 Auto Video Editor — edição automática de vídeo com IA

Pipeline completo que transforma um vídeo bruto em um vídeo vertical (9:16)
pronto para publicar: **transcrição (Whisper) → análise (Claude) → cenas
animadas (Remotion) → render MP4**. A única etapa manual é a revisão — e às
vezes nem ela.

## Arquitetura

Dois projetos separados:

| Projeto | O que é |
|---|---|
| `video-editor/` | App Next.js 14 (App Router) — interface + API do pipeline. |
| `video-editor/remotion/` | Projeto Remotion isolado — composições de vídeo (cenas + legendas). |

## Pipeline (6 etapas)

1. **Upload** — usuário sobe o MP4 bruto + prompt opcional de direção.
2. **Normalização** — `ffmpeg` converte HEVC/qualquer coisa para **H.264 CFR 30fps** e extrai o áudio.
3. **Transcrição** — **Whisper API** gera legendas com timestamps de palavra + `.srt`.
4. **Análise** — **Claude** identifica o formato narrativo, cria a paleta de cores e define as cenas.
5. **Revisão** — preview lateral + lista de cenas editáveis + timeline; geração de ilustrações IA sob demanda.
6. **Render** — **Remotion** renderiza o MP4 final 1080×1920.

## Sistema de timing (`startLeg`)

A IA **não calcula frames**. Cada cena é ancorada por `startLeg` — o **índice
da legenda** onde a cena começa. `convertScenesFromLegendaIndex()`
(`lib/timing.ts`) converte esses índices em frames exatos, calculando a duração
de cada cena a partir do início da cena seguinte.

## Formato do vídeo

- 1080×1920 (9:16 vertical)
- 30 FPS
- Fonte **Sora** (Google Fonts), pesos 400/600/700/800
- Legendas estilo TikTok: palavra-por-palavra, cor por sentimento

## Setup

```bash
cd video-editor

# 1. Dependências (app + Remotion)
npm install
cd remotion && npm install && cd ..

# 2. Variáveis de ambiente
cp .env.local.example .env.local
# preencha ANTHROPIC_API_KEY e OPENAI_API_KEY

# 3. Dev server (porta 3333)
npm run dev
# → http://localhost:3333
```

> **ffmpeg**: os binários vêm via `ffmpeg-static` / `ffprobe-static`, então não
> é preciso instalar ffmpeg no sistema.

### Remotion Studio (opcional)

Para editar/testar as composições isoladamente:

```bash
cd remotion
npm run studio
```

## Variáveis de ambiente

| Variável | Uso |
|---|---|
| `ANTHROPIC_API_KEY` | Claude — análise de conteúdo e cenas |
| `OPENAI_API_KEY` | Whisper (transcrição) + ilustrações (gpt-image-1) |
| `CLAUDE_MODEL` | opcional (default `claude-sonnet-5`) |
| `WHISPER_MODEL` | opcional (default `whisper-1`) |
| `IMAGE_MODEL` | opcional (default `gpt-image-1`) |
| `DATA_DIR` | diretório de dados (default `./data`) |

## Estrutura

```
video-editor/
├── app/
│   ├── page.tsx                 # dashboard + upload
│   ├── editor/[id]/page.tsx     # editor
│   └── api/                     # upload, normalize, transcribe, analyze,
│       │                        #   illustrate, render, video (Range), asset
│       └── ...
├── components/
│   ├── UploadZone.tsx
│   └── editor/                  # Editor, Preview, SceneList, Timeline, Pipeline
├── lib/                         # types, timing, store, ffmpeg, whisper,
│   └── ...                      #   claude, images, render, srt, api
└── remotion/
    └── src/
        ├── Root.tsx  MainVideo.tsx  Captions.tsx  theme.ts
        └── scenes/              # intro, statement, illustration, quote,
                                 #   list, bignumber, outro
```

## Notas

- Storage é baseado em filesystem (`data/projects/<id>/`) — suficiente para
  dev/single-node. Troque `lib/store.ts` por um DB em produção.
- A rota `/api/video/[id]` implementa **HTTP Range Requests** (seek no player).
- O render usa `@remotion/bundler` + `@remotion/renderer` — o primeiro render
  faz o bundle e o mantém em cache no processo.
