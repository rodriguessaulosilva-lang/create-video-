/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // Mantém o renderer/bundler do Remotion e os binários ffmpeg fora do
    // bundle do servidor — eles carregam assets nativos/binários em runtime.
    serverComponentsExternalPackages: [
      "@remotion/bundler",
      "@remotion/renderer",
      "ffmpeg-static",
      "ffprobe-static",
    ],
    // Permite uploads grandes de vídeo pelas route handlers.
    serverActions: {
      bodySizeLimit: "1024mb",
    },
  },
};

module.exports = nextConfig;
