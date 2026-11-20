import { useState } from 'react';
import {
  Activity,
  AlertTriangle,
  Building2,
  CheckCircle2,
  Clock,
  Download,
  Droplets,
  FlaskConical,
  Gauge,
  LogOut,
  Pause,
  Play,
  Power,
  RefreshCw,
  ShieldCheck,
  SlidersHorizontal,
  User,
  Waves,
} from 'lucide-react';
import {
  detectConsumptionAnomaly,
  estimateCostKz,
  evaluateWaterQuality,
  formatDurationHms,
  formatPointsCsv,
  generateAlertsAndRecommendations,
  statusDisplayLabel,
} from '../lib/aquasenseEngine';
import type {
  AppSection,
  ChartPeriod,
  ClientSession,
  ConsumerLoginInput,
  MeterPoint,
  OrganizationLoginInput,
  ScenarioMode,
  StatusLevel,
  TelemetryLogEntry,
  ThresholdConfig,
} from '../lib/aquasenseTypes';
import { ConsumptionChart } from './ConsumptionChart';
import { PlatformLogin } from './PlatformLogin';

interface PlatformSectionProps {
  session: ClientSession | null;
  onConsumerLogin: (input: ConsumerLoginInput) => void;
  onOrganizationLogin: (input: OrganizationLoginInput) => void;
  onLogout: () => void;
  onNavigate: (section: AppSection) => void;
  meter: MeterPoint;
  liveClockHms: string;
  isLive: boolean;
  onToggleLive: () => void;
  onManualSync: () => void;
  onApplyScenario: (meterId: string, scenario: ScenarioMode) => void;
  onHydraulicAction: (
    meterId: string,
    action: 'torneira' | 'tanque' | 'toggle_valvula'
  ) => void;
  telemetryLog: TelemetryLogEntry[];
  resolvedAlertIds: ReadonlySet<string>;
  onToggleResolveAlert: (alertId: string) => void;
  thresholds: ThresholdConfig;
  onUpdateThresholds: (next: ThresholdConfig) => void;
}

const SCENARIO_BUTTONS: { id: ScenarioMode; label: string }[] = [
  { id: 'normal', label: 'Operação Normal' },
  { id: 'fuga', label: 'Fuga Silenciosa' },
  { id: 'consumo_anormal', label: 'Ruptura / Consumo Anormal' },
  { id: 'qualidade', label: 'Alteração de Qualidade' },
];

function statusTextClasses(status: StatusLevel): string {
  if (status === 'alerta') return 'text-[#B91C1C]';
  if (status === 'atencao') return 'text-[#B45309]';
  return 'text-[#15803D]';
}

function statusBarColor(status: StatusLevel): string {
  if (status === 'alerta') return 'bg-[#DC2626]';
  if (status === 'atencao') return 'bg-[#D97706]';
  return 'bg-[#0D76A8]';
}

