import type {
  AdminLoginInput,
  AdminSecurityConfig,
  AlertItem,
  BeneficiaryCategory,
  ConsumerLoginInput,
  MeterPoint,
  NetworkSummary,
  NewMeterInput,
  OrganizationLoginInput,
  ParameterEvaluation,
  PilotInquiryInput,
  RecommendationItem,
  ScenarioMode,
  StatusLevel,
  ThresholdConfig,
  ValidationResult,
  WaterQualityAssessment,
  WaterQualityReading,
} from './aquasenseTypes';

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

export const DEFAULT_ADMIN_SECURITY: AdminSecurityConfig = {
  username: 'gestao@aquasense.ao',
  password: 'AquaGestao2026',
  primaryAccessKey: 'AQ-KEY-2026-AO',
  operatorKeys: [
    {
      id: 'op-key-1',
      label: 'Equipa Técnica Luanda Norte',
      keyValue: 'AQ-OP-LDA-8841',
      createdAt: 'Configuração inicial',
      active: true,
    },
  ],
  updatedAt: 'Configuração inicial',
};

export function statusRank(status: StatusLevel): number {
  if (status === 'alerta') return 2;
  if (status === 'atencao') return 1;
  return 0;
}

export function maxStatus(a: StatusLevel, b: StatusLevel): StatusLevel {
  return statusRank(a) >= statusRank(b) ? a : b;
}

export function statusDisplayLabel(status: StatusLevel): string {
  if (status === 'alerta') return 'Alerta';
  if (status === 'atencao') return 'Atenção';
  return 'Normal';
}

/**
 * Estimates indicative cost in Angolan Kwanzas (AOA) for a volume in liters
 * (reference indicative rate: ~420 Kz per m³ for domestic demonstration).
 */
export function estimateCostKz(liters: number, ratePerM3Kz = 420): number {
  return Math.max(0, Math.round((liters / 1000) * ratePerM3Kz));
}

/**
 * Formats an elapsed duration in seconds into HH:MM:SS for real-time counters.
 */
export function formatDurationHms(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const seconds = safe % 60;
  return [hours, minutes, seconds].map((n) => String(n).padStart(2, '0')).join(':');
}

/**
 * Evaluates physico-chemical water quality parameters (indicative only; does not certify potability).
 */
