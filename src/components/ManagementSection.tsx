import { useState, type FormEvent } from 'react';
import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  Clock,
  Copy,
  Download,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  LogOut,
  Plus,
  Power,
  RefreshCw,
  RotateCcw,
  Search,
  ShieldCheck,
  Trash2,
  X,
} from 'lucide-react';
import {
  DEFAULT_ADMIN_SECURITY,
  authenticateAdmin,
  computeNetworkSummary,
  evaluateMeterStatus,
  evaluateWaterQuality,
  filterMeterPoints,
  formatPointsCsv,
  generateFormattedAccessKey,
  statusDisplayLabel,
  validateNewMeterInput,
} from '../lib/aquasenseEngine';
import type {
  AdminSecurityConfig,
  BeneficiaryCategory,
  ConnectivityType,
  MeterPoint,
  NewMeterInput,
  ScenarioMode,
  StatusLevel,
} from '../lib/aquasenseTypes';
import { AquaLogo } from './AquaLogo';

interface ManagementSectionProps {
  isAuthenticated: boolean;
  activeKeyLabel: string | null;
  securityConfig: AdminSecurityConfig;
  onLoginSuccess: (keyLabel: string) => void;
  onLogout: () => void;
  onUpdateSecurity: (next: AdminSecurityConfig) => void;
  points: MeterPoint[];
  liveClockHms: string;
  leakThresholdLpm: number;
  onAddMeter: (meter: MeterPoint) => void;
  onApplyScenario: (meterId: string, scenario: ScenarioMode) => void;
  onHydraulicAction: (
    meterId: string,
    action: 'torneira' | 'tanque' | 'toggle_valvula'
  ) => void;
}

const CATEGORY_OPTIONS: BeneficiaryCategory[] = [
  'Residências e famílias',
  'Condomínios',
  'Empresas de distribuição de água',
  'Instituições públicas',
  'Escolas e universidades',
  'Comunidades',
];

const CONNECTIVITY_OPTIONS: ConnectivityType[] = ['Wi-Fi', 'GSM/4G', 'LoRaWAN'];

const EMPTY_METER_FORM: NewMeterInput = {
  code: '',
  name: '',
  location: '',
  category: 'Residências e famílias',
  connectivity: 'Wi-Fi',
  habitualDailyLiters: '450',
};

