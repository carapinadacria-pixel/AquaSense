import { useState, type FormEvent } from 'react';
import { ArrowRight, Building2, Lock, User } from 'lucide-react';
import {
  ANGOLA_PROVINCES,
  HUILA_DEMO_BAIRROS,
  PROVINCE_MUNICIPALITIES,
} from '../lib/aquasenseData';
import {
  validateConsumerLogin,
  validateOrganizationLogin,
} from '../lib/aquasenseEngine';
import type {
  AppSection,
  BeneficiaryCategory,
  ClientAccountType,
  ConsumerLoginInput,
  OrganizationLoginInput,
} from '../lib/aquasenseTypes';
import { AquaLogo } from './AquaLogo';

interface PlatformLoginProps {
  onConsumerLogin: (input: ConsumerLoginInput) => void;
  onOrganizationLogin: (input: OrganizationLoginInput) => void;
  onNavigate: (section: AppSection) => void;
}

const ORG_CATEGORIES: BeneficiaryCategory[] = [
  'Condomínios',
  'Escolas e universidades',
  'Instituições públicas',
  'Comunidades',
  'Empresas de distribuição de água',
];

export function PlatformLogin({
  onConsumerLogin,
  onOrganizationLogin,
  onNavigate,
}: PlatformLoginProps) {
  const [tab, setTab] = useState<ClientAccountType>('consumidor');
  const [consumerForm, setConsumerForm] = useState<ConsumerLoginInput>({
    name: '',
    bairro: '',
    municipality: 'Lubango',
    province: 'Huíla',
    meterCode: '',
  });
  const [orgForm, setOrgForm] = useState<OrganizationLoginInput>({
    organizationName: '',
    organizationType: 'Condomínios',
    contactName: '',
    bairro: '',
    municipality: 'Lubango',
    province: 'Huíla',
    meterCode: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const consumerMunicipalities = PROVINCE_MUNICIPALITIES[consumerForm.province] ?? [];
  const orgMunicipalities = PROVINCE_MUNICIPALITIES[orgForm.province] ?? [];

  const handleTabSwitch = (nextTab: ClientAccountType) => {
    setTab(nextTab);
    setErrors({});
  };

  const handleConsumerProvinceChange = (province: string) => {
    const municipalities = PROVINCE_MUNICIPALITIES[province] ?? [];
    setConsumerForm((prev) => ({
      ...prev,
      province,
      municipality: municipalities[0] ?? '',
    }));
  };

  const handleOrgProvinceChange = (province: string) => {
    const municipalities = PROVINCE_MUNICIPALITIES[province] ?? [];
    setOrgForm((prev) => ({
      ...prev,
      province,
      municipality: municipalities[0] ?? '',
    }));
  };

  const handleConsumerSubmit = (e: FormEvent) => {
    e.preventDefault();
    const res = validateConsumerLogin(consumerForm);
    if (!res.valid) {
      setErrors(res.errors);
      return;
    }
    setErrors({});
    onConsumerLogin(consumerForm);
  };

  const handleOrgSubmit = (e: FormEvent) => {
    e.preventDefault();
    const res = validateOrganizationLogin(orgForm);
    if (!res.valid) {
      setErrors(res.errors);
      return;
    }
    setErrors({});
    onOrganizationLogin(orgForm);
  };

  const fillDemoConsumerHuila = () => {
    setErrors({});
    setConsumerForm({
      name: 'Mariana Tchivinda',
      bairro: 'Bairro Comercial',
      municipality: 'Lubango',
      province: 'Huíla',
      meterCode: 'AQ-HLA-021',
    });
  };

  const fillDemoConsumerLuanda = () => {
    setErrors({});
    setConsumerForm({
      name: 'Carlos Mendes',
      bairro: 'Talatona',
      municipality: 'Talatona',
      province: 'Luanda',
      meterCode: 'AQ-LDA-014',
    });
  };

  const fillDemoOrgHuila = () => {
    setErrors({});
    setOrgForm({
      organizationName: 'Condomínio Nossa Senhora do Monte',
      organizationType: 'Condomínios',
      contactName: 'Eng. Mateus Chivinda',
      bairro: 'Nossa Senhora do Monte',
      municipality: 'Lubango',
      province: 'Huíla',
      meterCode: 'AQ-HLA-112',
    });
  };

  const fillDemoOrgLuanda = () => {
    setErrors({});
    setOrgForm({
      organizationName: 'Condomínio Jardim de Rosas — Bloco C',
      organizationType: 'Condomínios',
      contactName: 'Eng. Paulo Silva',
      bairro: 'Camama',
      municipality: 'Belas',
      province: 'Luanda',
      meterCode: 'AQ-LDA-082',
    });
  };

  return (
    <div className="bg-[#F8FAFC] min-h-[calc(100vh-4rem)] py-12 sm:py-16">
      <div className="max-w-[1000px] mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left Context Panel in Deep AQUASENSE Navy */}
          <div className="lg:col-span-5 bg-[#07334E] text-white rounded-2xl p-7 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <AquaLogo size="md" />
                <div>
                  <p className="font-display font-extrabold text-xl tracking-tight">AQUASENSE</p>
                  <p className="text-xs text-[#6EC8E8]">Plataforma de Monitorização</p>
                </div>
              </div>

              <h1 className="text-2xl font-bold text-white leading-snug">
                Acesso ao seu ponto de medição inteligente
              </h1>
              <p className="text-sm text-[#B8D7E8] mt-3 leading-relaxed">
                Identifique a sua residência ou organização com o município, bairro e número do
                contador para acompanhar consumo em tempo real, pressão da rede e qualidade da água.
              </p>

              <div className="mt-7 pt-6 border-t border-white/15 space-y-3 text-xs text-[#B8D7E8]">
                <p className="font-semibold text-[#6EC8E8]">Exemplos activos — Huíla e Luanda:</p>
                <div className="space-y-1.5 font-mono text-[11px]">
                  <p>· Huíla (Lubango): AQ-HLA-021 — Bairro Comercial</p>
                  <p>· Huíla (Lubango): AQ-HLA-045 — Bairro Tchioco</p>
                  <p>· Huíla (Lubango): AQ-HLA-112 — N.ª Sra. do Monte</p>
                  <p>· Luanda (Talatona): AQ-LDA-014 — Residência Lote B12</p>
                  <p>· Luanda (Belas): AQ-LDA-082 — Camama (Condomínio)</p>
                </div>
                <p className="text-[#8DC3DC] leading-relaxed pt-1">
                  Bairros de referência na Huíla: {HUILA_DEMO_BAIRROS.slice(0, 5).join(', ')}. Pode
                  também registar qualquer novo número de contador.
                </p>
              </div>
            </div>

            <div className="mt-8 pt-5 border-t border-white/15">
              <button
                type="button"
                onClick={() => onNavigate('gestao')}
                className="inline-flex items-center gap-2 text-xs font-semibold text-[#6EC8E8] hover:text-white transition-colors cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>É entidade gestora? Aceder ao Portal de Gestão</span>
              </button>
            </div>
          </div>

          {/* Right Login Form Panel */}
          <div className="lg:col-span-7 bg-white border border-[#DCE5EC] rounded-2xl p-6 sm:p-8">
            {/* Role Tabs: Consumidor vs Organização */}
            <div
              role="tablist"
              aria-label="Tipo de acesso à plataforma"
              className="grid grid-cols-2 gap-1.5 p-1 bg-[#F3F6F9] border border-[#DCE5EC] rounded-xl mb-6"
            >
              <button
                type="button"
                role="tab"
                aria-selected={tab === 'consumidor'}
                onClick={() => handleTabSwitch('consumidor')}
                className={`inline-flex items-center justify-center gap-2 py-2.5 px-3 text-sm font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  tab === 'consumidor'
                    ? 'bg-[#07334E] text-white'
                    : 'text-[#4A6274] hover:text-[#07334E]'
                }`}
              >
                <User className="w-4 h-4" />
                <span>Consumidor</span>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={tab === 'organizacao'}
                onClick={() => handleTabSwitch('organizacao')}
                className={`inline-flex items-center justify-center gap-2 py-2.5 px-3 text-sm font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  tab === 'organizacao'
                    ? 'bg-[#07334E] text-white'
                    : 'text-[#4A6274] hover:text-[#07334E]'
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span>Organização</span>
              </button>
            </div>

            {tab === 'consumidor' ? (
              <form onSubmit={handleConsumerSubmit} noValidate className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div>
                    <h2 className="text-lg font-bold text-[#07334E]">Acesso de Consumidor</h2>
                    <p className="text-xs text-[#5A7184]">
                      Introduza os dados do titular, localização e contador domiciliar.
                    </p>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <button
                      type="button"
                      onClick={fillDemoConsumerHuila}
                      className="font-semibold text-[#0D76A8] hover:text-[#07334E] underline underline-offset-2 cursor-pointer whitespace-nowrap"
                    >
                      Demo Huíla
                    </button>
                    <span className="text-[#CBD5E1]" aria-hidden="true">|</span>
                    <button
                      type="button"
                      onClick={fillDemoConsumerLuanda}
                      className="font-semibold text-[#0D76A8] hover:text-[#07334E] underline underline-offset-2 cursor-pointer whitespace-nowrap"
                    >
                      Demo Luanda
                    </button>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="login-consumer-name"
                    className="block text-xs font-semibold text-[#07334E] mb-1.5"
                  >
                    Nome completo *
                  </label>
                  <input
                    id="login-consumer-name"
                    type="text"
                    value={consumerForm.name}
                    onChange={(e) =>
                      setConsumerForm({ ...consumerForm, name: e.target.value })
                    }
                    placeholder="Ex: Mariana Tchivinda"
                    className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-[#DCE5EC] focus:border-[#0D76A8] text-[#07334E]"
                  />
                  {errors.name && (
                    <p role="alert" className="text-xs text-[#B91C1C] mt-1">
                      {errors.name}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="login-consumer-province"
                      className="block text-xs font-semibold text-[#07334E] mb-1.5"
                    >
                      Província *
                    </label>
                    <select
                      id="login-consumer-province"
                      value={consumerForm.province}
                      onChange={(e) => handleConsumerProvinceChange(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-[#DCE5EC] focus:border-[#0D76A8] bg-white text-[#07334E]"
                    >
                      {ANGOLA_PROVINCES.map((prov) => (
                        <option key={prov} value={prov}>
                          {prov}
                        </option>
                      ))}
                    </select>
                    {errors.province && (
                      <p role="alert" className="text-xs text-[#B91C1C] mt-1">
                        {errors.province}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="login-consumer-municipality"
                      className="block text-xs font-semibold text-[#07334E] mb-1.5"
                    >
                      Município *
                    </label>
                    <select
                      id="login-consumer-municipality"
                      value={consumerForm.municipality}
                      onChange={(e) =>
                        setConsumerForm({ ...consumerForm, municipality: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-[#DCE5EC] focus:border-[#0D76A8] bg-white text-[#07334E]"
                    >
                      <option value="">Seleccione o município</option>
                      {consumerMunicipalities.map((mun) => (
                        <option key={mun} value={mun}>
                          {mun}
                        </option>
                      ))}
                    </select>
                    {errors.municipality && (
                      <p role="alert" className="text-xs text-[#B91C1C] mt-1">
                        {errors.municipality}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="login-consumer-bairro"
                      className="block text-xs font-semibold text-[#07334E] mb-1.5"
                    >
                      Bairro *
                    </label>
                    <input
                      id="login-consumer-bairro"
                      type="text"
                      value={consumerForm.bairro}
                      onChange={(e) =>
                        setConsumerForm({ ...consumerForm, bairro: e.target.value })
                      }
                      placeholder={
                        consumerForm.province === 'Huíla'
                          ? 'Ex: Bairro Comercial, Tchioco'
                          : 'Ex: Talatona'
                      }
                      className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-[#DCE5EC] focus:border-[#0D76A8] text-[#07334E]"
                    />
                    {errors.bairro && (
                      <p role="alert" className="text-xs text-[#B91C1C] mt-1">
                        {errors.bairro}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="login-consumer-meter"
                      className="block text-xs font-semibold text-[#07334E] mb-1.5"
                    >
                      Número do contador *
                    </label>
                    <input
                      id="login-consumer-meter"
                      type="text"
                      value={consumerForm.meterCode}
                      onChange={(e) =>
                        setConsumerForm({ ...consumerForm, meterCode: e.target.value })
                      }
                      placeholder={
                        consumerForm.province === 'Huíla' ? 'Ex: AQ-HLA-021' : 'Ex: AQ-LDA-014'
                      }
                      className="w-full px-3.5 py-2.5 text-sm font-mono uppercase rounded-lg border border-[#DCE5EC] focus:border-[#0D76A8] text-[#07334E]"
                    />
                    {errors.meterCode && (
                      <p role="alert" className="text-xs text-[#B91C1C] mt-1">
                        {errors.meterCode}
                      </p>
                    )}
                  </div>
                </div>

                <div className="pt-3">
                  <button
                    type="submit"
                    className="w-full inline-flex items-center justify-center gap-2 py-3 px-5 text-sm font-semibold text-white bg-[#07334E] hover:bg-[#0D76A8] rounded-lg transition-colors cursor-pointer"
                  >
                    <span>Entrar no Painel do Consumidor</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleOrgSubmit} noValidate className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div>
                    <h2 className="text-lg font-bold text-[#07334E]">Acesso de Organização</h2>
                    <p className="text-xs text-[#5A7184]">
                      Condomínios, escolas, instituições públicas ou pontos comunitários.
                    </p>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <button
                      type="button"
                      onClick={fillDemoOrgHuila}
                      className="font-semibold text-[#0D76A8] hover:text-[#07334E] underline underline-offset-2 cursor-pointer whitespace-nowrap"
                    >
                      Demo Huíla
                    </button>
                    <span className="text-[#CBD5E1]" aria-hidden="true">|</span>
                    <button
                      type="button"
                      onClick={fillDemoOrgLuanda}
                      className="font-semibold text-[#0D76A8] hover:text-[#07334E] underline underline-offset-2 cursor-pointer whitespace-nowrap"
                    >
                      Demo Luanda
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="login-org-name"
                      className="block text-xs font-semibold text-[#07334E] mb-1.5"
                    >
                      Nome da organização *
                    </label>
                    <input
                      id="login-org-name"
                      type="text"
                      value={orgForm.organizationName}
                      onChange={(e) =>
                        setOrgForm({ ...orgForm, organizationName: e.target.value })
                      }
                      placeholder="Ex: Condomínio Nossa Senhora do Monte"
                      className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-[#DCE5EC] focus:border-[#0D76A8] text-[#07334E]"
                    />
                    {errors.organizationName && (
                      <p role="alert" className="text-xs text-[#B91C1C] mt-1">
                        {errors.organizationName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="login-org-type"
                      className="block text-xs font-semibold text-[#07334E] mb-1.5"
                    >
                      Tipo de organização
                    </label>
                    <select
                      id="login-org-type"
                      value={orgForm.organizationType}
                      onChange={(e) =>
                        setOrgForm({
                          ...orgForm,
                          organizationType: e.target.value as BeneficiaryCategory,
                        })
                      }
                      className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-[#DCE5EC] focus:border-[#0D76A8] bg-white text-[#07334E]"
                    >
                      {ORG_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="login-org-contact"
                    className="block text-xs font-semibold text-[#07334E] mb-1.5"
                  >
                    Nome do responsável *
                  </label>
                  <input
                    id="login-org-contact"
                    type="text"
                    value={orgForm.contactName}
                    onChange={(e) =>
                      setOrgForm({ ...orgForm, contactName: e.target.value })
                    }
                    placeholder="Ex: Eng. Mateus Chivinda"
                    className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-[#DCE5EC] focus:border-[#0D76A8] text-[#07334E]"
                  />
                  {errors.contactName && (
                    <p role="alert" className="text-xs text-[#B91C1C] mt-1">
                      {errors.contactName}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="login-org-province"
                      className="block text-xs font-semibold text-[#07334E] mb-1.5"
                    >
                      Província *
                    </label>
                    <select
                      id="login-org-province"
                      value={orgForm.province}
                      onChange={(e) => handleOrgProvinceChange(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-[#DCE5EC] focus:border-[#0D76A8] bg-white text-[#07334E]"
                    >
                      {ANGOLA_PROVINCES.map((prov) => (
                        <option key={prov} value={prov}>
                          {prov}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="login-org-municipality"
                      className="block text-xs font-semibold text-[#07334E] mb-1.5"
                    >
                      Município *
                    </label>
                    <select
                      id="login-org-municipality"
                      value={orgForm.municipality}
                      onChange={(e) =>
                        setOrgForm({ ...orgForm, municipality: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-[#DCE5EC] focus:border-[#0D76A8] bg-white text-[#07334E]"
                    >
                      <option value="">Seleccione o município</option>
                      {orgMunicipalities.map((mun) => (
                        <option key={mun} value={mun}>
                          {mun}
                        </option>
                      ))}
                    </select>
                    {errors.municipality && (
                      <p role="alert" className="text-xs text-[#B91C1C] mt-1">
                        {errors.municipality}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="login-org-bairro"
                      className="block text-xs font-semibold text-[#07334E] mb-1.5"
                    >
                      Bairro / Zona *
                    </label>
                    <input
                      id="login-org-bairro"
                      type="text"
                      value={orgForm.bairro}
                      onChange={(e) =>
                        setOrgForm({ ...orgForm, bairro: e.target.value })
                      }
                      placeholder={
                        orgForm.province === 'Huíla'
                          ? 'Ex: Nossa Senhora do Monte'
                          : 'Ex: Camama'
                      }
                      className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-[#DCE5EC] focus:border-[#0D76A8] text-[#07334E]"
                    />
                    {errors.bairro && (
                      <p role="alert" className="text-xs text-[#B91C1C] mt-1">
                        {errors.bairro}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="login-org-meter"
                      className="block text-xs font-semibold text-[#07334E] mb-1.5"
                    >
                      Número do contador principal *
                    </label>
                    <input
                      id="login-org-meter"
                      type="text"
                      value={orgForm.meterCode}
                      onChange={(e) =>
                        setOrgForm({ ...orgForm, meterCode: e.target.value })
                      }
                      placeholder={
                        orgForm.province === 'Huíla' ? 'Ex: AQ-HLA-112' : 'Ex: AQ-LDA-082'
                      }
                      className="w-full px-3.5 py-2.5 text-sm font-mono uppercase rounded-lg border border-[#DCE5EC] focus:border-[#0D76A8] text-[#07334E]"
                    />
                    {errors.meterCode && (
                      <p role="alert" className="text-xs text-[#B91C1C] mt-1">
                        {errors.meterCode}
                      </p>
                    )}
                  </div>
                </div>

                <div className="pt-3">
                  <button
                    type="submit"
                    className="w-full inline-flex items-center justify-center gap-2 py-3 px-5 text-sm font-semibold text-white bg-[#07334E] hover:bg-[#0D76A8] rounded-lg transition-colors cursor-pointer"
                  >
                    <span>Entrar no Painel da Organização</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
