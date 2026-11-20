import { useEffect, useRef, useState } from 'react';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import { ImpactSection } from './components/ImpactSection';
import { ManagementSection } from './components/ManagementSection';
import { OverviewSection } from './components/OverviewSection';
import { PlatformSection } from './components/PlatformSection';
import { TopBar } from './components/TopBar';
import { INITIAL_METER_POINTS } from './lib/aquasenseData';
import {
  DEFAULT_ADMIN_SECURITY,
  applyHydraulicAction,
  applyScenarioToPoint,
  stepMeterSimulation,
} from './lib/aquasenseEngine';
import type {
  AdminSecurityConfig,
  AppSection,
  ClientSession,
  ConsumerLoginInput,
  MeterPoint,
  OrganizationLoginInput,
  ScenarioMode,
  StatusLevel,
  TelemetryLogEntry,
  ThresholdConfig,
} from './lib/aquasenseTypes';

const STORAGE_KEYS = {
  thresholds: 'aquasense_thresholds_v1',
  resolvedAlerts: 'aquasense_resolved_alerts_v1',
  customMeters: 'aquasense_custom_meters_v1',
  clientSession: 'aquasense_client_session_v1',
  adminSecurity: 'aquasense_admin_security_v1',
};

function formatTimeShort(): string {
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  const ss = String(now.getSeconds()).padStart(2, '0');
  return `${hh}:${mm}:${ss}`;
}

function formatCurrentTimeLabel(): string {
  return `Hoje, ${formatTimeShort()}`;
}

function readInitialSection(): AppSection {
  if (typeof window === 'undefined') return 'visao-geral';
  const params = new URLSearchParams(window.location.search);
  if (params.get('autostart') === '1' || params.get('view') === 'plataforma') {
    return 'plataforma';
  }
  const view = params.get('view');
  if (
    view === 'visao-geral' ||
    view === 'plataforma' ||
    view === 'impacto' ||
    view === 'contacto' ||
    view === 'gestao'
  ) {
    return view;
  }
  return 'visao-geral';
}

function readStoredThresholds(): ThresholdConfig {
  if (typeof window === 'undefined') {
    return { dailyLimitLiters: 550, leakContinuousThresholdLpm: 1.5 };
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.thresholds);
    if (!raw) return { dailyLimitLiters: 550, leakContinuousThresholdLpm: 1.5 };
    const parsed = JSON.parse(raw) as Partial<ThresholdConfig>;
    return {
      dailyLimitLiters:
        typeof parsed.dailyLimitLiters === 'number' ? parsed.dailyLimitLiters : 550,
      leakContinuousThresholdLpm:
        typeof parsed.leakContinuousThresholdLpm === 'number'
          ? parsed.leakContinuousThresholdLpm
          : 1.5,
    };
  } catch {
    return { dailyLimitLiters: 550, leakContinuousThresholdLpm: 1.5 };
  }
}

function readStoredResolvedAlerts(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.resolvedAlerts);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? new Set(parsed.filter((x) => typeof x === 'string')) : new Set();
  } catch {
    return new Set();
  }
}

function readInitialMeters(): MeterPoint[] {
  if (typeof window === 'undefined') return INITIAL_METER_POINTS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.customMeters);
    if (!raw) return INITIAL_METER_POINTS;
    const custom = JSON.parse(raw);
    if (!Array.isArray(custom)) return INITIAL_METER_POINTS;
    return [...INITIAL_METER_POINTS, ...custom];
  } catch {
    return INITIAL_METER_POINTS;
  }
}

function readStoredClientSession(): ClientSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.clientSession);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<ClientSession>;
    if (!parsed || !parsed.meterId || !parsed.displayName) return null;
    return {
      type: parsed.type === 'organizacao' ? 'organizacao' : 'consumidor',
      displayName: parsed.displayName,
      contactName: parsed.contactName,
      category: parsed.category ?? 'Residências e famílias',
      bairro: parsed.bairro ?? 'Bairro Comercial',
      municipality: parsed.municipality ?? (parsed.province === 'Huíla' ? 'Lubango' : 'Luanda'),
      province: parsed.province ?? 'Huíla',
      meterCode: parsed.meterCode ?? 'AQ-HLA-021',
      meterId: parsed.meterId,
      loggedInAt: parsed.loggedInAt ?? formatCurrentTimeLabel(),
    };
  } catch {
    return null;
  }
}

