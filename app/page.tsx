// Tela de login

import { FormularioLogin } from "@/components/login/formulario";

export default function Login() {
  return (
    <div className="w-full max-w-sm space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold">CITi Legacy</h1>
        <p className="text-sm text-gray-600">Todo projeto deixa um legado. Quem chega não começa do zero.</p>
      </div>
      <div className="border border-gray-400 bg-white p-6">
        <FormularioLogin />
      </div>
    </div>
  );
}
