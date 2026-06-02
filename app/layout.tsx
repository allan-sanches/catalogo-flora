import type { Metadata } from "next";
import { Lora, Montserrat_Alternates } from "next/font/google";
import "./globals.css";

const lora = Lora({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-lora",
  display: "swap",
});

const montserratAlternates = Montserrat_Alternates({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-montserrat-alternates",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Flora Mattos · Cultivo Afetivo",
    template: "%s · Flora Mattos",
  },
  description:
    "Catálogo virtual de plantas da Flora Mattos — famílias, gêneros e espécies com fotos, descrições e informações de cultivo.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="pt-BR"
      data-theme="flora"
      className={`${lora.variable} ${montserratAlternates.variable}`}
    >
      <head>
        {/* Aplica a preferência de preços antes da pintura (evita flash) */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{if(localStorage.getItem('flora:prices')==='shown')document.documentElement.setAttribute('data-prices','shown')}catch(e){}`,
          }}
        />
      </head>
      <body className="min-h-screen bg-base-200 antialiased">{children}</body>
    </html>
  );
}