function readStoredAdminSecurity(): AdminSecurityConfig {
  if (typeof window === 'undefined') return DEFAULT_ADMIN_SECURITY;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.adminSecurity);
    if (!raw) return DEFAULT_ADMIN_SECURITY;
    const parsed = JSON.parse(raw) as Partial<AdminSecurityConfig>;
    if (!parsed.username || !parsed.password || !parsed.primaryAccessKey) {
      return DEFAULT_ADMIN_SECURITY;
    }
    return {
      username: parsed.username,
      password: parsed.password,
      primaryAccessKey: parsed.primaryAccessKey,
      operatorKeys: Array.isArray(parsed.operatorKeys)
        ? parsed.operatorKeys
        : DEFAULT_ADMIN_SECURITY.operatorKeys,
      updatedAt: parsed.updatedAt ?? 'Actualizado',
    };
  } catch {
    return DEFAULT_ADMIN_SECURITY;
  }
}

function buildCustomMeter(
  code: string,
  name: string,
  bairro: string,
  municipality: string,
  province: string,
  category: MeterPoint['category'],
  habitualDailyLiters: number
): MeterPoint {
  const perBlock = Math.max(10, Math.round(habitualDailyLiters / 10));
  const labels24 = ['00h', '02h', '04h', '06h', '08h', '10h', '12h', '14h', '16h', '18h', '20h', '22h'];
  const weights = [0.25, 0.2, 0.22, 0.95, 1.5, 1.1, 1.2, 0.95, 0.85, 1.4, 1.3, 0.55];
  return {
    id: `meter-user-${Date.now()}`,
    code: code.trim().toUpperCase(),
    name,
    location: `${bairro}, ${municipality}, ${province}`,
    bairro,
    municipality,
    province,
    category,
    connectivity: 'Wi-Fi',
    controller: 'Unidade AQUASENSE v1',
    lastSyncIso: formatCurrentTimeLabel(),
    totalVolumeM3: Number((habitualDailyLiters * 0.14).toFixed(2)),
    dailyLiters: Math.round(habitualDailyLiters * 0.92),
    habitualDailyLiters,
    currentFlowLpm: 1.35,
    pressureBar: province === 'Huíla' ? 2.72 : 2.62,
    valveClosed: false,
    wastedLitersEstimate: 0,
    continuousFlowMinutes: 10,
    continuousFlowSeconds: 615,
    quality: {
      ph: 7.2,
      turbidityNtu: 0.8,
      tdsPpm: province === 'Huíla' ? 195 : 220,
      temperatureC: province === 'Huíla' ? 20.8 : 23.4,
    },
    series24h: labels24.map((label, idx) => ({
      label,
      habitualLiters: Math.round(perBlock * weights[idx]),
      liters: Math.round(perBlock * weights[idx] * 0.93),
    })),
    series7d: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map((label) => ({
      label,
      habitualLiters: habitualDailyLiters,
      liters: Math.round(habitualDailyLiters * 0.95),
    })),
    series30d: ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'].map((label) => ({
      label,
      habitualLiters: habitualDailyLiters * 7,
      liters: Math.round(habitualDailyLiters * 7 * 0.95),
    })),
    activeScenario: 'normal',
  };
}

