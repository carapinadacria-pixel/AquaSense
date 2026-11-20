import { useState } from 'react';
import { motion } from 'motion/react';
import {
  Activity,
  ArrowRight,
  Bell,
  Clock,
  Cpu,
  Droplets,
  FlaskConical,
  Gauge,
  LayoutDashboard,
  Radio,
  ShieldAlert,
  Target,
  Wifi,
} from 'lucide-react';
import { PROBLEMS_LIST, SOLUTION_ELEMENTS } from '../lib/aquasenseData';
import type { AppSection, MeterPoint } from '../lib/aquasenseTypes';
import { evaluateWaterQuality } from '../lib/aquasenseEngine';
import { AquaLogo } from './AquaLogo';

interface OverviewSectionProps {
  featuredMeter: MeterPoint;
  liveClockHms: string;
  onNavigate: (section: AppSection) => void;
}

const TARGET_AUDIENCE = [
  'Famílias e residências',
  'Condomínios',
  'Empresas de distribuição de água',
  'Instituições públicas',
  'Escolas e universidades',
  'Comunidades',
];

const PROBLEM_ICONS = [Gauge, Activity, Droplets, Bell, FlaskConical];
const SOLUTION_ICONS = [Cpu, Gauge, FlaskConical, Wifi, LayoutDashboard, Bell];

type VennDimensionKey = 'consumo' | 'gestao' | 'qualidade';

const VENN_DIMENSIONS: Record<
  VennDimensionKey,
  {
    title: string;
    subtitle: string;
    detail: string;
    color: string;
  }
> = {
  consumo: {
    title: 'Monitorização do consumo',
    subtitle: 'Leitura contínua segundo a segundo',
    detail:
      'Registo automatizado de caudal instantâneo (L/min), volume diário e histórico acumulado em residências, condomínios e instituições.',
    color: '#0D76A8',
  },
  gestao: {
    title: 'Gestão inteligente e prevenção do desperdício',
    subtitle: 'Detecção de fugas e controlo hidráulico',
    detail:
      'Identificação automática de fluxos contínuos fora do padrão, alertas de pressão e comando preventivo da válvula principal.',
    color: '#38B2DA',
  },
  qualidade: {
    title: 'Monitorização da qualidade da água',
    subtitle: 'Indicadores físico-químicos contínuos',
    detail:
      'Acompanhamento em tempo real de pH, turbidez, TDS/condutividade e temperatura para sinalização precoce de alterações na água.',
    color: '#07334E',
  },
};

