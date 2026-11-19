// Manifest do PWA: permite instalar o CITi Legacy no celular e no computador como um app
// (ícone na tela de início, abre em tela cheia, sem a barra do navegador).
import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "CITi Legacy",
    short_name: "CITi Legacy",
    description: "Todos os projetos do CITi, acompanhados semana a semana.",
    lang: "pt-BR",
    start_url: "/projetos",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0a0a0a",
    theme_color: "#0a0a0a",
    categories: ["productivity", "business"],
    icons: [
      { src: "/icones/192", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icones/512", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icones/512", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Projetos", url: "/projetos", icons: [{ src: "/icones/192", sizes: "192x192" }] },
      { name: "Membros", url: "/membros", icons: [{ src: "/icones/192", sizes: "192x192" }] },
      { name: "Modo reunião", url: "/reuniao", icons: [{ src: "/icones/192", sizes: "192x192" }] },
    ],
  };
}
