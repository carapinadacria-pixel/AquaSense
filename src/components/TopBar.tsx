import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import type { AppSection } from '../lib/aquasenseTypes';
import { AquaLogo } from './AquaLogo';

interface TopBarProps {
  activeSection: AppSection;
  onNavigate: (section: AppSection) => void;
}

const NAV_ITEMS: { id: AppSection; label: string }[] = [
  { id: 'visao-geral', label: 'Visão Geral' },
  { id: 'plataforma', label: 'Plataforma' },
  { id: 'impacto', label: 'Impacto' },
  { id: 'contacto', label: 'Contacto' },
];

export function TopBar({ activeSection, onNavigate }: TopBarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSelect = (section: AppSection) => {
    onNavigate(section);
    setMobileOpen(false);
  };

  const isWorkspace = activeSection === 'plataforma' || activeSection === 'gestao';

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-[#DCE5EC]">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single-line Brand Wordmark */}
        <button
          type="button"
          onClick={() => handleSelect('visao-geral')}
          className="flex items-center gap-2.5 text-[#07334E] font-display font-extrabold text-lg tracking-tight whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 rounded-sm"
        >
          <AquaLogo size="sm" />
          <span>AQUASENSE</span>
        </button>

        {/* Zone 2: 5 Concise Single-Line Navigation Links */}
        <nav
          aria-label="Navegação principal"
          className="hidden md:flex items-center gap-7 text-sm font-medium text-[#4A6274]"
        >
          {NAV_ITEMS.map((item) => {
            const active = activeSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelect(item.id)}
                aria-current={active ? 'page' : undefined}
                className={`relative py-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 rounded-sm ${
                  active
                    ? 'text-[#07334E] font-semibold'
                    : 'hover:text-[#07334E]'
                }`}
              >
                {item.label}
                {active && (
                  <span
                    aria-hidden="true"
                    className="absolute left-0 right-0 bottom-0 h-0.5 bg-[#0D76A8]"
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: 1 Primary Action (+ mobile menu trigger on small screens) */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => handleSelect(isWorkspace ? 'visao-geral' : 'plataforma')}
            className="hidden sm:inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-[#07334E] hover:bg-[#0D76A8] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            {isWorkspace ? 'Voltar ao Início' : 'Abrir Plataforma'}
          </button>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label={mobileOpen ? 'Fechar menu de navegação' : 'Abrir menu de navegação'}
            aria-expanded={mobileOpen}
            className="md:hidden inline-flex items-center justify-center w-11 h-11 rounded-lg border border-[#DCE5EC] text-[#07334E] hover:bg-[#F3F6F9] transition-colors cursor-pointer"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileOpen && (
        <nav
          aria-label="Navegação móvel"
          className="md:hidden border-t border-[#DCE5EC] bg-white px-4 py-4 space-y-1"
        >
          {NAV_ITEMS.map((item) => {
            const active = activeSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelect(item.id)}
                aria-current={active ? 'page' : undefined}
                className={`w-full text-left px-3 py-3 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                  active
                    ? 'bg-[#EBF6FB] text-[#07334E] font-semibold'
                    : 'text-[#334A5C] hover:bg-[#F3F6F9]'
                }`}
              >
                {item.label}
              </button>
            );
          })}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => handleSelect(isWorkspace ? 'visao-geral' : 'plataforma')}
              className="w-full py-3 px-4 text-sm font-semibold text-white bg-[#07334E] hover:bg-[#0D76A8] rounded-lg transition-colors cursor-pointer"
            >
              {isWorkspace ? 'Voltar ao Início' : 'Abrir Plataforma'}
            </button>
          </div>
        </nav>
      )}
    </header>
  );
}
