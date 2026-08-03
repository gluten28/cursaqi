import React, { useState } from "react";
import { Search, Heart, User, Settings, Menu, X, LogOut, Bell } from "lucide-react";

interface HeaderProps {
  currentView: string;
  onViewChange: (view: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  wishlistCount: number;
  userEmail?: string;
  isAdmin?: boolean;
  onLoginClick?: () => void;
  onRegisterClick?: () => void;
  onLogout?: () => void;
  unreadNotificationsCount?: number;
  onNotificationToggle?: () => void;
}

export default function Header({
  currentView,
  onViewChange,
  searchQuery,
  onSearchChange,
  wishlistCount,
  userEmail,
  isAdmin = false,
  onLoginClick,
  onRegisterClick,
  onLogout,
  unreadNotificationsCount = 0,
  onNotificationToggle,
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="w-full flex flex-col z-40 sticky top-0 bg-white border-b border-slate-100 shadow-xs" id="cursaqi-header">
      {/* Top Notification Bar */}
      <div 
        className="w-full bg-[#0a2540] py-2 px-4 text-center text-xs font-medium tracking-wide text-white uppercase" 
        id="header-announcement-bar"
      >
        A sua jornada de aprendizagem começa aqui — agora com descontos exclusivos! Promoção por tempo limitado!
      </div>

      {/* Main Navigation Row */}
      <div className="w-full max-w-7xl mx-auto h-20 px-4 md:px-8 flex items-center justify-between" id="header-nav-row">
        {/* Logo and Brand */}
        <button 
          className="flex items-center gap-2 cursor-pointer transition-colors duration-150 hover:opacity-90"
          onClick={() => {
            onViewChange("home");
            onSearchChange("");
          }}
          id="header-logo-btn"
        >
          <img 
            src="https://ik.imagekit.io/mdsiwq57o/CursaQI/Logotipo.png" 
            alt="CUrsaQi" 
            className="h-14 w-14 rounded-full object-cover border border-slate-200 shadow-xs shrink-0" 
            referrerPolicy="no-referrer"
            id="header-logo-image"
          />
        </button>

        {/* Central Search Bar (Desktop only) */}
        <div className="hidden md:flex relative max-w-sm w-full mx-6" id="header-search-wrapper">
          <input
            type="text"
            placeholder="Pesquisar por título de curso ou docente..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-sm text-sm focus:outline-hidden focus:ring-1 focus:ring-[#0d9488] focus:border-[#0d9488] placeholder-slate-400 font-sans"
            id="header-search-input"
          />
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" id="header-search-icon" />
          {searchQuery && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-[#0d9488] transition-colors"
              id="header-search-clear-btn"
            >
              Limpar
            </button>
          )}
        </div>

        {/* Action Widgets Group (Desktop) */}
        <div className="hidden lg:flex items-center gap-6" id="header-actions-desktop">
          <nav className="flex items-center gap-4 text-xs font-bold uppercase tracking-wider text-slate-600 font-sans mr-2" id="header-nav-links">
            <button
              onClick={() => {
                onViewChange("home");
                onSearchChange("");
              }}
              className={`pb-1 cursor-pointer transition-all border-b-2 ${
                (currentView === "home" || currentView === "dashboard") ? "border-[#0d9488] text-[#0d9488]" : "border-transparent text-slate-500 hover:text-[#0d9488]"
              }`}
              id="nav-home-btn"
            >
              Início
            </button>
            
            <button
              onClick={() => {
                onViewChange("courses");
                onSearchChange("");
              }}
              className={`pb-1 cursor-pointer transition-all border-b-2 ${
                currentView === "courses" ? "border-[#0d9488] text-[#0d9488]" : "border-transparent text-slate-500 hover:text-[#0d9488]"
              }`}
              id="nav-courses-btn"
            >
              Cursos
            </button>

            <button
              onClick={() => {
                onViewChange("about");
              }}
              className={`pb-1 cursor-pointer transition-all border-b-2 ${
                currentView === "about" ? "border-[#0d9488] text-[#0d9488]" : "border-transparent text-slate-500 hover:text-[#0d9488]"
              }`}
              id="nav-about-btn"
            >
              Sobre
            </button>

            <button
              onClick={() => {
                onViewChange("history");
              }}
              className={`pb-1 cursor-pointer transition-all border-b-2 ${
                currentView === "history" ? "border-[#0d9488] text-[#0d9488]" : "border-transparent text-slate-500 hover:text-[#0d9488]"
              }`}
              id="nav-history-btn"
            >
              Histórico
            </button>

            {userEmail && (
              <button
                onClick={() => {
                  onViewChange("payments");
                  onSearchChange("");
                }}
                className={`pb-1 cursor-pointer transition-all border-b-2 ${
                  currentView === "payments" ? "border-[#0d9488] text-[#0d9488]" : "border-transparent text-slate-500 hover:text-[#0d9488]"
                }`}
                id="nav-payments-btn"
              >
                Pagamentos
              </button>
            )}

            <button
              onClick={() => {
                onViewChange("profile");
              }}
              className={`pb-1 cursor-pointer transition-all border-b-2 ${
                currentView === "profile" ? "border-[#0d9488] text-[#0d9488]" : "border-transparent text-slate-500 hover:text-[#0d9488]"
              }`}
              id="nav-profile-btn"
            >
              Perfil
            </button>
          </nav>

          {/* Quick Stats: Wishlist */}
          <div className="flex items-center text-slate-600 gap-1" id="header-wishlist-indicator">
            <Heart className="h-5 w-5 text-slate-400" id="wishlist-icon" />
            <span className="text-xs bg-slate-100 text-slate-700 font-mono font-medium px-2 py-0.5 rounded-full" id="wishlist-count-badge">
              {wishlistCount}
            </span>
          </div>

          {/* Bell Notifications */}
          <button 
            onClick={onNotificationToggle}
            className="flex items-center text-slate-600 gap-1 hover:text-[#0d9488] relative cursor-pointer"
            id="header-notification-indicator"
            title="Abrir Central de Notificações"
          >
            <Bell className="h-5 w-5 text-slate-400 hover:text-slate-800 transition-colors" id="notification-bell-icon" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white text-[9px] font-mono leading-none font-bold px-1.5 py-0.5 rounded-full" id="notification-badge-unread">
                {unreadNotificationsCount}
              </span>
            )}
          </button>

