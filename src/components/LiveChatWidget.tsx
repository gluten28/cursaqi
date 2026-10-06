import React, { useState, useEffect, useRef } from "react";
import { 
  Bot, 
  X, 
  Send, 
  MessageSquare, 
  HelpCircle, 
  Lightbulb, 
  MessageCircle, 
  ShieldCheck, 
  Sparkles, 
  RotateCw,
  User,
  CheckCircle2,
  Minimize2,
  Maximize2
} from "lucide-react";
import { ChatMessage, ChatCategory, UserProfile } from "../types";
import { dbGetChatMessages, dbSendChatMessage, dbSubscribeToChat } from "../supabase";

interface LiveChatWidgetProps {
  currentUser: UserProfile | null;
  onRequireAuth?: () => void;
}

const CATEGORY_CONFIG: Record<ChatCategory, { label: string; icon: React.ReactNode; color: string; badge: string }> = {
  ideia: {
    label: "Ideia",
    icon: <Lightbulb className="h-3 w-3 text-amber-500" />,
    color: "bg-amber-50 text-amber-800 border-amber-200",
    badge: "💡 Ideia"
  },
  pergunta: {
    label: "Dúvida",
    icon: <HelpCircle className="h-3 w-3 text-sky-500" />,
    color: "bg-sky-50 text-sky-800 border-sky-200",
    badge: "❓ Dúvida"
  },
  sugestao: {
    label: "Sugestão",
    icon: <MessageCircle className="h-3 w-3 text-emerald-500" />,
    color: "bg-emerald-50 text-emerald-800 border-emerald-200",
    badge: "💬 Sugestão"
  },
  ajuda: {
    label: "Ajuda",
    icon: <MessageSquare className="h-3 w-3 text-rose-500" />,
    color: "bg-rose-50 text-rose-800 border-rose-200",
    badge: "🆘 Ajuda"
  },
  geral: {
    label: "Geral",
    icon: <Sparkles className="h-3 w-3 text-teal-600" />,
    color: "bg-slate-100 text-slate-700 border-slate-200",
    badge: "📢 Geral"
  }
};

