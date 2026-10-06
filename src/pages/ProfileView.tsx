import React, { useState } from "react";
import { Save, ShieldCheck, Key, HelpCircle, User, Award, Percent, Sparkles, Clock, Check } from "lucide-react";
import { UserProfile } from "../types";
import { supabase } from "../supabase";

interface ProfileViewProps {
  user: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
  onLogout: () => void;
  onSubscribePremium: () => void;
}

export default function ProfileView({
  user,
  onUpdateProfile,
  onLogout,
  onSubscribePremium,
}: ProfileViewProps) {
  const [fullName, setFullName] = useState(user.fullName);
  const [whatsapp, setWhatsapp] = useState(user.whatsapp);
  const [address, setAddress] = useState(user.address);
  const [password, setPassword] = useState("");

  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setLoading(true);

    if (!fullName.trim() || !whatsapp.trim() || !address.trim()) {
      setErrorMsg("Nome, WhatsApp e Endereço são de preenchimento obrigatório.");
      setLoading(false);
      return;
    }

    try {
      // If user provided a password, update it securely via Supabase Auth
      if (password.trim()) {
        const { error: pwdError } = await supabase.auth.updateUser({
          password: password.trim()
        });
        if (pwdError) {
          setErrorMsg(`Erro ao atualizar senha: ${pwdError.message}`);
          setLoading(false);
          return;
        }
      }

      const updatedUser: UserProfile = {
        ...user,
        fullName: fullName.trim(),
        whatsapp: whatsapp.trim(),
        address: address.trim(),
      };

      onUpdateProfile(updatedUser);
      setSuccessMsg("Os seus dados de cadastro foram guardados com êxito no banco de dados.");
      setPassword("");
      setTimeout(() => {
        setSuccessMsg("");
      }, 4500);
    } catch (err: any) {
      setErrorMsg(err.message || "Erro ao atualizar perfil.");
    } finally {
      setLoading(false);
    }
  };

  // Calculate dynamic quiz stats from track
  const answersTrack = user.quizAnswersTrack || {};
  const trackEntries = Object.values(answersTrack);
  const totalAnswers = trackEntries.length;
  const correctCount = trackEntries.filter((a) => a.isCorrect).length;
  const incorrectCount = totalAnswers - correctCount;
  const successPercentage = totalAnswers > 0 ? Math.round((correctCount / totalAnswers) * 100) : 0;

  return (
    <div className="w-full bg-[#f8fafc] font-sans min-h-screen py-10 px-4" id="profile-view-tab">
      <div className="w-full max-w-5xl mx-auto space-y-8" id="profile-view-wrapper">
        
        {/* Profile Jumbotron banner */}
        <div className="bg-white border border-slate-200 p-8 rounded-sm text-left shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-6" id="profile-jumbo-card">
          <div className="flex items-center gap-5" id="profile-avatar-combo">
            <div className="w-20 h-20 bg-slate-100 border-2 border-slate-350 text-[#0d9488] font-bold text-3xl font-mono flex items-center justify-center rounded-sm shadow-inner shrink-0">
              {fullName.slice(0, 2).toUpperCase() || "US"}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="font-display font-bold text-2xl text-[#0a2540] tracking-tight">{fullName}</h3>
                <span className={`text-[9px] uppercase font-mono font-bold tracking-widest px-2.5 py-0.5 rounded-xs border ${
                  user.planType === "pago"
                    ? "bg-amber-100 text-amber-950 border-amber-300"
                    : "bg-slate-100 text-slate-700 border-slate-300"
                }`}>
                  Plano {user.planType === "pago" ? "Premium" : "Gratuito"}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono tracking-wide">{user.email} (Estudante Registado)</p>
            </div>
          </div>

          <div className="flex items-center justify-end" id="profile-logout-wrap">
            {/* O botão Terminar Sessão foi removido daqui a pedido do utilizador, mantendo-se apenas na barra de navegação/navbar */}
          </div>
        </div>

        {/* Form area + Analytics Panels Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start" id="profile-grid">
          
          {/* Left Block: Personal registration form (7 cols) */}
          <div className="lg:col-span-7 bg-white border border-slate-200 p-6 md:p-8 rounded-sm text-left shadow-xs space-y-6" id="profile-form-block">
            <div>
              <h3 className="font-display font-bold text-lg text-[#0a2540]">Dados Pessoais & Credenciais</h3>
              <p className="text-xs text-slate-400 font-sans mt-0.5">Mantenha a sua ficha cadastral atualizada para acompanhamento de progresso e contactos</p>
            </div>

            {successMsg && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-sm" id="profile-success-box">
                {successMsg}
              </div>
            )}

            {errorMsg && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold rounded-sm" id="profile-error-box">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4" id="profile-inner-html-form">
              {/* E-mail (Disabled) */}
              <div className="flex flex-col space-y-1">
                <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400" htmlFor="prof-f-email">
                  Endereço de Correio Electrónico de Login (Inalterável)
                </label>
                <input
                  id="prof-f-email"
                  type="email"
                  disabled
                  value={user.email}
                  className="px-3 py-2.5 bg-slate-50 border border-slate-200 text-slate-400 rounded-sm text-xs font-mono select-none cursor-not-allowed"
                />
              </div>

              {/* Full Name */}
              <div className="flex flex-col space-y-1">
                <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-600" htmlFor="prof-f-name">
                  Nome Completo do Estudante
                </label>
                <input
                  id="prof-f-name"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="px-3 py-2.5 border border-slate-200 focus:outline-hidden focus:ring-1 focus:ring-[#0d9488] focus:border-[#0d9488] rounded-sm text-xs font-sans font-medium"
                  placeholder="Seu nome completo para o certificado"
                />
              </div>

              {/* WhatsApp phone contact */}
              <div className="flex flex-col space-y-1">
                <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-600" htmlFor="prof-f-whatsapp">
                  Número de WhatsApp para Comunicações
                </label>
                <input
                  id="prof-f-whatsapp"
                  type="text"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className="px-3 py-2.5 border border-slate-200 focus:outline-hidden focus:ring-1 focus:ring-[#0d9488] focus:border-[#0d9488] rounded-sm text-xs font-mono"
                  placeholder="e.g. +258820000000"
                />
              </div>

              {/* Home Address (Morada) */}
              <div className="flex flex-col space-y-1">
                <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-600" htmlFor="prof-f-address">
                  Morada Física Residencial
                </label>
                <input
                  id="prof-f-address"
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="px-3 py-2.5 border border-slate-200 focus:outline-hidden focus:ring-1 focus:ring-[#0d9488] focus:border-[#0d9488] rounded-sm text-xs font-sans"
                  placeholder="Bairro, Rua, Casa, Cidade"
                />
                <span className="text-[10px] text-[#0d9488] font-sans block mt-1">
                  * Certifique-se de preencher a sua morada correcta e completa, pois é para este endereço que enviaremos o seu <strong>certificado de conclusão físico</strong> de forma gratuita ao terminar cada curso.
                </span>
              </div>

              {/* Security Password */}
              <div className="flex flex-col space-y-1 pb-2">
                <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-600" htmlFor="prof-f-password">
                  Definir Nova Palavra-Passe de Segurança (Deixe em branco para não alterar)
                </label>
                <input
                  id="prof-f-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="px-3 py-2.5 border border-slate-200 focus:outline-hidden focus:ring-1 focus:ring-[#0d9488] focus:border-[#0d9488] rounded-sm text-xs font-mono"
                  placeholder="Nova palavra-passe de acesso"
                />
              </div>

              <div className="border-t border-slate-100 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full inline-flex items-center justify-center gap-2 bg-[#0d9488] hover:bg-[#0f766e] text-white text-xs font-bold uppercase tracking-wider py-3.5 px-6 rounded-sm cursor-pointer transition-colors shadow-2xs disabled:opacity-50"
                  id="profile-save-btn"
                >
                  <Save className="h-4 w-4" />
                  <span>{loading ? "A processar..." : "Guardar Alterações do Perfil"}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Right Block: Plano selector & Quiz Analytics (5 cols) */}
          <div className="lg:col-span-5 space-y-6 text-left" id="profile-extras-block">
            
            {/* 1. SECTION: TIPO DE PLANO SELECTOR */}
            <div className="bg-white border border-slate-200 p-6 rounded-sm shadow-xs space-y-4" id="plan-selection-card">
              {user.planType === "pago" ? (
                /* Premium Status Display */
                <div className="space-y-4" id="premium-status-info">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                    <div className="p-2 bg-amber-50 rounded-sm text-amber-600">
                      <Sparkles className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-sm text-slate-800">Assinatura Premium Ativa</h3>
                      <p className="text-[10px] text-slate-400 font-mono">Taxa Fixa • 90 Dias de Acesso Total</p>
                    </div>
                  </div>

                  <div className="bg-emerald-50/50 border border-emerald-100 p-4 rounded-xs text-xs text-slate-700 space-y-2 font-sans">
                    <p className="leading-relaxed">
                      O seu acesso Premium está ativado. Tem acesso desbloqueado a <strong>todos os vídeos</strong>, <strong>materiais didáticos</strong> e <strong>bónus extras</strong> de todos os cursos da plataforma.
                    </p>
                    <div className="pt-2 border-t border-emerald-100 flex justify-between items-center text-[10px] font-mono text-slate-500">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-emerald-600" />
                        <span>Expira em: {user.premiumExpiresAt ? new Date(user.premiumExpiresAt).toLocaleDateString("pt-PT") : "-"}</span>
                      </div>
                      <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                        {user.premiumExpiresAt 
                          ? `${Math.max(0, Math.ceil((new Date(user.premiumExpiresAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))} dias restantes` 
                          : "Ativo"}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                /* Upgrade premium CTA */
                <div className="space-y-4" id="premium-upgrade-cta">
                  <div>
                    <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-amber-650 bg-amber-50 px-2 py-0.5 rounded-xs border border-amber-200">
                      Upgrade Disponível
                    </span>
                    <h3 className="font-display font-bold text-base text-[#0a2540] mt-2">Apoio & Acesso Premium</h3>
                    <p className="text-[11px] text-slate-550 font-sans leading-relaxed mt-0.5">
                      Subscreva o plano pago para desbloquear acesso a todos os cursos de informática, suporte direto e materiais extras de estudo.
                    </p>
                  </div>

                  <div className="border border-slate-150 p-4 rounded-xs space-y-3 bg-slate-50/50 text-xs">
                    <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                      <span className="font-semibold text-slate-700">Período de Assinatura</span>
                      <span className="font-mono font-bold text-slate-600 bg-white px-2 py-0.5 border border-slate-200 rounded-sm">90 Dias</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                      <span className="font-semibold text-slate-700">Taxa Única / Fixa</span>
                      <span className="font-mono font-black text-[#0d9488] text-sm">1.799 MT</span>
                    </div>

                    <div className="space-y-1.5 pt-1 text-[11px] text-slate-600 font-sans">
                      <div className="flex items-center gap-2">
                        <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                        <span>Acesso total a todos os vídeos das aulas</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                        <span>Acesso livre aos materiais didáticos de apoio</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                        <span>Recursos bónus extra e suporte prioritário</span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={onSubscribePremium}
                    className="w-full inline-flex items-center justify-center gap-2 bg-[#0d9488] hover:bg-[#0f766e] text-white text-xs font-bold uppercase tracking-wider py-3 px-6 rounded-sm cursor-pointer transition-colors shadow-2xs font-sans"
                    id="profile-subscribe-btn"
                  >
                    <Sparkles className="h-4 w-4 text-amber-300" />
                    <span>Adquirir Assinatura Premium</span>
                  </button>
                </div>
              )}
            </div>

            {/* 2. SECTION: QUIZ PERFORMANCE ANALYTICS (Correct and Incorrect answers flat display) */}
            <div className="bg-white border border-slate-200 p-6 rounded-sm shadow-xs space-y-4" id="quiz-analytics-card">
              <div>
                <h3 className="font-display font-bold text-base text-[#0a2540]">Estatísticas de Consolidação</h3>
                <p className="text-[10px] text-slate-400 font-sans mt-0.5">Inquérito analítico de respostas acertadas e erradas resolvidas nos questionários</p>
              </div>

              {totalAnswers === 0 ? (
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-sm text-center text-xs text-slate-400 font-sans" id="analytics-empty">
                  Nenhum questionário respondido no histórico deste perfil.
                </div>
              ) : (
                <div className="space-y-4" id="analytics-stats-panel">
                  {/* Visual Correct vs Incorrect Progress Meter Bar */}
                  <div className="space-y-1.5" id="mini-chart">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-emerald-700">Respostas Acertadas ({correctCount})</span>
                      <span className="text-rose-700">Respostas Erradas ({incorrectCount})</span>
                    </div>

                    {/* Dual component pure flat bar */}
                    <div className="w-full h-4 bg-rose-200 rounded-xs flex overflow-hidden border border-slate-205" id="micro-progress-ratio">
                      <div 
                        className="bg-emerald-600 h-full transition-all duration-300"
                        style={{ width: `${successPercentage}%` }}
                      />
                    </div>

                    <div className="flex justify-between text-[10px] font-mono text-slate-400">
                      <span>Proporção de Acertos: {successPercentage}%</span>
                      <span>Total Respondido: {totalAnswers}</span>
                    </div>
                  </div>

                  {/* Summary lists metrics */}
                  <div className="grid grid-cols-2 gap-3" id="performance-small-widgets">
                    <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-xs flex items-center justify-between" id="widget-correct">
                      <div className="text-left">
                        <span className="text-[9px] font-mono font-bold uppercase text-emerald-650 tracking-wider">Acertos</span>
                        <div className="text-lg font-bold text-emerald-800 mt-0.5">{correctCount}</div>
                      </div>
                      <ShieldCheck className="h-4 w-4 text-emerald-650 shrink-0" />
                    </div>

                    <div className="bg-rose-50 border border-rose-100 p-3 rounded-xs flex items-center justify-between" id="widget-incorrect">
                      <div className="text-left">
                        <span className="text-[9px] font-mono font-bold uppercase text-rose-650 tracking-wider">Erros</span>
                        <div className="text-lg font-bold text-rose-800 mt-0.5">{incorrectCount}</div>
                      </div>
                      <Percent className="h-4 w-4 text-rose-650 shrink-0" />
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
