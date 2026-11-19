// Ícone da aba do navegador (favicon), gerado a partir do logo do CITi.
import { iconeCiti } from "@/lib/icone";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  return iconeCiti(64, { favicon: true });
}