export function evaluateWaterQuality(reading: WaterQualityReading): WaterQualityAssessment {
  const phStatus: StatusLevel =
    reading.ph < 6.0 || reading.ph > 9.0
      ? 'alerta'
      : reading.ph < 6.5 || reading.ph > 8.5
        ? 'atencao'
        : 'normal';

  const turbidityStatus: StatusLevel =
    reading.turbidityNtu > 5.0
      ? 'alerta'
      : reading.turbidityNtu > 2.5
        ? 'atencao'
        : 'normal';

  const tdsStatus: StatusLevel =
    reading.tdsPpm > 550
      ? 'alerta'
      : reading.tdsPpm > 380
        ? 'atencao'
        : 'normal';

  const tempStatus: StatusLevel =
    reading.temperatureC > 32 || reading.temperatureC < 10
      ? 'alerta'
      : reading.temperatureC > 28 || reading.temperatureC < 15
        ? 'atencao'
        : 'normal';

  const parameters: ParameterEvaluation[] = [
    {
      key: 'ph',
      label: 'pH (Acidez / Alcalinidade)',
      value: Number(reading.ph.toFixed(2)),
      unit: 'pH',
      referenceRange: '6,5 – 8,5',
      status: phStatus,
      statusLabel: statusDisplayLabel(phStatus),
      percentPosition: clamp(((reading.ph - 4) / 6) * 100, 2, 98),
      detail:
        phStatus === 'normal'
          ? 'Dentro da faixa indicativa equilibrada.'
          : reading.ph < 6.5
            ? 'Tendência ácida detectada pelo sensor.'
            : 'Tendência alcalina acima da faixa de referência.',
    },
    {
      key: 'turbidityNtu',
      label: 'Turbidez',
      value: Number(reading.turbidityNtu.toFixed(1)),
      unit: 'NTU',
      referenceRange: '≤ 5,0 NTU',
      status: turbidityStatus,
      statusLabel: statusDisplayLabel(turbidityStatus),
      percentPosition: clamp((reading.turbidityNtu / 10) * 100, 2, 98),
      detail:
        turbidityStatus === 'normal'
          ? 'Transparência estável e baixa presença de partículas em suspensão.'
          : turbidityStatus === 'atencao'
            ? 'Aumento moderado de partículas em suspensão.'
            : 'Turbidez elevada; recomenda-se inspecção do reservatório e filtragem.',
    },
    {
      key: 'tdsPpm',
      label: 'TDS / Condutividade',
      value: Math.round(reading.tdsPpm),
      unit: 'ppm',
      referenceRange: '≤ 500 ppm',
      status: tdsStatus,
      statusLabel: statusDisplayLabel(tdsStatus),
      percentPosition: clamp((reading.tdsPpm / 800) * 100, 2, 98),
      detail:
        tdsStatus === 'normal'
          ? 'Teor de sólidos dissolvidos dentro dos parâmetros habituais.'
          : tdsStatus === 'atencao'
            ? 'Teor de sólidos dissolvidos em elevação gradual.'
            : 'Sólidos dissolvidos acima do limite indicativo configurado.',
    },
    {
      key: 'temperatureC',
      label: 'Temperatura da Água',
      value: Number(reading.temperatureC.toFixed(1)),
      unit: '°C',
      referenceRange: '15 – 28 °C',
      status: tempStatus,
      statusLabel: statusDisplayLabel(tempStatus),
      percentPosition: clamp(((reading.temperatureC - 5) / 35) * 100, 2, 98),
      detail:
        tempStatus === 'normal'
          ? 'Temperatura térmica estável na rede de distribuição.'
          : 'Variação térmica fora do intervalo habitual de distribuição.',
    },
  ];

  const overallStatus = parameters.reduce<StatusLevel>(
    (acc, item) => maxStatus(acc, item.status),
    'normal'
  );

  return {
    overallStatus,
    overallLabel:
      overallStatus === 'normal'
        ? 'Parâmetros estáveis'
        : overallStatus === 'atencao'
          ? 'Variação detectada'
          : 'Fora dos limites indicativos',
    parameters,
  };
}

export interface ConsumptionAnomalyResult {
  leakDetected: boolean;
  abnormalConsumption: boolean;
  deviationPercent: number;
  status: StatusLevel;
}

/**
 * Deterministically evaluates consumption deviation and continuous flow leak signatures.
 */
export function detectConsumptionAnomaly(
  currentFlowLpm: number,
  dailyLiters: number,
  dailyLimitLiters: number,
  habitualDailyLiters: number,
  continuousFlowMinutes: number,
  leakContinuousThresholdLpm: number
): ConsumptionAnomalyResult {
  const safeHabitual = Math.max(1, habitualDailyLiters);
  const deviationPercent = Math.round(((dailyLiters - safeHabitual) / safeHabitual) * 100);

  const leakDetected =
    continuousFlowMinutes >= 90 && currentFlowLpm >= leakContinuousThresholdLpm;

  const abnormalConsumption =
    dailyLiters > dailyLimitLiters || deviationPercent >= 30;

  let status: StatusLevel = 'normal';
  if (leakDetected || dailyLiters > dailyLimitLiters * 1.25 || deviationPercent >= 45) {
    status = 'alerta';
  } else if (abnormalConsumption || deviationPercent >= 18) {
    status = 'atencao';
  }

  return {
    leakDetected,
    abnormalConsumption,
    deviationPercent,
    status,
  };
}

export function evaluateMeterStatus(
  point: MeterPoint,
  config: ThresholdConfig
): StatusLevel {
  const quality = evaluateWaterQuality(point.quality);
  const consumption = detectConsumptionAnomaly(
    point.currentFlowLpm,
    point.dailyLiters,
    config.dailyLimitLiters,
    point.habitualDailyLiters,
    point.continuousFlowMinutes,
    config.leakContinuousThresholdLpm
  );
  return maxStatus(quality.overallStatus, consumption.status);
}

