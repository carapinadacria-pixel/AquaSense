import { useState } from 'react';
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Cpu,
  Database,
  FlaskConical,
  Gauge,
  LayoutDashboard,
  User,
  Wifi,
} from 'lucide-react';
import {
  ARCHITECTURE_STEPS,
  CORE_FEATURES,
  HARDWARE_COMPONENTS,
} from '../lib/aquasenseData';

const STEP_ICONS = [
  Gauge,
  Cpu,
  FlaskConical,
  Cpu,
  Wifi,
  Database,
  LayoutDashboard,
  User,
];

type FeatureFilter = 'todas' | 'Em desenvolvimento' | 'Previsto';

export function ArchitectureSection() {
  const [selectedStep, setSelectedStep] = useState<number>(2);
  const [featureFilter, setFeatureFilter] = useState<FeatureFilter>('todas');

  const topRow = ARCHITECTURE_STEPS.slice(0, 4); // 1, 2, 3, 4 (left to right)
  const bottomRowVisual = [
    ARCHITECTURE_STEPS[7], // 8
    ARCHITECTURE_STEPS[6], // 7
    ARCHITECTURE_STEPS[5], // 6
    ARCHITECTURE_STEPS[4], // 5
  ]; // displayed left-to-right with left arrows (8 <- 7 <- 6 <- 5) matching PDF Page 5!

  const activeStepObj =
    ARCHITECTURE_STEPS.find((s) => s.step === selectedStep) ?? ARCHITECTURE_STEPS[0];

  const filteredFeatures =
    featureFilter === 'todas'
      ? CORE_FEATURES
      : CORE_FEATURES.filter((f) => f.status === featureFilter);

  return (
    <div>
      {/* 04 · ARQUITECTURA E FUNCIONAMENTO (PDF Page 5) */}
      <section className="max-w-[1240px] mx-auto px-4 sm:px-6 py-16 lg:py-20 border-b border-[#DCE5EC]">
        <p className="text-xs font-semibold text-[#0D76A8] mb-2">
          04 · Arquitectura e funcionamento
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold text-[#07334E] tracking-tight">
          Arquitectura e funcionamento
        </h1>
        <div className="w-12 h-1 bg-[#45B5DC] mt-3 mb-4" aria-hidden="true" />
        <p className="text-[#2C4050] max-w-3xl mb-10 leading-relaxed">
          Diagrama técnico interactivo do fluxo de dados, desde o ponto de medição até ao
          utilizador final. Seleccione qualquer etapa para consultar o seu papel técnico na solução.
        </p>

        {/* Interactive 8-Step Pipeline Diagram faithful to PDF Page 5 */}
        <div className="bg-[#F3F6F9] border border-[#DCE5EC] rounded-2xl p-5 sm:p-7 mb-6">
          {/* Top Row: 1 -> 2 -> 3 -> 4 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {topRow.map((node, index) => {
              const Icon = STEP_ICONS[node.step - 1] ?? Cpu;
              const isSelected = selectedStep === node.step;
              return (
                <div key={node.step} className="relative flex items-stretch">
                  <button
                    type="button"
                    onClick={() => setSelectedStep(node.step)}
                    aria-pressed={isSelected}
                    className={`w-full text-left rounded-xl p-5 transition-all cursor-pointer border ${
                      node.dark
                        ? isSelected
                          ? 'bg-[#07334E] text-white border-[#45B5DC] ring-2 ring-[#45B5DC]/40'
                          : 'bg-[#07334E] text-white border-[#07334E] hover:border-[#45B5DC]'
                        : isSelected
                          ? 'bg-white text-[#07334E] border-[#0D76A8] ring-2 ring-[#0D76A8]/25'
                          : 'bg-white text-[#07334E] border-[#B8D7E8] hover:border-[#0D76A8]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <span
                        className={`w-7 h-7 rounded-full text-xs font-mono font-bold flex items-center justify-center ${
                          node.dark
                            ? 'bg-[#0D76A8] text-white'
                            : 'bg-[#0D76A8] text-white'
                        }`}
                      >
                        {node.step}
                      </span>
                      <Icon
                        className={`w-5 h-5 ${
                          node.dark ? 'text-[#6EC8E8]' : 'text-[#0D76A8]'
                        }`}
                      />
                    </div>
                    <h2
                      className={`text-sm font-bold leading-snug ${
                        node.dark ? 'text-white' : 'text-[#07334E]'
                      }`}
                    >
                      {node.title}
                    </h2>
                    <p
                      className={`text-xs mt-1.5 leading-relaxed ${
                        node.dark ? 'text-[#B8D7E8]' : 'text-[#5A7184]'
                      }`}
                    >
                      {node.short}
                    </p>
                  </button>
                  {index < 3 && (
                    <ArrowRight
                      aria-hidden="true"
                      className="hidden lg:block w-4 h-4 text-[#0D76A8] shrink-0 self-center -mr-2.5 ml-1 z-10"
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Connector row: step 4 down to step 5 */}
          <div className="hidden lg:grid grid-cols-4 gap-4 py-2">
            <div className="col-start-4 flex justify-center">
              <ArrowDown className="w-5 h-5 text-[#0D76A8]" aria-hidden="true" />
            </div>
          </div>

          {/* Bottom Row: 8 <- 7 <- 6 <- 5 on desktop, sequential on mobile */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4 lg:mt-0">
            {bottomRowVisual.map((node, index) => {
              const Icon = STEP_ICONS[node.step - 1] ?? Database;
              const isSelected = selectedStep === node.step;
              return (
                <div key={node.step} className="relative flex items-stretch">
                  <button
                    type="button"
                    onClick={() => setSelectedStep(node.step)}
                    aria-pressed={isSelected}
                    className={`w-full text-left rounded-xl p-5 transition-all cursor-pointer border bg-white text-[#07334E] ${
                      isSelected
                        ? 'border-[#0D76A8] ring-2 ring-[#0D76A8]/25'
                        : 'border-[#B8D7E8] hover:border-[#0D76A8]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <span className="w-7 h-7 rounded-full text-xs font-mono font-bold flex items-center justify-center bg-[#0D76A8] text-white">
                        {node.step}
                      </span>
                      <Icon className="w-5 h-5 text-[#0D76A8]" />
                    </div>
                    <h2 className="text-sm font-bold leading-snug text-[#07334E]">
                      {node.title}
                    </h2>
                    <p className="text-xs mt-1.5 leading-relaxed text-[#5A7184]">
                      {node.short}
                    </p>
                  </button>
                  {index < 3 && (
                    <ArrowLeft
                      aria-hidden="true"
                      className="hidden lg:block w-4 h-4 text-[#0D76A8] shrink-0 self-center -mr-2.5 ml-1 z-10"
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Step Specification Bar */}
        <div className="bg-[#07334E] text-white rounded-xl p-6 mb-14 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-mono text-[#6EC8E8] mb-1">
              Etapa 0{activeStepObj.step} de 08 · Fluxo de dados AQUASENSE
            </p>
            <h3 className="text-lg font-bold text-white">{activeStepObj.title}</h3>
            <p className="text-sm text-[#B8D7E8] mt-1 max-w-3xl leading-relaxed">
              {activeStepObj.detail}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() =>
                setSelectedStep((prev) => (prev <= 1 ? 8 : prev - 1))
              }
              className="px-3.5 py-2 text-xs font-semibold rounded-lg border border-white/20 hover:border-[#45B5DC] text-white cursor-pointer whitespace-nowrap"
            >
              Etapa anterior
            </button>
            <button
              type="button"
              onClick={() =>
                setSelectedStep((prev) => (prev >= 8 ? 1 : prev + 1))
              }
              className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-[#0D76A8] hover:bg-[#38B2DA] text-white cursor-pointer whitespace-nowrap"
            >
              Próxima etapa
            </button>
          </div>
        </div>

        {/* Tecnologias e componentes previstos */}
        <h2 className="text-2xl font-bold text-[#07334E] mb-4">
          Tecnologias e componentes previstos
        </h2>
        <div className="overflow-x-auto border border-[#DCE5EC] rounded-xl mb-6">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-[#07334E] text-white text-xs font-semibold">
                <th className="py-3.5 px-5">Componente</th>
                <th className="py-3.5 px-5">Função prevista</th>
                <th className="py-3.5 px-5 text-right">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DCE5EC] text-sm">
              {HARDWARE_COMPONENTS.map((row, i) => (
                <tr
                  key={row.component}
                  className={i % 2 === 1 ? 'bg-[#F8FAFC]' : 'bg-white'}
                >
                  <td className="py-3.5 px-5 font-semibold text-[#07334E]">
                    {row.component}
                  </td>
                  <td className="py-3.5 px-5 text-[#2C4050]">{row.purpose}</td>
                  <td className="py-3.5 px-5 text-right font-medium text-[#5A7184] whitespace-nowrap">
                    {row.state}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Nota técnica */}
        <div className="bg-[#EBF6FB] border border-[#C5E4F2] rounded-xl p-5">
          <p className="text-sm text-[#07334E] leading-relaxed">
            <strong className="font-bold">Nota técnica:</strong> Os sensores permitem acompanhar
            parâmetros indicativos e detectar variações, mas{' '}
            <strong className="font-bold">não certificam a potabilidade da água</strong>, que exige
            análises laboratoriais complementares por entidades competentes. A selecção final dos
            componentes depende da fase de validação técnica.
          </p>
        </div>
      </section>

      {/* 05 · FUNCIONALIDADES PRINCIPAIS (PDF Page 6) */}
      <section className="max-w-[1240px] mx-auto px-4 sm:px-6 py-16 lg:py-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <p className="text-xs font-semibold text-[#0D76A8] mb-2">
              05 · Funcionalidades principais
            </p>
            <h2 className="text-3xl font-bold text-[#07334E] tracking-tight">
              Funcionalidades principais
            </h2>
            <div className="w-12 h-1 bg-[#45B5DC] mt-3 mb-3" aria-hidden="true" />
            <p className="text-[#2C4050] max-w-2xl">
              Funcionalidades que o sistema AQUASENSE se propõe disponibilizar, com indicação do
              respectivo estado de maturidade.
            </p>
          </div>

          {/* Interactive segmented filter */}
          <div
            role="group"
            aria-label="Filtrar funcionalidades por estado"
            className="inline-flex items-center gap-1 p-1 bg-[#F3F6F9] border border-[#DCE5EC] rounded-lg self-start"
          >
            {(['todas', 'Em desenvolvimento', 'Previsto'] as FeatureFilter[]).map(
              (option) => {
                const active = featureFilter === option;
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setFeatureFilter(option)}
                    aria-pressed={active}
                    className={`px-3.5 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      active
                        ? 'bg-[#07334E] text-white'
                        : 'text-[#4A6274] hover:text-[#07334E]'
                    }`}
                  >
                    {option === 'todas' ? 'Todas (9)' : option}
                  </button>
                );
              }
            )}
          </div>
        </div>

        <div className="overflow-x-auto border border-[#DCE5EC] rounded-xl mb-6">
          <table className="w-full text-left border-collapse min-w-[640px]">
            <thead>
              <tr className="bg-[#07334E] text-white text-xs font-semibold">
                <th className="py-3.5 px-5 w-16">N.º</th>
                <th className="py-3.5 px-5">Funcionalidade</th>
                <th className="py-3.5 px-5">Descrição</th>
                <th className="py-3.5 px-5 text-right">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DCE5EC] text-sm">
              {filteredFeatures.map((feat, i) => (
                <tr
                  key={feat.num}
                  className={i % 2 === 1 ? 'bg-[#F8FAFC]' : 'bg-white'}
                >
                  <td className="py-3.5 px-5 font-mono text-[#0D76A8] font-semibold tabular-nums">
                    {feat.num}
                  </td>
                  <td className="py-3.5 px-5 font-semibold text-[#07334E]">
                    {feat.name}
                  </td>
                  <td className="py-3.5 px-5 text-[#2C4050]">{feat.description}</td>
                  <td className="py-3.5 px-5 text-right whitespace-nowrap">
                    <span
                      className={`font-semibold text-xs ${
                        feat.status === 'Em desenvolvimento'
                          ? 'text-[#0D76A8]'
                          : 'text-[#5A7184]'
                      }`}
                    >
                      {feat.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-[#EBF6FB] border border-[#C5E4F2] rounded-xl p-5">
          <p className="text-sm text-[#07334E] leading-relaxed">
            <strong className="font-bold">Nota:</strong> A classificação de estado é indicativa e
            reflecte o grau de maturidade previsto para cada funcionalidade. A medição de parâmetros
            da qualidade da água tem carácter informativo e não substitui análises laboratoriais.
          </p>
        </div>
      </section>
    </div>
  );
}
