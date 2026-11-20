import { useState, type FormEvent } from 'react';
import { CheckCircle2, MapPin, Send } from 'lucide-react';
import { ANGOLA_PROVINCES } from '../lib/aquasenseData';
import { validatePilotInquiry } from '../lib/aquasenseEngine';
import type { BeneficiaryCategory, PilotInquiryInput } from '../lib/aquasenseTypes';

const INITIAL_FORM: PilotInquiryInput = {
  name: '',
  organization: '',
  email: '',
  phone: '',
  profile: 'Residências e famílias',
  province: 'Luanda',
  message: '',
};

const PROFILE_OPTIONS: BeneficiaryCategory[] = [
  'Residências e famílias',
  'Condomínios',
  'Empresas de distribuição de água',
  'Instituições públicas',
  'Escolas e universidades',
  'Comunidades',
];

export function ContactSection() {
  const [form, setForm] = useState<PilotInquiryInput>(INITIAL_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submittedRecord, setSubmittedRecord] = useState<PilotInquiryInput | null>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const result = validatePilotInquiry(form);
    if (!result.valid) {
      setErrors(result.errors);
      return;
    }
    setErrors({});
    setSubmittedRecord({ ...form });
    setForm(INITIAL_FORM);
  };

  return (
    <section className="max-w-[1240px] mx-auto px-4 sm:px-6 py-16 lg:py-20">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left info column */}
        <div className="lg:col-span-5">
          <p className="text-xs font-semibold text-[#0D76A8] mb-2">
            Contacto institucional e testes-piloto
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-[#07334E] tracking-tight">
            Participar no ecossistema AQUASENSE
          </h1>
          <div className="w-12 h-1 bg-[#45B5DC] mt-3 mb-5" aria-hidden="true" />
          <p className="text-[#2C4050] leading-relaxed mb-8">
            Manifeste interesse para integrar a fase de testes-piloto em residências, condomínios,
            escolas, instituições públicas ou parcerias técnicas com entidades gestoras de água em
            Angola.
          </p>

          <div className="space-y-4 mb-8">
            <div className="bg-[#F3F6F9] border border-[#DCE5EC] rounded-xl p-5">
              <div className="flex items-center gap-2.5 text-sm font-bold text-[#07334E] mb-1">
                <MapPin className="w-4 h-4 text-[#0D76A8]" />
                <span>Âmbito geográfico</span>
              </div>
              <p className="text-sm text-[#2C4050]">
                Concebido para a realidade angolana, com fase inicial de validação técnica em
                residências e condomínios e perspectiva de expansão às restantes províncias.
              </p>
            </div>
          </div>
        </div>

        {/* Right form column */}
        <div className="lg:col-span-7">
          {submittedRecord ? (
            <div
              role="status"
              className="bg-[#EBF6FB] border border-[#C5E4F2] rounded-2xl p-8 space-y-4"
            >
              <div className="flex items-center gap-3 text-[#07334E]">
                <CheckCircle2 className="w-7 h-7 text-[#0D76A8] shrink-0" />
                <h2 className="text-xl font-bold">Pedido de contacto registado</h2>
              </div>
              <p className="text-sm text-[#2C4050] leading-relaxed">
                Obrigado, <strong className="font-semibold text-[#07334E]">{submittedRecord.name}</strong>.
                O seu interesse para a categoria{' '}
                <strong className="font-semibold text-[#07334E]">{submittedRecord.profile}</strong>{' '}
                na província de{' '}
                <strong className="font-semibold text-[#07334E]">{submittedRecord.province}</strong>{' '}
                foi registado para acompanhamento técnico pela equipa AQUASENSE.
              </p>
              <div className="bg-white border border-[#DCE5EC] rounded-xl p-4 text-xs text-[#5A7184] space-y-1 font-mono">
                <p>E-mail: {submittedRecord.email}</p>
                <p>Telefone: {submittedRecord.phone}</p>
                {submittedRecord.organization && (
                  <p>Entidade: {submittedRecord.organization}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => setSubmittedRecord(null)}
                className="px-4 py-2.5 text-sm font-semibold text-white bg-[#07334E] hover:bg-[#0D76A8] rounded-lg transition-colors cursor-pointer"
              >
                Enviar nova solicitação
              </button>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              noValidate
              className="bg-white border border-[#DCE5EC] rounded-2xl p-6 sm:p-8 space-y-5"
            >
              <h2 className="text-xl font-bold text-[#07334E]">
                Formulário de interesse para testes-piloto
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label
                    htmlFor="contact-name"
                    className="block text-xs font-semibold text-[#07334E] mb-1.5"
                  >
                    Nome completo *
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Ex: Maria Fernandes"
                    className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-[#DCE5EC] focus:border-[#0D76A8] bg-white text-[#07334E]"
                  />
                  {errors.name && (
                    <p role="alert" className="text-xs text-[#B91C1C] mt-1">
                      {errors.name}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="contact-org"
                    className="block text-xs font-semibold text-[#07334E] mb-1.5"
                  >
                    Organização / Condomínio (opcional)
                  </label>
                  <input
                    id="contact-org"
                    type="text"
                    value={form.organization}
                    onChange={(e) => setForm({ ...form, organization: e.target.value })}
                    placeholder="Ex: Administração do Condomínio"
                    className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-[#DCE5EC] focus:border-[#0D76A8] bg-white text-[#07334E]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label
                    htmlFor="contact-email"
                    className="block text-xs font-semibold text-[#07334E] mb-1.5"
                  >
                    Endereço de e-mail *
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="nome@entidade.ao"
                    className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-[#DCE5EC] focus:border-[#0D76A8] bg-white text-[#07334E]"
                  />
                  {errors.email && (
                    <p role="alert" className="text-xs text-[#B91C1C] mt-1">
                      {errors.email}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="contact-phone"
                    className="block text-xs font-semibold text-[#07334E] mb-1.5"
                  >
                    Telefone / Telemóvel *
                  </label>
                  <input
                    id="contact-phone"
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="+244 9XX XXX XXX"
                    className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-[#DCE5EC] focus:border-[#0D76A8] bg-white text-[#07334E]"
                  />
                  {errors.phone && (
                    <p role="alert" className="text-xs text-[#B91C1C] mt-1">
                      {errors.phone}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label
                    htmlFor="contact-profile"
                    className="block text-xs font-semibold text-[#07334E] mb-1.5"
                  >
                    Perfil de beneficiário
                  </label>
                  <select
                    id="contact-profile"
                    value={form.profile}
                    onChange={(e) =>
                      setForm({ ...form, profile: e.target.value as BeneficiaryCategory })
                    }
                    className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-[#DCE5EC] focus:border-[#0D76A8] bg-white text-[#07334E]"
                  >
                    {PROFILE_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="contact-province"
                    className="block text-xs font-semibold text-[#07334E] mb-1.5"
                  >
                    Província *
                  </label>
                  <select
                    id="contact-province"
                    value={form.province}
                    onChange={(e) => setForm({ ...form, province: e.target.value })}
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
              </div>

              <div>
                <label
                  htmlFor="contact-message"
                  className="block text-xs font-semibold text-[#07334E] mb-1.5"
                >
                  Contexto e objectivo do contacto *
                </label>
                <textarea
                  id="contact-message"
                  rows={4}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="Indique o número aproximado de pontos de medição, contexto de instalação ou tipo de parceria pretendida..."
                  className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-[#DCE5EC] focus:border-[#0D76A8] bg-white text-[#07334E]"
                />
                {errors.message && (
                  <p role="alert" className="text-xs text-[#B91C1C] mt-1">
                    {errors.message}
                  </p>
                )}
              </div>

              <div className="pt-2 flex flex-wrap items-center justify-between gap-4">
                <p className="text-xs text-[#5A7184]">
                  Campos assinalados com * são obrigatórios.
                </p>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-[#07334E] hover:bg-[#0D76A8] rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                >
                  <Send className="w-4 h-4" />
                  <span>Submeter manifestação de interesse</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
