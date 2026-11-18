import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./db/esquema.ts",
  out: "./db/migracoes",
  dialect: "postgresql",
  dbCredentials: { url: process.env.DATABASE_URL! },
});
