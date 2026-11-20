export type AppSection = 'visao-geral' | 'plataforma' | 'impacto' | 'contacto' | 'gestao';

export type ClientAccountType = 'consumidor' | 'organizacao';

export type StatusLevel = 'normal' | 'atencao' | 'alerta';

export type BeneficiaryCategory =
  | 'Residências e famílias'
  | 'Condomínios'
  | 'Empresas de distribuição de água'
  | 'Instituições públicas'
  | 'Escolas e universidades'
  | 'Comunidades';

export type ConnectivityType = 'Wi-Fi' | 'GSM/4G' | 'LoRaWAN';

export type ChartPeriod = '24h' | '7d' | '30d';

export type ScenarioMode = 'normal' | 'fuga' | 'consumo_anormal' | 'qualidade';

export interface WaterQualityReading {
  ph: number;            // Reference: 6.5 - 8.5
  turbidityNtu: number;  // Reference: <= 5.0 NTU
  tdsPpm: number;        // Reference: <= 500 ppm
  temperatureC: number;  // Reference: 15 - 28 °C
}

export interface ParameterEvaluation {
  key: 'ph' | 'turbidityNtu' | 'tdsPpm' | 'temperatureC';
  label: string;
  value: number;
  unit: string;
  referenceRange: string;
  status: StatusLevel;
  statusLabel: string;
  percentPosition: number;
  detail: string;
}

export interface WaterQualityAssessment {
  overallStatus: StatusLevel;
  overallLabel: string;
  parameters: ParameterEvaluation[];
}

export interface ConsumptionPoint {
  label: string;
  liters: number;
  habitualLiters: number;
}

export interface ThresholdConfig {
  dailyLimitLiters: number;
  leakContinuousThresholdLpm: number;
}

export interface TelemetryLogEntry {
  id: string;
  time: string;
  event: string;
  detail: string;
  severity: StatusLevel;
}

export interface MeterPoint {
  id: string;
  code: string;
  name: string;
  location: string;
  bairro: string;
  municipality: string;
  province: string;
  category: BeneficiaryCategory;
  connectivity: ConnectivityType;
  controller: string;
  lastSyncIso: string;
  totalVolumeM3: number;
  dailyLiters: number;
  habitualDailyLiters: number;
  currentFlowLpm: number;
  pressureBar: number;
  valveClosed: boolean;
  wastedLitersEstimate: number;
  continuousFlowMinutes: number;
  continuousFlowSeconds: number;
  quality: WaterQualityReading;
  series24h: ConsumptionPoint[];
  series7d: ConsumptionPoint[];
  series30d: ConsumptionPoint[];
  activeScenario: ScenarioMode;
}

export interface AlertItem {
  id: string;
  meterId: string;
  meterName: string;
  type: 'fuga' | 'consumo_anormal' | 'qualidade';
  severity: 'atencao' | 'alerta';
  title: string;
  description: string;
  recommendation: string;
  timestamp: string;
  resolved: boolean;
}

export interface RecommendationItem {
  id: string;
  category: 'Consumo' | 'Prevenção de Fugas' | 'Qualidade da Água';
  title: string;
  action: string;
  priority: StatusLevel;
}

export interface NetworkSummary {
  totalPoints: number;
  totalDailyM3: number;
  totalCumulativeM3: number;
  pointsNormal: number;
  pointsAttention: number;
  pointsAlert: number;
  qualityCompliancePct: number;
}

export interface NewMeterInput {
  code: string;
  name: string;
  location: string;
  category: BeneficiaryCategory;
  connectivity: ConnectivityType;
  habitualDailyLiters: string;
}

export interface PilotInquiryInput {
  name: string;
  organization: string;
  email: string;
  phone: string;
  profile: BeneficiaryCategory;
  province: string;
  message: string;
}

export interface ConsumerLoginInput {
  name: string;
  bairro: string;
  municipality: string;
  province: string;
  meterCode: string;
}

export interface OrganizationLoginInput {
  organizationName: string;
  organizationType: BeneficiaryCategory;
  contactName: string;
  bairro: string;
  municipality: string;
  province: string;
  meterCode: string;
}

export interface ClientSession {
  type: ClientAccountType;
  displayName: string;
  contactName?: string;
  category: BeneficiaryCategory;
  bairro: string;
  municipality: string;
  province: string;
  meterCode: string;
  meterId: string;
  loggedInAt: string;
}

export interface OperatorAccessKey {
  id: string;
  label: string;
  keyValue: string;
  createdAt: string;
  active: boolean;
}

export interface AdminSecurityConfig {
  username: string;
  password: string;
  primaryAccessKey: string;
  operatorKeys: OperatorAccessKey[];
  updatedAt: string;
}

export interface AdminLoginInput {
  username: string;
  password: string;
  accessKey: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}