          {/* Divider line */}
          <div className="h-6 w-[1px] bg-slate-200" id="header-divider-line" />

          {/* Auth Display Block (Guest Buttons or Logged User Profile) */}
          {userEmail ? (
            <div className="flex items-center gap-3.5" id="header-user-badge-container">
              <div className="flex items-center gap-2 cursor-pointer" onClick={() => onViewChange("profile")} id="header-user-badge">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 font-mono text-xs font-bold" id="user-avatar-circle">
                  <User className="h-4 w-4 text-slate-500" id="user-avatar-icon" />
                </div>
                <div className="flex flex-col text-left" id="user-info-text">
                  <span className="text-[10px] text-emerald-600 font-mono font-bold leading-none uppercase animate-pulse" id="user-role-label">Sessão Iniciada</span>
                  <span className="text-xs font-semibold text-slate-700 max-w-[145px] truncate font-sans mt-0.5" id="user-email-text" title={userEmail}>
                    {userEmail}
                  </span>
                </div>
              </div>
              <button
                onClick={onLogout}
                className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-slate-50 border border-slate-200 hover:border-red-200 rounded-sm transition-colors duration-150 flex items-center justify-center cursor-pointer"
                title="Sair / Encerrar Sessão"
                id="header-logout-btn"
              >
                <LogOut className="h-4 w-4" id="header-logout-icon" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2" id="header-auth-buttons">
              <button
                onClick={onLoginClick}
                className="text-xs font-bold uppercase tracking-wider text-slate-700 hover:text-[#0d9488] py-2 px-3 border border-slate-200 rounded-sm hover:border-[#0d9488] transition-colors cursor-pointer"
                id="header-login-btn"
              >
                Iniciar Sessão
              </button>
              <button
                onClick={onRegisterClick}
                className="text-xs font-bold uppercase tracking-wider bg-[#0a2540] hover:bg-[#0d9488] text-white py-2 px-3.5 rounded-sm transition-colors cursor-pointer"
                id="header-register-btn"
              >
                Criar Conta
              </button>
            </div>
          )}

          {/* Core Panel Trigger for Administrador Panel - ONLY visible if user is admin */}
          {isAdmin && (
            <button
              onClick={() => onViewChange(currentView === "admin" ? "home" : "admin")}
              className={`flex items-center gap-2 cursor-pointer text-xs font-bold uppercase tracking-wider py-2.5 px-4 rounded-sm transition-colors duration-150 shadow-xs ${
                currentView === "admin"
                  ? "bg-slate-700 text-white hover:bg-slate-800"
                  : "bg-[#0d9488] text-white hover:bg-[#0f766e]"
              }`}
              id="toggle-admin-btn"
            >
              <Settings className="h-4 w-4" id="toggle-admin-icon" />
              <span>{currentView === "admin" ? "Ver Website" : "Painel de Admin"}</span>
            </button>
          )}
        </div>

        {/* Mobile controls toggle */}
        <div className="flex lg:hidden items-center gap-3" id="header-mobile-controls">
          {/* Quick Wishlist mini widget */}
          <div className="flex items-center gap-1 mr-1" id="mobile-wishlist">
            <Heart className="h-5 w-5 text-slate-400" id="mobile-wishlist-icon" />
            <span className="text-xs font-mono font-bold text-[#0d9488]">{wishlistCount}</span>
          </div>

