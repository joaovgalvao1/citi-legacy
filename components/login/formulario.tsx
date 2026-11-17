"use client";

// Formulário de login (usuário único de demonstração).

import { useState } from "react";
import { useRouter } from "next/navigation";
import { entrar } from "@/lib/sessao";
import { Botao } from "@/components/ui";

export function FormularioLogin() {
  const router = useRouter();
  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");

  function enviar(e: React.FormEvent) {
    e.preventDefault();
    if (!usuario.trim() || !senha) {
      setErro("Preencha usuário e senha.");
      return;
    }
    if (!entrar(usuario, senha)) {
      setErro("Usuário ou senha incorretos.");
      return;
    }
    router.replace("/projetos");
  }

  return (
    <form onSubmit={enviar} className="space-y-4" noValidate>
      <label className="block text-sm">
        <span className="mb-1 block text-gray-700">Usuário</span>
        <input
          value={usuario}
          onChange={(e) => {
            setUsuario(e.target.value);
            setErro("");
          }}
          autoComplete="username"
          className="w-full border border-gray-400 bg-white px-3 py-2"
        />
      </label>
      <label className="block text-sm">
        <span className="mb-1 block text-gray-700">Senha</span>
        <input
          type="password"
          value={senha}
          onChange={(e) => {
            setSenha(e.target.value);
            setErro("");
          }}
          autoComplete="current-password"
          className="w-full border border-gray-400 bg-white px-3 py-2"
        />
      </label>
      {erro && (
        <p role="alert" className="text-sm font-semibold text-gray-900">
          {erro}
        </p>
      )}
      <Botao type="submit">Entrar</Botao>
    </form>
  );
}
