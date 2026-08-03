import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X, Check, Upload, Loader2, ArrowRight, ShieldCheck, HelpCircle } from "lucide-react";
import { Course, UserProfile, PaymentMethod, PaymentTicket } from "../types";
import { dbCreatePaymentTicket, dbUploadReceipt } from "../supabase";

const purchaseSchema = z.object({
  paymentMethodId: z.string().min(1, "Selecione um método de pagamento"),
  payerPhone: z.string().optional(),
});

type PurchaseFormData = z.infer<typeof purchaseSchema>;

interface PurchaseModalProps {
  course: Course;
  currentUser: UserProfile;
  paymentMethods: PaymentMethod[];
  onClose: () => void;
  onTicketCreated: (ticket: PaymentTicket) => void;
}

export default function PurchaseModal({
  course,
  currentUser,
  paymentMethods,
  onClose,
  onTicketCreated,
}: PurchaseModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const activeMethods = paymentMethods.filter(m => m.isActive);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<PurchaseFormData>({
    resolver: zodResolver(purchaseSchema),
    defaultValues: {
      paymentMethodId: "",
      payerPhone: "",
    }
  });

  const handleMethodSelect = (method: PaymentMethod) => {
    setSelectedMethod(method);
    setValue("paymentMethodId", method.id);
  };

  // Drag and drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (file: File) => {
    setFileError("");
    const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp", "application/pdf"];
    
    if (!allowedTypes.includes(file.type)) {
      setFileError("Apenas arquivos PNG, JPG, JPEG, WEBP ou PDF são permitidos.");
      setReceiptFile(null);
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      setFileError("O tamanho máximo do comprovativo é de 20 MB.");
      setReceiptFile(null);
      return;
    }

    setReceiptFile(file);
  };

  const onSubmit = async (data: PurchaseFormData) => {
    if (!receiptFile) {
      setFileError("O comprovativo de pagamento é obrigatório.");
      return;
    }

    setIsSubmitting(true);
    try {
      // Create temporary ticket code for folder path naming stability
      const tempTicketNum = `TCK-TEMP-${Date.now()}`;
      
      // Upload file to Supabase storage bucket
      const uploadedUrl = await dbUploadReceipt(receiptFile, currentUser.id, tempTicketNum);
      if (!uploadedUrl) {
        setFileError("Falha ao carregar o comprovativo. Tente novamente.");
        setIsSubmitting(false);
        return;
      }

      // Create ticket in db
      const ticket = await dbCreatePaymentTicket({
        userId: currentUser.id,
        courseId: course.id,
        paymentMethodId: data.paymentMethodId,
        amount: course.price,
        payerPhone: data.payerPhone || "",
        transactionReference: "",
        receiptUrl: uploadedUrl,
      });

      if (ticket) {
        onTicketCreated(ticket);
      } else {
        setFileError("Erro ao registrar o ticket de pagamento na base de dados.");
      }
    } catch (err: any) {
      console.error(err);
      setFileError("Ocorreu um erro no processamento do seu pagamento.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs font-sans">
      <div className="bg-white rounded-sm border border-slate-200 w-full max-w-lg shadow-2xl overflow-hidden flex flex-col text-left">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-[#0a2540] text-white flex items-center justify-between border-b border-teal-900 shrink-0">
          <div className="space-y-0.5">
            <span className="text-[9px] font-mono tracking-widest text-[#0d9488] uppercase font-bold">Checkout Seguro</span>
            <h3 className="font-display font-bold text-sm uppercase tracking-wide">
              {course.id === "PREMIUM_SUBSCRIPTION" ? "Subscrever Plano Premium" : "Comprar Curso"}
            </h3>
          </div>
          <button 
            onClick={onClose} 
            className="p-1 hover:bg-slate-800 rounded-full transition-colors text-slate-350 hover:text-white cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Scrollable Workspace */}
        <div className="p-6 overflow-y-auto max-h-[75vh] space-y-6">
          
          {/* Top Course Card preview summary */}
          <div className="bg-slate-50 border border-slate-150 p-4 rounded-sm flex items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[9px] uppercase font-mono tracking-wider font-bold text-slate-400">
                {course.id === "PREMIUM_SUBSCRIPTION" ? "Assinatura Selecionada" : "Curso Selecionado"}
              </span>
              <h4 className="font-display font-bold text-xs text-slate-800">{course.title}</h4>
            </div>
            <div className="text-right shrink-0">
              <span className="text-[9px] uppercase font-mono tracking-wider font-bold text-slate-400 block">Preço</span>
              <span className="text-sm font-extrabold text-[#0d9488] font-mono">{course.price.toLocaleString("pt-PT")} MT</span>
            </div>
          </div>

          {step === 1 ? (
            /* STEP 1: SELECT METHOD & VIEW NUMBERS */
            <div className="space-y-6">
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-[#0a2540] uppercase font-mono">1. Selecione o Método de Pagamento</h4>
                <p className="text-[11px] text-slate-500 leading-normal">
                  Selecione uma das opções abaixo para visualizar as instruções e os dados de conta para efetuar o pagamento.
                </p>
              </div>

              {activeMethods.length === 0 ? (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-sm text-center text-xs text-slate-500 leading-relaxed">
                  Não existem métodos de pagamento configurados pela administração de momento. Por favor tente mais tarde.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {activeMethods.map((method) => {
                    const isSelected = selectedMethod?.id === method.id;
                    return (
                      <button
                        key={method.id}
                        type="button"
                        onClick={() => handleMethodSelect(method)}
                        className={`p-4 rounded-sm border text-center flex flex-col items-center gap-2 cursor-pointer transition-all ${
                          isSelected
                            ? "bg-teal-50/50 border-[#0d9488] text-[#0d9488] font-semibold"
                            : "bg-white border-slate-200 hover:bg-slate-50 text-slate-650"
                        }`}
                      >
                        <span className="text-xs font-bold uppercase">{method.name}</span>
                        <span className="text-[9px] text-slate-400 uppercase font-mono">{method.type}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Instructions Panel based on selection */}
              {selectedMethod && (
                <div className="p-5 bg-teal-50/20 border border-teal-100 rounded-sm space-y-4">
                  <div className="space-y-1">
                    <span className="text-[9px] font-mono uppercase font-bold text-[#0d9488] block">Dados para Pagamento</span>
                    <h5 className="text-xs font-bold text-[#0a2540]">{selectedMethod.name}</h5>
                  </div>

                  <div className="text-xs text-slate-600 space-y-2 leading-relaxed font-sans">
                    {selectedMethod.type === "bank" ? (
                      <div className="grid grid-cols-1 gap-1.5 border-t border-teal-50 pt-2 font-mono text-[11px]">
                        <div><strong>Banco:</strong> {selectedMethod.bank}</div>
                        <div><strong>Titular:</strong> {selectedMethod.accountName}</div>
                        <div><strong>Conta:</strong> {selectedMethod.accountNumber}</div>
                        {selectedMethod.nib && <div><strong>NIB:</strong> {selectedMethod.nib}</div>}
                        {selectedMethod.iban && <div><strong>IBAN:</strong> {selectedMethod.iban}</div>}
                      </div>
                    ) : (
                      <div className="border-t border-teal-50 pt-2 font-mono text-sm font-bold text-slate-700">
                        Número: {selectedMethod.phone}
                        {selectedMethod.accountName && (
                          <div className="text-[11px] font-normal text-slate-500 font-sans mt-1">
                            Titular: {selectedMethod.accountName}
                          </div>
                        )}
                      </div>
                    )}

                    {selectedMethod.instructions && (
                      <div className="border-t border-teal-50 pt-3 text-[10.5px] text-slate-500 italic">
                        <strong>Instruções:</strong> {selectedMethod.instructions}
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-slate-150 flex justify-end">
                <button
                  type="button"
                  disabled={!selectedMethod}
                  onClick={() => setStep(2)}
                  className="px-5 py-2.5 bg-[#0a2540] hover:bg-[#0d9488] disabled:bg-slate-300 text-white font-bold uppercase tracking-wider text-[10px] rounded-sm cursor-pointer disabled:cursor-not-allowed transition-colors inline-flex items-center gap-2"
                >
                  <span>Já efetuei o pagamento</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ) : (
            /* STEP 2: TICKET FORM & COMPROVATIVO UPLOAD */
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold text-[#0a2540] uppercase font-mono">2. Registar Comprovativo</h4>
                <p className="text-[11px] text-slate-500 leading-normal">
                  Preencha os dados do pagamento efetuado e anexe a imagem ou PDF do comprovativo para moderação.
                </p>
              </div>

              {/* Readonly Info block fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-50 p-4 border border-slate-150 rounded-sm">
                <div>
                  <span className="text-[9px] text-slate-400 font-mono block">Nome do Aluno</span>
                  <span className="font-bold text-slate-700">{currentUser.fullName}</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 font-mono block">Email</span>
                  <span className="font-bold text-slate-700 truncate block">{currentUser.email}</span>
                </div>
                <div className="sm:col-span-2 pt-2 border-t border-slate-200 mt-2 flex justify-between">
                  <div>
                    <span className="text-[9px] text-slate-400 font-mono block">
                      {course.id === "PREMIUM_SUBSCRIPTION" ? "Plano Selecionado" : "Programa Académico"}
                    </span>
                    <span className="font-bold text-slate-700">{course.title}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] text-slate-400 font-mono block">Método Escolhido</span>
                    <span className="font-mono font-bold text-[#0d9488] uppercase">{selectedMethod?.name}</span>
                  </div>
                </div>
              </div>

              {/* Transaction details inputs */}
              <div className="space-y-4">
                {selectedMethod?.type !== "bank" && (
                  <div className="flex flex-col text-left">
                    <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1" htmlFor="p-phone">
                      Número Utilizado para Pagar
                    </label>
                    <input
                      id="p-phone"
                      type="text"
                      placeholder="e.g. 84XXXXXXX"
                      {...register("payerPhone")}
                      className="px-3 py-2 border border-slate-200 focus:outline-[#0d9488] text-xs font-mono"
                    />
                  </div>
                )}

                {/* Info note: transaction reference is read from the proof-of-payment photo by admin */}
                <div className="p-3 bg-teal-50/40 border border-teal-100 rounded-sm text-[10.5px] text-slate-600 leading-relaxed font-sans">
                  <span className="font-bold text-[#0d9488] block mb-1">ℹ️ Nota de Verificação</span>
                  A referência de transferência da operadora já estará visível na foto do comprovativo que irá anexar abaixo. O administrador irá comparar o comprovativo com a mensagem de transferência para aprovar a sua matrícula.
                </div>
              </div>

              {/* Proof File Uploader */}
              <div className="space-y-2 text-left">
                <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                  Upload do Comprovativo (Mínimo: PNG, JPG, JPEG, WEBP, PDF) *
                </label>
                
                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-sm p-6 text-center transition-all ${
                    dragActive ? "border-[#0d9488] bg-teal-50/20" : "border-slate-300 bg-slate-50 hover:bg-slate-100"
                  }`}
                >
                  <input
                    type="file"
                    id="receipt-file-input"
                    className="hidden"
                    accept=".png,.jpg,.jpeg,.webp,.pdf"
                    onChange={handleFileChange}
                  />
                  
                  <label htmlFor="receipt-file-input" className="cursor-pointer block space-y-3">
                    <Upload className="h-8 w-8 text-slate-400 mx-auto" />
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-700">
                        {receiptFile ? receiptFile.name : "Arraste e solte o seu ficheiro comprovativo aqui"}
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono">
                        {receiptFile 
                          ? `${(receiptFile.size / (1024 * 1024)).toFixed(2)} MB • Clique para alterar`
                          : "Formatos aceites: PNG, JPG, WEBP, PDF (Máx: 20MB)"
                        }
                      </p>
                    </div>
                  </label>
                </div>

                {fileError && (
                  <span className="text-rose-600 text-[10px] font-semibold block">{fileError}</span>
                )}
              </div>

              {/* Submit / Navigation controls */}
              <div className="pt-4 border-t border-slate-150 flex items-center justify-between gap-3">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setStep(1)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-sm text-[10px] font-mono uppercase font-bold hover:bg-slate-100 cursor-pointer disabled:cursor-not-allowed"
                >
                  Voltar
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-[#0d9488] hover:bg-[#0f766e] disabled:bg-slate-400 text-white font-bold uppercase tracking-wider text-[10px] py-2.5 rounded-sm cursor-pointer disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>A enviar ticket...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="h-3.5 w-3.5" />
                      <span>Enviar Ticket de Pagamento</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