          {/* Mobile Bell notification button */}
          <button 
            onClick={onNotificationToggle}
            className="flex items-center gap-1 relative cursor-pointer"
            id="mobile-notification-btn"
          >
            <Bell className="h-5 w-5 text-slate-400" id="mobile-bell-icon" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute -top-1 -right-1.5 bg-rose-600 text-white text-[8px] font-mono leading-none font-bold px-1 py-0.5 rounded-full" id="mobile-notification-badge">
                {unreadNotificationsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1 text-slate-600 focus:outline-hidden hover:bg-slate-100 rounded-xs cursor-pointer"
            id="mobile-hamburger-btn"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6 text-slate-800" id="mobile-menu-close-icon" />
            ) : (
              <Menu className="h-6 w-6 text-slate-800" id="mobile-menu-open-icon" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Overlay Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden w-full bg-white border-t border-slate-100 pb-6 px-4 flex flex-col gap-4 animate-fade-in" id="header-mobile-drawer">
          {/* Mobile Search */}
          <div className="relative mt-3 w-full" id="mobile-search-wrapper">
            <input
              type="text"
              placeholder="Pesquisar por título de curso ou docente..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-sm text-sm focus:outline-hidden focus:ring-1 focus:ring-[#0d9488] focus:border-[#0d9488]"
              id="mobile-search-input"
            />
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" id="mobile-search-icon" />
          </div>

          {/* Navigation Links for Mobile */}
          <nav className="flex flex-col gap-3 font-sans text-sm font-semibold tracking-wide uppercase text-slate-700 text-left animate-fade-in" id="mobile-nav-links">
            <button
              onClick={() => {
                onViewChange("home");
                setMobileMenuOpen(false);
              }}
              className={`text-left py-2 border-b border-slate-50 ${
                (currentView === "home" || currentView === "dashboard") ? "text-[#0d9488]" : ""
              }`}
              id="mobile-nav-home"
            >
              Início
            </button>
            <button
              onClick={() => {
                onViewChange("courses");
                setMobileMenuOpen(false);
              }}
              className={`text-left py-2 border-b border-slate-50 ${
                currentView === "courses" ? "text-[#0d9488]" : ""
              }`}
              id="mobile-nav-courses"
            >
              Cursos
            </button>
            <button
              onClick={() => {
                onViewChange("about");
                setMobileMenuOpen(false);
              }}
              className={`text-left py-2 border-b border-slate-50 ${
                currentView === "about" ? "text-[#0d9488]" : ""
              }`}
              id="mobile-nav-about"
            >
              Sobre
            </button>
            <button
              onClick={() => {
                onViewChange("history");
                setMobileMenuOpen(false);
              }}
              className={`text-left py-2 border-b border-slate-50 ${
                currentView === "history" ? "text-[#0d9488]" : ""
              }`}
              id="mobile-nav-history"
            >
              Histórico
            </button>
            {userEmail && (
              <button
                onClick={() => {
                  onViewChange("payments");
                  setMobileMenuOpen(false);
                }}
                className={`text-left py-2 border-b border-slate-50 ${
                  currentView === "payments" ? "text-[#0d9488]" : ""
                }`}
                id="mobile-nav-payments"
              >
                Pagamentos
              </button>
            )}
            <button
              onClick={() => {
                onViewChange("profile");
                setMobileMenuOpen(false);
              }}
              className={`text-left py-2 border-b border-slate-50 ${
                currentView === "profile" ? "text-[#0d9488]" : ""
              }`}
              id="mobile-nav-profile"
            >
              Perfil
            </button>

            {isAdmin && (
              <button
                onClick={() => {
                  onViewChange("admin");
                  setMobileMenuOpen(false);
                }}
                className={`text-left py-2 border-b border-slate-50 font-bold flex items-center gap-2 ${
                  currentView === "admin" ? "text-slate-900" : "text-[#0d9488]"
                }`}
                id="mobile-nav-admin"
              >
                <Settings className="h-4 w-4 text-slate-600" />
                Painel do Administrador
              </button>
            )}
          </nav>

           {/* Mobile Auth displaying (Guest or Logged User) */}
          {userEmail ? (
            <div className="bg-slate-50 p-3.5 rounded-sm text-xs mt-2 text-left flex items-center justify-between" id="mobile-user-card">
              <div>
                <div className="text-slate-400 uppercase font-mono tracking-wider font-semibold">Conta Académica</div>
                <div className="font-semibold text-slate-700 mt-1 font-mono break-all" id="mobile-user-email">{userEmail}</div>
              </div>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (onLogout) onLogout();
                }}
                className="p-2 border border-slate-200 rounded-sm hover:bg-slate-100 hover:text-red-600 text-slate-500 transition-colors duration-150 flex items-center justify-center cursor-pointer"
                title="Sair / Encerrar Sessão"
                id="mobile-logout-btn"
              >
                <LogOut className="h-4 w-4" id="mobile-logout-icon" />
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 mt-2" id="mobile-auth-actions-group">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (onLoginClick) onLoginClick();
                }}
                className="w-full text-center text-xs font-bold uppercase tracking-wider text-slate-700 py-3 border border-slate-200 rounded-sm hover:border-[#0d9488]"
                id="mobile-login-btn"
              >
                Iniciar Sessão
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (onRegisterClick) onRegisterClick();
                }}
                className="w-full text-center text-xs font-bold uppercase tracking-wider bg-[#0a2540] text-white py-3 rounded-sm"
                id="mobile-register-btn"
              >
                Criar Conta
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
