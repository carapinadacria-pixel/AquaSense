import { Lock } from 'lucide-react';
import type { AppSection } from '../lib/aquasenseTypes';
import { AquaLogo } from './AquaLogo';

interface FooterProps {
  onNavigate: (section: AppSection) => void;
}

export function Footer({ onNavigate }: FooterProps) {
  return (
    <footer className="bg-[#05263B] text-[#B8D7E8] border-t border-[#164461]">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-8 border-b border-white/10">
          <div className="md:col-span-5">
            <div className="flex items-center gap-2.5 text-white font-display font-extrabold text-lg">
              <AquaLogo size="sm" />
              <span>AQUASENSE</span>
            </div>
            <p className="text-sm text-[#6EC8E8] mt-2 font-medium">
              Inteligência para cada gota.
            </p>
            <p className="text-xs text-[#8DC3DC] mt-2 max-w-sm leading-relaxed">
              Sistema Inteligente de Monitorização e Gestão da Água · Projecto de inovação
              tecnológica e impacto socioambiental · Angola.
            </p>
          </div>

          <div className="md:col-span-4">
            <p className="text-xs font-semibold text-white mb-3">Navegação</p>
            <div className="grid grid-cols-2 gap-y-2 text-sm">
              <button
                type="button"
                onClick={() => onNavigate('visao-geral')}
                className="text-left hover:text-white transition-colors cursor-pointer"
              >
                Visão Geral
              </button>
              <button
                type="button"
                onClick={() => onNavigate('plataforma')}
                className="text-left hover:text-white transition-colors cursor-pointer"
              >
                Plataforma Digital
              </button>
              <button
                type="button"
                onClick={() => onNavigate('impacto')}
                className="text-left hover:text-white transition-colors cursor-pointer"
              >
                Impacto e ODS
              </button>
              <button
                type="button"
                onClick={() => onNavigate('contacto')}
                className="text-left hover:text-white transition-colors cursor-pointer"
              >
                Contacto
              </button>
            </div>
          </div>

          <div className="md:col-span-3">
            <p className="text-xs font-semibold text-white mb-3">Administração</p>
            <button
              type="button"
              onClick={() => onNavigate('gestao')}
              className="inline-flex items-center gap-2 text-sm text-[#6EC8E8] hover:text-white transition-colors cursor-pointer"
            >
              <Lock className="w-4 h-4 shrink-0" />
              <span>Portal de Gestão (Restrito)</span>
            </button>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-[#8DC3DC]">
          <p>AQUASENSE · Tecnologia e inovação ao serviço da água · Angola</p>
          <p>
            Parâmetros de qualidade têm carácter indicativo e não substituem análise laboratorial.
          </p>
        </div>
      </div>
    </footer>
  );
}