/**
 * Generates deterministic alerts and actionable recommendations for a meter point.
 */
export function generateAlertsAndRecommendations(
  point: MeterPoint,
  config: ThresholdConfig,
  resolvedAlertIds: ReadonlySet<string> = new Set()
): { alerts: AlertItem[]; recommendations: RecommendationItem[] } {
  const quality = evaluateWaterQuality(point.quality);
  const consumption = detectConsumptionAnomaly(
    point.currentFlowLpm,
    point.dailyLiters,
    config.dailyLimitLiters,
    point.habitualDailyLiters,
    point.continuousFlowMinutes,
    config.leakContinuousThresholdLpm
  );

  const alerts: AlertItem[] = [];
  const recommendations: RecommendationItem[] = [];
  const timestamp = point.lastSyncIso;

  if (consumption.leakDetected) {
    const id = `alert-${point.id}-fuga`;
    alerts.push({
      id,
      meterId: point.id,
      meterName: point.name,
      type: 'fuga',
      severity: 'alerta',
      title: 'Possível fuga contínua detectada',
      description: `Fluxo ininterrupto de ${point.currentFlowLpm.toFixed(1)} L/min durante ${point.continuousFlowMinutes} minutos consecutivos (pressão ${point.pressureBar.toFixed(1)} bar) no contador ${point.code}. Perda estimada: ${Math.round(point.wastedLitersEstimate)} L.`,
      recommendation:
        'Feche todas as torneiras ou accione o fecho preventivo da válvula principal para confirmar se o caudal zera. Inspeccione autoclismos, reservatórios elevados e ligações exteriores.',
      timestamp,
      resolved: resolvedAlertIds.has(id),
    });
    recommendations.push({
      id: `rec-${point.id}-fuga`,
      category: 'Prevenção de Fugas',
      title: 'Inspecção imediata da rede interna',
      action:
        'Encerre a válvula de corte sectorial durante 15 minutos para isolar o ramal onde persiste o caudal contínuo e evitar desperdício prolongado.',
      priority: 'alerta',
    });
  }

  if (consumption.abnormalConsumption) {
    const id = `alert-${point.id}-consumo`;
    const severity: 'atencao' | 'alerta' =
      point.dailyLiters > config.dailyLimitLiters * 1.25 || consumption.deviationPercent >= 45
        ? 'alerta'
        : 'atencao';
    alerts.push({
      id,
      meterId: point.id,
      meterName: point.name,
      type: 'consumo_anormal',
      severity,
      title: 'Consumo acima do padrão habitual',
      description: `Registo diário de ${Math.round(point.dailyLiters)} L (${consumption.deviationPercent > 0 ? '+' : ''}${consumption.deviationPercent}% face à média habitual de ${Math.round(point.habitualDailyLiters)} L).`,
      recommendation:
        'Reveja os horários de maior caudal no histórico de 24 horas e valide a rega, lavagens ou enchimento de tanques.',
      timestamp,
      resolved: resolvedAlertIds.has(id),
    });
    recommendations.push({
      id: `rec-${point.id}-consumo`,
      category: 'Consumo',
      title: 'Ajuste de rotina de utilização',
      action:
        'Distribua tarefas de maior consumo (máquinas, enchimento de depósitos) fora das horas de pico e configure alertas preventivos ao atingir 80% do limite diário.',
      priority: severity,
    });
  }

  const outOfRangeParams = quality.parameters.filter((p) => p.status !== 'normal');
  if (outOfRangeParams.length > 0) {
    const id = `alert-${point.id}-qualidade`;
    const summaryList = outOfRangeParams
      .map((p) => `${p.label.split(' ')[0]}: ${p.value} ${p.unit}`)
      .join(' · ');
    alerts.push({
      id,
      meterId: point.id,
      meterName: point.name,
      type: 'qualidade',
      severity: quality.overallStatus === 'alerta' ? 'alerta' : 'atencao',
      title: 'Alteração nos parâmetros físico-químicos da água',
      description: `Leitura indicativa fora da faixa habitual (${summaryList}). Os sensores são informativos e não substituem análise laboratorial.`,
      recommendation:
        'Evite consumo directo sem filtragem ou fervura até estabilização dos parâmetros. Se a variação persistir, solicite análise laboratorial à entidade competente.',
      timestamp,
      resolved: resolvedAlertIds.has(id),
    });
    recommendations.push({
      id: `rec-${point.id}-qualidade`,
      category: 'Qualidade da Água',
      title: 'Verificação do ponto de entrada e filtragem',
      action:
        'Verifique o estado dos filtros domésticos e a limpeza do reservatório/tanque. Recolha amostra para verificação laboratorial caso a turbidez ou o pH permaneçam elevados.',
      priority: quality.overallStatus === 'alerta' ? 'alerta' : 'atencao',
    });
  }

  if (recommendations.length === 0) {
    recommendations.push(
      {
        id: `rec-${point.id}-habit`,
        category: 'Consumo',
        title: 'Consumo alinhado com o padrão eficiente',
        action:
          'O volume diário encontra-se dentro do limite definido. Mantenha o acompanhamento semanal para consolidar hábitos de consumo consciente.',
        priority: 'normal',
      },
      {
        id: `rec-${point.id}-check`,
        category: 'Prevenção de Fugas',
        title: 'Monitorização nocturna activa',
        action:
          'Sem registo de caudal contínuo fora de horas. O sistema assinalará automaticamente perdas silenciosas acima do limiar configurado.',
        priority: 'normal',
      },
      {
        id: `rec-${point.id}-quality-ok`,
        category: 'Qualidade da Água',
        title: 'Parâmetros físico-químicos estáveis',
        action:
          'pH, turbidez, TDS e temperatura dentro dos valores indicativos habituais. Lembre-se de higienizar depósitos periodicamente.',
        priority: 'normal',
      }
    );
  }

  return { alerts, recommendations };
}

