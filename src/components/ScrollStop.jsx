"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    // 1. Fuerza el scroll al inicio inmediatamente al montar
    window.scrollTo(0, 0);

    // 2. Desactiva la restauración automática del navegador
    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }
  }, [pathname]); // Se ejecuta al cargar y cada vez que cambies de ruta

  return null;
}
