import React, { useState, useEffect } from "react";
import { Award, FileText, Calendar, Eye, X, ExternalLink, ShieldCheck, HelpCircle } from "lucide-react";
import { UserProfile, Course, PaymentMethod, PaymentTicket } from "../types";
import { dbGetPaymentTickets, dbGetPaymentMethods } from "../supabase";

interface UserPaymentsViewProps {
  currentUser: UserProfile;
  courses: Course[];
}

export default function UserPaymentsView({
  currentUser,
  courses,
}: UserPaymentsViewProps) {
  const [tickets, setTickets] = useState<PaymentTicket[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<PaymentTicket | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTickets = async () => {
    setIsLoading(true);
    try {
      const [dbTickets, dbMethods] = await Promise.all([
        dbGetPaymentTickets(currentUser.id),
        dbGetPaymentMethods(),
      ]);
      setTickets(dbTickets);
      setPaymentMethods(dbMethods);
    } catch (err) {
      console.error("Error loading user tickets data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [currentUser.id]);

  const getStatusBadge = (status: PaymentTicket["status"]) => {
    switch (status) {
      case "PENDING":
        return (
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-100 px-2 py-0.5 rounded-xs leading-none">
            Pendente
          </span>
        );
      case "UNDER_REVIEW":
        return (
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-blue-50 text-blue-800 border border-blue-100 px-2 py-0.5 rounded-xs leading-none">
            Em Análise
          </span>
        );
      case "APPROVED":
        return (
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-100 px-2 py-0.5 rounded-xs leading-none">
            Aprovado
          </span>
        );
      case "REJECTED":
        return (
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-rose-50 text-rose-800 border border-rose-100 px-2 py-0.5 rounded-xs leading-none">
            Rejeitado
          </span>
        );
      default:
        return null;
    }
  };

  const getMethodName = (methodId: string) => {
    const method = paymentMethods.find(m => m.id === methodId);
    return method ? method.name : "Desconhecido";
  };

  const getCourseTitle = (courseId: string) => {
    if (courseId === "PREMIUM_SUBSCRIPTION") {
      return "Assinatura Estudantil Premium (90 dias)";
    }
    const course = courses.find(c => c.id === courseId);
    return course ? course.title : "Curso Desconhecido";
  };

  const formatDate = (isoString: string) => {
    if (!isoString) return "-";
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString("pt-PT") + " " + d.toLocaleTimeString("pt-PT").slice(0, 5);
    } catch {
      return isoString;
    }
  };

  return (
    <div className="w-full bg-[#f8fafc] font-sans min-h-screen py-10 px-4" id="user-payments-tab">
      <div className="w-full max-w-5xl mx-auto space-y-8" id="user-payments-wrapper">
        
        {/* Title Header Card */}
        <div className="bg-white border border-slate-200 p-8 rounded-sm text-left shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6" id="payments-summary-card">
          <div className="space-y-2">
            <span className="text-[10px] bg-slate-100 text-slate-800 px-3 py-1 rounded-sm uppercase font-mono font-bold tracking-wider">
              Controlo de Facturação e Tickets de Pagamento
            </span>
            <h2 className="font-display font-bold text-2xl md:text-3.5xl text-[#0a2540] tracking-tight">
              Meus Pagamentos
            </h2>
            <div className="w-12 h-[3px] bg-[#0d9488]" />
            <p className="text-xs text-slate-500 font-sans leading-relaxed max-w-xl">
              Acompanhe o estado de aprovação dos seus comprovativos de pagamento. 
              Assim que o ticket de transação for aprovado pela administração, o acesso completo aos cursos adquiridos e manuais didáticos correspondentes será ativado instantaneamente.
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-150 p-4 rounded-sm text-center font-mono self-stretch sm:self-auto flex flex-col justify-center" id="payments-counter">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total de Faturas</span>
            <span className="text-2xl font-bold text-[#0d9488] block mt-1">{tickets.length}</span>
          </div>
        </div>

        {/* Tickets Table block */}
        <div className="bg-white border border-slate-200 rounded-sm shadow-xs overflow-hidden" id="payments-table-block">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
            <h3 className="font-display font-bold text-sm text-[#0a2540] uppercase tracking-wider">Histórico de Transações</h3>
          </div>

          {isLoading ? (
            <div className="p-12 text-center text-xs text-slate-400 font-sans space-y-2">
              <div className="animate-spin h-6 w-6 border-2 border-[#0d9488] border-t-transparent rounded-full mx-auto" />
              <p>A carregar pagamentos...</p>
            </div>
          ) : tickets.length === 0 ? (
            <div className="p-12 text-center text-slate-450 text-xs font-sans space-y-3">
              <FileText className="h-10 w-10 text-slate-300 mx-auto" />
              <h4 className="font-bold text-slate-700">Nenhum ticket de pagamento enviado</h4>
              <p className="max-w-xs mx-auto text-slate-400 leading-normal">
                Quando comprar um curso pago e submeter o respetivo comprovativo, poderá acompanhar o progresso da análise diretamente nesta secção.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left font-sans text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 uppercase font-mono tracking-wider bg-slate-50/50">
                    <th className="py-3 px-4">Ticket</th>
                    <th className="py-3 px-4">Curso</th>
                    <th className="py-3 px-4">Valor</th>
                    <th className="py-3 px-4">Método</th>
                    <th className="py-3 px-4">Estado</th>
                    <th className="py-3 px-4">Data Envio</th>
                    <th className="py-3 px-4 text-center">Acções</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {tickets.map(ticket => (
                    <tr key={ticket.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-800">{ticket.ticketNumber}</td>
                      <td className="py-3 px-4 font-bold text-slate-700 truncate max-w-[200px]" title={getCourseTitle(ticket.courseId)}>
                        {getCourseTitle(ticket.courseId)}
                      </td>
                      <td className="py-3 px-4 font-mono font-semibold text-slate-800">
                        {ticket.amount.toLocaleString("pt-PT")} MT
                      </td>
                      <td className="py-3 px-4 text-slate-650">{getMethodName(ticket.paymentMethodId)}</td>
                      <td className="py-3 px-4">{getStatusBadge(ticket.status)}</td>
                      <td className="py-3 px-4 text-slate-400">{formatDate(ticket.createdAt)}</td>
                      <td className="py-3 px-4">
                        <div className="flex justify-center">
                          <button
                            onClick={() => setSelectedTicket(ticket)}
                            className="inline-flex items-center gap-1 bg-[#0a2540] hover:bg-[#0d9488] text-white text-[10px] font-bold uppercase tracking-wider py-1.5 px-3 rounded-xs transition-colors cursor-pointer"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            <span>Ver Ficha</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

      {/* Ticket Details Modal Dialog Overlay */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-sm border border-slate-200 w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col text-left">
            
            {/* Header */}
            <div className="px-6 py-4 bg-[#0a2540] text-white flex items-center justify-between border-b border-teal-900 shrink-0">
              <div className="space-y-0.5">
                <span className="text-[9px] font-mono tracking-widest text-[#0d9488] uppercase font-bold">Ficha de Faturação</span>
                <h3 className="font-display font-bold text-sm uppercase tracking-wide">
                  Detalhes do Ticket {selectedTicket.ticketNumber}
                </h3>
              </div>
              <button 
                onClick={() => setSelectedTicket(null)} 
                className="p-1 hover:bg-slate-800 rounded-full transition-colors text-slate-350 hover:text-white cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Scrollable details panel */}
            <div className="p-6 overflow-y-auto max-h-[75vh] space-y-6">
              
              {/* Row Status Badge & Course Name summary */}
              <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-50 p-4 border border-slate-150 rounded-sm">
                <div className="text-left">
                  <span className="text-[9px] text-slate-400 font-mono block">
                    {selectedTicket.courseId === "PREMIUM_SUBSCRIPTION" ? "Assinatura Adquirida" : "Curso Adquirido"}
                  </span>
                  <span className="font-bold text-[#0a2540] text-sm">{getCourseTitle(selectedTicket.courseId)}</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 font-mono block mb-1">Estado de Análise</span>
                  {getStatusBadge(selectedTicket.status)}
                </div>
              </div>

              {/* Data fields grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
                <div className="border border-slate-150 p-3.5 rounded-sm">
                  <span className="text-[9px] font-mono uppercase tracking-wider text-slate-450 block mb-1.5">Informações do Aluno</span>
                  <div className="space-y-1 text-slate-650">
                    <p><strong>Nome:</strong> {currentUser.fullName}</p>
                    <p><strong>Email:</strong> {currentUser.email}</p>
                    {currentUser.whatsapp && <p><strong>Whatsapp:</strong> {currentUser.whatsapp}</p>}
                  </div>
                </div>

                <div className="border border-slate-150 p-3.5 rounded-sm">
                  <span className="text-[9px] font-mono uppercase tracking-wider text-slate-450 block mb-1.5">Dados da Transação</span>
                  <div className="space-y-1 text-slate-650">
                    <p><strong>Valor Pago:</strong> {selectedTicket.amount.toLocaleString("pt-PT")} MT</p>
                    <p><strong>Método de Envio:</strong> {getMethodName(selectedTicket.paymentMethodId)}</p>
                    {selectedTicket.payerPhone && <p><strong>Contacto Payer:</strong> {selectedTicket.payerPhone}</p>}
                    <p className="truncate"><strong>Referência:</strong> <span className="font-mono bg-slate-105 p-0.5 rounded-xs border text-[11px] font-bold text-slate-800">{selectedTicket.transactionReference}</span></p>
                  </div>
                </div>
              </div>

              {/* Receipt Previewer */}
              <div className="space-y-2 text-left">
                <span className="text-[9px] font-mono uppercase font-bold text-slate-400">Comprovativo de Pagamento Carregado</span>
                <div className="border border-slate-200 rounded-sm bg-slate-50 p-3 flex flex-col items-center justify-center min-h-[160px] relative overflow-hidden">
                  {selectedTicket.receiptUrl.toLowerCase().endsWith(".pdf") ? (
                    <div className="text-center p-6 space-y-3">
                      <FileText className="h-12 w-12 text-[#0d9488] mx-auto" />
                      <p className="text-xs font-bold text-slate-700">Comprovativo em Formato PDF</p>
                      <a
                        href={selectedTicket.receiptUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 bg-[#0a2540] hover:bg-[#0d9488] text-white text-[10px] font-bold uppercase tracking-wider py-2 px-4 rounded-xs cursor-pointer transition-colors"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        <span>Abrir Documento PDF</span>
                      </a>
                    </div>
                  ) : (
                    <div className="w-full flex flex-col items-center gap-3">
                      <img 
                        src={selectedTicket.receiptUrl} 
                        alt="Comprovativo de Pagamento" 
                        className="max-h-[300px] max-w-full object-contain border border-slate-200 rounded-xs bg-white"
                      />
                      <a
                        href={selectedTicket.receiptUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 border border-slate-350 hover:border-slate-800 text-slate-600 hover:text-slate-850 text-[10px] font-bold uppercase tracking-wider py-1.5 px-3 bg-white rounded-xs cursor-pointer transition-colors"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        <span>Visualizar Imagem Inteira</span>
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Administrative Notes panel if exists */}
              {selectedTicket.adminNotes && (
                <div className="p-4 bg-amber-50/50 border border-amber-200 text-amber-900 rounded-sm text-xs text-left space-y-1 leading-normal">
                  <span className="text-[9px] font-mono uppercase tracking-wider text-amber-700 font-bold block">Observações do Administrador</span>
                  <p className="italic text-slate-750 font-sans">{selectedTicket.adminNotes}</p>
                </div>
              )}

              {/* Timestamps */}
              <div className="text-[9px] font-mono text-slate-400 grid grid-cols-2 gap-4 border-t border-slate-100 pt-4">
                <div>Criado em: {formatDate(selectedTicket.createdAt)}</div>
                {selectedTicket.reviewedAt && (
                  <div className="text-right">Analisado em: {formatDate(selectedTicket.reviewedAt)}</div>
                )}
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