/**
 * Applies a realistic physical scenario to a meter point.
 */
export function applyScenarioToPoint(
  point: MeterPoint,
  scenario: ScenarioMode
): MeterPoint {
  const baseHabitual = point.habitualDailyLiters;

  if (scenario === 'normal') {
    return {
      ...point,
      activeScenario: 'normal',
      valveClosed: false,
      currentFlowLpm: 1.4,
      pressureBar: 2.62,
      wastedLitersEstimate: 0,
      continuousFlowMinutes: 12,
      continuousFlowSeconds: 740,
      dailyLiters: Math.round(baseHabitual * 0.94),
      quality: {
        ph: 7.2,
        turbidityNtu: 0.9,
        tdsPpm: 218,
        temperatureC: point.province === 'Huíla' ? 20.8 : 23.4,
      },
      series24h: point.series24h.map((item) => ({
        ...item,
        liters: Math.round(item.habitualLiters * 0.95),
      })),
    };
  }

  if (scenario === 'fuga') {
    return {
      ...point,
      activeScenario: 'fuga',
      valveClosed: false,
      currentFlowLpm: 2.6,
      pressureBar: 2.08,
      wastedLitersEstimate: 214,
      continuousFlowMinutes: 185,
      continuousFlowSeconds: 11120,
      dailyLiters: Math.round(baseHabitual * 1.48),
      quality: {
        ph: 7.1,
        turbidityNtu: 1.2,
        tdsPpm: 229,
        temperatureC: point.province === 'Huíla' ? 21.3 : 23.9,
      },
      series24h: point.series24h.map((item, idx) => ({
        ...item,
        liters: idx >= 6 ? Math.round(item.habitualLiters + 42) : item.habitualLiters,
      })),
    };
  }

  if (scenario === 'consumo_anormal') {
    return {
      ...point,
      activeScenario: 'consumo_anormal',
      valveClosed: false,
      currentFlowLpm: 12.8,
      pressureBar: 1.68,
      wastedLitersEstimate: 148,
      continuousFlowMinutes: 46,
      continuousFlowSeconds: 2775,
      dailyLiters: Math.round(baseHabitual * 1.58),
      quality: {
        ph: 7.3,
        turbidityNtu: 1.5,
        tdsPpm: 242,
        temperatureC: point.province === 'Huíla' ? 21.6 : 24.1,
      },
      series24h: point.series24h.map((item, idx) => ({
        ...item,
        liters:
          idx >= 8 && idx <= 11
            ? Math.round(item.habitualLiters * 2.2)
            : Math.round(item.habitualLiters * 1.15),
      })),
    };
  }

  // scenario === 'qualidade'
  return {
    ...point,
    activeScenario: 'qualidade',
    valveClosed: false,
    currentFlowLpm: 1.6,
    pressureBar: 2.42,
    wastedLitersEstimate: 0,
    continuousFlowMinutes: 18,
    continuousFlowSeconds: 1090,
    dailyLiters: Math.round(baseHabitual * 0.98),
    quality: {
      ph: 5.8,
      turbidityNtu: 7.4,
      tdsPpm: 615,
      temperatureC: point.province === 'Huíla' ? 23.1 : 25.4,
    },
    series24h: point.series24h.map((item) => ({
      ...item,
      liters: Math.round(item.habitualLiters * 0.98),
    })),
  };
}

