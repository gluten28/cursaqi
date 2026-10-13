import React, { useState } from "react";
import { 
  Home, 
  BookOpen, 
  Users, 
  Info, 
  Clock, 
  CreditCard, 
  User, 
  Settings, 
  Heart, 
  Bell, 
  Share2, 
  LogOut, 
  Menu, 
  X, 
  GraduationCap,
  Sparkles,
  ShieldCheck,
  ChevronRight
} from "lucide-react";
import { UserProfile } from "../types";

interface SidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
  wishlistCount: number;
  currentUser: UserProfile | null;
  isAdmin?: boolean;
  onLoginClick?: () => void;
  onRegisterClick?: () => void;
  onLogout?: () => void;
  unreadNotificationsCount?: number;
  onNotificationToggle?: () => void;
  onShareSite?: () => void;
}

export default function Sidebar({
  currentView,
  onViewChange,
  wishlistCount,
  currentUser,
  isAdmin = false,
  onLoginClick,
  onRegisterClick,
  onLogout,
  unreadNotificationsCount = 0,
  onNotificationToggle,
  onShareSite,
}: SidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleNavClick = (view: string) => {
    onViewChange(view);
    setMobileOpen(false);
  };

  const navItems = [
    {
      id: "home",
      label: "Início",
      icon: <Home className="h-4 w-4" />,
      active: currentView === "home" || currentView === "dashboard",
    },
    {
      id: "courses",
      label: "Cursos",
      icon: <BookOpen className="h-4 w-4" />,
      active: currentView === "courses",
    },
    {
      id: "community",
      label: "Comunidade",
      icon: <Users className="h-4 w-4" />,
      active: currentView === "community",
      badge: "Ao Vivo",
    },
    {
      id: "about",
      label: "Sobre Nós",
      icon: <Info className="h-4 w-4" />,
      active: currentView === "about",
    },
    {
      id: "history",
      label: "Histórico",
      icon: <Clock className="h-4 w-4" />,
      active: currentView === "history",
    },
    ...(currentUser
      ? [
          {
            id: "payments",
            label: "Pagamentos",
            icon: <CreditCard className="h-4 w-4" />,
            active: currentView === "payments",
          },
          {
            id: "profile",
            label: "Meu Perfil",
            icon: <User className="h-4 w-4" />,
            active: currentView === "profile",
          },
        ]
      : []),
  ];

  return (
    <>
      {/* Mobile Top App Bar */}
      <div 
        className="lg:hidden w-full bg-white text-slate-800 h-16 px-4 flex items-center justify-between sticky top-0 z-40 border-b border-slate-200 shadow-xs"
        id="cursaqi-mobile-bar"
      >
        <button
          onClick={() => handleNavClick("home")}
          className="flex items-center gap-2 cursor-pointer"
        >
          <img
            src="https://ik.imagekit.io/mdsiwq57o/CursaQI/Logotipo.png"
            alt="CUrsaQi"
            className="h-10 w-10 rounded-full object-cover border border-teal-500/40"
            referrerPolicy="no-referrer"
          />
          <span className="font-display font-bold text-base tracking-tight text-slate-900 uppercase">
            CUrsaQi
          </span>
        </button>

        <div className="flex items-center gap-2">
          {/* Notification Button Mobile */}
          <button
            onClick={onNotificationToggle}
            className="relative p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            title="Notificações"
          >
            <Bell className="h-5 w-5" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute top-1 right-1 bg-rose-600 text-white text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-full">
                {unreadNotificationsCount}
              </span>
            )}
          </button>

          {/* Wishlist Mobile */}
          <div className="flex items-center gap-1 text-slate-600 px-1 text-xs">
            <Heart className="h-4 w-4 text-rose-500" />
            <span className="font-mono font-bold text-teal-600">{wishlistCount}</span>
          </div>

          {/* Hamburger toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            aria-label="Abrir Menu Lateral"
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/40 z-45 backdrop-blur-xs transition-opacity animate-fade-in"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Panel (Desktop: Fixed left; Mobile: Sliding drawer) */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-white text-slate-800 flex flex-col justify-between border-r border-slate-200 shadow-2xl lg:shadow-none transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
        id="cursaqi-app-sidebar"
      >
        {/* Top Header Block / Brand Logo */}
        <div className="p-5 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <button
              onClick={() => handleNavClick("home")}
              className="flex items-center gap-3 text-left group cursor-pointer"
            >
              <div className="relative">
                <img
                  src="https://ik.imagekit.io/mdsiwq57o/CursaQI/Logotipo.png"
                  alt="CUrsaQi"
                  className="h-12 w-12 rounded-full object-cover border-2 border-teal-500/50 shadow-md group-hover:scale-105 transition-transform"
                  referrerPolicy="no-referrer"
                />
                <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-display font-black text-lg tracking-tight uppercase text-slate-900 leading-none">
                  CUrsaQi
                </span>
                <span className="text-[10px] font-mono uppercase tracking-wider text-teal-600 font-semibold mt-1">
                  Cursos de Informática
                </span>
              </div>
            </button>

            {/* Close Button on Mobile Drawer */}
            <button
              onClick={() => setMobileOpen(false)}
              className="lg:hidden p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Middle Navigation Section */}
        <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-6 no-scrollbar">
          {/* Main Navigation Links */}
          <div>
            <div className="px-3 pb-2 text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
              Navegação Principal
            </div>
            <nav className="space-y-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all duration-150 cursor-pointer group ${
                    item.active
                      ? "bg-[#0d9488] text-white shadow-md shadow-teal-700/20 font-bold"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={item.active ? "text-white" : "text-teal-600 group-hover:text-teal-700"}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded-full font-bold ${
                      item.active ? "bg-white text-teal-800" : "bg-teal-50 text-teal-700 border border-teal-200"
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* Quick Platform Actions & Tools */}
          <div>
            <div className="px-3 pb-2 text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
              Atalhos e Notificações
            </div>
            <div className="space-y-1">
              {/* Notifications */}
              <button
                onClick={() => {
                  if (onNotificationToggle) onNotificationToggle();
                  setMobileOpen(false);
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <Bell className="h-4 w-4 text-teal-600 group-hover:text-teal-700" />
                  <span>Notificações</span>
                </div>
                {unreadNotificationsCount > 0 ? (
                  <span className="bg-rose-600 text-white text-[9.5px] font-mono font-bold px-2 py-0.5 rounded-full">
                    {unreadNotificationsCount} novas
                  </span>
                ) : (
                  <span className="text-[10px] font-mono text-slate-400">0</span>
                )}
              </button>

              {/* Wishlist */}
              <button
                onClick={() => handleNavClick("courses")}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <Heart className="h-4 w-4 text-rose-500 group-hover:text-rose-600" />
                  <span>Favoritos</span>
                </div>
                <span className="text-[10px] font-mono font-bold bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full text-rose-600">
                  {wishlistCount}
                </span>
              </button>

              {/* Share */}
              {onShareSite && (
                <button
                  onClick={() => {
                    onShareSite();
                    setMobileOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <Share2 className="h-4 w-4 text-teal-600 group-hover:text-teal-700" />
                    <span>Partilhar CUrsaQi</span>
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </button>
              )}

              {/* Admin Panel Link */}
              {isAdmin && (
                <button
                  onClick={() => handleNavClick(currentView === "admin" ? "home" : "admin")}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer mt-2 ${
                    currentView === "admin"
                      ? "bg-amber-600 text-white shadow-md"
                      : "bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Settings className="h-4 w-4 text-amber-600" />
                    <span>{currentView === "admin" ? "Sair do Admin" : "Painel Administrador"}</span>
                  </div>
                  <ShieldCheck className="h-4 w-4 text-amber-600" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Bottom User Profile / Auth Area */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/80">
          {currentUser ? (
            <div className="space-y-3">
              <div 
                onClick={() => handleNavClick("profile")}
                className="flex items-center gap-3 p-2 rounded-xl hover:bg-white border border-transparent hover:border-slate-200 cursor-pointer transition-all shadow-xs"
                title="Aceder ao perfil"
              >
                {currentUser.avatarUrl ? (
                  <img
                    src={currentUser.avatarUrl}
                    alt={currentUser.fullName || "Perfil"}
                    className="w-10 h-10 rounded-full object-cover border-2 border-teal-500/50 shadow-xs shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-teal-100 border border-teal-300 flex items-center justify-center text-teal-800 font-bold font-mono text-sm shrink-0">
                    {currentUser.fullName ? currentUser.fullName.slice(0, 2).toUpperCase() : "ES"}
                  </div>
                )}
                <div className="flex flex-col min-w-0 text-left">
                  <span className="text-xs font-bold text-slate-800 truncate font-sans">
                    {currentUser.fullName}
                  </span>
                  <span className="text-[10px] text-slate-500 truncate font-mono">
                    {currentUser.email}
                  </span>
                  <span className="text-[9px] font-mono uppercase font-bold text-emerald-600 mt-0.5">
                    ● {currentUser.role === "admin" ? "Administrador" : "Estudante Conectado"}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => handleNavClick("profile")}
                  className="flex-1 py-1.5 px-3 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-[11px] font-semibold rounded-lg text-center transition-colors cursor-pointer shadow-xs"
                >
                  Ver Perfil
                </button>
                <button
                  onClick={() => {
                    if (onLogout) onLogout();
                    setMobileOpen(false);
                  }}
                  className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 hover:border-rose-300 rounded-lg transition-colors cursor-pointer"
                  title="Terminar Sessão"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="text-[10.5px] text-slate-500 font-sans pb-1 leading-snug">
                Acesse a sua conta ou crie um registo para desbloquear os cursos:
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    if (onLoginClick) onLoginClick();
                    setMobileOpen(false);
                  }}
                  className="w-full py-2 px-2 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-colors cursor-pointer text-center shadow-xs"
                >
                  Entrar
                </button>
                <button
                  onClick={() => {
                    if (onRegisterClick) onRegisterClick();
                    setMobileOpen(false);
                  }}
                  className="w-full py-2 px-2 bg-[#0d9488] hover:bg-[#0f766e] text-white rounded-lg text-[11px] font-bold uppercase tracking-wider transition-colors cursor-pointer text-center shadow-sm"
                >
                  Registar
                </button>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