export default function App() {
  const [activeSection, setActiveSection] = useState<AppSection>(readInitialSection);
  const [points, setPoints] = useState<MeterPoint[]>(readInitialMeters);
  const [clientSession, setClientSession] = useState<ClientSession | null>(
    readStoredClientSession
  );
  const [adminSecurity, setAdminSecurity] = useState<AdminSecurityConfig>(
    readStoredAdminSecurity
  );
  const [adminAuthKeyLabel, setAdminAuthKeyLabel] = useState<string | null>(null);
  const [isLive, setIsLive] = useState<boolean>(true);
  const [liveClockHms, setLiveClockHms] = useState<string>(formatTimeShort);
  const [thresholds, setThresholds] = useState<ThresholdConfig>(readStoredThresholds);
  const [resolvedAlertIds, setResolvedAlertIds] = useState<Set<string>>(
    readStoredResolvedAlerts
  );
  const [telemetryLog, setTelemetryLog] = useState<TelemetryLogEntry[]>([
    {
      id: 'log-init-1',
      time: formatTimeShort(),
      event: 'Leitura periódica recebida',
      detail: 'Caudal e sensores físico-químicos sincronizados sem falhas.',
      severity: 'normal',
    },
  ]);

  const tickRef = useRef(1);

  const appendLog = (event: string, detail: string, severity: StatusLevel) => {
    setTelemetryLog((prev) => [
      {
        id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        time: formatTimeShort(),
        event,
        detail,
        severity,
      },
      ...prev.slice(0, 14),
    ]);
  };

  // Real-time HH:MM:SS clock + 1-second realistic physical hydraulic & sensor telemetry
  useEffect(() => {
    const timer = window.setInterval(() => {
      const nowHms = formatTimeShort();
      setLiveClockHms(nowHms);
      if (!isLive) return;
      tickRef.current += 1;
      const seed = tickRef.current;
      const syncLabel = `Hoje, ${nowHms}`;
      setPoints((prev) =>
        prev.map((point, idx) => ({
          ...stepMeterSimulation(point, seed + idx * 1.7, 1),
          lastSyncIso: syncLabel,
        }))
      );
    }, 1000);
    return () => window.clearInterval(timer);
  }, [isLive]);

  const persistCustomMeters = (updated: MeterPoint[]) => {
    const baseIds = new Set(INITIAL_METER_POINTS.map((p) => p.id));
    const customOnly = updated.filter((p) => !baseIds.has(p.id));
    try {
      window.localStorage.setItem(STORAGE_KEYS.customMeters, JSON.stringify(customOnly));
    } catch {
      // Ignore storage quota issues
    }
  };

  const handleNavigate = (section: AppSection) => {
    setActiveSection(section);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const saveClientSession = (next: ClientSession | null) => {
    setClientSession(next);
    try {
      if (next) {
        window.localStorage.setItem(STORAGE_KEYS.clientSession, JSON.stringify(next));
      } else {
        window.localStorage.removeItem(STORAGE_KEYS.clientSession);
      }
    } catch {
      // Ignore storage errors
    }
  };

  const handleConsumerLogin = (input: ConsumerLoginInput) => {
    const normalizedCode = input.meterCode.trim().toUpperCase();
    const existing = points.find((p) => p.code.toUpperCase() === normalizedCode);
    let targetMeter = existing;

    if (!targetMeter) {
      targetMeter = buildCustomMeter(
        normalizedCode,
        `Residência ${input.name.trim()}`,
        input.bairro.trim(),
        input.municipality.trim(),
        input.province,
        'Residências e famílias',
        450
      );
      setPoints((prev) => {
        const next = [...prev, targetMeter!];
        persistCustomMeters(next);
        return next;
      });
    }

    saveClientSession({
      type: 'consumidor',
      displayName: input.name.trim(),
      category: 'Residências e famílias',
      bairro: input.bairro.trim(),
      municipality: input.municipality.trim(),
      province: input.province,
      meterCode: targetMeter.code,
      meterId: targetMeter.id,
      loggedInAt: formatCurrentTimeLabel(),
    });
    appendLog(
      'Sessão de consumidor iniciada',
      `Contador ${targetMeter.code} ligado em ${input.bairro.trim()}, ${input.municipality.trim()}, ${input.province}.`,
      'normal'
    );
  };

  const handleOrganizationLogin = (input: OrganizationLoginInput) => {
    const normalizedCode = input.meterCode.trim().toUpperCase();
    const existing = points.find((p) => p.code.toUpperCase() === normalizedCode);
    let targetMeter = existing;

    if (!targetMeter) {
      targetMeter = buildCustomMeter(
        normalizedCode,
        input.organizationName.trim(),
        input.bairro.trim(),
        input.municipality.trim(),
        input.province,
        input.organizationType,
        3200
      );
      setPoints((prev) => {
        const next = [...prev, targetMeter!];
        persistCustomMeters(next);
        return next;
      });
    }

    saveClientSession({
      type: 'organizacao',
      displayName: input.organizationName.trim(),
      contactName: input.contactName.trim(),
      category: input.organizationType,
      bairro: input.bairro.trim(),
      municipality: input.municipality.trim(),
      province: input.province,
      meterCode: targetMeter.code,
      meterId: targetMeter.id,
      loggedInAt: formatCurrentTimeLabel(),
    });
    appendLog(
      'Sessão de organização iniciada',
      `${input.organizationName.trim()} (${targetMeter.code}) ligada em ${input.bairro.trim()}, ${input.municipality.trim()}, ${input.province}.`,
      'normal'
    );
  };

  const handleManualSync = () => {
    const label = formatCurrentTimeLabel();
    setPoints((prev) => prev.map((p) => ({ ...p, lastSyncIso: label })));
    appendLog(
      'Sincronização manual executada',
      'Leitura confirmada junto ao contador inteligente.',
      'normal'
    );
  };

  const handleApplyScenario = (meterId: string, scenario: ScenarioMode) => {
    const label = formatCurrentTimeLabel();
    setPoints((prev) =>
      prev.map((p) =>
        p.id === meterId
          ? { ...applyScenarioToPoint(p, scenario), lastSyncIso: label }
          : p
      )
    );
    setResolvedAlertIds((prev) => {
      const next = new Set(
        Array.from(prev).filter((id) => !id.startsWith(`alert-${meterId}-`))
      );
      try {
        window.localStorage.setItem(
          STORAGE_KEYS.resolvedAlerts,
          JSON.stringify(Array.from(next))
        );
      } catch {
        // Ignore storage quota issues
      }
      return next;
    });

    if (scenario === 'fuga') {
      appendLog(
        'Fuga contínua detectada',
        'Fluxo persistente (2,6 L/min) com queda de pressão para 2,1 bar.',
        'alerta'
      );
    } else if (scenario === 'consumo_anormal') {
      appendLog(
        'Pico de caudal / ruptura simulada',
        'Caudal elevado (12,8 L/min) e queda de pressão para 1,7 bar.',
        'alerta'
      );
    } else if (scenario === 'qualidade') {
      appendLog(
        'Desvio físico-químico detectado',
        'Turbidez (7,4 NTU), pH (5,8) e TDS (615 ppm) fora da faixa indicativa.',
        'alerta'
      );
    } else {
      appendLog(
        'Operação normalizada',
        'Caudal, pressão (2,6 bar) e parâmetros da água estabilizados.',
        'normal'
      );
    }
  };

  const handleHydraulicAction = (
    meterId: string,
    action: 'torneira' | 'tanque' | 'toggle_valvula'
  ) => {
    const target = points.find((p) => p.id === meterId);
    const label = formatCurrentTimeLabel();
    setPoints((prev) =>
      prev.map((p) =>
        p.id === meterId
          ? { ...applyHydraulicAction(p, action), lastSyncIso: label }
          : p
      )
    );

    if (action === 'toggle_valvula') {
      const closing = !(target?.valveClosed ?? false);
      appendLog(
        closing ? 'Válvula principal fechada' : 'Válvula principal reaberta',
        closing
          ? 'Corte hidráulico activo: caudal reduzido a 0,0 L/min.'
          : 'Fornecimento restabelecido com pressão nominal.',
        closing ? 'atencao' : 'normal'
      );
    } else if (action === 'torneira') {
      appendLog(
        'Consumo doméstico registado',
        'Abertura de torneira/duche (+6,5 L/min, +18 L registados).',
        'normal'
      );
    } else {
      appendLog(
        'Enchimento de reservatório iniciado',
        'Aumento de caudal (+13,5 L/min) e +95 L no volume diário.',
        'atencao'
      );
    }
  };

  const handleToggleResolveAlert = (alertId: string) => {
    setResolvedAlertIds((prev) => {
      const next = new Set(prev);
      if (next.has(alertId)) {
        next.delete(alertId);
      } else {
        next.add(alertId);
      }
      try {
        window.localStorage.setItem(
          STORAGE_KEYS.resolvedAlerts,
          JSON.stringify(Array.from(next))
        );
      } catch {
        // Ignore storage quota issues
      }
      return next;
    });
  };

  const handleUpdateThresholds = (next: ThresholdConfig) => {
    setThresholds(next);
    try {
      window.localStorage.setItem(STORAGE_KEYS.thresholds, JSON.stringify(next));
    } catch {
      // Ignore storage quota issues
    }
  };

  const handleUpdateAdminSecurity = (next: AdminSecurityConfig) => {
    setAdminSecurity(next);
    try {
      window.localStorage.setItem(STORAGE_KEYS.adminSecurity, JSON.stringify(next));
    } catch {
      // Ignore storage quota issues
    }
  };

  const handleAddMeter = (newMeter: MeterPoint) => {
    setPoints((prev) => {
      const updated = [...prev, newMeter];
      persistCustomMeters(updated);
      return updated;
    });
  };

  const activeClientMeter =
    (clientSession && points.find((p) => p.id === clientSession.meterId)) || points[1] || points[0];

  return (
    <div className="min-h-screen flex flex-col bg-white text-[#1E3342]">
      <TopBar activeSection={activeSection} onNavigate={handleNavigate} />

      <main className="flex-1">
        {activeSection === 'visao-geral' && (
          <OverviewSection
            featuredMeter={activeClientMeter}
            liveClockHms={liveClockHms}
            onNavigate={handleNavigate}
          />
        )}
        {activeSection === 'plataforma' && (
          <PlatformSection
            session={clientSession}
            onConsumerLogin={handleConsumerLogin}
            onOrganizationLogin={handleOrganizationLogin}
            onLogout={() => saveClientSession(null)}
            onNavigate={handleNavigate}
            meter={activeClientMeter}
            liveClockHms={liveClockHms}
            isLive={isLive}
            onToggleLive={() => setIsLive((prev) => !prev)}
            onManualSync={handleManualSync}
            onApplyScenario={handleApplyScenario}
            onHydraulicAction={handleHydraulicAction}
            telemetryLog={telemetryLog}
            resolvedAlertIds={resolvedAlertIds}
            onToggleResolveAlert={handleToggleResolveAlert}
            thresholds={thresholds}
            onUpdateThresholds={handleUpdateThresholds}
          />
        )}
        {activeSection === 'impacto' && (
          <ImpactSection onNavigate={handleNavigate} />
        )}
        {activeSection === 'contacto' && <ContactSection />}
        {activeSection === 'gestao' && (
          <ManagementSection
            isAuthenticated={adminAuthKeyLabel !== null}
            activeKeyLabel={adminAuthKeyLabel}
            securityConfig={adminSecurity}
            onLoginSuccess={(label) => setAdminAuthKeyLabel(label)}
            onLogout={() => setAdminAuthKeyLabel(null)}
            onUpdateSecurity={handleUpdateAdminSecurity}
            points={points}
            liveClockHms={liveClockHms}
            leakThresholdLpm={thresholds.leakContinuousThresholdLpm}
            onAddMeter={handleAddMeter}
            onApplyScenario={handleApplyScenario}
            onHydraulicAction={handleHydraulicAction}
          />
        )}
      </main>

      <Footer onNavigate={handleNavigate} />
    </div>
  );
}