/**
 * Advances a meter point by one realistic physical telemetry tick (default: 1 second).
 * Models hydraulic inertia, Bernoulli pressure response, exact second-by-second
 * continuous duration (HH:MM:SS), and respects closed valve state.
 */
export function stepMeterSimulation(
  point: MeterPoint,
  tickSeed: number,
  elapsedSeconds = 1
): MeterPoint {
  const wave = Math.sin(tickSeed * 0.55);
  const microWave = Math.cos(tickSeed * 0.9);

  if (point.valveClosed) {
    return {
      ...point,
      currentFlowLpm: 0,
      pressureBar: Number(clamp(2.86 + wave * 0.03, 2.75, 2.98).toFixed(2)),
      continuousFlowMinutes: 0,
      continuousFlowSeconds: 0,
    };
  }

  const targetFlow =
    point.activeScenario === 'consumo_anormal'
      ? 12.6
      : point.activeScenario === 'fuga'
        ? Math.max(2.4, point.habitualDailyLiters > 2000 ? 4.2 : 2.6)
        : point.habitualDailyLiters > 10000
          ? 21.5
          : point.habitualDailyLiters > 4000
            ? 4.1
            : point.habitualDailyLiters > 1500
              ? 2.2
              : 1.35;

  // Smooth relaxation back toward scenario target after temporary tap/tank spikes
  const relax = (targetFlow - point.currentFlowLpm) * 0.04;
  const flowJitter =
    point.activeScenario === 'consumo_anormal'
      ? wave * 0.35
      : point.activeScenario === 'fuga'
        ? wave * 0.08
        : wave * 0.09;

  const nextFlow = Number(Math.max(0.15, point.currentFlowLpm + relax + flowJitter).toFixed(2));
  const addedLiters = (nextFlow / 60) * elapsedSeconds;

  // Realistic line pressure responds inversely to instantaneous flow velocity
  const baseStaticBar = point.province === 'Huíla' ? 2.82 : 2.74;
  const dynamicDrop = Math.min(1.25, nextFlow * 0.068);
  const nextPressure = Number(
    clamp(baseStaticBar - dynamicDrop + microWave * 0.03, 1.35, 3.35).toFixed(2)
  );

  const nextContinuousSeconds = point.continuousFlowSeconds + Math.max(1, Math.round(elapsedSeconds));
  const nextContinuousMinutes = Math.floor(nextContinuousSeconds / 60);

  const nextWaste =
    point.activeScenario === 'fuga'
      ? Number((point.wastedLitersEstimate + addedLiters * 4).toFixed(2))
      : point.wastedLitersEstimate;

  const nextPh = Number(clamp(point.quality.ph + wave * 0.01, 5.2, 9.4).toFixed(2));
  const nextTurbidity = Number(
    clamp(point.quality.turbidityNtu + microWave * 0.03, 0.3, 9.8).toFixed(1)
  );
  const nextTds = Math.round(clamp(point.quality.tdsPpm + wave * 1.4, 120, 780));
  const nextTemp = Number(
    clamp(point.quality.temperatureC + microWave * 0.03, 15.0, 34.0).toFixed(1)
  );

  const scaledAddedLiters = addedLiters * 4;
  const nextSeries24h = point.series24h.map((slot, idx) =>
    idx === point.series24h.length - 1
      ? { ...slot, liters: Number((slot.liters + scaledAddedLiters).toFixed(1)) }
      : slot
  );

  return {
    ...point,
    currentFlowLpm: nextFlow,
    pressureBar: nextPressure,
    dailyLiters: Number((point.dailyLiters + scaledAddedLiters).toFixed(2)),
    totalVolumeM3: Number((point.totalVolumeM3 + scaledAddedLiters / 1000).toFixed(4)),
    continuousFlowMinutes: nextContinuousMinutes,
    continuousFlowSeconds: nextContinuousSeconds,
    wastedLitersEstimate: nextWaste,
    quality: {
      ph: nextPh,
      turbidityNtu: nextTurbidity,
      tdsPpm: nextTds,
      temperatureC: nextTemp,
    },
    series24h: nextSeries24h,
  };
}

