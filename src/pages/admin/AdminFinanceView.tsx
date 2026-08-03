import React, { useState, useEffect } from "react";
import { 
  BarChart3, FileText, CheckCircle2, XCircle, AlertTriangle, 
  Search, Calendar, Filter, DollarSign, Settings2, Eye, X, 
  Check, RefreshCw, Smartphone, Landmark, Info, ExternalLink
} from "lucide-react";
import { Course, UserProfile, PaymentMethod, PaymentTicket } from "../../types";

interface AdminFinanceViewProps {
  courses: Course[];
  users: UserProfile[];
  paymentMethods: PaymentMethod[];
  paymentTickets: PaymentTicket[];
  onUpdateTicketStatus: (ticketId: string, status: "APPROVED" | "REJECTED" | "UNDER_REVIEW", adminNotes: string) => Promise<void>;
  onSavePaymentMethod: (method: PaymentMethod) => Promise<void>;
  currentUser: UserProfile;
}

type SubTab = "dashboard" | "tickets" | "methods";

export default function AdminFinanceView({
  courses,
  users,
  paymentMethods,
  paymentTickets,
  onUpdateTicketStatus,
  onSavePaymentMethod,
  currentUser,
}: AdminFinanceViewProps) {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>("dashboard");
  const [selectedTicket, setSelectedTicket] = useState<PaymentTicket | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Filters for Tickets Page
  const [filterPeriod, setFilterPeriod] = useState<"today" | "week" | "month" | "year" | "all">("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterCourse, setFilterCourse] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Method Settings States
  const [editingMethodId, setEditingMethodId] = useState<string | null>(null);
  const [methodName, setMethodName] = useState("");
  const [methodType, setMethodType] = useState("mpesa");
  const [methodPhone, setMethodPhone] = useState("");
  const [methodAccountName, setMethodAccountName] = useState("");
  const [methodBank, setMethodBank] = useState("");
  const [methodAccountNumber, setMethodAccountNumber] = useState("");
  const [methodNib, setMethodNib] = useState("");
  const [methodIban, setMethodIban] = useState("");
  const [methodInstructions, setMethodInstructions] = useState("");
  const [methodIsActive, setMethodIsActive] = useState(true);
  const [methodDisplayOrder, setMethodDisplayOrder] = useState(1);

  // Helper matching
  const getUserProfile = (userId: string) => {
    return users.find(u => u.id === userId);
  };

  const getMethodName = (methodId: string) => {
    const method = paymentMethods.find(m => m.id === methodId);
    return method ? method.name : "Desconhecido";
  };

  const getCourseTitle = (courseId: string) => {
    const course = courses.find(c => c.id === courseId);
    return course ? course.title : "Curso Desconhecido";
  };

  // --- STATS CALCULATIONS ---
  const ticketsPending = paymentTickets.filter(t => t.status === "PENDING");
  const ticketsApproved = paymentTickets.filter(t => t.status === "APPROVED");
  const ticketsRejected = paymentTickets.filter(t => t.status === "REJECTED");

  const totalSoldAmount = ticketsApproved.reduce((acc, t) => acc + t.amount, 0);

  // Revenue Today & This Month
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

  const getRevenueInPeriod = (startTimestamp: number) => {
    return ticketsApproved
      .filter(t => {
        const ticketTime = new Date(t.reviewedAt || t.createdAt).getTime();
        return ticketTime >= startTimestamp;
      })
      .reduce((acc, t) => acc + t.amount, 0);
  };

  const revenueToday = getRevenueInPeriod(todayStart);
  const revenueThisMonth = getRevenueInPeriod(monthStart);

  // Monthly breakdown mockup chart data (last 6 months)
  const getMonthlyBreakdown = () => {
    const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    const currentMonthIdx = now.getMonth();
    
    // Create last 6 months list
    const chartData = [];
    for (let i = 5; i >= 0; i--) {
      const targetMonthIdx = (currentMonthIdx - i + 12) % 12;
      const targetYear = currentMonthIdx - i < 0 ? now.getFullYear() - 1 : now.getFullYear();
      
      const sum = ticketsApproved
        .filter(t => {
          const d = new Date(t.reviewedAt || t.createdAt);
          return d.getMonth() === targetMonthIdx && d.getFullYear() === targetYear;
        })
        .reduce((acc, t) => acc + t.amount, 0);

      chartData.push({
        label: months[targetMonthIdx],
        value: sum
      });
    }
    return chartData;
  };

  const monthlyChartData = getMonthlyBreakdown();
  const maxChartValue = Math.max(...monthlyChartData.map(d => d.value), 1000);

  // --- FILTERS LOGIC ---
  const filteredTickets = paymentTickets.filter(ticket => {
    const student = getUserProfile(ticket.userId);
    const courseTitle = getCourseTitle(ticket.courseId);

    // Search query matches
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
      ticket.ticketNumber.toLowerCase().includes(searchLower) ||
      ticket.transactionReference.toLowerCase().includes(searchLower) ||
      (student?.fullName || "").toLowerCase().includes(searchLower) ||
      (student?.email || "").toLowerCase().includes(searchLower) ||
      courseTitle.toLowerCase().includes(searchLower);

    if (!matchesSearch) return false;

    // Status filter
    if (filterStatus !== "all" && ticket.status !== filterStatus) return false;

    // Course filter
    if (filterCourse !== "all" && ticket.courseId !== filterCourse) return false;

    // Period filter
    if (filterPeriod !== "all") {
      const ticketTime = new Date(ticket.createdAt).getTime();
      if (filterPeriod === "today" && ticketTime < todayStart) return false;
      if (filterPeriod === "week" && ticketTime < now.getTime() - 7 * 24 * 3600 * 1000) return false;
      if (filterPeriod === "month" && ticketTime < monthStart) return false;
      if (filterPeriod === "year" && ticketTime < new Date(now.getFullYear(), 0, 1).getTime()) return false;
    }

    return true;
  });

  // --- ACTIONS ---
  const handleReviewAction = async (status: "APPROVED" | "REJECTED" | "UNDER_REVIEW") => {
    if (!selectedTicket) return;
    if (status === "REJECTED" && !adminNotes.trim()) {
      alert("Por favor introduza o motivo da rejeição no campo de observações.");
      return;
    }

    setIsActionLoading(true);
    try {
      await onUpdateTicketStatus(selectedTicket.id, status, adminNotes);
      setSelectedTicket(null);
      setAdminNotes("");
    } catch (err) {
      console.error(err);
      alert("Erro ao processar a ação. Tente novamente.");
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleEditMethodStart = (method: PaymentMethod) => {
    setEditingMethodId(method.id);
    setMethodName(method.name);
    setMethodType(method.type);
    setMethodPhone(method.phone || "");
    setMethodAccountName(method.accountName || "");
    setMethodBank(method.bank || "");
    setMethodAccountNumber(method.accountNumber || "");
    setMethodNib(method.nib || "");
    setMethodIban(method.iban || "");
    setMethodInstructions(method.instructions || "");
    setMethodIsActive(method.isActive);
    setMethodDisplayOrder(method.displayOrder);
  };

  const handleSaveMethod = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!methodName.trim()) {
      alert("O nome do método de pagamento é obrigatório.");
      return;
    }

    const payload: PaymentMethod = {
      id: editingMethodId || `method-${Date.now()}`,
      name: methodName.trim(),
      type: methodType,
      phone: methodType !== "bank" ? methodPhone.trim() : "",
      accountName: methodAccountName.trim() || undefined,
      bank: methodType === "bank" ? methodBank.trim() : "",
      accountNumber: methodType === "bank" ? methodAccountNumber.trim() : "",
      nib: methodType === "bank" ? methodNib.trim() : "",
      iban: methodType === "bank" ? methodIban.trim() : "",
      instructions: methodInstructions.trim() || undefined,
      isActive: methodIsActive,
      displayOrder: methodDisplayOrder
    };

    try {
      await onSavePaymentMethod(payload);
      setEditingMethodId(null);
      // Clear fields
      setMethodName("");
      setMethodPhone("");
      setMethodAccountName("");
      setMethodBank("");
      setMethodAccountNumber("");
      setMethodNib("");
      setMethodIban("");
      setMethodInstructions("");
    } catch (err) {
      console.error(err);
      alert("Erro ao gravar as configurações.");
    }
  };

  return (
    <div className="w-full bg-[#f8fafc] font-sans min-h-screen text-left" id="admin-finance-desk">
      
      {/* Sub menu controls */}
      <div className="flex border-b border-slate-200 gap-1 text-xs font-bold uppercase tracking-wider bg-white px-6 pt-3" id="finance-sub-tabs">
        <button
          onClick={() => setActiveSubTab("dashboard")}
          className={`px-4 py-3 border-b-2 cursor-pointer transition-colors ${
            activeSubTab === "dashboard" ? "border-[#0d9488] text-[#0d9488]" : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <BarChart3 className="inline-block h-3.5 w-3.5 mr-1.5" />
          Dashboard Financeiro
        </button>
        
        <button
          onClick={() => setActiveSubTab("tickets")}
          className={`px-4 py-3 border-b-2 cursor-pointer transition-colors ${
            activeSubTab === "tickets" ? "border-[#0d9488] text-[#0d9488]" : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <FileText className="inline-block h-3.5 w-3.5 mr-1.5" />
          Tickets ({ticketsPending.length} pendentes)
        </button>

        <button
          onClick={() => setActiveSubTab("methods")}
          className={`px-4 py-3 border-b-2 cursor-pointer transition-colors ${
            activeSubTab === "methods" ? "border-[#0d9488] text-[#0d9488]" : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Settings2 className="inline-block h-3.5 w-3.5 mr-1.5" />
          Configuração de Métodos
        </button>
      </div>

      <div className="p-6 space-y-6">
        
        {/* SUBTAB 1: FINANCIAL DASHBOARD */}
        {activeSubTab === "dashboard" && (
          <div className="space-y-6 animate-fade-in" id="finance-dashboard-view">
            
            {/* KPI Metrics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              
              <div className="bg-white border border-slate-200 p-5 rounded-sm flex items-center justify-between shadow-2xs">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-slate-400">Tickets Pendentes</span>
                  <div className="text-2xl font-bold font-mono text-amber-600">{ticketsPending.length}</div>
                  <p className="text-[9px] text-slate-400">Aguardando análise</p>
                </div>
                <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />
              </div>

              <div className="bg-white border border-slate-200 p-5 rounded-sm flex items-center justify-between shadow-2xs">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-slate-400">Total Vendido</span>
                  <div className="text-2xl font-bold font-mono text-slate-800">
                    {totalSoldAmount.toLocaleString("pt-PT")} MT
                  </div>
                  <p className="text-[9px] text-slate-400">Aprovações confirmadas</p>
                </div>
                <DollarSign className="h-5 w-5 text-emerald-500 shrink-0" />
              </div>

              <div className="bg-white border border-slate-200 p-5 rounded-sm flex items-center justify-between shadow-2xs">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-slate-400">Faturado Hoje</span>
                  <div className="text-2xl font-bold font-mono text-[#0d9488]">
                    {revenueToday.toLocaleString("pt-PT")} MT
                  </div>
                  <p className="text-[9px] text-slate-400">Confirmado nas últimas 24h</p>
                </div>
                <CheckCircle2 className="h-5 w-5 text-[#0d9488] shrink-0" />
              </div>

              <div className="bg-white border border-slate-200 p-5 rounded-sm flex items-center justify-between shadow-2xs">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-slate-400">Faturado Este Mês</span>
                  <div className="text-2xl font-bold font-mono text-slate-800">
                    {revenueThisMonth.toLocaleString("pt-PT")} MT
                  </div>
                  <p className="text-[9px] text-slate-400">Ciclo mensal atual</p>
                </div>
                <Calendar className="h-5 w-5 text-slate-450 shrink-0" />
              </div>

            </div>

            {/* Split layout: Chart & Recent Payments */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* HTML/Tailwind Monthly sales bar chart */}
              <div className="lg:col-span-7 bg-white border border-slate-200 p-6 rounded-sm shadow-2xs space-y-6">
                <div>
                  <h3 className="font-display font-bold text-sm text-[#0a2540] uppercase tracking-wider">Histórico Mensal de Vendas</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">Faturamento acumulado nos últimos 6 meses</p>
                </div>

                <div className="h-60 flex items-end justify-between gap-3 pt-6 px-4">
                  {monthlyChartData.map((data, idx) => {
                    const heightPercent = Math.max(10, Math.round((data.value / maxChartValue) * 100));
                    return (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                        <div className="text-[9px] font-mono font-bold text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
                          {data.value.toLocaleString("pt-PT")}
                        </div>
                        <div 
                          style={{ height: `${heightPercent}%` }} 
                          className="w-full bg-[#0a2540] hover:bg-[#0d9488] rounded-t-xs transition-all cursor-pointer relative"
                        />
                        <span className="text-[10px] font-bold text-slate-400 font-mono mt-1 shrink-0">{data.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Recent actions list */}
              <div className="lg:col-span-5 bg-white border border-slate-200 p-6 rounded-sm shadow-2xs space-y-4">
                <div>
                  <h3 className="font-display font-bold text-sm text-[#0a2540] uppercase tracking-wider">Últimas Transações</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">Últimos tickets de pagamento processados</p>
                </div>

                <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto">
                  {paymentTickets.slice(0, 5).map(ticket => {
                    const student = getUserProfile(ticket.userId);
                    return (
                      <div key={ticket.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                        <div className="text-left min-w-0">
                          <span className="font-bold text-slate-700 truncate block">{student?.fullName || "Aluno"}</span>
                          <span className="text-[9.5px] text-slate-400 font-mono block">Ref: {ticket.transactionReference}</span>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="font-mono font-bold block">{ticket.amount.toLocaleString("pt-PT")} MT</span>
                          <span className={`text-[8.5px] font-mono px-1.5 py-0.5 rounded-xs leading-none border inline-block mt-0.5 ${
                            ticket.status === "APPROVED" ? "bg-emerald-55/10 text-emerald-800 border-emerald-200" :
                            ticket.status === "PENDING" ? "bg-amber-50 text-amber-800 border-amber-200" :
                            "bg-rose-50 text-rose-800 border-rose-200"
                          }`}>
                            {ticket.status}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                  {paymentTickets.length === 0 && (
                    <div className="py-8 text-center text-xs text-slate-400 font-sans">Sem movimentação financeira recente.</div>
                  )}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* SUBTAB 2: TICKETS REVIEW */}
        {activeSubTab === "tickets" && (
          <div className="space-y-6 animate-fade-in" id="finance-tickets-view">
            
            {/* Filter controls row */}
            <div className="bg-white border border-slate-200 p-4 rounded-sm shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
              
              {/* Search bar */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Pesquisar por ticket, referência, aluno..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-1.5 border border-slate-200 focus:outline-[#0d9488] text-xs w-full font-sans"
                />
              </div>

              {/* Advanced select dropdown filters */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-xs">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" />
                  <select
                    value={filterPeriod}
                    onChange={(e) => setFilterPeriod(e.target.value as any)}
                    className="bg-transparent focus:outline-none text-[10.5px] font-bold text-slate-600 uppercase tracking-wider"
                  >
                    <option value="all">Todos os Períodos</option>
                    <option value="today">Hoje</option>
                    <option value="week">Esta Semana</option>
                    <option value="month">Este Mês</option>
                    <option value="year">Este Ano</option>
                  </select>
                </div>

                <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-xs">
                  <Filter className="h-3.5 w-3.5 text-slate-400" />
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="bg-transparent focus:outline-none text-[10.5px] font-bold text-slate-600 uppercase tracking-wider"
                  >
                    <option value="all">Todos os Estados</option>
                    <option value="PENDING">Pendentes</option>
                    <option value="UNDER_REVIEW">Em Análise</option>
                    <option value="APPROVED">Aprovados</option>
                    <option value="REJECTED">Rejeitados</option>
                  </select>
                </div>

                <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-xs">
                  <select
                    value={filterCourse}
                    onChange={(e) => setFilterCourse(e.target.value)}
                    className="bg-transparent focus:outline-none text-[10.5px] font-bold text-slate-600 uppercase tracking-wider max-w-[150px]"
                  >
                    <option value="all">Todos os Cursos</option>
                    {courses.map(c => (
                      <option key={c.id} value={c.id}>{c.title}</option>
                    ))}
                  </select>
                </div>
              </div>

            </div>

            {/* Main tickets list table */}
            <div className="bg-white border border-slate-200 rounded-sm shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left font-sans text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 uppercase font-mono tracking-wider bg-slate-50">
                      <th className="py-3 px-4">Ticket</th>
                      <th className="py-3 px-4">Aluno</th>
                      <th className="py-3 px-4">Curso</th>
                      <th className="py-3 px-4">Valor</th>
                      <th className="py-3 px-4">Método</th>
                      <th className="py-3 px-4">Estado</th>
                      <th className="py-3 px-4 text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredTickets.map(ticket => {
                      const student = getUserProfile(ticket.userId);
                      return (
                        <tr key={ticket.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-3 px-4 font-mono font-bold text-[#0a2540]">{ticket.ticketNumber}</td>
                          <td className="py-3 px-4">
                            <div className="flex flex-col text-left">
                              <span className="font-bold text-slate-700">{student?.fullName || "Aluno"}</span>
                              <span className="text-[10px] text-slate-400 font-mono truncate max-w-[140px]">{student?.email}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 font-bold text-slate-600 truncate max-w-[160px]" title={getCourseTitle(ticket.courseId)}>
                            {getCourseTitle(ticket.courseId)}
                          </td>
                          <td className="py-3 px-4 font-mono font-semibold text-slate-800">
                            {ticket.amount.toLocaleString("pt-PT")} MT
                          </td>
                          <td className="py-3 px-4 text-slate-650">{getMethodName(ticket.paymentMethodId)}</td>
                          <td className="py-3 px-4">
                            <span className={`text-[9px] font-mono font-bold uppercase tracking-wider border px-2 py-0.5 rounded-xs leading-none ${
                              ticket.status === "APPROVED" ? "bg-emerald-50 text-emerald-800 border-emerald-250" :
                              ticket.status === "PENDING" ? "bg-amber-50 text-amber-800 border-amber-250" :
                              ticket.status === "UNDER_REVIEW" ? "bg-blue-50 text-blue-800 border-blue-250" :
                              "bg-rose-50 text-rose-800 border-rose-250"
                            }`}>
                              {ticket.status === "PENDING" ? "Pendente" : 
                               ticket.status === "APPROVED" ? "Aprovado" : 
                               ticket.status === "UNDER_REVIEW" ? "Em Análise" : "Rejeitado"}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex justify-center">
                              <button
                                onClick={() => {
                                  setSelectedTicket(ticket);
                                  setAdminNotes(ticket.adminNotes || "");
                                }}
                                className="inline-flex items-center gap-1.5 bg-[#0a2540] hover:bg-[#0d9488] text-white text-[10px] font-bold uppercase tracking-wider py-1.5 px-3.5 rounded-xs cursor-pointer transition-colors"
                              >
                                <Eye className="h-3.5 w-3.5" />
                                <span>Moderar</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {filteredTickets.length === 0 && (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-xs text-slate-400 font-sans">
                          Nenhum ticket de pagamento coincide com os filtros aplicados.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* SUBTAB 3: CONFIGURATION OF METHODS */}
        {activeSubTab === "methods" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-fade-in" id="finance-methods-view">
            
            {/* Form edit/add account */}
            <div className="lg:col-span-5 bg-white border border-slate-200 p-6 rounded-sm shadow-2xs space-y-4">
              <h3 className="font-display font-bold text-sm text-[#0a2540] uppercase tracking-wider border-b border-slate-100 pb-2">
                {editingMethodId ? "Editar Canal de Pagamento" : "Adicionar Canal de Pagamento"}
              </h3>

              <form onSubmit={handleSaveMethod} className="space-y-4 text-xs font-sans">
                <div className="flex flex-col">
                  <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1" htmlFor="m-name">
                    Nome Visível no Checkout *
                  </label>
                  <input
                    id="m-name"
                    type="text"
                    required
                    placeholder="e.g. M-Pesa (B2C)"
                    value={methodName}
                    onChange={(e) => setMethodName(e.target.value)}
                    className="px-3 py-2 border border-slate-200 focus:outline-[#0d9488] text-xs"
                  />
                </div>

                <div className="flex flex-col">
                  <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1" htmlFor="m-type">
                    Tipo de Canal *
                  </label>
                  <select
                    id="m-type"
                    value={methodType}
                    onChange={(e) => setMethodType(e.target.value)}
                    className="px-3 py-2 border border-slate-200 bg-white focus:outline-[#0d9488] text-xs"
                  >
                    <option value="mpesa">M-Pesa (Carteira Móvel)</option>
                    <option value="emola">e-Mola (Carteira Móvel)</option>
                    <option value="bank">Transferência Bancária</option>
                  </select>
                </div>

                <div className="flex flex-col">
                  <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1" htmlFor="m-acc-name">
                    Nome do Titular da Conta
                  </label>
                  <input
                    id="m-acc-name"
                    type="text"
                    placeholder="e.g. SmartCodai Academia"
                    value={methodAccountName}
                    onChange={(e) => setMethodAccountName(e.target.value)}
                    className="px-3 py-2 border border-slate-200 focus:outline-[#0d9488] text-xs"
                  />
                </div>

                {methodType !== "bank" ? (
                  <div className="flex flex-col">
                    <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1" htmlFor="m-phone">
                      Número de Telefone para Pagamento *
                    </label>
                    <input
                      id="m-phone"
                      type="text"
                      placeholder="e.g. 843308934"
                      value={methodPhone}
                      onChange={(e) => setMethodPhone(e.target.value)}
                      className="px-3 py-2 border border-slate-200 focus:outline-[#0d9488] text-xs font-mono"
                    />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex flex-col">
                      <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1" htmlFor="m-bank">
                        Banco *
                      </label>
                      <input
                        id="m-bank"
                        type="text"
                        placeholder="e.g. Millennium BIM"
                        value={methodBank}
                        onChange={(e) => setMethodBank(e.target.value)}
                        className="px-3 py-2 border border-slate-200 focus:outline-[#0d9488] text-xs"
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1" htmlFor="m-acc-num">
                        Número de Conta *
                      </label>
                      <input
                        id="m-acc-num"
                        type="text"
                        placeholder="e.g. 123456789"
                        value={methodAccountNumber}
                        onChange={(e) => setMethodAccountNumber(e.target.value)}
                        className="px-3 py-2 border border-slate-200 focus:outline-[#0d9488] text-xs font-mono"
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1" htmlFor="m-nib">
                        NIB (Número de Identificação Bancária)
                      </label>
                      <input
                        id="m-nib"
                        type="text"
                        placeholder="e.g. 000100000123456789012"
                        value={methodNib}
                        onChange={(e) => setMethodNib(e.target.value)}
                        className="px-3 py-2 border border-slate-200 focus:outline-[#0d9488] text-xs font-mono"
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1" htmlFor="m-iban">
                        IBAN
                      </label>
                      <input
                        id="m-iban"
                        type="text"
                        placeholder="e.g. MZ59000100000123456789012"
                        value={methodIban}
                        onChange={(e) => setMethodIban(e.target.value)}
                        className="px-3 py-2 border border-slate-200 focus:outline-[#0d9488] text-xs font-mono"
                      />
                    </div>
                  </div>
                )}

                <div className="flex flex-col">
                  <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1" htmlFor="m-inst">
                    Instruções para o Aluno (Exibidas no Checkout)
                  </label>
                  <textarea
                    id="m-inst"
                    placeholder="e.g. Por favor envie o valor exato. Comprovativo obrigatório."
                    value={methodInstructions}
                    onChange={(e) => setMethodInstructions(e.target.value)}
                    className="px-3 py-2 border border-slate-200 focus:outline-[#0d9488] text-xs min-h-[60px]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1" htmlFor="m-order">
                      Ordem de Exibição
                    </label>
                    <input
                      id="m-order"
                      type="number"
                      value={methodDisplayOrder}
                      onChange={(e) => setMethodDisplayOrder(Number(e.target.value))}
                      className="px-3 py-2 border border-slate-200 focus:outline-[#0d9488] text-xs font-mono"
                    />
                  </div>
                  
                  <div className="flex items-center gap-2 mt-4">
                    <input
                      id="m-active"
                      type="checkbox"
                      checked={methodIsActive}
                      onChange={(e) => setMethodIsActive(e.target.checked)}
                      className="h-4.5 w-4.5 accent-[#0d9488]"
                    />
                    <label className="text-xs font-bold text-slate-650" htmlFor="m-active">Método Ativo</label>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  {editingMethodId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingMethodId(null);
                        setMethodName("");
                        setMethodPhone("");
                        setMethodAccountName("");
                        setMethodBank("");
                        setMethodAccountNumber("");
                        setMethodNib("");
                        setMethodIban("");
                        setMethodInstructions("");
                      }}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold uppercase tracking-wider text-[10px] rounded-sm cursor-pointer"
                    >
                      Cancelar
                    </button>
                  )}
                  <button
                    type="submit"
                    className="flex-1 bg-[#0d9488] hover:bg-[#0f766e] text-white font-bold uppercase tracking-wider text-[10px] py-2.5 rounded-sm cursor-pointer"
                  >
                    {editingMethodId ? "Gravar Edição" : "Adicionar Método"}
                  </button>
                </div>
              </form>
            </div>

            {/* List active/inactive payment accounts */}
            <div className="lg:col-span-7 bg-white border border-slate-200 p-6 rounded-sm shadow-2xs space-y-4">
              <h3 className="font-display font-bold text-sm text-[#0a2540] uppercase tracking-wider border-b border-slate-100 pb-2">
                Métodos de Recebimento Ativos ({paymentMethods.length})
              </h3>

              <div className="space-y-4">
                {paymentMethods.map(method => (
                  <div 
                    key={method.id} 
                    className={`border p-4 rounded-sm flex items-start justify-between gap-4 transition-colors ${
                      method.isActive ? "border-slate-200 bg-white" : "border-slate-200 bg-slate-50/50 opacity-60"
                    }`}
                  >
                    <div className="flex items-start gap-3 text-left">
                      <div className="p-2 bg-slate-100 rounded-sm mt-0.5 text-slate-600">
                        {method.type === "bank" ? <Landmark className="h-5 w-5" /> : <Smartphone className="h-5 w-5" />}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-display font-bold text-xs text-[#0a2540]">{method.name}</h4>
                          <span className="text-[9px] font-mono uppercase bg-slate-100 px-1 text-slate-500 rounded-xs">Ordem: {method.displayOrder}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono leading-relaxed">
                          {method.type === "bank" ? (
                            <div>
                              <p>Banco: {method.bank}</p>
                              <p>Conta: {method.accountNumber}</p>
                              {method.nib && <p>NIB: {method.nib}</p>}
                            </div>
                          ) : (
                            <p>Número: {method.phone}</p>
                          )}
                          {method.accountName && <p className="font-sans text-[10.5px]">Titular: {method.accountName}</p>}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleEditMethodStart(method)}
                      className="text-[#0d9488] hover:bg-teal-50 border border-slate-200 hover:border-[#0d9488] text-[10px] font-mono uppercase font-bold py-1 px-2.5 rounded-xs transition-all cursor-pointer"
                    >
                      Configurar
                    </button>
                  </div>
                ))}
                {paymentMethods.length === 0 && (
                  <div className="p-6 text-center text-xs text-slate-400 font-sans border-2 border-dashed border-slate-200 rounded-sm">
                    Nenhum canal de pagamento configurado na base de dados de momento.
                  </div>
                )}
              </div>
            </div>

          </div>
        )}

      </div>

      {/* Ticket Moderation details Overlay Dialog */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-sm border border-slate-200 w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col text-left">
            
            {/* Header */}
            <div className="px-6 py-4 bg-[#0a2540] text-white flex items-center justify-between border-b border-teal-900 shrink-0">
              <div className="space-y-0.5">
                <span className="text-[9px] font-mono tracking-widest text-[#0d9488] uppercase font-bold">Consola de Validação</span>
                <h3 className="font-display font-bold text-sm uppercase tracking-wide">
                  Analisar Ticket {selectedTicket.ticketNumber}
                </h3>
              </div>
              <button 
                onClick={() => { setSelectedTicket(null); setAdminNotes(""); }} 
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
                  <span className="text-[9px] text-slate-400 font-mono block">Curso Solicitado</span>
                  <span className="font-bold text-[#0a2540] text-xs">{getCourseTitle(selectedTicket.courseId)}</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 font-mono block mb-1">Estado de Análise</span>
                  <span className={`text-[10px] font-mono font-bold uppercase tracking-wider border px-2.5 py-1 rounded-xs leading-none ${
                    selectedTicket.status === "APPROVED" ? "bg-emerald-50 text-emerald-800 border-emerald-250" :
                    selectedTicket.status === "PENDING" ? "bg-amber-50 text-amber-800 border-amber-250" :
                    selectedTicket.status === "UNDER_REVIEW" ? "bg-blue-50 text-blue-800 border-blue-250" :
                    "bg-rose-50 text-rose-800 border-rose-250"
                  }`}>
                    {selectedTicket.status}
                  </span>
                </div>
              </div>

              {/* Data fields grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
                <div className="border border-slate-150 p-3.5 rounded-sm">
                  <span className="text-[9px] font-mono uppercase tracking-wider text-slate-450 block mb-1.5">Perfil do Aluno</span>
                  {(() => {
                    const student = getUserProfile(selectedTicket.userId);
                    return (
                      <div className="space-y-1 text-slate-650">
                        <p><strong>Nome:</strong> {student?.fullName || "Não Encontrado"}</p>
                        <p><strong>Email:</strong> {student?.email || "Sem e-mail"}</p>
                        {student?.whatsapp && <p><strong>Whatsapp:</strong> {student.whatsapp}</p>}
                      </div>
                    );
                  })()}
                </div>

                <div className="border border-slate-150 p-3.5 rounded-sm">
                  <span className="text-[9px] font-mono uppercase tracking-wider text-slate-450 block mb-1.5">Dados Declarados</span>
                  <div className="space-y-1 text-slate-650">
                    <p><strong>Valor Curso:</strong> {selectedTicket.amount.toLocaleString("pt-PT")} MT</p>
                    <p><strong>Canal Pagamento:</strong> {getMethodName(selectedTicket.paymentMethodId)}</p>
                    {selectedTicket.payerPhone && <p><strong>Payer Phone:</strong> {selectedTicket.payerPhone}</p>}
                    <p className="truncate"><strong>Referência:</strong> <span className="font-mono bg-slate-105 p-0.5 rounded-xs border text-[11px] font-bold text-slate-800">{selectedTicket.transactionReference}</span></p>
                  </div>
                </div>
              </div>

              {/* Receipt Previewer */}
              <div className="space-y-2 text-left">
                <span className="text-[9px] font-mono uppercase font-bold text-slate-400">Comprovativo Anexado</span>
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
                        className="max-h-[300px] max-w-full object-contain border border-slate-200 rounded-xs bg-white shadow-3xs"
                      />
                      <a
                        href={selectedTicket.receiptUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 border border-slate-350 hover:border-slate-800 text-slate-600 hover:text-slate-850 text-[10px] font-bold uppercase tracking-wider py-1.5 px-3 bg-white rounded-xs cursor-pointer transition-colors"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        <span>Ver Imagem Original</span>
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Action input form for Notes */}
              <div className="flex flex-col text-left">
                <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1" htmlFor="adm-note">
                  Adicionar Observações / Motivo de Rejeição *
                </label>
                <textarea
                  id="adm-note"
                  required={selectedTicket.status === "PENDING" || selectedTicket.status === "UNDER_REVIEW"}
                  placeholder="Escreva notas para o aluno (obrigatório se rejeitar ou solicitar nova imagem)..."
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className="px-3 py-2 border border-slate-200 focus:outline-[#0d9488] text-xs min-h-[60px]"
                />
              </div>

              {/* Action Button Controls */}
              {selectedTicket.status !== "APPROVED" && (
                <div className="pt-4 border-t border-slate-150 flex flex-wrap gap-2.5 justify-end">
                  <button
                    type="button"
                    disabled={isActionLoading}
                    onClick={() => handleReviewAction("UNDER_REVIEW")}
                    className="px-3 py-2.5 border border-blue-300 hover:border-blue-600 bg-blue-50 text-blue-800 text-[10px] font-mono font-bold uppercase tracking-wider rounded-xs cursor-pointer transition-colors"
                  >
                    Solicitar nova imagem
                  </button>
                  <button
                    type="button"
                    disabled={isActionLoading}
                    onClick={() => handleReviewAction("REJECTED")}
                    className="px-3 py-2.5 border border-rose-300 hover:border-rose-600 bg-rose-50/50 text-rose-800 text-[10px] font-mono font-bold uppercase tracking-wider rounded-xs cursor-pointer transition-colors"
                  >
                    Rejeitar comprovativo
                  </button>
                  <button
                    type="button"
                    disabled={isActionLoading}
                    onClick={() => handleReviewAction("APPROVED")}
                    className="px-5 py-2.5 bg-[#0d9488] hover:bg-[#0f766e] text-white text-[10px] font-mono font-bold uppercase tracking-wider rounded-xs cursor-pointer transition-colors inline-flex items-center gap-1.5"
                  >
                    <Check className="h-4.5 w-4.5" />
                    <span>Aprovar Pagamento</span>
                  </button>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