function statusTextClasses(status: StatusLevel): string {
  if (status === 'alerta') return 'text-[#B91C1C]';
  if (status === 'atencao') return 'text-[#B45309]';
  return 'text-[#15803D]';
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

export function ManagementSection({
  isAuthenticated,
  activeKeyLabel,
  securityConfig,
  onLoginSuccess,
  onLogout,
  onUpdateSecurity,
  points,
  liveClockHms,
  leakThresholdLpm,
  onAddMeter,
  onApplyScenario,
  onHydraulicAction,
}: ManagementSectionProps) {
  // Login Gate state
  const [loginUser, setLoginUser] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [loginKey, setLoginKey] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [showLoginPass, setShowLoginPass] = useState(false);

  // Authenticated Management state
  const [activeTab, setActiveTab] = useState<'rede' | 'seguranca'>('rede');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'todos' | StatusLevel>('todos');
  const [categoryFilter, setCategoryFilter] = useState<'todas' | BeneficiaryCategory>('todas');
  const [inspectedMeterId, setInspectedMeterId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMeterForm, setNewMeterForm] = useState<NewMeterInput>(EMPTY_METER_FORM);
  const [meterErrors, setMeterErrors] = useState<Record<string, string>>({});
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  // Credentials & Keys editor state
  const [editUsername, setEditUsername] = useState(securityConfig.username);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [customPrimaryKey, setCustomPrimaryKey] = useState(securityConfig.primaryAccessKey);
  const [showSecretKeys, setShowSecretKeys] = useState(false);
  const [newOpLabel, setNewOpLabel] = useState('');
  const [securityError, setSecurityError] = useState<string | null>(null);
  const [securitySuccess, setSecuritySuccess] = useState<string | null>(null);

  const showNotice = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  const handleAdminLogin = (e: FormEvent) => {
    e.preventDefault();
    const res = authenticateAdmin(
      { username: loginUser, password: loginPass, accessKey: loginKey },
      securityConfig
    );
    if (!res.authenticated) {
      setLoginError(res.error ?? 'Falha na autenticação.');
      return;
    }
    setLoginError(null);
    setLoginPass('');
    setLoginKey('');
    onLoginSuccess(res.matchedKeyLabel ?? 'Chave Principal');
  };

  const fillInitialCredentials = () => {
    setLoginError(null);
    setLoginUser(securityConfig.username);
    setLoginPass(securityConfig.password);
    setLoginKey(securityConfig.primaryAccessKey);
  };

  // --- UNAUTHENTICATED MANAGEMENT PORTAL GATE ---
  if (!isAuthenticated) {
    return (
      <div className="bg-[#F8FAFC] min-h-[calc(100vh-4rem)] py-12 sm:py-16">
        <div className="max-w-[940px] mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Left Info Card */}
            <div className="lg:col-span-5 bg-[#07334E] text-white rounded-2xl p-7 sm:p-8 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <AquaLogo size="md" />
                  <div>
                    <p className="font-display font-extrabold text-xl tracking-tight">AQUASENSE</p>
                    <p className="text-xs text-[#6EC8E8]">Portal de Gestão Centralizada</p>
                  </div>
                </div>

                <h1 className="text-2xl font-bold text-white leading-snug">
                  Acesso reservado a entidades gestoras
                </h1>
                <p className="text-sm text-[#B8D7E8] mt-3 leading-relaxed">
                  Área separada dos consumidores e organizações para supervisão de múltiplos pontos
                  de medição, comando remoto de válvulas, registo de contadores e administração de
                  chaves de acesso.
                </p>

                {/* Pre-configured credentials box so user can immediately test */}
                <div className="mt-7 bg-[#05263B] border border-white/15 rounded-xl p-4 space-y-2 text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-[#6EC8E8]">Credenciais configuradas</span>
                    <button
                      type="button"
                      onClick={fillInitialCredentials}
                      className="text-[#45B5DC] hover:text-white underline underline-offset-2 cursor-pointer"
                    >
                      Preencher
                    </button>
                  </div>
                  <div className="font-mono text-[#B8D7E8] space-y-1">
                    <p>Utilizador: {securityConfig.username}</p>
                    <p>Palavra-passe: {securityConfig.password}</p>
                    <p>Chave activa: {securityConfig.primaryAccessKey}</p>
                  </div>
                  <p className="text-[11px] text-[#8DC3DC] pt-1">
                    Após entrar, poderá alterar a palavra-passe e gerar ou revogar chaves de acesso.
                  </p>
                </div>
              </div>

              <p className="text-xs text-[#8DC3DC] mt-8 pt-5 border-t border-white/15">
                Última actualização de segurança: {securityConfig.updatedAt}
              </p>
            </div>

            {/* Right Login Form */}
            <div className="lg:col-span-7 bg-white border border-[#DCE5EC] rounded-2xl p-6 sm:p-8">
              <div className="flex items-center gap-2.5 text-[#07334E] mb-2">
                <Lock className="w-5 h-5 text-[#0D76A8]" />
                <h2 className="text-xl font-bold">Autenticação de Gestão</h2>
              </div>
              <p className="text-xs text-[#5A7184] mb-6">
                Introduza o utilizador administrativo, palavra-passe e uma chave de acesso activa.
              </p>

              <form onSubmit={handleAdminLogin} noValidate className="space-y-4">
                <div>
                  <label
                    htmlFor="admin-username"
                    className="block text-xs font-semibold text-[#07334E] mb-1.5"
                  >
                    Utilizador / E-mail administrativo *
                  </label>
                  <input
                    id="admin-username"
                    type="email"
                    value={loginUser}
                    onChange={(e) => setLoginUser(e.target.value)}
                    placeholder="gestao@aquasense.ao"
                    className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-[#DCE5EC] focus:border-[#0D76A8] text-[#07334E]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="admin-password"
                    className="block text-xs font-semibold text-[#07334E] mb-1.5"
                  >
                    Palavra-passe *
                  </label>
                  <div className="relative">
                    <input
                      id="admin-password"
                      type={showLoginPass ? 'text' : 'password'}
                      value={loginPass}
                      onChange={(e) => setLoginPass(e.target.value)}
                      placeholder="Introduza a palavra-passe"
                      className="w-full pl-3.5 pr-10 py-2.5 text-sm rounded-lg border border-[#DCE5EC] focus:border-[#0D76A8] text-[#07334E]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPass((v) => !v)}
                      aria-label={showLoginPass ? 'Ocultar palavra-passe' : 'Mostrar palavra-passe'}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#5A7184] hover:text-[#07334E] p-1 cursor-pointer"
                    >
                      {showLoginPass ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="admin-access-key"
                    className="block text-xs font-semibold text-[#07334E] mb-1.5"
                  >
                    Chave de acesso (Principal ou de Operador) *
                  </label>
                  <input
                    id="admin-access-key"
                    type="text"
                    value={loginKey}
                    onChange={(e) => setLoginKey(e.target.value)}
                    placeholder="Ex: AQ-KEY-2026-AO"
                    className="w-full px-3.5 py-2.5 text-sm font-mono rounded-lg border border-[#DCE5EC] focus:border-[#0D76A8] text-[#07334E]"
                  />
                </div>

                {loginError && (
                  <div
                    role="alert"
                    className="bg-[#FEF2F2] border border-[#FECACA] text-[#B91C1C] rounded-lg p-3 text-xs font-medium"
                  >
                    {loginError}
                  </div>
                )}

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full inline-flex items-center justify-center gap-2 py-3 px-5 text-sm font-semibold text-white bg-[#07334E] hover:bg-[#0D76A8] rounded-lg transition-colors cursor-pointer"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Aceder ao Portal de Gestão</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- AUTHENTICATED MANAGEMENT PORTAL ---
  const networkSummary = computeNetworkSummary(points, leakThresholdLpm);
  const filteredPoints = filterMeterPoints(
    points,
    searchQuery,
    statusFilter,
    categoryFilter,
    leakThresholdLpm
  );
  const inspectedMeter = points.find((p) => p.id === inspectedMeterId) ?? null;

  const handleExportCsv = () => {
    const csv = formatPointsCsv(filteredPoints);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'aquasense-gestao-rede.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showNotice('Relatório CSV da rede exportado com sucesso.');
  };

  const handleCreateMeter = (e: FormEvent) => {
    e.preventDefault();
    const validation = validateNewMeterInput(newMeterForm);
    if (!validation.valid) {
      setMeterErrors(validation.errors);
      return;
    }
    const habitual = Math.round(Number(newMeterForm.habitualDailyLiters));
    const perBlock = Math.max(8, Math.round(habitual / 10));
    const labels24 = ['00h', '02h', '04h', '06h', '08h', '10h', '12h', '14h', '16h', '18h', '20h', '22h'];
    const weights = [0.25, 0.2, 0.22, 0.95, 1.5, 1.1, 1.2, 0.95, 0.85, 1.4, 1.3, 0.55];
    const locParts = newMeterForm.location.split(',').map((s) => s.trim());

    const created: MeterPoint = {
      id: `meter-${Date.now()}`,
      code: newMeterForm.code.trim().toUpperCase(),
      name: newMeterForm.name.trim(),
      location: newMeterForm.location.trim(),
      bairro: locParts[0] || newMeterForm.location.trim(),
      municipality: locParts[1] || locParts[0] || 'Lubango',
      province: locParts[2] || locParts[1] || 'Huíla',
      category: newMeterForm.category,
      connectivity: newMeterForm.connectivity,
      controller: 'Unidade AQUASENSE v1',
      lastSyncIso: `Hoje, ${liveClockHms}`,
      totalVolumeM3: Number((habitual * 0.12).toFixed(2)),
      dailyLiters: Math.round(habitual * 0.92),
      habitualDailyLiters: habitual,
      currentFlowLpm: 1.3,
      pressureBar: 2.64,
      valveClosed: false,
      wastedLitersEstimate: 0,
      continuousFlowMinutes: 10,
      continuousFlowSeconds: 610,
      quality: { ph: 7.2, turbidityNtu: 1.0, tdsPpm: 225, temperatureC: 21.5 },
      series24h: labels24.map((label, idx) => ({
        label,
        habitualLiters: Math.round(perBlock * weights[idx]),
        liters: Math.round(perBlock * weights[idx] * 0.92),
      })),
      series7d: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map((label) => ({
        label,
        habitualLiters: habitual,
        liters: Math.round(habitual * 0.94),
      })),
      series30d: ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'].map((label) => ({
        label,
        habitualLiters: habitual * 7,
        liters: Math.round(habitual * 7 * 0.95),
      })),
      activeScenario: 'normal',
    };

    onAddMeter(created);
    setMeterErrors({});
    setNewMeterForm(EMPTY_METER_FORM);
    setShowAddModal(false);
    showNotice(`Contador ${created.code} adicionado à rede de monitorização.`);
  };

  const handleSaveCredentials = (e: FormEvent) => {
    e.preventDefault();
    setSecurityError(null);
    setSecuritySuccess(null);

    if (!editUsername.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editUsername.trim())) {
      setSecurityError('Indique um endereço de e-mail administrativo válido.');
      return;
    }

    let nextPassword = securityConfig.password;
    if (newPassword || confirmPassword || currentPassword) {
      if (currentPassword !== securityConfig.password) {
        setSecurityError('A palavra-passe actual não corresponde.');
        return;
      }
      if (newPassword.length < 8) {
        setSecurityError('A nova palavra-passe deve ter pelo menos 8 caracteres.');
        return;
      }
      if (newPassword !== confirmPassword) {
        setSecurityError('A confirmação da nova palavra-passe não coincide.');
        return;
      }
      nextPassword = newPassword;
    }

    const nextKey = customPrimaryKey.trim();
    if (nextKey.length < 8) {
      setSecurityError('A chave de acesso principal deve ter pelo menos 8 caracteres.');
      return;
    }

    onUpdateSecurity({
      ...securityConfig,
      username: editUsername.trim(),
      password: nextPassword,
      primaryAccessKey: nextKey,
      updatedAt: new Date().toLocaleTimeString('pt-PT', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    });
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setSecuritySuccess(
      'Credenciais e chave de acesso principal actualizadas. As alterações já estão em vigor.'
    );
  };

  const handleGeneratePrimaryKey = () => {
    const fresh = generateFormattedAccessKey('AQ-KEY');
    setCustomPrimaryKey(fresh);
    setSecurityError(null);
    setSecuritySuccess('Nova chave gerada. Clique em "Guardar alterações" para confirmar.');
  };

  const handleAddOperatorKey = (e: FormEvent) => {
    e.preventDefault();
    const label = newOpLabel.trim();
    if (label.length < 3) {
      setSecurityError('Indique um nome para a chave de operador (mín. 3 caracteres).');
      return;
    }
    setSecurityError(null);
    const createdKey = {
      id: `op-${Date.now()}`,
      label,
      keyValue: generateFormattedAccessKey('AQ-OP'),
      createdAt: new Date().toLocaleTimeString('pt-PT', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      active: true,
    };
    onUpdateSecurity({
      ...securityConfig,
      operatorKeys: [createdKey, ...securityConfig.operatorKeys],
      updatedAt: createdKey.createdAt,
    });
    setNewOpLabel('');
    setSecuritySuccess(`Chave de operador "${label}" criada e activada.`);
  };

  const handleToggleOperatorKey = (id: string) => {
    onUpdateSecurity({
      ...securityConfig,
      operatorKeys: securityConfig.operatorKeys.map((k) =>
        k.id === id ? { ...k, active: !k.active } : k
      ),
      updatedAt: new Date().toLocaleTimeString('pt-PT', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    });
  };

  const handleDeleteOperatorKey = (id: string) => {
    onUpdateSecurity({
      ...securityConfig,
      operatorKeys: securityConfig.operatorKeys.filter((k) => k.id !== id),
      updatedAt: new Date().toLocaleTimeString('pt-PT', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    });
  };

  const handleResetDefaults = () => {
    onUpdateSecurity(DEFAULT_ADMIN_SECURITY);
    setEditUsername(DEFAULT_ADMIN_SECURITY.username);
    setCustomPrimaryKey(DEFAULT_ADMIN_SECURITY.primaryAccessKey);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setSecurityError(null);
    setSecuritySuccess('Credenciais e chaves predefinidas repostas com sucesso.');
  };

  const handleCopyText = (text: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).catch(() => {});
    }
    showNotice('Chave copiada para a área de transferência.');
  };

  return (
    <div className="bg-[#F8FAFC] min-h-[calc(100vh-4rem)]">
      {/* Dark Navy Management Header */}
      <div className="bg-[#07334E] text-white border-b border-[#164461]">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 py-7 space-y-5">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <p className="text-xs font-medium text-[#6EC8E8]">
                Portal de Gestão Centralizada · Sessão autenticada ({activeKeyLabel ?? 'Principal'})
              </p>
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mt-1">
                Administração de Rede e Segurança
              </h1>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-[#B8D7E8]">
              <span className="inline-flex items-center gap-1.5 text-white bg-[#05263B] border border-white/15 px-3 py-1.5 rounded-lg tabular-nums">
                <Clock className="w-3.5 h-3.5 text-[#45B5DC]" aria-hidden="true" />
                <span>{liveClockHms}</span>
              </span>
              <span>{securityConfig.username}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-white/10">
            <div
              role="tablist"
              aria-label="Módulos do portal de gestão"
              className="inline-flex items-center p-1 bg-[#05263B] border border-white/15 rounded-lg"
            >
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'rede'}
                onClick={() => setActiveTab('rede')}
                className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  activeTab === 'rede'
                    ? 'bg-[#0D76A8] text-white'
                    : 'text-[#B8D7E8] hover:text-white'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Rede de Contadores</span>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'seguranca'}
                onClick={() => setActiveTab('seguranca')}
                className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  activeTab === 'seguranca'
                    ? 'bg-[#0D76A8] text-white'
                    : 'text-[#B8D7E8] hover:text-white'
                }`}
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Credenciais e Chaves</span>
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {activeTab === 'rede' && (
                <button
                  type="button"
                  onClick={handleExportCsv}
                  className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg bg-[#45B5DC] hover:bg-[#6EC8E8] text-[#07334E] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Exportar CSV</span>
                </button>
              )}
              <button
                type="button"
                onClick={onLogout}
                className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg border border-white/20 hover:border-[#FCA5A5] text-[#B8D7E8] hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Terminar sessão de gestão</span>
              </button>
            </div>
          </div>

          {feedbackMsg && (
            <p role="status" className="text-xs text-[#6EC8E8] font-medium">
              {feedbackMsg}
            </p>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 py-8">
        {activeTab === 'rede' ? (
          <div className="space-y-6">
            {/* 4 Aggregated KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="bg-white border border-[#DCE5EC] rounded-xl p-5">
                <p className="text-xs text-[#5A7184] mb-1">Pontos monitorizados</p>
                <p className="font-mono tabular-nums text-3xl font-bold text-[#07334E]">
                  {networkSummary.totalPoints}
                </p>
                <p className="text-xs text-[#5A7184] mt-1.5">
                  {networkSummary.pointsNormal} normais · {networkSummary.pointsAttention} atenção
                </p>
              </div>

              <div className="bg-white border border-[#DCE5EC] rounded-xl p-5">
                <p className="text-xs text-[#5A7184] mb-1">Consumo diário agregado</p>
                <p className="font-mono tabular-nums text-3xl font-bold text-[#07334E]">
                  {networkSummary.totalDailyM3.toFixed(2)}{' '}
                  <span className="text-sm font-normal text-[#5A7184]">m³</span>
                </p>
                <p className="text-xs text-[#5A7184] mt-1.5 font-mono tabular-nums">
                  Acumulado: {networkSummary.totalCumulativeM3.toLocaleString('pt-PT')} m³
                </p>
              </div>

              <div className="bg-white border border-[#DCE5EC] rounded-xl p-5">
                <p className="text-xs text-[#5A7184] mb-1">Pontos em alerta</p>
                <p
                  className={`font-mono tabular-nums text-3xl font-bold ${
                    networkSummary.pointsAlert > 0 ? 'text-[#B91C1C]' : 'text-[#15803D]'
                  }`}
                >
                  {networkSummary.pointsAlert}
                </p>
                <p className="text-xs text-[#5A7184] mt-1.5">
                  Fugas contínuas ou desvios de qualidade
                </p>
              </div>

              <div className="bg-white border border-[#DCE5EC] rounded-xl p-5">
                <p className="text-xs text-[#5A7184] mb-1">Conformidade indicativa</p>
                <p className="font-mono tabular-nums text-3xl font-bold text-[#07334E]">
                  {networkSummary.qualityCompliancePct}%
                </p>
                <p className="text-xs text-[#5A7184] mt-1.5">
                  Pontos com sensores físico-químicos estáveis
                </p>
              </div>
            </div>

            {/* Search, Filters & Add Meter */}
            <div className="bg-white border border-[#DCE5EC] rounded-xl p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3 flex-1">
                <div className="relative flex-1 min-w-[220px] max-w-sm">
                  <Search
                    className="w-4 h-4 text-[#5A7184] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                    aria-hidden="true"
                  />
                  <input
                    type="search"
                    aria-label="Pesquisar ponto de medição por código, nome ou localização"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Pesquisar código, nome ou bairro..."
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-[#DCE5EC] focus:border-[#0D76A8] text-[#07334E]"
                  />
                </div>

                <div
                  role="group"
                  aria-label="Filtrar pontos por estado"
                  className="inline-flex items-center p-1 bg-[#F3F6F9] border border-[#DCE5EC] rounded-lg"
                >
                  {(
                    [
                      { id: 'todos', label: 'Todos' },
                      { id: 'normal', label: 'Normal' },
                      { id: 'atencao', label: 'Atenção' },
                      { id: 'alerta', label: 'Alerta' },
                    ] as { id: 'todos' | StatusLevel; label: string }[]
                  ).map((st) => {
                    const active = statusFilter === st.id;
                    return (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => setStatusFilter(st.id)}
                        aria-pressed={active}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                          active
                            ? 'bg-[#07334E] text-white'
                            : 'text-[#4A6274] hover:text-[#07334E]'
                        }`}
                      >
                        {st.label}
                      </button>
                    );
                  })}
                </div>

                <select
                  aria-label="Filtrar por categoria de beneficiário"
                  value={categoryFilter}
                  onChange={(e) =>
                    setCategoryFilter(e.target.value as 'todas' | BeneficiaryCategory)
                  }
                  className="px-3 py-2 text-xs font-semibold text-[#07334E] bg-[#F3F6F9] border border-[#DCE5EC] rounded-lg"
                >
                  <option value="todas">Todas as categorias</option>
                  {CATEGORY_OPTIONS.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={() => {
                  setMeterErrors({});
                  setShowAddModal(true);
                }}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-[#07334E] hover:bg-[#0D76A8] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Registar Ponto de Medição</span>
              </button>
            </div>

            {/* Inline Inspected Meter Drawer inside Management */}
            {inspectedMeter && (
              <div className="bg-[#EBF6FB] border border-[#C5E4F2] rounded-xl p-5 space-y-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-mono font-semibold text-[#0D76A8]">
                      Inspecção remota · {inspectedMeter.code}
                    </p>
                    <h2 className="text-lg font-bold text-[#07334E]">{inspectedMeter.name}</h2>
                    <p className="text-xs text-[#5A7184]">
                      {inspectedMeter.location} · {inspectedMeter.category}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setInspectedMeterId(null)}
                    aria-label="Fechar painel de inspecção"
                    className="w-8 h-8 rounded-lg bg-white border border-[#C5E4F2] flex items-center justify-center text-[#07334E] cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="bg-white border border-[#DCE5EC] rounded-lg p-3">
                    <p className="text-[#5A7184]">Consumo hoje</p>
                    <p className="font-mono font-bold text-base text-[#07334E] tabular-nums mt-0.5">
                      {Math.round(inspectedMeter.dailyLiters).toLocaleString('pt-PT')} L
                    </p>
                  </div>
                  <div className="bg-white border border-[#DCE5EC] rounded-lg p-3">
                    <p className="text-[#5A7184]">Caudal / Pressão</p>
                    <p className="font-mono font-bold text-base text-[#07334E] tabular-nums mt-0.5">
                      {inspectedMeter.currentFlowLpm.toFixed(1)} L/min ·{' '}
                      {inspectedMeter.pressureBar.toFixed(1)} bar
                    </p>
                  </div>
                  <div className="bg-white border border-[#DCE5EC] rounded-lg p-3">
                    <p className="text-[#5A7184]">Qualidade indicativa</p>
                    <p className="font-semibold text-sm text-[#07334E] mt-1">
                      {evaluateWaterQuality(inspectedMeter.quality).overallLabel}
                    </p>
                  </div>
                  <div className="bg-white border border-[#DCE5EC] rounded-lg p-3">
                    <p className="text-[#5A7184]">Válvula sectorial</p>
                    <p className="font-semibold text-sm text-[#07334E] mt-1">
                      {inspectedMeter.valveClosed ? 'Fechada remotamente' : 'Aberta'}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => onHydraulicAction(inspectedMeter.id, 'toggle_valvula')}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-[#07334E] hover:bg-[#0D76A8] text-white cursor-pointer"
                  >
                    <Power className="w-3.5 h-3.5" />
                    <span>
                      {inspectedMeter.valveClosed
                        ? 'Reabrir válvula remota'
                        : 'Activar corte remoto'}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onApplyScenario(inspectedMeter.id, 'normal')}
                    className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-white border border-[#C5E4F2] text-[#07334E] hover:border-[#0D76A8] cursor-pointer"
                  >
                    Normalizar operação
                  </button>
                  <button
                    type="button"
                    onClick={() => onApplyScenario(inspectedMeter.id, 'fuga')}
                    className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-white border border-[#FECACA] text-[#B91C1C] hover:bg-[#FEF2F2] cursor-pointer"
                  >
                    Testar alerta de fuga
                  </button>
                </div>
              </div>
            )}

            {/* Centralized Multi-Point Table */}
            <div className="bg-white border border-[#DCE5EC] rounded-xl overflow-hidden">
              {filteredPoints.length === 0 ? (
                <div className="p-10 text-center space-y-3">
                  <p className="text-base font-bold text-[#07334E]">
                    Nenhum ponto de medição corresponde aos filtros aplicados
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setStatusFilter('todos');
                      setCategoryFilter('todas');
                    }}
                    className="px-4 py-2 text-xs font-semibold text-white bg-[#0D76A8] hover:bg-[#07334E] rounded-lg cursor-pointer"
                  >
                    Limpar filtros
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[880px]">
                    <thead>
                      <tr className="bg-[#07334E] text-white text-xs font-semibold">
                        <th className="py-3.5 px-4 whitespace-nowrap">Código</th>
                        <th className="py-3.5 px-4 whitespace-nowrap">Ponto de medição</th>
                        <th className="py-3.5 px-4 whitespace-nowrap">Categoria</th>
                        <th className="py-3.5 px-4 text-right whitespace-nowrap">Consumo hoje</th>
                        <th className="py-3.5 px-4 text-right whitespace-nowrap">Caudal / Pressão</th>
                        <th className="py-3.5 px-4 text-right whitespace-nowrap">pH / Turbidez</th>
                        <th className="py-3.5 px-4 whitespace-nowrap">Estado</th>
                        <th className="py-3.5 px-4 text-right whitespace-nowrap">Acção</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#DCE5EC] text-sm">
                      {filteredPoints.map((point) => {
                        const rowStatus = evaluateMeterStatus(point, {
                          dailyLimitLiters: Math.round(point.habitualDailyLiters * 1.25),
                          leakContinuousThresholdLpm: leakThresholdLpm,
                        });
                        return (
                          <tr
                            key={point.id}
                            className={`transition-colors ${
                              inspectedMeterId === point.id
                                ? 'bg-[#EBF6FB]'
                                : 'hover:bg-[#EBF6FB]/60'
                            }`}
                          >
                            <td className="py-3.5 px-4 font-mono text-xs font-semibold text-[#0D76A8] whitespace-nowrap">
                              {point.code}
                            </td>
                            <td className="py-3.5 px-4">
                              <p className="font-semibold text-[#07334E]">{point.name}</p>
                              <p className="text-xs text-[#5A7184]">{point.location}</p>
                            </td>
                            <td className="py-3.5 px-4 text-xs text-[#2C4050]">{point.category}</td>
                            <td className="py-3.5 px-4 text-right font-mono tabular-nums text-[#07334E] font-medium whitespace-nowrap">
                              {Math.round(point.dailyLiters).toLocaleString('pt-PT')} L
                            </td>
                            <td className="py-3.5 px-4 text-right font-mono tabular-nums text-xs text-[#2C4050] whitespace-nowrap">
                              {point.currentFlowLpm.toFixed(1)} L/min · {point.pressureBar.toFixed(1)} bar
                            </td>
                            <td className="py-3.5 px-4 text-right font-mono tabular-nums text-xs text-[#2C4050] whitespace-nowrap">
                              {point.quality.ph.toFixed(1)} pH · {point.quality.turbidityNtu.toFixed(1)} NTU
                            </td>
                            <td className="py-3.5 px-4">
                              <StatusIndicator
                                status={point.valveClosed ? 'atencao' : rowStatus}
                                label={point.valveClosed ? 'Corte activo' : undefined}
                              />
                            </td>
                            <td className="py-3.5 px-4 text-right whitespace-nowrap">
                              <button
                                type="button"
                                onClick={() => setInspectedMeterId(point.id)}
                                aria-label={`Inspecionar ponto ${point.name}`}
                                className="px-3 py-1.5 text-xs font-semibold text-[#07334E] border border-[#DCE5EC] hover:border-[#0D76A8] hover:bg-white rounded-md transition-colors cursor-pointer"
                              >
                                Inspecionar
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* CREDENCIAIS E CHAVES DE ACESSO (EDITABLE) */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left: Primary Credentials & Master Access Key */}
            <div className="lg:col-span-7 bg-white border border-[#DCE5EC] rounded-xl p-6 space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#DCE5EC]">
                <div>
                  <h2 className="text-lg font-bold text-[#07334E]">
                    Credenciais administrativas e chave principal
                  </h2>
                  <p className="text-xs text-[#5A7184]">
                    Altere o utilizador, palavra-passe ou chave mestra do Portal de Gestão.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowSecretKeys((v) => !v)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0D76A8] hover:text-[#07334E] cursor-pointer"
                >
                  {showSecretKeys ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{showSecretKeys ? 'Ocultar chaves' : 'Mostrar chaves'}</span>
                </button>
              </div>

              {securityError && (
                <div
                  role="alert"
                  className="bg-[#FEF2F2] border border-[#FECACA] text-[#B91C1C] rounded-lg p-3 text-xs font-medium"
                >
                  {securityError}
                </div>
              )}
              {securitySuccess && (
                <div
                  role="status"
                  className="bg-[#EBF6FB] border border-[#C5E4F2] text-[#07334E] rounded-lg p-3 text-xs font-medium"
                >
                  {securitySuccess}
                </div>
              )}

              <form onSubmit={handleSaveCredentials} noValidate className="space-y-4">
                <div>
                  <label
                    htmlFor="sec-username"
                    className="block text-xs font-semibold text-[#07334E] mb-1.5"
                  >
                    Utilizador / E-mail administrativo
                  </label>
                  <input
                    id="sec-username"
                    type="email"
                    value={editUsername}
                    onChange={(e) => setEditUsername(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-[#DCE5EC] focus:border-[#0D76A8] text-[#07334E]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="sec-primary-key"
                    className="block text-xs font-semibold text-[#07334E] mb-1.5"
                  >
                    Chave de acesso principal
                  </label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      id="sec-primary-key"
                      type={showSecretKeys ? 'text' : 'password'}
                      value={customPrimaryKey}
                      onChange={(e) => setCustomPrimaryKey(e.target.value)}
                      className="flex-1 px-3.5 py-2.5 text-sm font-mono rounded-lg border border-[#DCE5EC] focus:border-[#0D76A8] text-[#07334E]"
                    />
                    <button
                      type="button"
                      onClick={handleGeneratePrimaryKey}
                      className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold rounded-lg border border-[#DCE5EC] text-[#07334E] hover:border-[#0D76A8] whitespace-nowrap cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Gerar nova chave</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCopyText(customPrimaryKey)}
                      aria-label="Copiar chave principal"
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-semibold rounded-lg border border-[#DCE5EC] text-[#07334E] hover:border-[#0D76A8] cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#DCE5EC] space-y-3">
                  <p className="text-xs font-bold text-[#07334E]">
                    Alterar palavra-passe (opcional)
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label
                        htmlFor="sec-curr-pass"
                        className="block text-[11px] font-semibold text-[#5A7184] mb-1"
                      >
                        Palavra-passe actual
                      </label>
                      <input
                        id="sec-curr-pass"
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-[#DCE5EC] focus:border-[#0D76A8]"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="sec-new-pass"
                        className="block text-[11px] font-semibold text-[#5A7184] mb-1"
                      >
                        Nova palavra-passe
                      </label>
                      <input
                        id="sec-new-pass"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Mín. 8 caracteres"
                        className="w-full px-3 py-2 text-sm rounded-lg border border-[#DCE5EC] focus:border-[#0D76A8]"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="sec-conf-pass"
                        className="block text-[11px] font-semibold text-[#5A7184] mb-1"
                      >
                        Confirmar nova
                      </label>
                      <input
                        id="sec-conf-pass"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-[#DCE5EC] focus:border-[#0D76A8]"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex flex-wrap items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={handleResetDefaults}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5A7184] hover:text-[#07334E] cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Repor credenciais predefinidas</span>
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 text-xs font-semibold text-white bg-[#07334E] hover:bg-[#0D76A8] rounded-lg transition-colors cursor-pointer"
                  >
                    Guardar alterações
                  </button>
                </div>
              </form>
            </div>

            {/* Right: Additional Operator Access Keys */}
            <div className="lg:col-span-5 bg-white border border-[#DCE5EC] rounded-xl p-6 space-y-5">
              <div>
                <h2 className="text-lg font-bold text-[#07334E]">Chaves de operadores</h2>
                <p className="text-xs text-[#5A7184] mt-0.5">
                  Crie ou revogue chaves adicionais para equipas operacionais e técnicos de rede.
                </p>
              </div>

              <form onSubmit={handleAddOperatorKey} className="flex gap-2">
                <input
                  type="text"
                  aria-label="Nome da nova chave de operador"
                  value={newOpLabel}
                  onChange={(e) => setNewOpLabel(e.target.value)}
                  placeholder="Ex: Equipa Benguela"
                  className="flex-1 px-3 py-2 text-sm rounded-lg border border-[#DCE5EC] focus:border-[#0D76A8]"
                />
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#0D76A8] hover:bg-[#07334E] rounded-lg whitespace-nowrap cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Criar chave</span>
                </button>
              </form>

              <div className="divide-y divide-[#DCE5EC]">
                {securityConfig.operatorKeys.length === 0 ? (
                  <p className="text-xs text-[#5A7184] py-4">
                    Nenhuma chave de operador registada.
                  </p>
                ) : (
                  securityConfig.operatorKeys.map((opKey) => (
                    <div key={opKey.id} className="py-3.5 first:pt-0 last:pb-0 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-[#07334E]">{opKey.label}</p>
                        <StatusIndicator
                          status={opKey.active ? 'normal' : 'alerta'}
                          label={opKey.active ? 'Activa' : 'Revogada'}
                        />
                      </div>
                      <div className="flex items-center justify-between gap-2 bg-[#F3F6F9] border border-[#DCE5EC] rounded-lg px-3 py-2">
                        <span className="font-mono text-xs text-[#07334E] truncate">
                          {showSecretKeys ? opKey.keyValue : '••••-••••-••••'}
                        </span>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleCopyText(opKey.keyValue)}
                            aria-label={`Copiar chave ${opKey.label}`}
                            className="text-xs text-[#0D76A8] hover:text-[#07334E] cursor-pointer"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleToggleOperatorKey(opKey.id)}
                            className="text-xs font-semibold text-[#5A7184] hover:text-[#07334E] underline cursor-pointer"
                          >
                            {opKey.active ? 'Revogar' : 'Reactivar'}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteOperatorKey(opKey.id)}
                            aria-label={`Remover chave ${opKey.label}`}
                            className="text-[#B91C1C] hover:text-[#7F1D1D] cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Meter Modal */}
      {showAddModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-meter-title"
          className="fixed inset-0 z-50 bg-[#05263B]/60 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="bg-white border border-[#DCE5EC] rounded-2xl w-full max-w-lg p-6 sm:p-7">
            <div className="flex items-center justify-between pb-4 border-b border-[#DCE5EC] mb-5">
              <div>
                <h2 id="add-meter-title" className="text-lg font-bold text-[#07334E]">
                  Registar novo ponto de medição
                </h2>
                <p className="text-xs text-[#5A7184] mt-0.5">
                  Associar contador inteligente AQUASENSE à rede centralizada
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                aria-label="Fechar janela de registo"
                className="w-9 h-9 rounded-lg border border-[#DCE5EC] flex items-center justify-center text-[#5A7184] hover:text-[#07334E] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateMeter} noValidate className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="meter-code"
                    className="block text-xs font-semibold text-[#07334E] mb-1"
                  >
                    Código do dispositivo *
                  </label>
                  <input
                    id="meter-code"
                    type="text"
                    value={newMeterForm.code}
                    onChange={(e) => setNewMeterForm({ ...newMeterForm, code: e.target.value })}
                    placeholder="Ex: AQ-LDA-520"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-[#DCE5EC] focus:border-[#0D76A8]"
                  />
                  {meterErrors.code && (
                    <p role="alert" className="text-xs text-[#B91C1C] mt-1">
                      {meterErrors.code}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="meter-habitual"
                    className="block text-xs font-semibold text-[#07334E] mb-1"
                  >
                    Consumo habitual (L/dia) *
                  </label>
                  <input
                    id="meter-habitual"
                    type="number"
                    value={newMeterForm.habitualDailyLiters}
                    onChange={(e) =>
                      setNewMeterForm({ ...newMeterForm, habitualDailyLiters: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm font-mono rounded-lg border border-[#DCE5EC] focus:border-[#0D76A8]"
                  />
                  {meterErrors.habitualDailyLiters && (
                    <p role="alert" className="text-xs text-[#B91C1C] mt-1">
                      {meterErrors.habitualDailyLiters}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label
                  htmlFor="meter-name"
                  className="block text-xs font-semibold text-[#07334E] mb-1"
                >
                  Designação do ponto *
                </label>
                <input
                  id="meter-name"
                  type="text"
                  value={newMeterForm.name}
                  onChange={(e) => setNewMeterForm({ ...newMeterForm, name: e.target.value })}
                  placeholder="Ex: Residência Morro Bento — Rua 4"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-[#DCE5EC] focus:border-[#0D76A8]"
                />
                {meterErrors.name && (
                  <p role="alert" className="text-xs text-[#B91C1C] mt-1">
                    {meterErrors.name}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="meter-location"
                  className="block text-xs font-semibold text-[#07334E] mb-1"
                >
                  Localização / Município *
                </label>
                <input
                  id="meter-location"
                  type="text"
                  value={newMeterForm.location}
                  onChange={(e) => setNewMeterForm({ ...newMeterForm, location: e.target.value })}
                  placeholder="Ex: Belas, Luanda"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-[#DCE5EC] focus:border-[#0D76A8]"
                />
                {meterErrors.location && (
                  <p role="alert" className="text-xs text-[#B91C1C] mt-1">
                    {meterErrors.location}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="meter-category"
                    className="block text-xs font-semibold text-[#07334E] mb-1"
                  >
                    Categoria
                  </label>
                  <select
                    id="meter-category"
                    value={newMeterForm.category}
                    onChange={(e) =>
                      setNewMeterForm({
                        ...newMeterForm,
                        category: e.target.value as BeneficiaryCategory,
                      })
                    }
                    className="w-full px-3 py-2 text-sm rounded-lg border border-[#DCE5EC] bg-white"
                  >
                    {CATEGORY_OPTIONS.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="meter-connectivity"
                    className="block text-xs font-semibold text-[#07334E] mb-1"
                  >
                    Comunicação IoT
                  </label>
                  <select
                    id="meter-connectivity"
                    value={newMeterForm.connectivity}
                    onChange={(e) =>
                      setNewMeterForm({
                        ...newMeterForm,
                        connectivity: e.target.value as ConnectivityType,
                      })
                    }
                    className="w-full px-3 py-2 text-sm rounded-lg border border-[#DCE5EC] bg-white"
                  >
                    {CONNECTIVITY_OPTIONS.map((conn) => (
                      <option key={conn} value={conn}>
                        {conn}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-[#DCE5EC] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#4A6274] hover:text-[#07334E] rounded-lg border border-[#DCE5EC] cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-[#07334E] hover:bg-[#0D76A8] rounded-lg transition-colors cursor-pointer"
                >
                  Adicionar ponto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
