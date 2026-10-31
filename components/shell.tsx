'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';
import {
  Bell,
  Building2,
  FolderUp,
  MessagesSquare,
  Moon,
  Plus,
  Radar,
  Sun,
  Tags,
  type LucideIcon,
} from 'lucide-react';
import { Logo, TAGLINE, Wordmark } from './logo';
import { BotaoSair } from './sair';

type Item = { href: string; rotulo: string; icone: LucideIcon };
type Grupo = { titulo: string; itens: Item[] };

/*
 * O menu é o radar de churn. As telas da época de vendas (Coaching, Radar de
 * dores, Torre de controle, Validação) saíram daqui em 2026-10-28, mas as rotas
 * continuam funcionando: dá para reaproveitar ou trazer de volta sem perda.
 */
const GRUPOS: Grupo[] = [
  {
    titulo: 'Retenção',
    itens: [
      { href: '/', rotulo: 'Radar', icone: Radar },
      { href: '/clientes', rotulo: 'Contas', icone: Building2 },
      { href: '/alertas', rotulo: 'Alertas', icone: Bell },
    ],
  },
  {
    titulo: 'Reuniões',
    itens: [
      { href: '/reunioes', rotulo: 'Reuniões', icone: MessagesSquare },
      { href: '/reunioes/lote', rotulo: 'Importar', icone: FolderUp },
    ],
  },
  {
    titulo: 'Empresa',
    itens: [{ href: '/catalogo', rotulo: 'Catálogo', icone: Tags }],
  },
];

function casa(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}

const TODAS_AS_ROTAS = GRUPOS.flatMap((g) => g.itens.map((i) => i.href));

/**
 * Só o item mais específico acende: em /reunioes/lote, "Importar em lote"
 * está ativo e "Reuniões" não, embora o caminho comece com /reunioes/.
 */
function ehAtivo(pathname: string, href: string): boolean {
  if (!casa(pathname, href)) return false;
  return !TODAS_AS_ROTAS.some((outra) => outra.length > href.length && casa(pathname, outra));
}

function AlternadorTema() {
  const [tema, setTema] = useState<'dark' | 'light'>('light');

  useEffect(() => {
    const atual = document.documentElement.getAttribute('data-theme');
    if (atual === 'light' || atual === 'dark') setTema(atual);
  }, []);

  function alternar() {
    const proximo = tema === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', proximo);
    try {
      localStorage.setItem('benjamin-tema', proximo);
    } catch {
      // localStorage bloqueado: o tema volta ao padrão no próximo carregamento.
    }
    setTema(proximo);
  }

  return (
    <button
      type="button"
      onClick={alternar}
      className="inline-flex size-7 items-center justify-center rounded-md border border-line text-ink-faint transition-colors duration-150 hover:border-line-strong hover:text-ink"
      aria-label={tema === 'dark' ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
      title={tema === 'dark' ? 'Tema claro' : 'Tema escuro'}
    >
      {tema === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
    </button>
  );
}

/**
 * Botão de ação primária: o único bloco chapado na cor da marca. Fica
 * reservado para a única coisa que o usuário SEMPRE pode fazer: trazer uma
 * reunião nova para dentro.
 */
function BotaoNova({ compacto = false }: { compacto?: boolean }) {
  return (
    <Link
      href="/reunioes/nova"
      className={`inline-flex items-center justify-center gap-1.5 rounded-md bg-acao font-semibold text-on-acao transition-opacity duration-150 hover:opacity-90 ${
        compacto ? 'px-2.5 py-1.5 text-[12px]' : 'w-full px-3 py-2 text-[13px]'
      }`}
    >
      <Plus size={compacto ? 13 : 14} />
      {compacto ? 'Analisar' : 'Analisar reunião'}
    </Link>
  );
}

export function Shell({ children, motor }: { children: ReactNode; motor: string }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-dvh">
      <aside className="no-print vidro-sutil sticky top-0 hidden h-dvh w-[236px] shrink-0 flex-col border-r border-line md:flex">
        <div className="flex items-center gap-2.5 px-4 py-5">
          <Logo size={28} />
          <div className="min-w-0">
            <Wordmark />
            <p className="mt-1 text-[11.5px] leading-[1.35] text-ink-faint">
              {TAGLINE}
            </p>
          </div>
        </div>

        <div className="px-3 pb-4">
          <BotaoNova />
        </div>

        <nav className="flex-1 overflow-y-auto px-3 pb-4">
          {GRUPOS.map((grupo) => (
            // Cinco itens não precisam de título de grupo: o que separa retenção de
            // reuniões é um respiro e uma linha fina.
            <div key={grupo.titulo} className="mb-3 border-b border-line pb-3 last:border-0">
              <ul className="space-y-0.5">
                {grupo.itens.map((item) => {
                  const ativo = ehAtivo(pathname, item.href);
                  const Icone = item.icone;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        aria-current={ativo ? 'page' : undefined}
                        className={`flex items-center gap-2.5 rounded-md px-2.5 py-[7px] text-[13px] transition-colors duration-150 ${
                          ativo
                            ? 'bg-surface-3 font-semibold text-ink'
                            : 'text-ink-dim hover:bg-surface-2 hover:text-ink'
                        }`}
                      >
                        <Icone size={15} className={`shrink-0 ${ativo ? 'text-accent' : ''}`} />
                        {item.rotulo}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="flex items-center justify-between gap-2 border-t border-line px-3 py-3">
          <span className="text-[11.5px] text-ink-faint" title="Motor de análise ativo">
            Motor de {motor}
          </span>
          <div className="flex items-center gap-1.5">
            <AlternadorTema />
            <BotaoSair />
          </div>
        </div>
      </aside>

      {/* Barra de navegação do mobile */}
      <header className="no-print vidro-sutil fixed inset-x-0 top-0 z-20 flex items-center justify-between border-b border-line px-4 py-2.5 md:hidden">
        <Link href="/" className="flex items-center gap-2.5">
          <Logo size={24} />
          <Wordmark className="!text-[11px] !tracking-[0.34em]" />
        </Link>
        <div className="flex items-center gap-2">
          <BotaoNova compacto />
          <AlternadorTema />
          <BotaoSair compacto />
        </div>
      </header>

      <main className="min-w-0 flex-1 px-4 pb-20 pt-20 md:px-10 md:pt-10">
        <div className="mx-auto max-w-[1200px]">{children}</div>
      </main>

      {/* Navegação inferior do mobile */}
      <nav className="no-print vidro-sutil fixed inset-x-0 bottom-0 z-20 flex items-center justify-around border-t border-line py-2 md:hidden">
        {GRUPOS.flatMap((g) => g.itens)
          .slice(0, 5)
          .map((item) => {
            const ativo = ehAtivo(pathname, item.href);
            const Icone = item.icone;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={ativo ? 'page' : undefined}
                className={`flex flex-col items-center gap-1 px-2 py-1 text-[11.5px] transition-colors ${
                  ativo ? 'font-semibold text-accent' : 'text-ink-faint'
                }`}
              >
                <Icone size={17} />
                {item.rotulo}
              </Link>
            );
          })}
      </nav>
    </div>
  );
}