export function OverviewSection({
  featuredMeter,
  liveClockHms,
  onNavigate,
}: OverviewSectionProps) {
  const quality = evaluateWaterQuality(featuredMeter.quality);
  const [activeVenn, setActiveVenn] = useState<VennDimensionKey>('consumo');
  const currentVennInfo = VENN_DIMENSIONS[activeVenn];

  return (
    <div>
      {/* HERO — Directly inspired by Page 1 of the AQUASENSE Institutional PDF */}
      <section className="relative overflow-hidden bg-[#07334E] text-white">
        {/* Geometric concentric water ripples & subtle IoT circuit traces from PDF Cover */}
        <svg
          aria-hidden="true"
          viewBox="0 0 1440 680"
          fill="none"
          className="pointer-events-none absolute inset-0 w-full h-full object-cover opacity-80"
          preserveAspectRatio="xMaxYMid slice"
        >
          {/* Concentric ripples anchored bottom-right */}
          {[180, 290, 400, 510, 620, 740, 860].map((r) => (
            <circle
              key={r}
              cx="1260"
              cy="610"
              r={r}
              stroke="#38B2DA"
              strokeOpacity="0.11"
              strokeWidth="1.2"
            />
          ))}
          {/* Minimal circuit traces top-right matching Page 1 (desktop only to keep mobile hero clean) */}
          <g className="hidden lg:block">
            <path
              d="M840 74 H1140 V42"
              stroke="#38B2DA"
              strokeOpacity="0.28"
              strokeWidth="1.4"
            />
            <path
              d="M840 74 H1140 V42"
              stroke="#6EC8E8"
              strokeOpacity="0.65"
              strokeWidth="1.8"
              strokeDasharray="10 26"
              className="animate-aqua-flow"
            />
            <circle cx="840" cy="74" r="4" fill="#45B5DC" />
            <circle cx="1140" cy="42" r="4" fill="#45B5DC" />

            <path
              d="M910 148 H1060 V94 H1230 V42"
              stroke="#38B2DA"
              strokeOpacity="0.24"
              strokeWidth="1.4"
            />
            <path
              d="M910 148 H1060 V94 H1230 V42"
              stroke="#6EC8E8"
              strokeOpacity="0.55"
              strokeWidth="1.8"
              strokeDasharray="10 26"
              className="animate-aqua-flow"
            />
            <circle cx="910" cy="148" r="4" fill="#45B5DC" />
            <circle cx="1230" cy="42" r="4" fill="#45B5DC" />

            <path
              d="M1170 212 V126 H1320 V42"
              stroke="#38B2DA"
              strokeOpacity="0.22"
              strokeWidth="1.4"
            />
            <circle cx="1170" cy="212" r="4" fill="#45B5DC" />
            <circle cx="1320" cy="42" r="4" fill="#45B5DC" />
          </g>
        </svg>

        <div className="relative max-w-[1240px] mx-auto px-4 sm:px-6 py-16 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">
            {/* Left column: Primary Brand Statement */}
            <div className="lg:col-span-7 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-5 mb-6">
                  <AquaLogo size="hero" />
                  <div>
                    <h1
                      className="font-display font-extrabold tracking-tight text-white leading-none"
                      style={{ fontSize: 'clamp(2.4rem, 4.5vw, 3.75rem)' }}
                    >
                      AQUASENSE
                    </h1>
                    <p className="text-xl sm:text-2xl font-medium text-[#45B5DC] mt-2">
                      Inteligência para cada gota.
                    </p>
                  </div>
                </div>

                <div className="w-16 h-0.5 bg-[#45B5DC] mb-6" aria-hidden="true" />

                <h2 className="text-xl sm:text-2xl font-semibold text-white/95 max-w-2xl leading-snug">
                  Sistema Inteligente de Monitorização e Gestão da Água
                </h2>
                <p className="text-base text-[#B8D7E8] mt-3 max-w-xl leading-relaxed">
                  Projecto de inovação tecnológica e impacto socioambiental concebido para modernizar
                  o acompanhamento do consumo e dos parâmetros físico-químicos da água em Angola.
                </p>

                {/* Clean unboxed domain descriptors with typographic separators */}
                <p className="mt-6 text-xs sm:text-sm text-[#8DC3DC] leading-relaxed">
                  Internet das Coisas (IoT) · Recursos hídricos · Sustentabilidade ambiental ·
                  Qualidade da água · Angola
                </p>

                {/* Primary CTA + Secondary link */}
                <div className="mt-9 flex flex-wrap items-center gap-4">
                  <button
                    type="button"
                    onClick={() => onNavigate('plataforma')}
                    className="inline-flex items-center gap-2.5 px-6 py-3.5 text-sm font-semibold text-[#07334E] bg-[#45B5DC] hover:bg-[#6EC8E8] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <span>Explorar Plataforma Digital</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onNavigate('impacto')}
                    className="inline-flex items-center gap-2 px-5 py-3.5 text-sm font-medium text-white border border-white/25 hover:border-[#45B5DC] hover:text-[#6EC8E8] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <span>Ver Impacto e Benefícios</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right column: Live Interactive Platform Preview Card */}
            <div className="lg:col-span-5 flex flex-col">
              <div className="h-full bg-[#05263B]/90 border border-[#1E5678] rounded-xl p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-3 pb-4 border-b border-white/10">
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-[#6EC8E8]">
                        Telemetria em Tempo Real · {featuredMeter.municipality}, {featuredMeter.province}
                      </p>
                      <p className="text-base font-semibold text-white mt-0.5">
                        {featuredMeter.name}
                      </p>
                    </div>
                    <span className="font-mono text-xs text-[#8DC3DC] tabular-nums whitespace-nowrap shrink-0">
                      {featuredMeter.code}
                    </span>
                  </div>

                  {/* Live numerical telemetry metrics */}
                  <div className="grid grid-cols-2 gap-4 py-5 border-b border-white/10">
                    <div>
                      <p className="text-xs text-[#8DC3DC]">Consumo hoje</p>
                      <p className="text-2xl font-bold font-mono tabular-nums text-white mt-1">
                        {featuredMeter.dailyLiters.toFixed(1)}{' '}
                        <span className="text-sm font-normal text-[#8DC3DC]">L</span>
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-[#8DC3DC]">Caudal · Pressão</p>
                      <p className="text-2xl font-bold font-mono tabular-nums text-white mt-1">
                        {featuredMeter.currentFlowLpm.toFixed(1)}{' '}
                        <span className="text-sm font-normal text-[#8DC3DC]">L/min</span>
                        <span className="text-xs font-normal text-[#6EC8E8] ml-1.5">
                          {featuredMeter.pressureBar.toFixed(1)} bar
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Physico-chemical readings */}
                  <div className="py-5">
                    <div className="flex items-center justify-between text-xs mb-3">
                      <span className="text-[#8DC3DC]">Parâmetros físico-químicos (indicativos)</span>
                      <span className="font-medium text-[#6EC8E8]">{quality.overallLabel}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {quality.parameters.map((param) => (
                        <div
                          key={param.key}
                          className="bg-[#07334E] border border-white/10 rounded-lg px-3.5 py-2.5"
                        >
                          <p className="text-[11px] text-[#8DC3DC] truncate">
                            {param.label.split(' ')[0]}
                          </p>
                          <p className="font-mono tabular-nums text-base font-semibold text-white mt-0.5">
                            {param.value}{' '}
                            <span className="text-xs font-normal text-[#8DC3DC]">{param.unit}</span>
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-3">
                  <span className="inline-flex items-center gap-1.5 text-xs font-mono tabular-nums text-[#8DC3DC]">
                    <Clock className="w-3.5 h-3.5 text-[#45B5DC]" aria-hidden="true" />
                    <span>{liveClockHms}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => onNavigate('plataforma')}
                    className="text-xs font-semibold text-[#45B5DC] hover:text-white inline-flex items-center gap-1 cursor-pointer whitespace-nowrap"
                  >
                    <span>Simular cenários</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* DESCRIÇÃO GERAL (Starts directly at Descrição geral as requested) */}
      <section className="max-w-[1240px] mx-auto px-4 sm:px-6 py-20 border-b border-[#DCE5EC]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mb-12">
          <div className="lg:col-span-6 space-y-3">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#07334E] tracking-tight">
              Descrição geral
            </h2>
            <div className="w-12 h-1 bg-[#45B5DC] mb-4" aria-hidden="true" />
            <p className="text-[#2C4050] leading-relaxed">
              O AQUASENSE é um sistema inteligente de monitorização e gestão da água, concebido para
              modernizar o acompanhamento do consumo e da qualidade da água em Angola. A solução
              assenta num dispositivo electrónico instalado junto ao contador domiciliar, capaz de
              realizar leituras automatizadas do consumo e de transmitir os dados para uma plataforma
              digital de gestão.
            </p>
            <p className="text-[#2C4050] leading-relaxed">
              Para além do consumo, o dispositivo incorpora sensores destinados a acompanhar
              determinados parâmetros físico-químicos da água, permitindo identificar alterações e
              emitir notificações e recomendações aos utilizadores.
            </p>
          </div>
          <div className="lg:col-span-6 space-y-3 lg:pt-2">
            <h3 className="text-xl font-bold text-[#07334E]">Contextualização</h3>
            <p className="text-[#2C4050] leading-relaxed">
              A gestão da água depende de informação fiável e atempada. Em muitos contextos, o
              registo do consumo continua a basear-se na leitura manual dos contadores, e o acesso
              dos consumidores a informação sobre o seu consumo e sobre as características da água é
              limitado.
            </p>
            <p className="text-[#2C4050] leading-relaxed">
              O AQUASENSE procura tornar esta informação mais acessível, transparente e útil,
              recorrendo a tecnologias acessíveis e adequadas à realidade angolana.
            </p>
          </div>
        </div>

        {/* Missão & Visão */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-[#F3F6F9] border border-[#DCE5EC] rounded-xl p-7">
            <div className="flex items-center gap-3.5 mb-4">
              <div className="w-10 h-10 rounded-full bg-[#07334E] text-white flex items-center justify-center shrink-0">
                <Droplets className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-[#07334E]">Missão</h3>
            </div>
            <p className="text-[#2C4050] leading-relaxed">
              Contribuir para uma gestão mais inteligente, eficiente e sustentável dos recursos
              hídricos, através da utilização de tecnologias acessíveis que promovam a conservação da
              água, a transparência da informação e a melhoria da qualidade de vida das comunidades.
            </p>
          </div>

          <div className="bg-[#F3F6F9] border border-[#DCE5EC] rounded-xl p-7">
            <div className="flex items-center gap-3.5 mb-4">
              <div className="w-10 h-10 rounded-full bg-[#0D76A8] text-white flex items-center justify-center shrink-0">
                <Radio className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-[#07334E]">Visão</h3>
            </div>
            <p className="text-[#2C4050] leading-relaxed">
              Tornar-se uma solução tecnológica de referência em Angola e, futuramente, em África, na
              modernização da monitorização e gestão inteligente dos recursos hídricos.
            </p>
          </div>
        </div>

        {/* Objectivo Geral Banner (Deep Navy #07334E matching PDF Page 2) */}
        <div className="bg-[#07334E] text-white rounded-xl p-7 sm:p-8 mb-10">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#6EC8E8] mb-2">
            <Target className="w-4 h-4" />
            <span>Objectivo geral</span>
          </div>
          <p className="text-base sm:text-lg text-white/95 leading-relaxed max-w-4xl">
            Desenvolver e demonstrar uma solução tecnológica integrada que permita monitorizar
            automaticamente o consumo e acompanhar parâmetros da qualidade da água, apoiando
            consumidores e entidades gestoras na redução do desperdício e na tomada de decisões
            informadas.
          </p>
        </div>

        {/* Público-alvo (clean structured strip, no static pill clutter) */}
        <div>
          <h3 className="text-base font-bold text-[#07334E] mb-3">Público-alvo</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {TARGET_AUDIENCE.map((group) => (
              <div
                key={group}
                className="bg-[#EBF6FB] border border-[#C5E4F2] rounded-lg px-4 py-3 text-sm font-medium text-[#07334E]"
              >
                {group}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 02 · PROBLEMA IDENTIFICADO (PDF Page 3) */}
      <section className="bg-[#F8FAFC] border-b border-[#DCE5EC]">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 py-20">
          <p className="text-xs font-semibold text-[#0D76A8] mb-2">
            02 · Problema identificado
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#07334E] tracking-tight">
            Problema identificado
          </h2>
          <div className="w-12 h-1 bg-[#45B5DC] mt-3 mb-4" aria-hidden="true" />
          <p className="text-[#2C4050] max-w-3xl mb-10 leading-relaxed">
            A monitorização tradicional do consumo e da qualidade da água apresenta limitações que
            afectam consumidores e entidades gestoras. Os principais desafios identificados são:
          </p>

          <div className="space-y-3.5 mb-10">
            {PROBLEMS_LIST.map((problem, idx) => {
              const Icon = PROBLEM_ICONS[idx] ?? ShieldAlert;
              return (
                <div
                  key={problem.num}
                  className="bg-white border border-[#DCE5EC] rounded-xl p-5 sm:p-6 flex items-start gap-5"
                >
                  <div className="w-11 h-11 rounded-full bg-[#EBF6FB] text-[#0D76A8] flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-base sm:text-lg font-bold text-[#07334E]">
                      <span className="font-mono text-[#0D76A8] mr-2.5">{problem.num}</span>
                      {problem.title}
                    </h3>
                    <p className="text-sm sm:text-base text-[#2C4050] mt-1.5 leading-relaxed">
                      {problem.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 bg-white border border-[#DCE5EC] rounded-xl p-6">
              <h3 className="text-lg font-bold text-[#07334E] mb-2">O contexto angolano</h3>
              <p className="text-sm sm:text-base text-[#2C4050] leading-relaxed">
                No contexto angolano, a diversidade de sistemas de abastecimento e a necessidade de
                gerir os recursos hídricos de forma responsável reforçam a importância de ferramentas
                que aproximem a informação do utilizador final e das entidades gestoras, tornando o
                consumo mais visível e a gestão mais transparente.
              </p>
            </div>
            <div className="lg:col-span-5 bg-[#EBF6FB] border border-[#C5E4F2] rounded-xl p-6">
              <p className="text-sm font-bold text-[#07334E] mb-1.5">Nota metodológica</p>
              <p className="text-sm text-[#2C4050] leading-relaxed">
                A quantificação estatística do problema apoia-se em dados oficiais e em levantamentos
                técnicos de campo. Os valores exibidos na plataforma digital ilustram o funcionamento
                contínuo e em tempo real do sistema.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 03 · A SOLUÇÃO AQUASENSE (PDF Page 4) */}
      <section className="max-w-[1240px] mx-auto px-4 sm:px-6 py-20 border-b border-[#DCE5EC]">
        <p className="text-xs font-semibold text-[#0D76A8] mb-2">
          03 · A solução AQUASENSE
        </p>
        <h2 className="text-3xl sm:text-4xl font-bold text-[#07334E] tracking-tight">
          A solução AQUASENSE
        </h2>
        <div className="w-12 h-1 bg-[#45B5DC] mt-3 mb-4" aria-hidden="true" />
        <p className="text-[#2C4050] max-w-3xl mb-10 leading-relaxed">
          O AQUASENSE propõe uma solução tecnológica integrada, composta por seis elementos
          complementares que, em conjunto, transformam o contador convencional num ponto inteligente
          de recolha de dados.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {SOLUTION_ELEMENTS.map((item, idx) => {
            const Icon = SOLUTION_ICONS[idx] ?? Cpu;
            return (
              <div
                key={item.num}
                className="bg-[#F3F6F9] border border-[#DCE5EC] rounded-xl p-6 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-11 h-11 rounded-full bg-[#07334E] text-white flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="font-mono text-2xl font-bold text-[#6EC8E8] tabular-nums">
                      {item.num}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-[#07334E] mb-2">{item.title}</h3>
                  <p className="text-sm text-[#2C4050] leading-relaxed">{item.description}</p>
                </div>

                <div className="mt-6 pt-4 border-t border-[#DCE5EC] flex items-center justify-between text-xs">
                  <span className="text-[#5A7184]">Estado</span>
                  <span
                    className={`font-semibold ${
                      item.status === 'Em desenvolvimento'
                        ? 'text-[#0D76A8]'
                        : 'text-[#5A7184]'
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Legenda do estado de desenvolvimento */}
        <div className="bg-white border border-[#DCE5EC] rounded-xl p-6">
          <h3 className="text-sm font-bold text-[#07334E] mb-3">
            Legenda do estado de desenvolvimento
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="font-semibold text-[#0D76A8]">Em desenvolvimento</p>
              <p className="text-[#5A7184] mt-0.5">
                Núcleo da solução, em concepção e desenvolvimento.
              </p>
            </div>
            <div>
              <p className="font-semibold text-[#07334E]">Previsto</p>
              <p className="text-[#5A7184] mt-0.5">
                Elemento previsto na arquitectura, sujeito a validação técnica.
              </p>
            </div>
            <div>
              <p className="font-semibold text-[#5A7184]">Perspectiva futura</p>
              <p className="text-[#5A7184] mt-0.5">
                Evolução planeada para a fase de expansão nacional.
              </p>
            </div>
          </div>
          <p className="text-xs text-[#5A7184] mt-4 pt-4 border-t border-[#DCE5EC]">
            Nenhum elemento é apresentado como implementado ou validado em escala definitiva. O estado
            de cada item é actualizado pela equipa à medida que o projecto avança.
          </p>
        </div>
      </section>

      {/* 06 · INOVAÇÃO E DIFERENCIAIS (PDF Page 7) */}
      <section className="max-w-[1240px] mx-auto px-4 sm:px-6 py-20">
        <p className="text-xs font-semibold text-[#0D76A8] mb-2">
          06 · Inovação e diferenciais
        </p>
        <h2 className="text-3xl sm:text-4xl font-bold text-[#07334E] tracking-tight">
          Inovação e diferenciais
        </h2>
        <div className="w-12 h-1 bg-[#45B5DC] mt-3 mb-4" aria-hidden="true" />
        <p className="text-[#2C4050] max-w-3xl mb-12 leading-relaxed">
          O diferencial do AQUASENSE está na integração, numa única solução, de três dimensões
          habitualmente tratadas de forma separada.
        </p>

        {/* Venn Diagram + Comparison Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center mb-12">
          {/* Interactive Animated 3-Circle Venn Diagram faithful to PDF Page 7 */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <svg
              viewBox="0 0 420 380"
              role="img"
              aria-label="Diagrama interactivo de integração AQUASENSE: Monitorização do consumo, Gestão inteligente e prevenção do desperdício, e Monitorização da qualidade da água"
              className="w-full max-w-[400px] h-auto"
            >
              {/* Animated outer orbital flow guide */}
              <circle
                cx="210"
                cy="184"
                r="166"
                fill="none"
                stroke="#38B2DA"
                strokeOpacity="0.28"
                strokeWidth="1.2"
                strokeDasharray="6 10"
                className="animate-aqua-orbit"
              />

              {/* Circle 1: Monitorização do consumo */}
              <motion.circle
                cx="155"
                cy="145"
                r={activeVenn === 'consumo' ? 106 : 100}
                fill="#0D76A8"
                stroke="#0D76A8"
                strokeWidth={activeVenn === 'consumo' ? 2.6 : 1.6}
                animate={{
                  fillOpacity: activeVenn === 'consumo' ? 0.25 : 0.13,
                  r: activeVenn === 'consumo' ? 106 : 100,
                }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                onMouseEnter={() => setActiveVenn('consumo')}
                onClick={() => setActiveVenn('consumo')}
                className="cursor-pointer"
              />
              {/* Circle 2: Gestão inteligente e prevenção do desperdício */}
              <motion.circle
                cx="265"
                cy="145"
                r={activeVenn === 'gestao' ? 106 : 100}
                fill="#38B2DA"
                stroke="#38B2DA"
                strokeWidth={activeVenn === 'gestao' ? 2.6 : 1.6}
                animate={{
                  fillOpacity: activeVenn === 'gestao' ? 0.27 : 0.14,
                  r: activeVenn === 'gestao' ? 106 : 100,
                }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                onMouseEnter={() => setActiveVenn('gestao')}
                onClick={() => setActiveVenn('gestao')}
                className="cursor-pointer"
              />
              {/* Circle 3: Monitorização da qualidade da água */}
              <motion.circle
                cx="210"
                cy="242"
                r={activeVenn === 'qualidade' ? 106 : 100}
                fill="#07334E"
                stroke="#07334E"
                strokeWidth={activeVenn === 'qualidade' ? 2.6 : 1.6}
                animate={{
                  fillOpacity: activeVenn === 'qualidade' ? 0.25 : 0.13,
                  r: activeVenn === 'qualidade' ? 106 : 100,
                }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                onMouseEnter={() => setActiveVenn('qualidade')}
                onClick={() => setActiveVenn('qualidade')}
                className="cursor-pointer"
              />

              {/* Animated data flow stream from active dimension into central AQUASENSE node */}
              <line
                x1={activeVenn === 'consumo' ? 120 : activeVenn === 'gestao' ? 300 : 210}
                y1={activeVenn === 'qualidade' ? 286 : 128}
                x2="210"
                y2="180"
                stroke={currentVennInfo.color}
                strokeWidth="2.2"
                strokeDasharray="6 6"
                className="animate-aqua-flow pointer-events-none"
              />

              {/* Center Signal Ripple */}
              <circle
                cx="210"
                cy="180"
                r="26"
                fill="none"
                stroke="#38B2DA"
                strokeWidth="1.5"
                className="animate-aqua-ripple pointer-events-none"
              />

              {/* Center Droplet Badge */}
              <path
                d="M210 154C210 154 195 172.5 195 182.5C195 191 201.7 197.5 210 197.5C218.3 197.5 225 191 225 182.5C225 172.5 210 154 210 154Z"
                fill="#07334E"
                className="pointer-events-none"
              />
              <path
                d="M202 178C204.2 175.8 207 174.7 210 174.7C213 174.7 215.8 175.8 218 178"
                stroke="#FFFFFF"
                strokeWidth="1.8"
                strokeLinecap="round"
                fill="none"
                className="pointer-events-none"
              />
              <path
                d="M205 181.5C206.4 180.1 208.1 179.4 210 179.4C211.9 179.4 213.6 180.1 215 181.5"
                stroke="#FFFFFF"
                strokeWidth="1.8"
                strokeLinecap="round"
                fill="none"
                className="pointer-events-none"
              />
              <circle cx="210" cy="185.5" r="1.6" fill="#FFFFFF" className="pointer-events-none" />
              <text
                x="210"
                y="212"
                textAnchor="middle"
                className="fill-[#07334E] text-[10.5px] font-bold tracking-wider pointer-events-none"
              >
                AQUASENSE
              </text>

              {/* Circle labels */}
              <text
                x="118"
                y="124"
                textAnchor="middle"
                className="fill-[#07334E] text-[12px] font-bold pointer-events-none"
              >
                <tspan x="118" dy="0">Monitorização</tspan>
                <tspan x="118" dy="16">do consumo</tspan>
              </text>
              <text
                x="300"
                y="118"
                textAnchor="middle"
                className="fill-[#07334E] text-[12px] font-bold pointer-events-none"
              >
                <tspan x="300" dy="0">Gestão inteligente e</tspan>
                <tspan x="300" dy="16">prevenção do</tspan>
                <tspan x="300" dy="16">desperdício</tspan>
              </text>
              <text
                x="210"
                y="292"
                textAnchor="middle"
                className="fill-[#07334E] text-[12px] font-bold pointer-events-none"
              >
                <tspan x="210" dy="0">Monitorização da</tspan>
                <tspan x="210" dy="16">qualidade da água</tspan>
              </text>
            </svg>

            {/* Accessible interactive selector + live detail panel for the diagram */}
            <div className="w-full max-w-[400px] mt-3 space-y-2.5">
              <div
                role="group"
                aria-label="Explorar dimensões do diagrama AQUASENSE"
                className="grid grid-cols-3 gap-1.5"
              >
                {(
                  [
                    { id: 'consumo', label: 'Consumo' },
                    { id: 'gestao', label: 'Prevenção' },
                    { id: 'qualidade', label: 'Qualidade' },
                  ] as { id: VennDimensionKey; label: string }[]
                ).map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveVenn(item.id)}
                    aria-pressed={activeVenn === item.id}
                    className={`py-1.5 px-2 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                      activeVenn === item.id
                        ? 'bg-[#07334E] text-white border-[#07334E]'
                        : 'bg-[#F3F6F9] text-[#2C4050] border-[#DCE5EC] hover:border-[#0D76A8]'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              <motion.div
                key={activeVenn}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="bg-[#F3F6F9] border border-[#DCE5EC] rounded-xl p-3.5 text-xs"
              >
                <p className="font-bold text-[#07334E]">{currentVennInfo.title}</p>
                <p className="text-[#5A7184] mt-1 leading-relaxed">{currentVennInfo.detail}</p>
              </motion.div>
            </div>
          </div>

          {/* Contador Convencional vs Ponto Inteligente AQUASENSE */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6 items-stretch">
            <div className="bg-[#F3F6F9] border border-[#DCE5EC] rounded-xl p-6 flex flex-col justify-between">
              <div>
                <p className="text-xs font-semibold text-[#5A7184] mb-2">
                  Contador convencional
                </p>
                <p className="text-sm text-[#2C4050] leading-relaxed mb-5">
                  Mede o volume consumido, mas a informação só fica disponível através de leitura
                  manual, de forma pontual e com acesso limitado pelo consumidor.
                </p>
              </div>
              <ul className="space-y-2 text-sm text-[#5A7184] border-t border-[#DCE5EC] pt-4">
                <li>· Leitura manual e pontual</li>
                <li>· Sem alertas de anomalias</li>
                <li>· Sem informação sobre a qualidade</li>
              </ul>
            </div>

            <div className="bg-[#07334E] text-white rounded-xl p-6 flex flex-col justify-between">
              <div>
                <p className="text-xs font-semibold text-[#6EC8E8] mb-2">
                  Ponto inteligente AQUASENSE
                </p>
                <p className="text-sm text-white/90 leading-relaxed mb-5">
                  O contador passa a ser um ponto de recolha de dados, com informação sobre consumo e
                  qualidade disponível de forma contínua para o consumidor e para a entidade gestora.
                </p>
              </div>
              <ul className="space-y-2 text-sm text-[#B8D7E8] border-t border-white/15 pt-4">
                <li>
                  <span className="text-[#45B5DC] mr-1.5">·</span>Leitura automatizada
                </li>
                <li>
                  <span className="text-[#45B5DC] mr-1.5">·</span>Alertas e recomendações
                </li>
                <li>
                  <span className="text-[#45B5DC] mr-1.5">·</span>Parâmetros da qualidade da água
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Proposta de valor */}
        <div className="bg-[#EBF6FB] border border-[#C5E4F2] rounded-xl p-7 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-3xl">
            <h3 className="text-lg font-bold text-[#07334E] mb-1.5">Proposta de valor</h3>
            <p className="text-[#2C4050] leading-relaxed">
              Transformar a forma como a água é monitorizada e gerida, permitindo que consumidores e
              entidades responsáveis tenham acesso a informações actualizadas sobre o consumo, o
              desperdício e as características da água, através de um ecossistema tecnológico
              integrado.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('plataforma')}
            className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-[#0D76A8] hover:bg-[#07334E] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <span>Testar Plataforma</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>
    </div>
  );
}
