import React, { useState } from "react";
import { Bell, X, CheckSquare, RefreshCw, Sparkles, AlertTriangle, AlertOctagon, GraduationCap, CheckCircle, HelpCircle, Coffee, Clock, Lock, Smile, MessageSquare } from "lucide-react";
import { PlatformNotification } from "../types";

// Unified definition of the 17 mapped developer actions
export const MAPPED_ACTIONS = [
  {
    id: "com_energia",
    name: "Com Energia (Acesso/Boas-vindas)",
    triggerType: "Entrada na plataforma",
    imageUrl: "https://ik.imagekit.io/mdsiwq57o/CursaQI/accoes/com_energia.png",
    defaultTitle: "Conexão Ativada com Sucesso!",
    defaultMessage: "Ficamos muito felizes de ter você de volta estudando hoje. Aproveite a energia alta para concluir as metas pendentes!",
    bgClass: "bg-teal-50 border-teal-200 text-teal-900"
  },
  {
    id: "amando",
    name: "Amando (Fórum Curtida)",
    triggerType: "Engajamento Social",
    imageUrl: "https://ik.imagekit.io/mdsiwq57o/CursaQI/accoes/amando.png",
    defaultTitle: "Seu comentário foi aplaudido!",
    defaultMessage: "Outro aluno marcou sua resposta sobre arquitetura de dados como extremamente útil na comunidade corporativa.",
    bgClass: "bg-slate-50 border-slate-200 text-slate-900"
  },
  {
    id: "confiante",
    name: "Confiante (Ativação de Streak)",
    triggerType: "Sequência de Estudos",
    imageUrl: "https://ik.imagekit.io/mdsiwq57o/CursaQI/accoes/confiante.png",
    defaultTitle: "Sequência Diária Atualizada",
    defaultMessage: "Sensacional! Você manteve seu Streak diário ativo e já está mais perto de seu certificado.",
    bgClass: "bg-slate-50 border-slate-200 text-slate-900"
  },
  {
    id: "confuso",
    name: "Confuso (Erros Repetidos)",
    triggerType: "Alerta de Apoio Pedagógico",
    imageUrl: "https://ik.imagekit.io/mdsiwq57o/CursaQI/accoes/confuso.png",
    defaultTitle: "Sugestão de Revisão de Conteúdo",
    defaultMessage: "Identificamos mais de duas tentativas incorretas na mesma questão do quiz. Recomendamos assistir à aula correspondente novamente de forma calma.",
    bgClass: "bg-slate-50 border-slate-200 text-slate-900"
  },
  {
    id: "desanimado",
    name: "Desanimado (Inatividade de 1 Semana)",
    triggerType: "Apoio e Retenção",
    imageUrl: "https://ik.imagekit.io/mdsiwq57o/CursaQI/accoes/desanimado.png",
    defaultTitle: "Sentimos sua Ausência",
    defaultMessage: "Faz mais de uma semana que você não acessa o curso. Dê um pequeno passo hoje assistindo a apenas 5 minutos de vídeo!",
    bgClass: "bg-slate-50 border-slate-200 text-slate-900"
  },
  {
    id: "determinado",
    name: "Determinado (Iniciar Módulo Avançado)",
    triggerType: "Foco Acadêmico",
    imageUrl: "https://ik.imagekit.io/mdsiwq57o/CursaQI/accoes/determinado.png",
    defaultTitle: "Módulo Avançado Iniciado!",
    defaultMessage: "Você acaba de iniciar um módulo prático complexo. Concentre-se nos códigos fonte fornecidos com atenção extra.",
    bgClass: "bg-slate-50 border-slate-200 text-slate-900"
  },
  {
    id: "duvidando",
    name: "Duvidando (Acesso à Central)",
    triggerType: "Chamado de Dúvidas / FAQ",
    imageUrl: "https://ik.imagekit.io/mdsiwq57o/CursaQI/accoes/duvidando.png",
    defaultTitle: "Centro de Apoio Aberto",
    defaultMessage: "Você acessou os manuais de FAQ e contactou nossa equipe de tutoria. Responderemos seu chamado técnico no menor tempo possível.",
    bgClass: "bg-slate-50 border-slate-200 text-slate-900"
  },
  {
    id: "esgotado",
    name: "Esgotado (Alerta de Descanso)",
    triggerType: "Fadiga Preventiva",
    imageUrl: "https://ik.imagekit.io/mdsiwq57o/CursaQI/accoes/esgotado.png",
    defaultTitle: "Alerta de Estudo Excessivo",
    defaultMessage: "Detectamos que você estuda focado há mais de 3 horas seguidas hoje. Faça um intervalo de 10 minutos para relaxar os olhos.",
    bgClass: "bg-slate-50 border-slate-200 text-slate-900"
  },
  {
    id: "estressado",
    name: "Estressado (Aviso de Falha Técnica)",
    triggerType: "Alerta do Sistema",
    imageUrl: "https://ik.imagekit.io/mdsiwq57o/CursaQI/accoes/estressado.png",
    defaultTitle: "Instabilidade Temporária Simulada",
    defaultMessage: "Instabilidade pontual na rota de processamento de vídeos. Não se preocupe, o fluxo foi redundado e está operacional.",
    bgClass: "bg-slate-50 border-slate-200 text-slate-900"
  },
  {
    id: "estudando",
    name: "Estudando (Novo Material)",
    triggerType: "Material Desbloqueado",
    imageUrl: "https://ik.imagekit.io/mdsiwq57o/CursaQI/accoes/estudando.png",
    defaultTitle: "Material Didático PDF Disponível",
    defaultMessage: "Um novo material de leitura teórica e e-book exclusivo do curso foi adicionado à sua barra de ferramentas didáticas.",
    bgClass: "bg-slate-50 border-slate-200 text-slate-900"
  },
  {
    id: "meditando",
    name: "Meditando (Conclusão de Aula com Foco)",
    triggerType: "Consolidação de Estudos",
    imageUrl: "https://ik.imagekit.io/mdsiwq57o/CursaQI/accoes/meditando.png",
    defaultTitle: "Estudo Focado Concluído!",
    defaultMessage: "Parabéns por concluir seu checklist de auto-estudo produtivo de hoje de forma serena e focada.",
    bgClass: "bg-slate-50 border-slate-200 text-slate-900"
  },
  {
    id: "orgulhoso",
    name: "Orgulhoso (Emissão de Certificado)",
    triggerType: "Parabéns / Formatura",
    imageUrl: "https://ik.imagekit.io/mdsiwq57o/CursaQI/accoes/orgulhoso.png",
    defaultTitle: "Certificado Registado Oficialmente!",
    defaultMessage: "Extraordinário! Você superou o aproveitamento mínimo de 80% e já pode emitir seu diploma de titulação profissional na rede.",
    bgClass: "bg-slate-50 border-slate-200 text-slate-900"
  },
  {
    id: "pintando",
    name: "Pintando (Submeter Exercício)",
    triggerType: "Avaliação Pedagógica",
    imageUrl: "https://ik.imagekit.io/mdsiwq57o/CursaQI/accoes/pintando.png",
    defaultTitle: "Código Submetido para Avaliação",
    defaultMessage: "Seu arquivo de prova prática foi depositado na caixa de envios. Um professor tutor irá rever sua lógica nos próximos dias.",
    bgClass: "bg-slate-50 border-slate-200 text-slate-900"
  },
  {
    id: "preso",
    name: "Preso (Bloqueio de Conteúdo)",
    triggerType: "Aviso de Monetização",
    imageUrl: "https://ik.imagekit.io/mdsiwq57o/CursaQI/accoes/preso.png",
    defaultTitle: "Conteúdo Reservado de Assinante",
    defaultMessage: "Esse recurso está bloqueado temporariamente no plano gratuito. Adquira o Plano Pago na aba do seu Perfil para desbloquear imediatamente.",
    bgClass: "bg-slate-50 border-slate-200 text-slate-900"
  },
  {
    id: "raiva",
    name: "Raiva (Cancelamento de Chamada)",
    triggerType: "Aviso Operacional",
    imageUrl: "https://ik.imagekit.io/mdsiwq57o/CursaQI/accoes/raiva.png",
    defaultTitle: "Reagendamento de Mentoria Necessário",
    defaultMessage: "Infelizmente o suporte ao vivo agendado com o mentor colidiu com outro horário de urgência académica. Reagende sem custos.",
    bgClass: "bg-slate-50 border-slate-200 text-slate-900"
  },
  {
    id: "sono",
    name: "Sono (Manutenção Tarde da Noite)",
    triggerType: "Higiene da Mente",
    imageUrl: "https://ik.imagekit.io/mdsiwq57o/CursaQI/accoes/sono.png",
    defaultTitle: "Horas de Sono Recomendadas",
    defaultMessage: "Passa das 22 horas de estudo. Guarde seu código e descanse a mente; o processamento cognitivo solidifica-se durante o sono.",
    bgClass: "bg-slate-50 border-slate-100 text-slate-900"
  },
  {
    id: "tomando_cafe",
    name: "Tomando Café (Upgrade VIP)",
    triggerType: "Estatuto Premium",
    imageUrl: "https://ik.imagekit.io/mdsiwq57o/CursaQI/accoes/tomando_cafe.png",
    defaultTitle: "Parabéns pelo Upgrade de Plano!",
    defaultMessage: "Sua assinatura CursaQi Premium foi ativada. Suporte imediato, áudio em alta definição e mentorias completas liberadas.",
    bgClass: "bg-slate-50 border-slate-200 text-slate-900"
  }
];

