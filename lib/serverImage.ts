import { readFile } from "node:fs/promises";
import path from "node:path";

/**
 * Lê uma imagem da pasta public/ (a partir do caminho público, ex.:
 * "/images/plantas/x/imagem.jpg") e devolve um data URI base64.
 * Usado em rotas de geração (panfleto/PDF) para embutir a imagem sem
 * depender de fetch HTTP (que falha com Deployment Protection na Vercel).
 * Retorna null se o arquivo não existir.
 */
export async function localImageDataUri(
  publicPath?: string | null
): Promise<string | null> {
  if (!publicPath) return null;
  try {
    const clean = publicPath.replace(/^\/+/, "");
    const file = path.join(process.cwd(), "public", clean);
    const buf = await readFile(file);
    const ext = (publicPath.split(".").pop() || "").toLowerCase();
    const mime =
      ext === "png"
        ? "image/png"
        : ext === "webp"
          ? "image/webp"
          : ext === "gif"
            ? "image/gif"
            : ext === "svg"
              ? "image/svg+xml"
              : "image/jpeg";
    return `data:${mime};base64,${buf.toString("base64")}`;
  } catch {
    return null;
  }
}