/**
 * Triggers a realistic physical hydraulic action on the meter (e.g., opening a faucet, filling tank, or closing main valve).
 */
export function applyHydraulicAction(
  point: MeterPoint,
  action: 'torneira' | 'tanque' | 'toggle_valvula'
): MeterPoint {
  if (action === 'toggle_valvula') {
    const closing = !point.valveClosed;
    return {
      ...point,
      valveClosed: closing,
      currentFlowLpm: closing ? 0 : 1.4,
      pressureBar: closing ? 2.86 : 2.62,
      continuousFlowMinutes: closing ? 0 : point.continuousFlowMinutes,
      continuousFlowSeconds: closing ? 0 : point.continuousFlowSeconds,
    };
  }

  if (action === 'torneira') {
    return {
      ...point,
      valveClosed: false,
      currentFlowLpm: Number(Math.min(18, point.currentFlowLpm + 6.5).toFixed(1)),
      pressureBar: Number(Math.max(1.55, point.pressureBar - 0.28).toFixed(2)),
      dailyLiters: Number((point.dailyLiters + 18).toFixed(2)),
      totalVolumeM3: Number((point.totalVolumeM3 + 0.018).toFixed(4)),
    };
  }

  // Enchimento de tanque / reservatório
  return {
    ...point,
    valveClosed: false,
    currentFlowLpm: Number(Math.min(24, point.currentFlowLpm + 13.5).toFixed(1)),
    pressureBar: Number(Math.max(1.38, point.pressureBar - 0.56).toFixed(2)),
    dailyLiters: Number((point.dailyLiters + 95).toFixed(2)),
    totalVolumeM3: Number((point.totalVolumeM3 + 0.095).toFixed(4)),
  };
}

export function computeNetworkSummary(
  points: MeterPoint[],
  defaultLeakThresholdLpm = 1.5
): NetworkSummary {
  if (points.length === 0) {
    return {
      totalPoints: 0,
      totalDailyM3: 0,
      totalCumulativeM3: 0,
      pointsNormal: 0,
      pointsAttention: 0,
      pointsAlert: 0,
      qualityCompliancePct: 100,
    };
  }

  let totalDailyLiters = 0;
  let totalCumulativeM3 = 0;
  let pointsNormal = 0;
  let pointsAttention = 0;
  let pointsAlert = 0;
  let qualityOkCount = 0;

  for (const p of points) {
    totalDailyLiters += p.dailyLiters;
    totalCumulativeM3 += p.totalVolumeM3;
    const config: ThresholdConfig = {
      dailyLimitLiters: Math.round(p.habitualDailyLiters * 1.25),
      leakContinuousThresholdLpm: defaultLeakThresholdLpm,
    };
    const status = evaluateMeterStatus(p, config);
    if (status === 'alerta') pointsAlert += 1;
    else if (status === 'atencao') pointsAttention += 1;
    else pointsNormal += 1;

    if (evaluateWaterQuality(p.quality).overallStatus === 'normal') {
      qualityOkCount += 1;
    }
  }

  return {
    totalPoints: points.length,
    totalDailyM3: Number((totalDailyLiters / 1000).toFixed(2)),
    totalCumulativeM3: Number(totalCumulativeM3.toFixed(1)),
    pointsNormal,
    pointsAttention,
    pointsAlert,
    qualityCompliancePct: Math.round((qualityOkCount / points.length) * 100),
  };
}