export default function LiveChatWidget({ currentUser, onRequireAuth }: LiveChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<ChatCategory>("geral");
  const [filterCategory, setFilterCategory] = useState<ChatCategory | "todas">("todas");
  const [guestName, setGuestName] = useState(() => {
    try {
      return localStorage.getItem("cursaqi_chat_guest_name") || "";
    } catch {
      return "";
    }
  });
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Load initial messages
  const loadMessages = async () => {
    setIsLoading(true);
    try {
      const data = await dbGetChatMessages();
      setMessages(data);
    } catch (err) {
      console.error("Erro ao carregar mensagens:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();

    // Subscribe to realtime changes
    const unsubscribe = dbSubscribeToChat((newMsg) => {
      setMessages((prev) => {
        // Prevent duplicate if already in state
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

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, filterCategory]);

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
      // Check if Formador Aldo Valige
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
          localStorage.setItem("cursaqi_chat_guest_name", trimmedGuest);
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
        category: selectedCategory
      });

      if (created) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === created.id)) return prev;
          return [...prev, created];
        });
        setInputMessage("");
      }
    } catch (err) {
      console.error("Erro ao enviar mensagem:", err);
    } finally {
      setIsSending(false);
    }
  };

  const filteredMessages = filterCategory === "todas"
    ? messages
    : messages.filter((m) => m.category === filterCategory);

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
      {/* Floating Trigger Button with Robot Icon */}
      <div className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-40 flex flex-col items-end">
        {/* Unread Message Tooltip Bubble if closed and unread */}
        {!isOpen && unreadCount > 0 && (
          <div className="mb-2 bg-[#0a2540] text-white text-xs px-3 py-1.5 rounded-full shadow-lg border border-teal-500/30 flex items-center gap-1.5 animate-bounce">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>{unreadCount} nova{unreadCount > 1 ? "s" : ""} mensagem{unreadCount > 1 ? "s" : ""}</span>
          </div>
        )}

        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`group relative flex items-center gap-2.5 px-4 py-3 sm:px-5 sm:py-3.5 rounded-full shadow-2xl transition-all duration-300 cursor-pointer ${
            isOpen 
              ? "bg-[#0a2540] text-white hover:bg-slate-850 ring-2 ring-teal-500/50" 
              : "bg-linear-to-r from-[#0d9488] to-[#0f766e] text-white hover:shadow-teal-500/30 hover:scale-105"
          }`}
          aria-label="Abrir Chat de Suporte com Robô"
          title="Chat da Comunidade & Suporte em Tempo Real"
          id="live-chat-toggle-button"
        >
          {/* Pulsing indicator */}
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-400"></span>
          </span>

          {/* Robot Icon */}
          <div className="relative">
            <Bot className="h-6 w-6 stroke-[2.2] transition-transform group-hover:rotate-6" />
          </div>

          <span className="font-sans font-bold text-xs uppercase tracking-wider hidden sm:inline">
            {isOpen ? "Fechar Chat" : "Chat ao Vivo"}
          </span>

          {/* Badge count */}
          {!isOpen && unreadCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[10px] font-mono font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* Chat Window Panel */}
      {isOpen && (
        <div 
          className="fixed bottom-20 right-4 sm:bottom-24 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[410px] h-[580px] max-h-[82vh] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-fade-in font-sans"
          id="live-chat-window-panel"
        >
          {/* Header */}
          <div className="bg-[#0a2540] text-white p-4 flex items-center justify-between border-b border-slate-700/50 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-400/40 flex items-center justify-center text-teal-300 relative shadow-inner">
                <Bot className="h-6 w-6 text-teal-300" />
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#0a2540]" />
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1.5">
                  <h3 className="font-display font-bold text-sm tracking-tight text-white leading-none">
                    Suporte & Comunidade CUrsaQi
                  </h3>
                </div>
                <p className="text-[11px] text-slate-300 font-sans mt-1 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Chat aberto em tempo real
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={loadMessages}
                disabled={isLoading}
                title="Actualizar mensagens"
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              >
                <RotateCw className={`h-4 w-4 ${isLoading ? "animate-spin text-teal-400" : ""}`} />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                title="Fechar chat"
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Subtitle / Welcome pill notice */}
          <div className="bg-slate-50 border-b border-slate-200 px-3.5 py-2 text-left flex items-center justify-between gap-2">
            <span className="text-[10.5px] text-slate-600 leading-tight">
              💬 Deixe aqui a sua <strong>ideia</strong>, <strong>dúvida</strong>, <strong>sugestão</strong> ou <strong>peça ajuda</strong>.
            </span>
            <span className="text-[9px] font-mono uppercase bg-teal-50 text-teal-800 border border-teal-200 px-2 py-0.5 rounded-full font-bold shrink-0">
              Público
            </span>
          </div>

          {/* Category Filter Chips */}
          <div className="bg-white border-b border-slate-100 px-3 py-2 flex items-center gap-1.5 overflow-x-auto text-xs no-scrollbar">
            <button
              onClick={() => setFilterCategory("todas")}
              className={`px-2.5 py-1 rounded-full text-[10.5px] font-semibold transition-all shrink-0 cursor-pointer ${
                filterCategory === "todas"
                  ? "bg-[#0a2540] text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Todas ({messages.length})
            </button>
            {(["ideia", "pergunta", "sugestao", "ajuda", "geral"] as ChatCategory[]).map((cat) => {
              const cfg = CATEGORY_CONFIG[cat];
              const count = messages.filter((m) => m.category === cat).length;
              return (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={`px-2.5 py-1 rounded-full text-[10.5px] font-semibold transition-all flex items-center gap-1 shrink-0 cursor-pointer ${
                    filterCategory === cat
                      ? "bg-[#0d9488] text-white shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  <span>{cfg.badge}</span>
                  {count > 0 && <span className="opacity-75 font-mono text-[9px]">({count})</span>}
                </button>
              );
            })}
          </div>

          {/* Message List */}
          <div 
            ref={messagesContainerRef}
            className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/60 text-left text-xs"
          >
            {filteredMessages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 space-y-2">
                <Bot className="h-10 w-10 text-slate-300 stroke-1" />
                <p className="text-xs font-semibold text-slate-600">Nenhuma mensagem nesta categoria ainda.</p>
                <p className="text-[11px] text-slate-400 max-w-xs">Seja o primeiro a deixar uma pergunta ou sugestão para o Formador Aldo Valige e a comunidade!</p>
              </div>
            ) : (
              filteredMessages.map((msg) => {
                const isFormador = msg.authorRole === "formador";
                const isAdmin = msg.authorRole === "admin";
                const isCurrentUser = currentUser && msg.userId === currentUser.id;
                const catCfg = CATEGORY_CONFIG[msg.category] || CATEGORY_CONFIG.geral;

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col space-y-1 ${
                      isFormador
                        ? "bg-teal-50/80 border border-teal-200/90 rounded-xl p-3 shadow-2xs"
                        : "bg-white border border-slate-200 rounded-xl p-3 shadow-2xs"
                    }`}
                  >
                    {/* Author Meta Line */}
                    <div className="flex items-center justify-between gap-2 border-b border-slate-100/80 pb-1.5 mb-1">
                      <div className="flex items-center gap-1.5 min-w-0">
                        {isFormador ? (
                          <div className="w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center shrink-0">
                            <ShieldCheck className="h-3.5 w-3.5" />
                          </div>
                        ) : isAdmin ? (
                          <div className="w-5 h-5 rounded-full bg-slate-800 text-white flex items-center justify-center shrink-0">
                            <Bot className="h-3 w-3" />
                          </div>
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center shrink-0">
                            <User className="h-3 w-3" />
                          </div>
                        )}

                        <span className={`font-bold truncate text-[11.5px] ${isFormador ? "text-teal-900" : "text-slate-800"}`}>
                          {msg.authorName}
                        </span>

                        {/* Role Badges */}
                        {isFormador && (
                          <span className="bg-teal-600 text-white text-[9px] font-mono font-bold uppercase px-1.5 py-0.2 rounded-xs shrink-0">
                            Formador
                          </span>
                        )}
                        {isAdmin && !isFormador && (
                          <span className="bg-slate-700 text-white text-[9px] font-mono font-bold uppercase px-1.5 py-0.2 rounded-xs shrink-0">
                            Suporte
                          </span>
                        )}
                        {msg.authorRole === "aluno" && (
                          <span className="bg-sky-100 text-sky-850 text-[9px] font-mono font-bold uppercase px-1.5 py-0.2 rounded-xs shrink-0">
                            Estudante
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {/* Category badge */}
                        <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded-full border ${catCfg.color}`}>
                          {catCfg.badge}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {formatMessageTime(msg.createdAt)}
                        </span>
                      </div>
                    </div>

                    {/* Message Body */}
                    <p className="text-slate-750 text-[12px] leading-relaxed whitespace-pre-wrap break-words font-sans">
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
            
            {/* Top row: Category selector & Guest identity */}
            <div className="flex items-center justify-between gap-2 text-xs">
              {/* Category picker */}
              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mr-0.5">Tipo:</span>
                {(["geral", "pergunta", "ideia", "sugestao", "ajuda"] as ChatCategory[]).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2 py-0.5 rounded-full text-[10px] font-semibold transition-all cursor-pointer ${
                      selectedCategory === cat
                        ? "bg-[#0d9488] text-white shadow-2xs"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {CATEGORY_CONFIG[cat].label}
                  </button>
                ))}
              </div>

              {/* Identity indicator / guest name */}
              {currentUser ? (
                <div className="flex items-center gap-1 text-[10.5px] text-teal-700 font-medium shrink-0">
                  <CheckCircle2 className="h-3 w-3 text-teal-600" />
                  <span className="truncate max-w-[100px]">{currentUser.fullName.split(" ")[0]}</span>
                </div>
              ) : (
                <input
                  type="text"
                  placeholder="Seu nome..."
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="px-2 py-0.5 text-[10.5px] border border-slate-200 rounded-sm w-24 sm:w-28 focus:outline-hidden focus:border-teal-500 font-sans"
                  title="Identifique-se como visitante"
                />
              )}
            </div>

            {/* Input Message Text Area / Send Button */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Escreva a sua dúvida, sugestão ou ideia..."
                disabled={isSending}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:bg-white focus:border-[#0d9488] transition-all font-sans"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || isSending}
                className="bg-[#0d9488] hover:bg-[#0f766e] disabled:opacity-40 disabled:hover:bg-[#0d9488] text-white p-2.5 rounded-xl transition-all shadow-sm cursor-pointer flex items-center justify-center shrink-0"
                title="Enviar mensagem"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>

            {/* Helpful footer hint */}
            <div className="flex items-center justify-between text-[9.5px] text-slate-400 pt-0.5">
              <span>Mensagens públicas abertas a todos os estudantes.</span>
              {!currentUser && onRequireAuth && (
                <button
                  type="button"
                  onClick={onRequireAuth}
                  className="text-[#0d9488] font-bold hover:underline cursor-pointer"
                >
                  Entrar com conta
                </button>
              )}
            </div>
          </form>
        </div>
      )}
    </>
  );
}
