import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Auto Video Editor — edição com IA",
  description:
    "Do vídeo bruto ao vídeo pronto: transcrição, análise com IA, cenas animadas e render automático.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <head>
        {/* Fonte Sora (Google Fonts) — pesos 400/600/700/800 */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-base text-white antialiased">
        {/* halo de fundo global */}
        <div className="pointer-events-none fixed inset-0 -z-10">
          <div className="absolute left-1/2 top-0 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-gold/10 blur-[160px]" />
        </div>
        {children}
      </body>
    </html>
  );
}