export function filterMeterPoints(
  points: MeterPoint[],
  searchQuery: string,
  statusFilter: 'todos' | StatusLevel,
  categoryFilter: 'todas' | BeneficiaryCategory,
  defaultLeakThresholdLpm = 1.5
): MeterPoint[] {
  const normalizedQuery = searchQuery.trim().toLowerCase();

  return points.filter((p) => {
    if (categoryFilter !== 'todas' && p.category !== categoryFilter) {
      return false;
    }

    if (statusFilter !== 'todos') {
      const config: ThresholdConfig = {
        dailyLimitLiters: Math.round(p.habitualDailyLiters * 1.25),
        leakContinuousThresholdLpm: defaultLeakThresholdLpm,
      };
      if (evaluateMeterStatus(p, config) !== statusFilter) {
        return false;
      }
    }

    if (normalizedQuery.length > 0) {
      const haystack = `${p.code} ${p.name} ${p.location} ${p.bairro} ${p.municipality} ${p.province} ${p.category}`.toLowerCase();
      if (!haystack.includes(normalizedQuery)) {
        return false;
      }
    }

    return true;
  });
}

function escapeCsvCell(value: string | number): string {
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function formatPointsCsv(points: MeterPoint[]): string {
  const headers = [
    'Codigo',
    'Ponto de Medicao',
    'Localizacao',
    'Categoria',
    'Conectividade',
    'Consumo Diario (L)',
    'Volume Acumulado (m3)',
    'Caudal Actual (L/min)',
    'Pressao (bar)',
    'pH',
    'Turbidez (NTU)',
    'TDS (ppm)',
    'Temperatura (C)',
    'Estado',
  ];

  const rows = points.map((p) => {
    const status = evaluateMeterStatus(p, {
      dailyLimitLiters: Math.round(p.habitualDailyLiters * 1.25),
      leakContinuousThresholdLpm: 1.5,
    });
    return [
      p.code,
      p.name,
      p.location,
      p.category,
      p.connectivity,
      Math.round(p.dailyLiters),
      p.totalVolumeM3.toFixed(1),
      p.currentFlowLpm.toFixed(1),
      p.pressureBar.toFixed(1),
      p.quality.ph.toFixed(2),
      p.quality.turbidityNtu.toFixed(1),
      Math.round(p.quality.tdsPpm),
      p.quality.temperatureC.toFixed(1),
      statusDisplayLabel(status),
    ]
      .map(escapeCsvCell)
      .join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}

export function validateConsumerLogin(input: ConsumerLoginInput): ValidationResult {
  const errors: Record<string, string> = {};
  if (!input.name.trim() || input.name.trim().length < 3) {
    errors.name = 'Indique o seu nome completo (mín. 3 caracteres).';
  }
  if (!input.bairro.trim() || input.bairro.trim().length < 2) {
    errors.bairro = 'Indique o bairro da residência.';
  }
  if (!input.municipality.trim() || input.municipality.trim().length < 2) {
    errors.municipality = 'Seleccione ou indique o município.';
  }
  if (!input.province.trim()) {
    errors.province = 'Seleccione a província.';
  }
  if (!input.meterCode.trim() || input.meterCode.trim().length < 4) {
    errors.meterCode = 'Indique o número do contador (ex: AQ-HLA-021 ou AQ-LDA-014).';
  }
  return { valid: Object.keys(errors).length === 0, errors };
}

export function validateOrganizationLogin(input: OrganizationLoginInput): ValidationResult {
  const errors: Record<string, string> = {};
  if (!input.organizationName.trim() || input.organizationName.trim().length < 3) {
    errors.organizationName = 'Indique o nome da organização ou condomínio.';
  }
  if (!input.contactName.trim() || input.contactName.trim().length < 3) {
    errors.contactName = 'Indique o nome do responsável técnico ou administrativo.';
  }
  if (!input.bairro.trim() || input.bairro.trim().length < 2) {
    errors.bairro = 'Indique o bairro ou zona da instalação.';
  }
  if (!input.municipality.trim() || input.municipality.trim().length < 2) {
    errors.municipality = 'Seleccione ou indique o município.';
  }
  if (!input.province.trim()) {
    errors.province = 'Seleccione a província.';
  }
  if (!input.meterCode.trim() || input.meterCode.trim().length < 4) {
    errors.meterCode = 'Indique o número do contador principal (ex: AQ-HLA-112 ou AQ-LDA-082).';
  }
  return { valid: Object.keys(errors).length === 0, errors };
}

export function authenticateAdmin(
  input: AdminLoginInput,
  config: AdminSecurityConfig
): { authenticated: boolean; matchedKeyLabel?: string; error?: string } {
  const user = input.username.trim().toLowerCase();
  const pass = input.password;
  const key = input.accessKey.trim();

  if (!user || !pass || !key) {
    return {
      authenticated: false,
      error: 'Preencha o utilizador administrativo, a palavra-passe e a chave de acesso.',
    };
  }

  if (user !== config.username.trim().toLowerCase() || pass !== config.password) {
    return {
      authenticated: false,
      error: 'Credenciais administrativas inválidas. Verifique o utilizador e a palavra-passe.',
    };
  }

  if (key === config.primaryAccessKey.trim()) {
    return { authenticated: true, matchedKeyLabel: 'Chave Principal de Gestão' };
  }

  const operatorMatch = config.operatorKeys.find(
    (k) => k.active && k.keyValue.trim() === key
  );
  if (operatorMatch) {
    return { authenticated: true, matchedKeyLabel: operatorMatch.label };
  }

  return {
    authenticated: false,
    error: 'Chave de acesso inválida ou revogada. Utilize uma chave activa.',
  };
}

export function generateFormattedAccessKey(prefix = 'AQ-KEY'): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let part = '';
  for (let i = 0; i < 6; i++) {
    part += chars[Math.floor(Math.random() * chars.length)];
  }
  return `${prefix}-${part}-AO`;
}

export function validateNewMeterInput(input: NewMeterInput): ValidationResult {
  const errors: Record<string, string> = {};

  if (!input.code.trim() || input.code.trim().length < 4) {
    errors.code = 'Indique um código de contador válido (mín. 4 caracteres, ex: AQ-LDA-510).';
  }
  if (!input.name.trim() || input.name.trim().length < 3) {
    errors.name = 'Indique o nome do ponto de medição (mín. 3 caracteres).';
  }
  if (!input.location.trim() || input.location.trim().length < 3) {
    errors.location = 'Indique a localização / município em Angola.';
  }
  const habitual = Number(input.habitualDailyLiters);
  if (!Number.isFinite(habitual) || habitual < 50 || habitual > 500000) {
    errors.habitualDailyLiters = 'O consumo diário habitual deve situar-se entre 50 L e 500.000 L.';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validatePilotInquiry(input: PilotInquiryInput): ValidationResult {
  const errors: Record<string, string> = {};

  if (!input.name.trim() || input.name.trim().length < 3) {
    errors.name = 'Indique o seu nome completo.';
  }
  if (!input.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email.trim())) {
    errors.email = 'Indique um endereço de e-mail válido.';
  }
  if (!input.phone.trim() || input.phone.replace(/\D/g, '').length < 9) {
    errors.phone = 'Indique um contacto telefónico válido (mín. 9 dígitos).';
  }
  if (!input.province.trim()) {
    errors.province = 'Seleccione a província de interesse.';
  }
  if (!input.message.trim() || input.message.trim().length < 12) {
    errors.message = 'Descreva brevemente o contexto ou interesse no teste-piloto (mín. 12 caracteres).';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}
