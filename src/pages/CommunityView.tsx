import React, { useState, useEffect, useRef } from "react";
import { 
  Users, 
  Send, 
  Lightbulb, 
  HelpCircle, 
  MessageCircle, 
  MessageSquare, 
  Sparkles, 
  ShieldCheck, 
  RotateCw, 
  User, 
  CheckCircle2, 
  LogIn
} from "lucide-react";
import { ChatMessage, ChatCategory, UserProfile } from "../types";
import { dbGetChatMessages, dbSendChatMessage, dbSubscribeToChat } from "../supabase";

interface CommunityViewProps {
  currentUser: UserProfile | null;
  onRequireAuth?: () => void;
}

const CATEGORY_CONFIG: Record<Exclude<ChatCategory, "suporte">, { label: string; icon: React.ReactNode; color: string; badge: string }> = {
  geral: {
    label: "Geral",
    icon: <Sparkles className="h-3.5 w-3.5 text-teal-600" />,
    color: "bg-teal-50 text-teal-800 border-teal-200",
    badge: "📢 Geral"
  },
  pergunta: {
    label: "Dúvidas",
    icon: <HelpCircle className="h-3.5 w-3.5 text-sky-500" />,
    color: "bg-sky-50 text-sky-800 border-sky-200",
    badge: "❓ Dúvidas"
  },
  ideia: {
    label: "Ideias",
    icon: <Lightbulb className="h-3.5 w-3.5 text-amber-500" />,
    color: "bg-amber-50 text-amber-800 border-amber-200",
    badge: "💡 Ideias"
  },
  sugestao: {
    label: "Sugestões",
    icon: <MessageCircle className="h-3.5 w-3.5 text-emerald-500" />,
    color: "bg-emerald-50 text-emerald-800 border-emerald-200",
    badge: "💬 Sugestões"
  },
  ajuda: {
    label: "Ajuda",
    icon: <MessageSquare className="h-3.5 w-3.5 text-rose-500" />,
    color: "bg-rose-50 text-rose-800 border-rose-200",
    badge: "🆘 Ajuda"
  }
};

