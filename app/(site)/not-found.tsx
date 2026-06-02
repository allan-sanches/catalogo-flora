import Link from "next/link";

export default function NotFound() {
  return (
    <div className="hero py-20">
      <div className="hero-content text-center">
        <div>
          <p className="text-6xl">🌵</p>
          <h1 className="mt-4 text-2xl font-bold">Planta não encontrada</h1>
          <p className="mt-2 text-base-content/60">
            Não encontramos essa espécie no catálogo.
          </p>
          <Link href="/" className="btn btn-primary mt-6">
            Voltar ao catálogo
          </Link>
        </div>
      </div>
    </div>
  );
}
