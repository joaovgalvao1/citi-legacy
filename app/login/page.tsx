// Tela de login

import { FormularioLogin } from "@/components/login/formulario";
import { Marca } from "@/components/layout/marca";

export default function Login() {
  return (
    <div className="anima-surgir w-full max-w-sm space-y-8">
      <div className="space-y-3 text-center">
        <Marca grande />
        <p className="text-sm text-gray-600">Entre para acompanhar os projetos do CITi.</p>
      </div>
      <div className="rounded-2xl border border-gray-300 bg-white p-6">
        <FormularioLogin />
      </div>
    </div>
  );
}