export default function CommunityView({ currentUser, onRequireAuth }: CommunityViewProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<Exclude<ChatCategory, "suporte">>("geral");
  const [filterCategory, setFilterCategory] = useState<Exclude<ChatCategory, "suporte"> | "todas">("todas");
  const [guestName, setGuestName] = useState(() => {
    try {
      return localStorage.getItem("cursaqi_chat_guest_name") || "";
    } catch {
      return "";
    }
  });
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load initial community messages (excluding support messages)
  const loadMessages = async () => {
    setIsLoading(true);
    try {
      const allMsgs = await dbGetChatMessages();
      // Community only: filter out support messages
      const communityOnly = allMsgs.filter((m) => m.category !== "suporte");
      setMessages(communityOnly);
    } catch (err) {
      console.error("Erro ao carregar mensagens da comunidade:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();

    // Subscribe to realtime changes
    const unsubscribe = dbSubscribeToChat((newMsg) => {
      // Ignore support messages on community page
      if (newMsg.category === "suporte") return;

      setMessages((prev) => {
        if (prev.some((m) => m.id === newMsg.id)) return prev;
        return [...prev, newMsg];
      });
    });

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
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
      console.error("Erro ao enviar mensagem para a comunidade:", err);
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
        return `Hoje às ${hours}:${minutes}`;
      }
      return `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1).toString().padStart(2, "0")} • ${hours}:${minutes}`;
    } catch {
      return "";
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-8 py-8 font-sans" id="community-view-root">
      {/* Page Header */}
      <div className="bg-[#0a2540] text-white rounded-2xl p-6 md:p-8 border border-slate-800 shadow-xl mb-6 relative overflow-hidden text-left">
        <div className="absolute top-0 right-0 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 bg-[#0d9488]/90 text-white text-[10px] font-mono font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-sm">
                <Users className="h-3 w-3" />
                Comunidade Acadêmica
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-400 font-bold bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                Em Tempo Real
              </span>
            </div>

            <h1 className="font-display text-2xl md:text-3.5xl font-bold tracking-tight text-white">
              Comunidade e Fórum de Aprendizagem CUrsaQi
            </h1>
            <p className="text-xs md:text-sm text-slate-300 font-sans leading-relaxed">
              Tire dúvidas de informática, compartilhe ideias, debata programação e conecte-se diretamente com o Formador Aldo Valige e outros estudantes.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadMessages}
              disabled={isLoading}
              className="inline-flex items-center gap-2 bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-4 py-2.5 rounded-xl border border-slate-700 transition-colors cursor-pointer"
            >
              <RotateCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin text-teal-400" : ""}`} />
              <span>Actualizar Fórum</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Layout Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden flex flex-col h-[700px]">
        
        {/* Category Filters Top Bar */}
        <div className="bg-slate-50 border-b border-slate-200 p-3 sm:px-6 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setFilterCategory("todas")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filterCategory === "todas"
                  ? "bg-[#0a2540] text-white shadow-xs"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              Todas as Mensagens ({messages.length})
            </button>
            {(["geral", "pergunta", "ideia", "sugestao", "ajuda"] as const).map((cat) => {
              const cfg = CATEGORY_CONFIG[cat];
              const count = messages.filter((m) => m.category === cat).length;
              return (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    filterCategory === cat
                      ? "bg-[#0d9488] text-white shadow-xs"
                      : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                  }`}
                >
                  <span>{cfg.badge}</span>
                  {count > 0 && <span className="opacity-80 text-[10px] font-mono">({count})</span>}
                </button>
              );
            })}
          </div>

          <span className="text-[11px] text-slate-500 font-mono hidden md:inline">
            Canal Aberto • Todas as dúvidas são públicas
          </span>
        </div>

        {/* Message Feed */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/50 text-left">
          {filteredMessages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400 space-y-3">
              <div className="w-16 h-16 rounded-full bg-teal-50 border border-teal-200 flex items-center justify-center text-[#0d9488]">
                <Users className="h-8 w-8" />
              </div>
              <h3 className="font-bold text-slate-700 text-sm">Nenhuma publicação nesta categoria ainda</h3>
              <p className="text-xs text-slate-400 max-w-sm">
                Seja a primeira pessoa a deixar uma questão, compartilhar uma ideia ou sugerir novos temas de aula para a turma!
              </p>
            </div>
          ) : (
            filteredMessages.map((msg) => {
              const isFormador = msg.authorRole === "formador";
              const isAdmin = msg.authorRole === "admin";
              const catCfg = CATEGORY_CONFIG[(msg.category as Exclude<ChatCategory, "suporte">)] || CATEGORY_CONFIG.geral;

              return (
                <div
                  key={msg.id}
                  className={`rounded-2xl p-4 sm:p-5 shadow-xs transition-all ${
                    isFormador
                      ? "bg-teal-50/90 border-2 border-teal-300"
                      : "bg-white border border-slate-200 hover:border-slate-300"
                  }`}
                >
                  {/* Message Meta Header */}
                  <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-2.5 mb-2.5">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-bold font-mono text-xs ${
                        isFormador 
                          ? "bg-teal-600 text-white shadow-xs" 
                          : isAdmin 
                            ? "bg-slate-800 text-white" 
                            : "bg-slate-100 text-slate-700 border border-slate-200"
                      }`}>
                        {isFormador ? (
                          <ShieldCheck className="h-4 w-4" />
                        ) : (
                          msg.authorName.slice(0, 2).toUpperCase()
                        )}
                      </div>

                      <div className="flex flex-col min-w-0 text-left">
                        <div className="flex items-center gap-2">
                          <span className={`font-bold text-xs sm:text-sm truncate ${isFormador ? "text-teal-950 font-display" : "text-slate-800"}`}>
                            {msg.authorName}
                          </span>
                          {isFormador && (
                            <span className="bg-teal-600 text-white text-[9.5px] font-mono font-bold uppercase px-2 py-0.5 rounded-full shrink-0">
                              Formador Oficial
                            </span>
                          )}
                          {isAdmin && !isFormador && (
                            <span className="bg-slate-700 text-white text-[9.5px] font-mono font-bold uppercase px-2 py-0.5 rounded-full shrink-0">
                              Administrador
                            </span>
                          )}
                          {msg.authorRole === "aluno" && (
                            <span className="bg-sky-100 text-sky-800 text-[9.5px] font-mono font-bold uppercase px-2 py-0.5 rounded-full shrink-0">
                              Estudante
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {formatMessageTime(msg.createdAt)}
                        </span>
                      </div>
                    </div>

                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${catCfg.color}`}>
                      {catCfg.badge}
                    </span>
                  </div>

                  {/* Message Content */}
                  <p className="text-slate-750 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap break-words font-sans">
                    {msg.message}
                  </p>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Composer */}
        <form onSubmit={handleSendMessage} className="bg-white border-t border-slate-200 p-4 sm:p-5 space-y-3">
          
          {/* Top Row: Category Picker & Identity */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10.5px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                Categoria da mensagem:
              </span>
              {(["geral", "pergunta", "ideia", "sugestao", "ajuda"] as const).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    selectedCategory === cat
                      ? "bg-[#0d9488] text-white shadow-2xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {CATEGORY_CONFIG[cat].label}
                </button>
              ))}
            </div>

            {/* Author info */}
            {currentUser ? (
              <div className="flex items-center gap-1.5 text-xs text-teal-700 font-semibold shrink-0">
                <CheckCircle2 className="h-4 w-4 text-teal-600" />
                <span>Identificado como <strong>{currentUser.fullName}</strong></span>
              </div>
            ) : (
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <input
                  type="text"
                  placeholder="Seu nome (visitante)..."
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg w-full sm:w-44 focus:outline-hidden focus:border-[#0d9488]"
                  title="Digite seu nome para assinar a mensagem"
                />
                {onRequireAuth && (
                  <button
                    type="button"
                    onClick={onRequireAuth}
                    className="text-xs text-[#0d9488] font-bold hover:underline shrink-0 flex items-center gap-1"
                  >
                    <LogIn className="h-3.5 w-3.5" />
                    Entrar
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Text input area and Send Button */}
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Escreva a sua dúvida, ideia de projeto ou contribuição para a comunidade..."
              disabled={isSending}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:bg-white focus:border-[#0d9488] transition-all font-sans"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || isSending}
              className="bg-[#0d9488] hover:bg-[#0f766e] disabled:opacity-40 text-white px-5 py-3 rounded-xl font-bold uppercase tracking-wider text-xs transition-all shadow-md cursor-pointer flex items-center gap-2 shrink-0"
            >
              <span>Publicar</span>
              <Send className="h-4 w-4" />
            </button>
          </div>

          <div className="text-[10px] text-slate-400 text-left">
            💡 Dica: Respostas e comentários do Formador Aldo Valige aparecerão destacados na cor verde água.
          </div>
        </form>

      </div>
    </div>
  );
}

