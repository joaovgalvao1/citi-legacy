"use client";

// Registra o service worker do PWA (public/sw.js), que permite instalar o app e mostra uma página
// de "sem conexão" quando o aparelho está offline.

import { useEffect } from "react";

export function RegistrarServiceWorker() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {
      // sem service worker o site continua funcionando normalmente; só não fica instalável em alguns navegadores
    });
  }, []);
  return null;
}
