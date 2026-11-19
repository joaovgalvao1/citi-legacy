// Ícones do PWA (manifest): /icones/192 e /icones/512, em PNG.
import { iconeCiti } from "@/lib/icone";

const TAMANHOS = ["192", "512"];

export function generateStaticParams() {
  return TAMANHOS.map((tamanho) => ({ tamanho }));
}

export async function GET(_: Request, { params }: RouteContext<"/icones/[tamanho]">) {
  const { tamanho } = await params;
  if (!TAMANHOS.includes(tamanho)) return new Response("não encontrado", { status: 404 });
  return iconeCiti(Number(tamanho));
}