function StatusIndicator({ status, label }: { status: StatusLevel; label?: string }) {
  const display = label ?? statusDisplayLabel(status);
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-semibold whitespace-nowrap ${statusTextClasses(status)}`}
    >
      {status === 'normal' ? (
        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
      ) : (
        <AlertTriangle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
      )}
      <span>{display}</span>
    </span>
  );
}

export function PlatformSection({
  session,
  onConsumerLogin,
  onOrganizationLogin,
  onLogout,
  onNavigate,
  meter,
  liveClockHms,
  isLive,
  onToggleLive,
  onManualSync,
  onApplyScenario,
  onHydraulicAction,
  telemetryLog,
  resolvedAlertIds,
  onToggleResolveAlert,
  thresholds,
  onUpdateThresholds,
}: PlatformSectionProps) {
  const [chartPeriod, setChartPeriod] = useState<ChartPeriod>('24h');
  const [exportMessage, setExportMessage] = useState<string | null>(null);

  if (!session) {
    return (
      <PlatformLogin
        onConsumerLogin={onConsumerLogin}
        onOrganizationLogin={onOrganizationLogin}
        onNavigate={onNavigate}
      />
    );
  }

  const effectiveThreshold: ThresholdConfig = {
    dailyLimitLiters:
      meter.habitualDailyLiters > 1000
        ? Math.round(meter.habitualDailyLiters * 1.25)
        : thresholds.dailyLimitLiters,
    leakContinuousThresholdLpm: thresholds.leakContinuousThresholdLpm,
  };

  const qualityAssessment = evaluateWaterQuality(meter.quality);
  const anomaly = detectConsumptionAnomaly(
    meter.currentFlowLpm,
    meter.dailyLiters,
    effectiveThreshold.dailyLimitLiters,
    meter.habitualDailyLiters,
    meter.continuousFlowMinutes,
    effectiveThreshold.leakContinuousThresholdLpm
  );
  const { alerts, recommendations } = generateAlertsAndRecommendations(
    meter,
    effectiveThreshold,
    resolvedAlertIds
  );
  const activeAlertsCount = alerts.filter((a) => !a.resolved).length;
  const dailyCostKz = estimateCostKz(meter.dailyLiters);
  const wasteCostKz = estimateCostKz(meter.wastedLitersEstimate);

  const chartData =
    chartPeriod === '24h'
      ? meter.series24h
      : chartPeriod === '7d'
        ? meter.series7d
        : meter.series30d;

  const chartPeriodLabel =
    chartPeriod === '24h'
      ? 'Últimas 24 horas'
      : chartPeriod === '7d'
        ? 'Últimos 7 dias'
        : 'Últimos 30 dias';

  const handleExportCsv = () => {
    const csv = formatPointsCsv([meter]);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `aquasense-${meter.code.toLowerCase()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setExportMessage('Relatório CSV do contador gerado com sucesso.');
    setTimeout(() => setExportMessage(null), 3500);
  };

  return (
    <div className="bg-[#F8FAFC] min-h-[calc(100vh-4rem)]">
      {/* Workspace Header & Authenticated Consumer/Organization Bar */}
      <div className="bg-[#07334E] text-white border-b border-[#164461]">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 py-7 space-y-5">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <p className="text-xs font-medium text-[#6EC8E8]">
                {session.type === 'consumidor' ? 'Conta de Consumidor' : `Organização · ${session.category}`}
                {' · '}
                {session.bairro}, {session.municipality}, {session.province}
              </p>
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mt-1">
                {session.displayName}
              </h1>
              <p className="text-xs text-[#B8D7E8] mt-1 font-mono tabular-nums">
                Contador {meter.code} · Última leitura: {meter.lastSyncIso}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs text-[#B8D7E8]">
              <div className="inline-flex items-center gap-1.5 font-mono tabular-nums text-white bg-[#05263B] border border-white/15 px-3 py-1.5 rounded-lg">
                <Clock className="w-3.5 h-3.5 text-[#45B5DC]" aria-hidden="true" />
                <span>{liveClockHms}</span>
              </div>
              <div className="flex items-center gap-2">
                {session.type === 'consumidor' ? (
                  <User className="w-4 h-4 text-[#6EC8E8]" />
                ) : (
                  <Building2 className="w-4 h-4 text-[#6EC8E8]" />
                )}
                <span>
                  {session.contactName ? `Responsável: ${session.contactName}` : 'Sessão activa'}
                </span>
              </div>
            </div>
          </div>

          {/* Single-row Workspace Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-white/10">
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={onToggleLive}
                className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg border border-white/20 hover:border-[#45B5DC] text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                {isLive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isLive ? 'Pausar telemetria' : 'Retomar telemetria'}</span>
              </button>

              <button
                type="button"
                onClick={onManualSync}
                className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg border border-white/20 hover:border-[#45B5DC] text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Sincronizar leitura</span>
              </button>

              <button
                type="button"
                onClick={handleExportCsv}
                className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg bg-[#45B5DC] hover:bg-[#6EC8E8] text-[#07334E] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Exportar CSV</span>
              </button>
            </div>

            <button
              type="button"
              onClick={onLogout}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg border border-white/20 hover:border-[#FCA5A5] text-[#B8D7E8] hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Terminar sessão</span>
            </button>
          </div>
          {exportMessage && (
            <p role="status" className="text-xs text-[#6EC8E8] font-medium">
              {exportMessage}
            </p>
          )}
        </div>
      </div>

      {/* Main Content Container */}
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Realistic Hydraulic & IoT Simulation Control Center */}
        <div className="bg-white border border-[#DCE5EC] rounded-xl divide-y divide-[#DCE5EC]">
          <div className="p-4 sm:px-5 flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs font-semibold text-[#5A7184] whitespace-nowrap">
              Cenários de simulação física (IoT):
            </span>
            <div className="flex flex-wrap items-center gap-2">
              {SCENARIO_BUTTONS.map((sc) => {
                const active = meter.activeScenario === sc.id;
                return (
                  <button
                    key={sc.id}
                    type="button"
                    onClick={() => onApplyScenario(meter.id, sc.id)}
                    aria-pressed={active}
                    className={`px-3.5 py-2 text-xs font-semibold rounded-lg border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      active
                        ? sc.id === 'normal'
                          ? 'bg-[#07334E] text-white border-[#07334E]'
                          : 'bg-[#B91C1C] text-white border-[#B91C1C]'
                        : 'bg-white text-[#2C4050] border-[#DCE5EC] hover:border-[#0D76A8] hover:text-[#07334E]'
                    }`}
                  >
                    {sc.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Interactive Real-Time Hydraulic Actions */}
          <div className="p-4 sm:px-5 bg-[#FAFBFD] rounded-b-xl flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs font-semibold text-[#5A7184] whitespace-nowrap">
              Acções hidráulicas em tempo real:
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => onHydraulicAction(meter.id, 'torneira')}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-white border border-[#DCE5EC] text-[#07334E] hover:border-[#0D76A8] transition-colors whitespace-nowrap cursor-pointer"
              >
                <Droplets className="w-3.5 h-3.5 text-[#0D76A8]" />
                <span>Abrir torneira / duche (+6,5 L/min)</span>
              </button>
              <button
                type="button"
                onClick={() => onHydraulicAction(meter.id, 'tanque')}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-white border border-[#DCE5EC] text-[#07334E] hover:border-[#0D76A8] transition-colors whitespace-nowrap cursor-pointer"
              >
                <Waves className="w-3.5 h-3.5 text-[#0D76A8]" />
                <span>Encher reservatório (+13,5 L/min)</span>
              </button>
              <button
                type="button"
                onClick={() => onHydraulicAction(meter.id, 'toggle_valvula')}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg border transition-colors whitespace-nowrap cursor-pointer ${
                  meter.valveClosed
                    ? 'bg-[#15803D] text-white border-[#15803D] hover:bg-[#166534]'
                    : 'bg-[#07334E] text-white border-[#07334E] hover:bg-[#B91C1C] hover:border-[#B91C1C]'
                }`}
              >
                <Power className="w-3.5 h-3.5" />
                <span>
                  {meter.valveClosed ? 'Reabrir válvula principal' : 'Fechar válvula principal'}
                </span>
              </button>
            </div>
          </div>
          {/* Live Animated Hydraulic Flow Conduit Diagram */}
          <div className="p-4 sm:px-5 bg-white rounded-b-xl">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3 text-xs">
              <span className="font-semibold text-[#07334E]">
                Diagrama hidráulico em tempo real · {meter.code}
              </span>
              <span className="font-mono tabular-nums text-[#5A7184]">
                Duração contínua:{' '}
                <strong className="text-[#07334E]">
                  {formatDurationHms(meter.continuousFlowSeconds)}
                </strong>
                {' · '}Relógio: <strong className="text-[#07334E]">{liveClockHms}</strong>
              </span>
            </div>
            <svg
              viewBox="0 0 760 72"
              role="img"
              aria-label={`Fluxo hidráulico em tempo real: ${meter.valveClosed ? 'Válvula fechada, sem caudal' : `${meter.currentFlowLpm.toFixed(1)} litros por minuto a ${meter.pressureBar.toFixed(2)} bar`}`}
              className="w-full h-auto"
            >
              {/* Main pipe background */}
              <line
                x1="76"
                y1="36"
                x2="684"
                y2="36"
                stroke="#E2ECF2"
                strokeWidth="12"
                strokeLinecap="round"
              />
              {/* Animated water flow stream inside pipe */}
              {!meter.valveClosed && meter.currentFlowLpm > 0 ? (
                <line
                  x1="76"
                  y1="36"
                  x2="684"
                  y2="36"
                  stroke={
                    anomaly.leakDetected || meter.activeScenario === 'consumo_anormal'
                      ? '#DC2626'
                      : '#0D76A8'
                  }
                  strokeWidth="6"
                  strokeDasharray="16 20"
                  strokeLinecap="round"
                  className="animate-aqua-flow"
                  style={{
                    animationDuration: `${Math.max(0.32, Math.min(2.2, 3.2 / Math.max(0.8, meter.currentFlowLpm)))}s`,
                  }}
                />
              ) : (
                <line
                  x1="76"
                  y1="36"
                  x2="262"
                  y2="36"
                  stroke="#D97706"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeOpacity="0.65"
                />
              )}

              {/* Node 1: Entrada Rede */}
              <rect x="8" y="14" width="112" height="44" rx="8" fill="#07334E" />
              <text x="64" y="32" textAnchor="middle" className="fill-[#6EC8E8] text-[9.5px] font-semibold">
                REDE PÚBLICA
              </text>
              <text x="64" y="48" textAnchor="middle" className="fill-white text-[11px] font-mono font-bold">
                {meter.pressureBar.toFixed(2)} bar
              </text>

              {/* Node 2: Válvula Principal */}
              <rect
                x="220"
                y="14"
                width="126"
                height="44"
                rx="8"
                fill={meter.valveClosed ? '#FEF3C7' : '#EBF6FB'}
                stroke={meter.valveClosed ? '#D97706' : '#0D76A8'}
                strokeWidth="1.5"
              />
              <text
                x="283"
                y="32"
                textAnchor="middle"
                className="fill-[#5A7184] text-[9.5px] font-semibold"
              >
                VÁLVULA PRINCIPAL
              </text>
              <text
                x="283"
                y="48"
                textAnchor="middle"
                className={`text-[11px] font-bold ${
                  meter.valveClosed ? 'fill-[#B45309]' : 'fill-[#07334E]'
                }`}
              >
                {meter.valveClosed ? 'FECHADA (CORTE)' : 'ABERTA'}
              </text>

              {/* Node 3: Contador Inteligente */}
              <rect
                x="414"
                y="14"
                width="148"
                height="44"
                rx="8"
                fill="#07334E"
              />
              <text x="488" y="32" textAnchor="middle" className="fill-[#6EC8E8] text-[9.5px] font-semibold">
                CAUDAL INSTANTÂNEO
              </text>
              <text x="488" y="48" textAnchor="middle" className="fill-white text-[11px] font-mono font-bold">
                {meter.currentFlowLpm.toFixed(2)} L/min
              </text>

              {/* Node 4: Sensores Qualidade */}
              <rect
                x="624"
                y="14"
                width="128"
                height="44"
                rx="8"
                fill={qualityAssessment.overallStatus === 'normal' ? '#EBF6FB' : '#FEF2F2'}
                stroke={qualityAssessment.overallStatus === 'normal' ? '#0D76A8' : '#DC2626'}
                strokeWidth="1.5"
              />
              <text x="688" y="32" textAnchor="middle" className="fill-[#5A7184] text-[9.5px] font-semibold">
                SENSORES ÁGUA
              </text>
              <text
                x="688"
                y="48"
                textAnchor="middle"
                className={`text-[11px] font-mono font-bold ${
                  qualityAssessment.overallStatus === 'normal' ? 'fill-[#07334E]' : 'fill-[#B91C1C]'
                }`}
              >
                pH {meter.quality.ph.toFixed(1)} · {meter.quality.turbidityNtu.toFixed(1)} NTU
              </text>
            </svg>
          </div>
        </div>

        {/* 4-Column KPI Strip with Realistic Pressure, Valve State & Indicative Cost */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white border border-[#DCE5EC] rounded-xl p-5">
            <div className="flex items-center justify-between text-xs text-[#5A7184] mb-2">
              <span>Consumo diário</span>
              <Droplets className="w-4 h-4 text-[#0D76A8]" aria-hidden="true" />
            </div>
            <p className="font-mono tabular-nums text-2xl font-bold text-[#07334E]">
              {meter.dailyLiters.toLocaleString('pt-PT', {
                minimumFractionDigits: 1,
                maximumFractionDigits: 1,
              })}{' '}
              <span className="text-sm font-normal text-[#5A7184]">L</span>
            </p>
            <div className="mt-2 flex items-center justify-between text-xs">
              <span className="text-[#5A7184] font-mono tabular-nums">
                Est. {dailyCostKz.toLocaleString('pt-PT')} Kz/dia
              </span>
              <span
                className={`font-mono font-semibold tabular-nums ${
                  anomaly.deviationPercent >= 25
                    ? 'text-[#B91C1C]'
                    : anomaly.deviationPercent > 10
                      ? 'text-[#B45309]'
                      : 'text-[#15803D]'
                }`}
              >
                {anomaly.deviationPercent > 0 ? '+' : ''}
                {anomaly.deviationPercent}% habitual
              </span>
            </div>
          </div>

          <div className="bg-white border border-[#DCE5EC] rounded-xl p-5">
            <div className="flex items-center justify-between text-xs text-[#5A7184] mb-2">
              <span>Caudal e pressão da rede</span>
              <Gauge className="w-4 h-4 text-[#0D76A8]" aria-hidden="true" />
            </div>
            <p className="font-mono tabular-nums text-2xl font-bold text-[#07334E]">
              {meter.currentFlowLpm.toFixed(1)}{' '}
              <span className="text-sm font-normal text-[#5A7184]">L/min</span>
              <span className="text-sm font-normal text-[#5A7184] ml-2">
                · {meter.pressureBar.toFixed(2)} bar
              </span>
            </p>
            <div className="mt-2 flex items-center justify-between text-xs">
              <span className="text-[#5A7184] font-mono tabular-nums">
                {meter.valveClosed
                  ? 'Válvula fechada'
                  : `Fluxo: ${formatDurationHms(meter.continuousFlowSeconds)}`}
              </span>
              <StatusIndicator
                status={meter.valveClosed ? 'atencao' : anomaly.leakDetected ? 'alerta' : 'normal'}
                label={
                  meter.valveClosed
                    ? 'Corte activo'
                    : anomaly.leakDetected
                      ? 'Possível fuga'
                      : 'Fluxo normal'
                }
              />
            </div>
          </div>

          <div className="bg-white border border-[#DCE5EC] rounded-xl p-5">
            <div className="flex items-center justify-between text-xs text-[#5A7184] mb-2">
              <span>Leitura acumulada</span>
              <ShieldCheck className="w-4 h-4 text-[#0D76A8]" aria-hidden="true" />
            </div>
            <p className="font-mono tabular-nums text-2xl font-bold text-[#07334E]">
              {meter.totalVolumeM3.toFixed(3)}{' '}
              <span className="text-sm font-normal text-[#5A7184]">m³</span>
            </p>
            <p className="mt-2 text-xs text-[#5A7184] font-mono tabular-nums">
              {meter.wastedLitersEstimate > 0
                ? `Perda estimada: ${Math.round(meter.wastedLitersEstimate)} L (${wasteCostKz} Kz)`
                : 'Sem perdas contínuas estimadas'}
            </p>
          </div>

          <div className="bg-white border border-[#DCE5EC] rounded-xl p-5">
            <div className="flex items-center justify-between text-xs text-[#5A7184] mb-2">
              <span>Qualidade indicativa</span>
              <FlaskConical className="w-4 h-4 text-[#0D76A8]" aria-hidden="true" />
            </div>
            <p className="text-lg font-bold text-[#07334E] leading-snug">
              {qualityAssessment.overallLabel}
            </p>
            <div className="mt-2.5 flex items-center justify-between text-xs">
              <StatusIndicator status={qualityAssessment.overallStatus} />
              <span className="text-[#5A7184] font-mono tabular-nums">
                {activeAlertsCount} {activeAlertsCount === 1 ? 'alerta activo' : 'alertas activos'}
              </span>
            </div>
          </div>
        </div>

        {/* 2-Column Workspace: Consumption History + Alerts/Live Event Log */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: History Chart + Threshold Controls + Live Event Stream */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white border border-[#DCE5EC] rounded-xl p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-[#07334E]">Histórico de consumo</h2>
                  <p className="text-xs text-[#5A7184]">
                    Comparação contínua face ao padrão habitual do contador {meter.code}
                  </p>
                </div>

                <div
                  role="group"
                  aria-label="Período do histórico de consumo"
                  className="inline-flex items-center p-1 bg-[#F3F6F9] border border-[#DCE5EC] rounded-lg self-start"
                >
                  {(
                    [
                      { id: '24h', label: '24 Horas' },
                      { id: '7d', label: '7 Dias' },
                      { id: '30d', label: '30 Dias' },
                    ] as { id: ChartPeriod; label: string }[]
                  ).map((period) => {
                    const active = chartPeriod === period.id;
                    return (
                      <button
                        key={period.id}
                        type="button"
                        onClick={() => setChartPeriod(period.id)}
                        aria-pressed={active}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                          active
                            ? 'bg-[#07334E] text-white'
                            : 'text-[#4A6274] hover:text-[#07334E]'
                        }`}
                      >
                        {period.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <ConsumptionChart data={chartData} periodLabel={chartPeriodLabel} />

              {/* Configurable Thresholds */}
              <div className="pt-5 border-t border-[#DCE5EC]">
                <div className="flex items-center gap-2 text-xs font-bold text-[#07334E] mb-3">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-[#0D76A8]" />
                  <span>Limites de alerta configuráveis</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="threshold-daily"
                      className="flex items-center justify-between text-xs text-[#5A7184] mb-1"
                    >
                      <span>Limite diário domiciliar</span>
                      <span className="font-mono font-semibold text-[#07334E] tabular-nums">
                        {thresholds.dailyLimitLiters} L/dia
                      </span>
                    </label>
                    <input
                      id="threshold-daily"
                      type="range"
                      min={250}
                      max={1200}
                      step={25}
                      value={thresholds.dailyLimitLiters}
                      onChange={(e) =>
                        onUpdateThresholds({
                          ...thresholds,
                          dailyLimitLiters: Number(e.target.value),
                        })
                      }
                      className="w-full accent-[#0D76A8] cursor-pointer"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="threshold-leak"
                      className="flex items-center justify-between text-xs text-[#5A7184] mb-1"
                    >
                      <span>Limiar de caudal contínuo (fuga)</span>
                      <span className="font-mono font-semibold text-[#07334E] tabular-nums">
                        {thresholds.leakContinuousThresholdLpm.toFixed(1)} L/min
                      </span>
                    </label>
                    <input
                      id="threshold-leak"
                      type="range"
                      min={0.5}
                      max={4.0}
                      step={0.1}
                      value={thresholds.leakContinuousThresholdLpm}
                      onChange={(e) =>
                        onUpdateThresholds({
                          ...thresholds,
                          leakContinuousThresholdLpm: Number(e.target.value),
                        })
                      }
                      className="w-full accent-[#0D76A8] cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Live Hydraulic & Sensor Event Feed */}
            <div className="bg-white border border-[#DCE5EC] rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-[#0D76A8]" aria-hidden="true" />
                  <h2 className="text-base font-bold text-[#07334E]">
                    Registo de eventos do contador
                  </h2>
                </div>
                <span className="text-xs text-[#5A7184]">
                  {isLive ? 'Recolha contínua activa' : 'Recolha em pausa'}
                </span>
              </div>

              <div className="divide-y divide-[#DCE5EC] max-h-56 overflow-y-auto">
                {telemetryLog.map((entry) => (
                  <div
                    key={entry.id}
                    className="py-2.5 first:pt-0 last:pb-0 flex items-start justify-between gap-4 text-xs"
                  >
                    <div className="min-w-0">
                      <p className="font-semibold text-[#07334E]">{entry.event}</p>
                      <p className="text-[#5A7184] mt-0.5">{entry.detail}</p>
                    </div>
                    <div className="text-right shrink-0 space-y-0.5">
                      <p className="font-mono text-[#5A7184] tabular-nums">{entry.time}</p>
                      <StatusIndicator status={entry.severity} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Automatic Alerts + Practical Recommendations */}
          <div className="lg:col-span-5 space-y-6">
            {/* Alerts Panel */}
            <div className="bg-white border border-[#DCE5EC] rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-[#07334E]">Alertas automáticos</h2>
                <span className="text-xs font-mono tabular-nums text-[#5A7184]">
                  {activeAlertsCount} activos · {alerts.length} total
                </span>
              </div>

              {alerts.length === 0 ? (
                <div className="bg-[#F3F6F9] border border-[#DCE5EC] rounded-lg p-5 text-sm text-[#2C4050]">
                  <div className="flex items-center gap-2 font-semibold text-[#15803D] mb-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Sem anomalias detectadas</span>
                  </div>
                  <p className="text-xs text-[#5A7184] leading-relaxed">
                    Consumo dentro do padrão habitual e sensores físico-químicos estáveis. Utilize
                    os cenários ou acções hidráulicas acima para testar a detecção em tempo real.
                  </p>
                </div>
              ) : (
                <div className="space-y-3.5">
                  {alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={`rounded-lg p-4 border ${
                        alert.resolved
                          ? 'bg-[#F8FAFC] border-[#DCE5EC] opacity-75'
                          : alert.severity === 'alerta'
                            ? 'bg-[#FEF2F2] border-[#FECACA]'
                            : 'bg-[#FFFBEB] border-[#FDE68A]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <StatusIndicator
                          status={alert.resolved ? 'normal' : alert.severity}
                          label={
                            alert.resolved
                              ? 'Resolvido'
                              : alert.severity === 'alerta'
                                ? 'Alerta prioritário'
                                : 'Atenção'
                          }
                        />
                        <span className="font-mono text-[11px] text-[#5A7184]">
                          {alert.timestamp}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-[#07334E] mt-2">{alert.title}</h3>
                      <p className="text-xs text-[#2C4050] mt-1 leading-relaxed">
                        {alert.description}
                      </p>
                      <p className="text-xs text-[#07334E] mt-2 pt-2 border-t border-black/10 leading-relaxed">
                        <strong className="font-semibold">Acção recomendada:</strong>{' '}
                        {alert.recommendation}
                      </p>
                      <div className="mt-3 flex items-center gap-4">
                        <button
                          type="button"
                          onClick={() => onToggleResolveAlert(alert.id)}
                          className="text-xs font-semibold text-[#0D76A8] hover:text-[#07334E] underline underline-offset-2 cursor-pointer"
                        >
                          {alert.resolved ? 'Reabrir alerta' : 'Marcar como resolvido'}
                        </button>
                        {alert.type === 'fuga' && !meter.valveClosed && !alert.resolved && (
                          <button
                            type="button"
                            onClick={() => onHydraulicAction(meter.id, 'toggle_valvula')}
                            className="text-xs font-semibold text-[#B91C1C] hover:text-[#7F1D1D] underline underline-offset-2 cursor-pointer"
                          >
                            Fechar válvula preventivamente
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recommendations Panel */}
            <div className="bg-white border border-[#DCE5EC] rounded-xl p-6">
              <h2 className="text-lg font-bold text-[#07334E] mb-4">Recomendações práticas</h2>
              <div className="divide-y divide-[#DCE5EC]">
                {recommendations.map((rec) => (
                  <div key={rec.id} className="py-3.5 first:pt-0 last:pb-0">
                    <p className="text-xs font-semibold text-[#0D76A8] mb-0.5">{rec.category}</p>
                    <h3 className="text-sm font-bold text-[#07334E]">{rec.title}</h3>
                    <p className="text-xs text-[#5A7184] mt-1 leading-relaxed">{rec.action}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Water Quality Physico-Chemical Panel */}
        <div className="bg-white border border-[#DCE5EC] rounded-xl p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
            <div>
              <h2 className="text-lg font-bold text-[#07334E]">
                Monitorização da qualidade da água (parâmetros físico-químicos)
              </h2>
              <p className="text-xs text-[#5A7184]">
                Sensores integrados no contador {meter.code} para detecção precoce de variações
              </p>
            </div>
            <StatusIndicator
              status={qualityAssessment.overallStatus}
              label={qualityAssessment.overallLabel}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-5">
            {qualityAssessment.parameters.map((param) => (
              <div
                key={param.key}
                className="bg-[#F3F6F9] border border-[#DCE5EC] rounded-xl p-4 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-semibold text-[#07334E]">{param.label}</span>
                    <StatusIndicator status={param.status} />
                  </div>
                  <p className="font-mono tabular-nums text-2xl font-bold text-[#07334E]">
                    {param.value}{' '}
                    <span className="text-xs font-normal text-[#5A7184]">{param.unit}</span>
                  </p>
                  <p className="text-[11px] font-mono text-[#5A7184] mt-0.5">
                    Referência indicativa: {param.referenceRange}
                  </p>
                </div>

                <div className="mt-4">
                  <div className="h-2 w-full bg-[#DCE5EC] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${statusBarColor(param.status)}`}
                      style={{ width: `${param.percentPosition}%` }}
                    />
                  </div>
                  <p className="text-xs text-[#5A7184] mt-2 leading-relaxed">{param.detail}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-[#EBF6FB] border border-[#C5E4F2] rounded-lg p-4">
            <p className="text-xs sm:text-sm text-[#07334E] leading-relaxed">
              <strong className="font-bold">Nota técnica:</strong> A medição destes parâmetros tem
              carácter informativo e permite acompanhar variações na água, mas{' '}
              <strong className="font-bold">não certifica a potabilidade</strong>, que exige
              análises laboratoriais complementares por entidades competentes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
