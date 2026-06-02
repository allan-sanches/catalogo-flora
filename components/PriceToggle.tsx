"use client";

import { useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function PriceToggle({ className = "" }: { className?: string }) {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    setShown(document.documentElement.getAttribute("data-prices") === "shown");
  }, []);

  const toggle = () => {
    const next = !shown;
    setShown(next);
    document.documentElement.setAttribute(
      "data-prices",
      next ? "shown" : "hidden"
    );
    try {
      localStorage.setItem("flora:prices", next ? "shown" : "hidden");
    } catch {}
  };

  return (
    <button
      type="button"
      onClick={toggle}
      className={`btn btn-ghost btn-sm justify-start gap-2 ${className}`}
      aria-pressed={shown}
    >
      {shown ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      {shown ? "Ocultar preços" : "Mostrar preços"}
    </button>
  );
}
