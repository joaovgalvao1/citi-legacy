// Conexão com o Postgres (local no Docker ou Neon na Vercel), via DATABASE_URL.

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as esquema from "./esquema";

const globalParaBanco = globalThis as unknown as { cliente?: ReturnType<typeof postgres> };

function criarCliente() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL não definida (veja .env.example)");
  // poucas conexões: funciona bem em ambiente serverless e no desenvolvimento
  return postgres(url, { max: 3, prepare: false });
}

// reaproveita a conexão entre recarregamentos do servidor de desenvolvimento
const cliente = globalParaBanco.cliente ?? criarCliente();
if (process.env.NODE_ENV !== "production") globalParaBanco.cliente = cliente;

export const db = drizzle(cliente, { schema: esquema });
export { esquema };
