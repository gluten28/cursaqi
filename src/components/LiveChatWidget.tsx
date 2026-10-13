import React, { useState, useEffect, useRef } from "react";
import { 
  X, 
  Send, 
  MessageCircle, 
  ShieldCheck, 
  RotateCw,
  User,
  CheckCircle2,
  Headphones,
  ExternalLink,
  Clock
} from "lucide-react";
import { ChatMessage, UserProfile } from "../types";
import { dbGetChatMessages, dbSendChatMessage, dbSubscribeToChat } from "../supabase";

interface LiveChatWidgetProps {
  currentUser: UserProfile | null;
  onRequireAuth?: () => void;
}

export default function LiveChatWidget({ currentUser, onRequireAuth }: LiveChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [guestName, setGuestName] = useState(() => {
    try {
      return localStorage.getItem("cursaqi_support_guest_name") || "";
    } catch {
      return "";
    }
  });
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Load initial support messages
  const loadMessages = async () => {
    setIsLoading(true);
    try {
      const allMsgs = await dbGetChatMessages();
      // Filter exclusively support messages
      const supportOnly = allMsgs.filter((m) => m.category === "suporte");
      setMessages(supportOnly);
    } catch (err) {
      console.error("Erro ao carregar mensagens de suporte:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();

    // Subscribe to realtime changes
    const unsubscribe = dbSubscribeToChat((newMsg) => {
      // Only process support messages
      if (newMsg.category !== "suporte") return;

      setMessages((prev) => {
        if (prev.some((m) => m.id === newMsg.id)) return prev;
        return [...prev, newMsg];
      });

      if (!isOpen) {
        setUnreadCount((c) => c + 1);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Reset unread count when opening
  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
      scrollToBottom();
    }
  }, [isOpen]);

  // Auto-scroll on new message
  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages]);

  const scrollToBottom = () => {
    setTimeout(() => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }, 100);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = inputMessage.trim();
    if (!text || isSending) return;

    // Determine author name & role
    let authorName = "Visitante";
    let authorRole: ChatMessage["authorRole"] = "visitante";

    if (currentUser) {
      authorName = currentUser.fullName || currentUser.email.split("@")[0];
      if (
        currentUser.email.toLowerCase().includes("valige") || 
        currentUser.fullName.toLowerCase().includes("valige") ||
        currentUser.role === "admin"
      ) {
        authorRole = "formador";
      } else {
        authorRole = "aluno";
      }
    } else {
      const trimmedGuest = guestName.trim();
      if (trimmedGuest) {
        authorName = trimmedGuest;
        try {
          localStorage.setItem("cursaqi_support_guest_name", trimmedGuest);
        } catch {}
      } else {
        authorName = "Visitante";
      }
    }

    setIsSending(true);

    try {
      const created = await dbSendChatMessage({
        userId: currentUser?.id,
        authorName,
        authorRole,
        message: text,
        category: "suporte" // Exclusively for support!
      });

      if (created) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === created.id)) return prev;
          return [...prev, created];
        });
        setInputMessage("");
      }
    } catch (err) {
      console.error("Erro ao enviar mensagem para suporte:", err);
    } finally {
      setIsSending(false);
    }
  };

  const formatMessageTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return "";
      const now = new Date();
      const isToday = date.toDateString() === now.toDateString();
      const hours = date.getHours().toString().padStart(2, "0");
      const minutes = date.getMinutes().toString().padStart(2, "0");
      if (isToday) {
        return `${hours}:${minutes}`;
      }
      return `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1).toString().padStart(2, "0")} ${hours}:${minutes}`;
    } catch {
      return "";
    }
  };

  return (
    <>
      {/* Floating Trigger Button with WhatsApp Green Color - Exclusive for Support */}
      <div className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-40 flex flex-col items-end">
        {/* Unread Message Tooltip Bubble if closed and unread */}
        {!isOpen && unreadCount > 0 && (
          <div className="mb-2 bg-[#0a2540] text-white text-xs px-3 py-1.5 rounded-full shadow-lg border border-[#25D366]/40 flex items-center gap-1.5 animate-bounce">
            <span className="w-2 h-2 rounded-full bg-[#25D366] animate-ping" />
            <span>{unreadCount} nova{unreadCount > 1 ? "s" : ""} resposta{unreadCount > 1 ? "s" : ""} de suporte</span>
          </div>
        )}

        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`group relative flex items-center gap-2.5 px-4 py-3 sm:px-5 sm:py-3.5 rounded-full shadow-2xl transition-all duration-300 cursor-pointer ${
            isOpen 
              ? "bg-[#0a2540] text-white hover:bg-slate-900 ring-2 ring-[#25D366]/60" 
              : "bg-[#25D366] hover:bg-[#20ba59] text-white hover:shadow-emerald-500/40 hover:scale-105 active:scale-95"
          }`}
          aria-label={isOpen ? "Fechar FalaQI" : "Abrir FalaQI - Suporte"}
          title="FalaQI - Suporte CUrsaQi"
          id="whatsapp-support-floating-button"
        >
          {/* Pulsing indicator */}
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
          </span>

          {/* Person Icon */}
          <div className="relative">
            <User className="h-6 w-6 stroke-[2.4] transition-transform group-hover:scale-110" />
          </div>

          <span className="font-sans font-bold text-xs uppercase tracking-wider hidden sm:inline">
            {isOpen ? "Fechar" : "FalaQI"}
          </span>

          {/* Badge count */}
          {!isOpen && unreadCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white text-[10px] font-mono font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* Support Chat Window Panel */}
      {isOpen && (
        <div 
          className="fixed bottom-20 right-4 sm:bottom-24 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[410px] h-[580px] max-h-[82vh] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-fade-in font-sans"
          id="whatsapp-support-window-panel"
        >
          {/* WhatsApp Header */}
          <div className="bg-[#075E54] text-white p-4 flex items-center justify-between border-b border-[#128C7E] shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#128C7E] border-2 border-[#25D366] flex items-center justify-center text-white relative shadow-inner">
                <User className="h-5 w-5" />
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-[#25D366] border-2 border-[#075E54]" />
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1.5">
                  <h3 className="font-display font-bold text-sm tracking-tight text-white leading-none">
                    FalaQI • Suporte
                  </h3>
                </div>
                <p className="text-[11px] text-emerald-100 font-sans mt-1 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#25D366] animate-pulse" />
                  Atendimento Oficial • Resposta rápida
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={loadMessages}
                disabled={isLoading}
                title="Actualizar mensagens"
                className="p-1.5 text-emerald-200 hover:text-white hover:bg-[#128C7E] rounded-lg transition-colors cursor-pointer"
              >
                <RotateCw className={`h-4 w-4 ${isLoading ? "animate-spin text-white" : ""}`} />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                title="Fechar suporte"
                className="p-1.5 text-emerald-200 hover:text-white hover:bg-[#128C7E] rounded-lg transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Direct WhatsApp Callout Banner */}
          <div className="bg-[#25D366]/10 border-b border-[#25D366]/30 px-3.5 py-2.5 text-left flex items-center justify-between gap-2">
            <div className="text-[11px] text-slate-700 leading-tight">
              Precisa de ajuda imediata para matrícula ou pagamentos?
            </div>
            <a
              href="https://wa.me/258873308934?text=Ol%C3%A1%20Formador%20Aldo%20Valige!%20Preciso%20de%20ajuda%20no%20suporte%20da%20CUrsaQi."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 bg-[#25D366] hover:bg-[#20ba59] text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-md shadow-xs transition-colors shrink-0 cursor-pointer"
            >
              <MessageCircle className="h-3 w-3" />
              <span>Abrir WhatsApp</span>
              <ExternalLink className="h-2.5 w-2.5" />
            </a>
          </div>

          {/* Support Message List */}
          <div 
            ref={messagesContainerRef}
            className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#e5ddd5]/30 text-left text-xs"
          >
            {/* Introductory welcoming card from Support */}
            <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs space-y-1">
              <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-xs pb-1 border-b border-slate-100">
                <ShieldCheck className="h-4 w-4 text-[#25D366]" />
                <span>Canal de Atendimento ao Estudante</span>
              </div>
              <p className="text-slate-600 text-[11.5px] leading-relaxed font-sans pt-1">
                Olá! Envie aqui a sua dúvida referente a cursos, pagamentos M-Pesa/e-Mola ou suporte com a plataforma. As mensagens são enviadas diretamente à equipa administrativa.
              </p>
            </div>

            {messages.length === 0 ? (
              <div className="py-8 flex flex-col items-center justify-center text-center text-slate-400 space-y-2">
                <MessageCircle className="h-8 w-8 text-[#25D366]/60" />
                <p className="text-xs font-semibold text-slate-600">Nenhuma mensagem de suporte ainda.</p>
                <p className="text-[11px] text-slate-400 max-w-xs">
                  Escreva abaixo a sua dúvida ou clique no botão acima para falar no WhatsApp!
                </p>
              </div>
            ) : (
              messages.map((msg) => {
                const isFormador = msg.authorRole === "formador";
                const isAdmin = msg.authorRole === "admin";
                const isFromTeam = isFormador || isAdmin;

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col space-y-1 max-w-[90%] rounded-xl p-3 shadow-2xs ${
                      isFromTeam
                        ? "mr-auto bg-white border border-emerald-200"
                        : "ml-auto bg-[#dcf8c6] border border-[#c2e8a6] text-right"
                    }`}
                  >
                    {/* Author Meta Line */}
                    <div className="flex items-center justify-between gap-2 border-b border-black/5 pb-1 mb-1">
                      <div className="flex items-center gap-1.5 min-w-0">
                        {isFromTeam ? (
                          <div className="w-4 h-4 rounded-full bg-[#075E54] text-white flex items-center justify-center shrink-0">
                            <ShieldCheck className="h-2.5 w-2.5" />
                          </div>
                        ) : (
                          <div className="w-4 h-4 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center shrink-0">
                            <User className="h-2.5 w-2.5" />
                          </div>
                        )}

                        <span className={`font-bold truncate text-[11px] ${isFromTeam ? "text-[#075E54]" : "text-slate-800"}`}>
                          {msg.authorName}
                        </span>

                        {isFromTeam && (
                          <span className="bg-[#075E54] text-white text-[8.5px] font-mono font-bold uppercase px-1.5 py-0.2 rounded-xs shrink-0">
                            Equipa
                          </span>
                        )}
                      </div>

                      <span className="text-[9.5px] text-slate-500 font-mono">
                        {formatMessageTime(msg.createdAt)}
                      </span>
                    </div>

                    {/* Message Body */}
                    <p className={`text-[12px] leading-relaxed whitespace-pre-wrap break-words font-sans text-left ${
                      isFromTeam ? "text-slate-800" : "text-slate-900"
                    }`}>
                      {msg.message}
                    </p>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input & Form Area */}
          <form onSubmit={handleSendMessage} className="bg-white border-t border-slate-200 p-3 space-y-2">
            
            {/* Top row: Identity indicator / guest name */}
            <div className="flex items-center justify-between gap-2 text-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                Identificação:
              </span>

              {currentUser ? (
                <div className="flex items-center gap-1 text-[11px] text-[#075E54] font-medium shrink-0">
                  <CheckCircle2 className="h-3 w-3 text-[#25D366]" />
                  <span className="truncate max-w-[150px]">{currentUser.fullName}</span>
                </div>
              ) : (
                <input
                  type="text"
                  placeholder="Seu nome..."
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="px-2 py-0.5 text-[11px] border border-slate-200 rounded-sm w-36 focus:outline-hidden focus:border-[#25D366] font-sans"
                  title="Identifique-se para o suporte"
                />
              )}
            </div>

            {/* Input Message Text Area / Send Button */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Descreva a sua dúvida para o suporte..."
                disabled={isSending}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:bg-white focus:border-[#25D366] transition-all font-sans"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || isSending}
                className="bg-[#25D366] hover:bg-[#20ba59] disabled:opacity-40 text-white p-2.5 rounded-xl transition-all shadow-sm cursor-pointer flex items-center justify-center shrink-0"
                title="Enviar para o suporte"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>

            {/* Helpful footer hint */}
            <div className="flex items-center justify-between text-[9.5px] text-slate-400 pt-0.5">
              <span>Canal direto com a equipa da CUrsaQi.</span>
              <a
                href="https://wa.me/258873308934"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#075E54] font-bold hover:underline flex items-center gap-0.5"
              >
                WhatsApp Oficial
              </a>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
