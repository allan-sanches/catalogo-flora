/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["@react-pdf/renderer"],
  // Inclui o conteúdo lido em runtime (Keystatic reader) no bundle das funções
  // serverless da Vercel — senão o panfleto/PDF não acham as plantas (404/vazio).
  outputFileTracingIncludes: {
    "/panfleto/[slug]": ["./content/**/*"],
    "/catalogo/pdf": ["./content/**/*"],
  },
  images: {
    // Permite logos em SVG enviados pelo CMS (uso confiável: arquivos próprios).
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      { protocol: "https", hostname: "upload.wikimedia.org" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
};

export default nextConfig;
