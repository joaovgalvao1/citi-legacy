// Marca do produto: logo do CITi + "Legacy".

import Image from "next/image";
import Link from "next/link";

export function Marca({ href = "/", grande = false }: { href?: string; grande?: boolean }) {
  return (
    <Link href={href} aria-label="CITi Legacy" className="inline-flex items-center gap-2">
      <Image
        src="/marca/citi-logo-verde.png"
        alt="CITi"
        width={225}
        height={115}
        priority
        className={grande ? "h-12 w-auto" : "h-7 w-auto"}
      />
      <span className={`font-bold tracking-tight text-gray-900 ${grande ? "text-3xl" : "text-lg"}`}>Legacy</span>
    </Link>
  );
}
