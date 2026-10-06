import React, { useState, useEffect } from "react";
import { UserPlus, LogIn, Mail, Lock, Phone, MapPin, User, ShieldCheck, Eye, EyeOff } from "lucide-react";
import { UserProfile } from "../types";
import { authSignIn, authSignUp } from "../supabase";

interface AuthScreenProps {
  onLoginSuccess: (user: UserProfile) => void;
  onRegisterSuccess: (newUser: UserProfile) => void;
  onCancel: () => void;
  initialMode?: "login" | "register";
}

export default function AuthScreen({
  onLoginSuccess,
  onRegisterSuccess,
  onCancel,
  initialMode = "login",
}: AuthScreenProps) {
  // Toggle between "login" or "register" modes
  const [authMode, setAuthMode] = useState<"login" | "register">(initialMode);

  // Sync state if initialMode changes
  useEffect(() => {
    setAuthMode(initialMode);
  }, [initialMode]);

  // Input states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [address, setAddress] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Validation alerts
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    if (!email.trim() || !password.trim()) {
      setErrorMsg("O endereço de e-mail e a senha são de preenchimento obrigatório.");
      setLoading(false);
      return;
    }

    try {
      const matchedUser = await authSignIn(email.trim(), password);
      if (!matchedUser) {
        setErrorMsg("Nenhum registo encontrado ou credenciais incorretas.");
        setLoading(false);
        return;
      }

      setSuccessMsg("Sessão iniciada com sucesso!");
      setTimeout(() => {
        onLoginSuccess(matchedUser);
      }, 400);
    } catch (err: any) {
      setErrorMsg(err.message || "Erro ao iniciar sessão. Verifique suas credenciais.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setLoading(true);

    // Full validations
    if (!fullName.trim() || !email.trim() || !whatsapp.trim() || !address.trim() || !password.trim()) {
      setErrorMsg("Por favor, preencha todos os campos do registo.");
      setLoading(false);
      return;
    }

    try {
      const newUser = await authSignUp(
        email.trim(),
        password,
        fullName.trim(),
        whatsapp.trim(),
        address.trim()
      );

      if (newUser) {
        onRegisterSuccess(newUser);
        setSuccessMsg("Registo efetuado com sucesso! Inicie a sua sessão.");
        
        // Auto toggle to login mode with prefilled email for continuous flow
        setTimeout(() => {
          setAuthMode("login");
          setPassword("");
          setSuccessMsg("");
        }, 1500);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Erro ao efetuar registo. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="w-full bg-slate-50 flex items-center justify-center font-sans" 
      style={{ padding: "40px 16px", minHeight: "calc(100vh - 80px)" }}
      id="auth-screen-root"
    >
      <div 
        className="w-full max-w-md bg-white border border-slate-200 rounded-sm shadow-sm overflow-hidden" 
        id="auth-box-container"
      >
        {/* Banner header inside card */}
        <div className="bg-[#0a2540] text-white text-left" style={{ padding: "32px 32px 24px" }} id="auth-banner">
          <span className="text-[10px] uppercase font-mono tracking-wider text-[#0d9488] font-bold animate-fade-in">
            Portal da Academia CUrsaQi
          </span>
          <h2 className="font-display font-medium text-xl md:text-2xl tracking-tight mt-1" id="auth-banner-title">
            {authMode === "login" ? "Iniciar Sessão" : "Criar Nova Conta"}
          </h2>
          <p className="text-xs text-slate-400 mt-2 font-sans">
            Insira as suas credenciais para aceder ao seu percurso de aprendizagem técnica e de especialização.
          </p>
        </div>

        {/* Dynamic content cards with max padding of 40px (using 32px) */}
        <div style={{ padding: "32px" }} id="auth-form-wrapper">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold rounded-sm mb-4 text-left font-sans">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-sm mb-4 text-left font-sans">
              {successMsg}
            </div>
          )}

          {authMode === "login" ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4 text-left" id="login-flow-form">
              {/* Login Email */}
              <div className="flex flex-col">
                <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1" htmlFor="login-email">
                  Endereço de E-mail
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-3.5 text-slate-400">
                    <Mail className="h-4 w-4" />
                  </span>
                  <input
                    id="login-email"
                    type="email"
                    required
                    placeholder="emailestudante@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 border border-slate-200 focus:outline-hidden focus:ring-1 focus:ring-[#0d9488] focus:border-[#0d9488] text-sm font-sans"
                  />
                </div>
              </div>

              {/* Login Password */}
              <div className="flex flex-col">
                <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1" htmlFor="login-password">
                  Palavra-passe (Senha)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-3.5 text-slate-400">
                    <Lock className="h-4 w-4" />
                  </span>
                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Defina a sua palavra-passe"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-10 py-2.5 border border-slate-200 focus:outline-hidden focus:ring-1 focus:ring-[#0d9488] focus:border-[#0d9488] text-sm font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 focus:outline-hidden"
                    style={{ background: "none", border: "none" }}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Dynamic submit action */}
              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 bg-[#0d9488] hover:bg-[#0f766e] text-white text-xs font-bold uppercase tracking-wider py-3 px-6 rounded-sm transition-colors cursor-pointer disabled:opacity-50"
                id="login-btn-action"
              >
                <span>{loading ? "Processando..." : "Aceder à Conta"}</span>
                <LogIn className="h-4 w-4" />
              </button>

              {/* Toggle trigger buttons */}
              <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-500" id="login-helper-buttons">
                Primeira vez na plataforma?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode("register");
                    setErrorMsg("");
                  }}
                  className="font-bold text-[#0d9488] hover:underline cursor-pointer"
                >
                  Registe-se aqui
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-4 text-left" id="signup-flow-form">
              {/* Full Name input */}
              <div className="flex flex-col">
                <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1" htmlFor="reg-fullname">
                  Nome Completo
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-slate-400">
                    <User className="h-4 w-4" />
                  </span>
                  <input
                    id="reg-fullname"
                    type="text"
                    required
                    placeholder="nome do estudante"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-slate-200 focus:outline-hidden focus:ring-1 focus:ring-[#0d9488] focus:border-[#0d9488] text-sm"
                  />
                </div>
              </div>

              {/* Email register */}
              <div className="flex flex-col">
                <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1" htmlFor="reg-email">
                  Endereço de E-mail
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-slate-400">
                    <Mail className="h-4 w-4" />
                  </span>
                  <input
                    id="reg-email"
                    type="email"
                    required
                    placeholder="emailestudante@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-slate-200 focus:outline-hidden focus:ring-1 focus:ring-[#0d9488] focus:border-[#0d9488] text-sm font-mono"
                  />
                </div>
              </div>

              {/* WhatsApp Contact */}
              <div className="flex flex-col">
                <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1" htmlFor="reg-whatsapp">
                  Contacto de WhatsApp
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-slate-400">
                    <Phone className="h-4 w-4" />
                  </span>
                  <input
                    id="reg-whatsapp"
                    type="text"
                    required
                    placeholder="+258 84 123 4567"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-slate-200 focus:outline-hidden focus:ring-1 focus:ring-[#0d9488] focus:border-[#0d9488] text-sm font-mono"
                  />
                </div>
              </div>

              {/* Physical Address (Morada) */}
              <div className="flex flex-col">
                <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1" htmlFor="reg-address">
                  Morada Física (Endereço)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-3.5 text-slate-400">
                    <MapPin className="h-4 w-4" />
                  </span>
                  <input
                    id="reg-address"
                    type="text"
                    required
                    placeholder="residencia do estudante"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 border border-slate-200 focus:outline-hidden focus:ring-1 focus:ring-[#0d9488] focus:border-[#0d9488] text-sm"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="flex flex-col">
                <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1" htmlFor="reg-password">
                  Palavra-passe (Senha)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-slate-400">
                    <Lock className="h-4 w-4" />
                  </span>
                  <input
                    id="reg-password"
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Defina a sua palavra-passe de acesso"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-10 py-2 border border-slate-200 focus:outline-hidden focus:ring-1 focus:ring-[#0d9488] focus:border-[#0d9488] text-sm font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2 text-slate-400 hover:text-slate-600 focus:outline-hidden"
                    style={{ background: "none", border: "none" }}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Register trigger button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 bg-[#0d9488] hover:bg-[#0f766e] text-white text-xs font-bold uppercase tracking-wider py-3 px-6 rounded-sm transition-colors cursor-pointer disabled:opacity-50"
                id="signup-btn-action"
              >
                <span>{loading ? "Processando..." : "Criar Minha Conta"}</span>
                <UserPlus className="h-4 w-4" />
              </button>

              <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-500" id="signup-helper-buttons">
                Já possui uma conta ativa?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode("login");
                    setErrorMsg("");
                  }}
                  className="font-bold text-[#0d9488] hover:underline cursor-pointer"
                >
                  Inicie a sua sessão
                </button>
              </div>
            </form>
          )}

          {/* Sparing cancel option */}
          <div className="mt-4 text-center">
            <button
              onClick={onCancel}
              className="text-xs text-slate-400 hover:text-slate-600 font-medium cursor-pointer"
              id="auth-cancel-btn"
            >
              Cancelar e Voltar ao Site
            </button>
          </div>
        </div>

        {/* Informational security check block footer */}
        <div className="bg-slate-50/50 border-t border-slate-100 text-center text-[10px] font-mono text-slate-400 flex items-center justify-center gap-1.5" style={{ padding: "16px" }} id="auth-compliance-footer">
          <ShieldCheck className="h-4 w-4 text-[#0d9488]" />
          <span>PLATAFORMA DE CURSOS // FORMAÇÃO ALDO VALIGE</span>
        </div>
      </div>
    </div>
  );
}
