import type { ReactNode } from "react";

const LUZ: Record<string, { icon: string; cls: string }> = {
  Sol: { icon: "☀️", cls: "badge-warning" },
  "Meia-luz": { icon: "⛅", cls: "badge-accent" },
  Sombra: { icon: "🌑", cls: "badge-neutral" },
};

const ORIGEM: Record<string, string> = {
  Nativa: "badge-success",
  Naturalizada: "badge-info",
  Cultivada: "badge-secondary",
};

export function Badge({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <span className={`badge badge-sm ${className}`}>{children}</span>;
}

export function LuzBadges({ luz }: { luz: readonly string[] }) {
  return (
    <>
      {luz.map((l) => {
        const info = LUZ[l] ?? { icon: "💡", cls: "badge-ghost" };
        return (
          <Badge key={l} className={`${info.cls} gap-1`}>
            <span aria-hidden>{info.icon}</span>
            {l}
          </Badge>
        );
      })}
    </>
  );
}

export function OrigemBadge({ origem }: { origem: string }) {
  return (
    <Badge className={`${ORIGEM[origem] ?? "badge-ghost"} badge-outline`}>
      {origem}
    </Badge>
  );
}
