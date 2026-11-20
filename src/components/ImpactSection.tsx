import {
  ArrowRight,
  Bell,
  Building2,
  Database,
  Droplets,
  FlaskConical,
  Gauge,
  LayoutDashboard,
  User,
} from 'lucide-react';
import {
  BENEFICIARIES_TABLE,
  IMPACT_BENEFITS,
  ODS_CONTRIBUTIONS,
  ROADMAP_STEPS,
} from '../lib/aquasenseData';
import type { AppSection } from '../lib/aquasenseTypes';
import { AquaLogo } from './AquaLogo';

interface ImpactSectionProps {
  onNavigate: (section: AppSection) => void;
}

const BENEFIT_ICONS = [Droplets, Gauge, Bell, LayoutDashboard, FlaskConical, Database];

export function ImpactSection({ onNavigate }: ImpactSectionProps) {
  return (
    <div>
      {/* 07 · IMPACTO SOCIAL E AMBIENTAL (PDF Page 8) */}
      <section className="max-w-[1240px] mx-auto px-4 sm:px-6 py-16 lg:py-20 border-b border-[#DCE5EC]">
        <p className="text-xs font-semibold text-[#0D76A8] mb-2">
          07 · Impacto social e ambiental
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold text-[#07334E] tracking-tight">
          Impacto social e ambiental
        </h1>
        <div className="w-12 h-1 bg-[#45B5DC] mt-3 mb-4" aria-hidden="true" />
        <p className="text-[#2C4050] max-w-3xl mb-10 leading-relaxed">
          Benefícios esperados com a implementação do AQUASENSE, sujeitos a validação em fase de
          testes-piloto.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-14">
          {IMPACT_BENEFITS.map((benefit, idx) => {
            const Icon = BENEFIT_ICONS[idx] ?? Droplets;
            return (
              <div
                key={benefit.title}
                className="bg-[#F3F6F9] border border-[#DCE5EC] rounded-xl p-6 flex items-start gap-4"
              >
                <div className="w-10 h-10 rounded-full bg-white border border-[#DCE5EC] text-[#0D76A8] flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-[#07334E]">{benefit.title}</h2>
                  <p className="text-sm text-[#2C4050] mt-1 leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Contributo para os Objectivos de Desenvolvimento Sustentável (ODS 6, 9, 11, 12) */}
        <h2 className="text-xl sm:text-2xl font-bold text-[#07334E] mb-5">
          Contributo para os Objectivos de Desenvolvimento Sustentável
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
          {ODS_CONTRIBUTIONS.map((ods) => (
            <div
              key={ods.number}
              className={`rounded-xl p-6 text-white flex flex-col justify-between min-h-[210px] ${
                ods.variant === 'navy' ? 'bg-[#07334E]' : 'bg-[#0D76A8]'
              }`}
            >
              <div>
                <p className="font-display text-4xl font-extrabold leading-none tabular-nums">
                  {ods.number}
                </p>
                <p className="text-xs font-semibold text-[#8DC3DC] mt-1 mb-4">ODS</p>
                <h3 className="text-base font-bold text-white leading-snug">{ods.title}</h3>
              </div>
              <p className="text-sm text-white/85 mt-4 leading-relaxed">{ods.description}</p>
            </div>
          ))}
        </div>

        <div className="bg-[#EBF6FB] border border-[#C5E4F2] rounded-xl p-5">
          <p className="text-sm text-[#07334E] leading-relaxed">
            <strong className="font-bold">Nota:</strong> A associação aos ODS representa um
            contributo potencial, a demonstrar com indicadores concretos na fase de testes-piloto.
          </p>
        </div>
      </section>

      {/* 08 · APLICAÇÕES E BENEFICIÁRIOS (PDF Page 9) */}
      <section className="bg-[#F8FAFC] border-b border-[#DCE5EC]">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 py-16 lg:py-20">
          <p className="text-xs font-semibold text-[#0D76A8] mb-2">
            08 · Aplicações e beneficiários
          </p>
          <h2 className="text-3xl font-bold text-[#07334E] tracking-tight">
            Aplicações e beneficiários
          </h2>
          <div className="w-12 h-1 bg-[#45B5DC] mt-3 mb-4" aria-hidden="true" />
          <p className="text-[#2C4050] max-w-3xl mb-8 leading-relaxed">
            A arquitectura modular do AQUASENSE permite adaptar a solução a diferentes escalas e
            contextos de utilização.
          </p>

          <div className="overflow-x-auto border border-[#DCE5EC] rounded-xl bg-white mb-12">
            <table className="w-full text-left border-collapse min-w-[680px]">
              <thead>
                <tr className="bg-[#07334E] text-white text-xs font-semibold">
                  <th className="py-3.5 px-5">Beneficiário</th>
                  <th className="py-3.5 px-5">Aplicação prevista</th>
                  <th className="py-3.5 px-5">Benefício esperado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DCE5EC] text-sm">
                {BENEFICIARIES_TABLE.map((row, idx) => (
                  <tr
                    key={row.beneficiary}
                    className={idx % 2 === 1 ? 'bg-[#F8FAFC]' : 'bg-white'}
                  >
                    <td className="py-4 px-5 font-semibold text-[#07334E]">
                      {row.beneficiary}
                    </td>
                    <td className="py-4 px-5 text-[#2C4050]">{row.application}</td>
                    <td className="py-4 px-5 text-[#2C4050]">{row.benefit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Quem utiliza a plataforma */}
          <h3 className="text-xl font-bold text-[#07334E] mb-5">Quem utiliza a plataforma</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-[#DCE5EC] rounded-xl p-7 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3.5 mb-4">
                  <div className="w-11 h-11 rounded-full bg-[#07334E] text-white flex items-center justify-center">
                    <User className="w-5 h-5" />
                  </div>
                  <h4 className="text-lg font-bold text-[#07334E]">Consumidor</h4>
                </div>
                <ul className="space-y-2.5 text-sm text-[#2C4050]">
                  <li>· Consulta do consumo e do histórico</li>
                  <li>· Alertas de consumo anormal ou possíveis fugas</li>
                  <li>· Recomendações para reduzir o desperdício</li>
                  <li>· Informação sobre parâmetros da água</li>
                </ul>
              </div>
              <div className="mt-6 pt-5 border-t border-[#DCE5EC]">
                <button
                  type="button"
                  onClick={() => onNavigate('plataforma')}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-[#0D76A8] hover:text-[#07334E] cursor-pointer"
                >
                  <span>Aceder à Plataforma (Consumidores e Organizações)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="bg-[#EBF6FB] border border-[#C5E4F2] rounded-xl p-7 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3.5 mb-4">
                  <div className="w-11 h-11 rounded-full bg-[#07334E] text-white flex items-center justify-center">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <h4 className="text-lg font-bold text-[#07334E]">Entidade gestora</h4>
                </div>
                <ul className="space-y-2.5 text-sm text-[#2C4050]">
                  <li>· Visão centralizada de vários pontos</li>
                  <li>· Identificação de anomalias e fugas</li>
                  <li>· Dados agregados para planeamento</li>
                  <li>· Apoio à transparência na leitura</li>
                </ul>
              </div>
              <div className="mt-6 pt-5 border-t border-[#C5E4F2]">
                <button
                  type="button"
                  onClick={() => onNavigate('gestao')}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-[#07334E] hover:text-[#0D76A8] cursor-pointer"
                >
                  <span>Abrir Portal de Gestão</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 09 · PERSPECTIVAS DE DESENVOLVIMENTO (PDF Page 10) */}
      <section className="max-w-[1240px] mx-auto px-4 sm:px-6 py-16 lg:py-20">
        <p className="text-xs font-semibold text-[#0D76A8] mb-2">
          09 · Perspectivas de desenvolvimento
        </p>
        <h2 className="text-3xl font-bold text-[#07334E] tracking-tight">
          Perspectivas de desenvolvimento
        </h2>
        <div className="w-12 h-1 bg-[#45B5DC] mt-3 mb-4" aria-hidden="true" />
        <p className="text-[#2C4050] max-w-3xl mb-10 leading-relaxed">
          Possibilidades de evolução do AQUASENSE, após a validação técnica da solução. Trata-se de
          perspectivas futuras, sem prazos ou compromissos assumidos neste documento.
        </p>

        {/* Vertical Timeline matching Page 10 */}
        <ol className="relative space-y-6 mb-14 before:content-[''] before:absolute before:left-5 before:top-5 before:bottom-5 before:w-0.5 before:bg-[#B8D7E8]">
          {ROADMAP_STEPS.map((item) => (
            <li
              key={item.step}
              className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-3 pl-14"
            >
              <span
                className={`absolute left-0 top-0.5 w-10 h-10 rounded-full flex items-center justify-center text-sm font-mono font-bold text-white ${
                  item.step % 2 === 1 ? 'bg-[#07334E]' : 'bg-[#0D76A8]'
                }`}
              >
                {item.step}
              </span>
              <div>
                <h3 className="text-base font-bold text-[#07334E]">{item.title}</h3>
                <p className="text-sm text-[#5A7184] mt-0.5">{item.description}</p>
              </div>
              <span className="text-xs font-medium text-[#5A7184] whitespace-nowrap shrink-0">
                Perspectiva futura
              </span>
            </li>
          ))}
        </ol>

        {/* Compromisso & Final Banner matching PDF Page 10 */}
        <div className="mb-8">
          <h3 className="text-lg font-bold text-[#07334E] mb-2">Compromisso</h3>
          <p className="text-[#2C4050] leading-relaxed max-w-3xl">
            Promover a inovação tecnológica ao serviço da sociedade e do ambiente, contribuindo para
            um futuro em que cada gota de água seja valorizada.
          </p>
        </div>

        <div className="bg-[#07334E] text-white rounded-2xl p-8 sm:p-10 flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <AquaLogo size="md" />
          <div>
            <p className="font-display text-xl sm:text-2xl font-semibold italic text-white leading-snug">
              Cada gota conta. Cada dado importa.
              <br />O futuro da água começa com uma gestão inteligente.
            </p>
            <p className="text-xs font-semibold tracking-wider text-[#6EC8E8] mt-4">
              AQUASENSE · Inteligência para cada gota
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