interface NotificationCenterProps {
  notifications: PlatformNotification[];
  onTriggerNotification: (type: string, title?: string, message?: string) => void;
  onClearNotifications: () => void;
  onMarkAllRead: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationCenter({
  notifications,
  onTriggerNotification,
  onClearNotifications,
  onMarkAllRead,
  isOpen,
  onClose
}: NotificationCenterProps) {
  const unreadCount = notifications.filter(n => !n.read).length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs font-sans animate-fade-in" id="notification-dialog-underlay">
      {/* Background click to dismiss */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Slide Drawer Content Container */}
      <div 
        className="relative w-full max-w-lg bg-white h-screen shadow-2xl flex flex-col border-l border-slate-250 animate-slide-in"
        id="notification-drawer-content"
      >
        {/* Fixed Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between" id="notification-drawer-header">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-[#0a2540]" />
            <span className="font-display font-black text-sm uppercase tracking-wider text-[#0a2540]">
              Central de Notificações CUrsaQi
            </span>
            {unreadCount > 0 && (
              <span className="bg-rose-600 text-white text-[9px] font-mono leading-none font-bold px-2 py-0.5 rounded-full">
                {unreadCount} Novas
              </span>
            )}
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-800 rounded-xs transition-colors cursor-pointer"
            id="notification-close-btn"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-5" id="notification-scroll-container">
          <div className="space-y-4" id="notifications-list-block">
            {/* Option Bar */}
            {notifications.length > 0 && (
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 text-[10px] font-mono tracking-wider text-slate-500 uppercase">
                <span>Listando logs de atividade do utilizador</span>
                <div className="flex gap-4">
                  <button 
                    onClick={onMarkAllRead}
                    className="text-[#0d9488] hover:underline font-bold"
                  >
                    Ler Todas
                  </button>
                  <button 
                    onClick={onClearNotifications}
                    className="text-rose-600 hover:underline font-bold"
                  >
                    Limpar Registro
                  </button>
                </div>
              </div>
            )}

            {notifications.length === 0 ? (
              <div className="py-24 text-center space-y-3" id="notify-history-empty">
                <Bell className="h-8 w-8 text-slate-300 mx-auto" />
                <div className="space-y-1 text-center">
                  <h4 className="font-bold text-slate-700 text-xs uppercase tracking-wider">Centro Vazio</h4>
                  <p className="text-[10px] text-slate-400 max-w-xs mx-auto">
                    Não existem notificações para apresentar de momento. Novas atualizações sobre o seu progresso e cursos aparecerão aqui de forma automática.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3" id="history-items-container">
                {notifications.map((n) => (
                  <div 
                    key={n.id} 
                    className={`relative flex items-start gap-4 p-3.5 border border-slate-150 rounded-sm bg-white hover:shadow-2xs transition-all ${
                      !n.read ? "border-l-2 border-l-[#0d9488] bg-slate-50/50" : ""
                    }`}
                    id={`notify-item-${n.id}`}
                  >
                    {/* Round compact Illustration */}
                    <img 
                      src={n.imageUrl} 
                      alt={n.type} 
                      className="w-12 h-12 rounded-full border border-slate-200 shadow-2xs shrink-0 object-cover"
                      referrerPolicy="no-referrer"
                    />

                    <div className="flex-1 space-y-1 text-left min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[8px] font-mono font-bold text-slate-400 uppercase tracking-widest leading-none">
                          AÇÃO: {n.type.toUpperCase().replace("_", " ")}
                        </span>
                        <span className="text-[8px] font-mono text-slate-400 leading-none shrink-0">
                          {n.timestamp}
                        </span>
                      </div>
                      <h4 className="font-sans font-extrabold text-[#0a2540] text-xs leading-snug">
                        {n.title}
                      </h4>
                      <p className="text-slate-600 text-[10.5px] leading-relaxed">
                        {n.message}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer info (Flat) */}
        <div className="p-4 border-t border-slate-150 text-center font-mono text-[9px] text-slate-400 bg-slate-50 uppercase tracking-widest">
          CUrsaQi • Canal de Notificações
        </div>
      </div>
    </div>
  );
}
