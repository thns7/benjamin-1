import { Cadastro } from './cadastro';

export const metadata = { title: 'Criar conta' };

export default function CadastroPage() {
  // O layout raiz não envolve esta rota no Shell (ver app/layout.tsx).
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <Cadastro />
    </div>
  );
}
