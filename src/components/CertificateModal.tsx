import React from "react";
import { X, Printer, ShieldCheck, QrCode, ShieldAlert, Award } from "lucide-react";

import { Course, UserProfile } from "../types";

interface CertificateModalProps {
  course: Course;
  user: UserProfile;
  examScore: number;
  examDate: string;
  certificateId: string;
  onClose: () => void;
}

export default function CertificateModal({
  course,
  user,
  examScore,
  examDate,
  certificateId,
  onClose,
}: CertificateModalProps) {
  const workload = course.lessonsCount * 3; // Estimated academic hours

  const handlePrint = () => {
    window.print();
  };

  return (
    <div 
      className="w-full min-h-screen bg-slate-50 font-sans pb-12 animate-fade-in text-slate-800"
      id="certificate-page-view"
    >
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" style={{ padding: "32px 16px" }}>
        {/* Navigation Breadcrumb Back */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fade-in">
          <button 
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#0a2540] hover:text-[#0d9488] transition-colors bg-white border border-slate-200 py-2.5 px-5 rounded-sm shadow-2xs cursor-pointer"
            id="back-to-dashboard-btn"
          >
            ← Voltar para o Painel / Início
          </button>
        </div>

        {/* Anti-fraud / Regulatory status notice banner */}
        <div className="mb-6 bg-slate-100 border-l-4 border-slate-600 text-slate-800 p-4 rounded-sm text-xs leading-relaxed font-sans flex items-start gap-3 shadow-xs" id="cert-regulatory-notice">
          <ShieldAlert className="h-5 w-5 text-slate-700 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-extrabold text-slate-950 uppercase tracking-widest text-[10px] block">Aviso de Isenção Regulamentar</span>
            <p className="text-slate-600 text-[11px]">
              <strong>Nota Importante:</strong> O certificado disponibilizado abaixo destina-se unicamente a fins de demonstração académica e prática de aproveitamento curricular simulado. <strong>Estes certificados não possuem caráter oficial</strong>, não são homologados pelo Ministério da Educação, e <strong>não possuem certificação profissional reconhecida junto a nenhuma entidade reguladora, ordem profissional ou autoridade pública competente</strong>.
            </p>
          </div>
        </div>

        {/* Wrapper to hold buttons and certificate */}
        <div 
          className="w-full bg-white rounded-sm shadow-sm flex flex-col overflow-hidden text-[#0a2540] border border-slate-200"
          id="certificate-modal-box"
        >
        {/* Actions header toolbar */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-[#0d9488]" />
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold">
              Certificado Verificado Academicamente // ID: {certificateId}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 bg-[#0d9488] hover:bg-[#0f766e] text-white text-xs font-bold uppercase tracking-wider py-1.5 px-3 rounded-sm transition-colors cursor-pointer"
              title="Exportar como PDF ou Imprimir"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Imprimir / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 h-8 w-8 hover:bg-slate-200 text-slate-500 hover:text-slate-800 rounded-full transition-colors flex items-center justify-center cursor-pointer font-bold"
              title="Fechar"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Certificate Landscape Panel Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10 flex justify-center bg-slate-100">
          {/* Main Certificate printable canvas card layout (landscape aspect ratio) */}
          <div 
            id="print-certificate-target"
            className="w-full max-w-3xl aspect-[1.414/1] bg-white border-[12px] border-[#0a2540] p-8 md:p-12 shadow-md relative flex flex-col justify-between text-center select-text select-none overflow-hidden"
          >
            {/* Subtle thin decorative inner frame border */}
            <div className="absolute inset-2 border border-slate-300 pointer-events-none" />

            {/* Corner traditional decoration markers */}
            <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-[#0d9488]" />
            <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-[#0d9488]" />
            <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-[#0d9488]" />
            <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-[#0d9488]" />

            {/* Top branding section */}
            <div className="space-y-2 mt-2">
              <div className="flex items-center justify-center gap-2">
                <span className="w-6 h-6 bg-[#0a2540] text-white flex items-center justify-center rounded-xs text-xs font-bold">
                  C
                </span>
                <span className="font-display text-base font-bold tracking-widest text-[#0a2540] uppercase">
                  CURSAQI ACADEMIA DE ENSINO
                </span>
              </div>
              <div className="text-[10px] font-mono tracking-widest text-[#0d9488] font-bold uppercase">
                CERTIFICADO DE PROGRESSO & CONCLUSÃO ACADÉMICA
              </div>
              <div className="w-16 h-[2px] bg-[#0d9488] mx-auto mt-2" />
            </div>

            {/* Central credential statement */}
            <div className="my-6 space-y-4">
              <p className="font-serif italic text-xs text-slate-500">
                Certificamos, para efeitos de aproveitamento e registo pedagógico interno, que o(a) estudante
              </p>
              
              <h3 className="font-display text-2xl md:text-3xl font-extrabold text-[#0a2540] tracking-tight py-1 border-b border-slate-100 max-w-md mx-auto">
                {user.fullName}
              </h3>

              <p className="font-serif italic text-xs text-slate-500 leading-relaxed max-w-lg mx-auto">
                concluiu de forma regulamentar todas as aulas virtuais teórico-práticas do curso livre de formação de especialização profissional pedagógica e obteve aproveitamento em avaliação estruturada:
              </p>

              <h4 className="font-display text-lg md:text-xl font-bold text-[#0d9488] tracking-tight uppercase">
                {course.title}
              </h4>

              <div className="flex justify-center items-center gap-6 text-xs font-mono text-slate-600 mt-2">
                <div className="bg-slate-50 px-3 py-1 border border-slate-100 text-[11px]">
                  CARGA HORÁRIA: <strong className="text-[#0a2540]">{workload} Horas</strong>
                </div>
                <div className="bg-slate-50 px-3 py-1 border border-slate-100 text-[11px]">
                  EXAME FINAL: <strong className="text-[#0a2540]">{examScore}% de Aproveitamento</strong>
                </div>
              </div>
            </div>

            {/* Bottom stamp, signatures & validation section */}
            <div className="grid grid-cols-12 gap-4 items-end mt-4 border-t border-slate-100 pt-6">
              
              {/* Validation dates and validation code */}
              <div className="col-span-4 text-left space-y-1">
                <div className="text-[9px] uppercase font-mono text-slate-400">Dados do Documento</div>
                <div className="text-[9.5px] font-mono text-slate-600 leading-tight">
                  <span className="block">Emissão: <strong className="text-slate-800">{examDate}</strong></span>
                  <span className="block mt-0.5">Identidade: <strong className="text-slate-800 text-[9px]">{certificateId}</strong></span>
                  <span className="block mt-0.5">Registo: <strong className="text-slate-800 text-[9px]">CQ-MOZ-REG-{certificateId.slice(-4).toUpperCase()}</strong></span>
                </div>
              </div>

              {/* Physical Monochromatic Signature Stamp Seal */}
              <div className="col-span-4 flex flex-col items-center justify-center">
                {/* SVG Artistic Signature representation for "Director Academico" */}
                <div className="w-32 h-10 relative flex items-center justify-center border-b border-slate-300">
                  <svg viewBox="0 0 100 30" className="w-full h-full text-slate-700 opacity-90">
                    {/* Draw manual-like elegant continuous path signature stroke lines */}
                    <path 
                      d="M10 20 C 25 5, 30 25, 45 10 C 60 -5, 75 18, 90 8 M50 15 L70 5" 
                      fill="none" 
                      stroke="#0d9488" 
                      strokeWidth="1.5" 
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="absolute bottom-1 right-2 text-[8px] font-mono text-slate-300 tracking-tighter uppercase select-none">
                    ASSINADO
                  </span>
                </div>
                <div className="text-[8px] uppercase tracking-wider font-mono text-slate-400 font-bold mt-1.5">
                  Direcção Pedagógica CUrsaQi
                </div>
              </div>

              {/* Solid Monochrome custom QR Code SVG */}
              <div className="col-span-4 flex flex-col items-end">
                <div className="p-1.5 bg-slate-55 border border-slate-200 rounded-sm">
                  {/* Generate fully vector static QR mesh layout visually representing certificate verification */}
                  <svg viewBox="0 0 50 50" className="h-[44px] w-[44px] text-slate-800 fill-current">
                    {/* Visual pattern representation in solid flat blocks */}
                    <rect x="0" y="0" width="12" height="12" />
                    <rect x="2" y="2" width="8" height="8" fill="white" />
                    <rect x="4" y="4" width="4" height="4" />

                    <rect x="38" y="0" width="12" height="12" />
                    <rect x="40" y="2" width="8" height="8" fill="white" />
                    <rect x="42" y="4" width="4" height="4" />

                    <rect x="0" y="38" width="12" height="12" />
                    <rect x="2" y="40" width="8" height="8" fill="white" />
                    <rect x="4" y="42" width="4" height="4" />

                    {/* Simulating QR block pixels around */}
                    <rect x="18" y="4" width="4" height="4" />
                    <rect x="26" y="2" width="4" height="4" />
                    <rect x="30" y="8" width="4" height="4" />

                    <rect x="6" y="16" width="4" height="4" />
                    <rect x="14" y="22" width="8" height="4" />
                    <rect x="18" y="14" width="4" height="8" />

                    <rect x="28" y="16" width="6" height="4" />
                    <rect x="34" y="24" width="4" height="8" />
                    
                    <rect x="14" y="34" width="8" height="6" />
                    <rect x="26" y="38" width="4" height="6" />
                    <rect x="34" y="36" width="10" height="4" />
                    <rect x="42" y="42" width="6" height="6" />
                  </svg>
                </div>
                <span className="text-[7.5px] tracking-tight font-mono text-slate-400 mt-1 uppercase">
                  Código de Validação QR
                </span>
              </div>
            </div>

            {/* Legal warning disclaimer note required to establish proper completion statement */}
            <div className="text-[7px] text-slate-400 font-sans border-t border-slate-100 pt-3 leading-tight select-none mt-4 text-center">
              Nota de Isenção Regulamentar: Este documento constitui um registo de demonstração de aproveitamento prático em curso livre. Não possui valor oficial ou legal, não foi homologado ou validado por Ministérios da Educação ou entidades reguladoras de ensino, e não possui reconhecimento de competência por autoridades profissionais ou entidades externas responsáveis.
            </div>
          </div>
        </div>

        {/* Physical Certificate Claim Banner */}
        <div className="p-6 bg-teal-50 border-t border-b border-slate-200 text-left space-y-2 font-sans" id="physical-certificate-claim-banner">
          <h4 className="text-xs font-extrabold text-[#0a2540] uppercase tracking-wider flex items-center gap-1.5">
            <Award className="h-4.5 w-4.5 text-[#0d9488]" />
            Seu Certificado de Participação Físico está Disponível!
          </h4>
          <p className="text-xs text-slate-650 leading-relaxed">
            Parabéns pela sua graduação no curso <strong>{course.title}</strong>! Como aluno concluinte com aproveitamento regulamentar, você tem direito a receber o seu <strong>certificado de participação físico oficial</strong>, impresso em papel timbrado institucional de alta qualidade com selo em relevo e assinado pela Direcção Pedagógica.
          </p>
          <div className="bg-white p-4 border border-slate-200 rounded-sm mt-3 text-xs text-slate-600 space-y-1.5 max-w-xl">
            <span className="block font-bold text-slate-700 text-[11px] uppercase tracking-wider">Dados de Envio Postal Registados:</span>
            <span className="block"><strong>Destinatário:</strong> {user.fullName}</span>
            <span className="block"><strong>Morada para Envio:</strong> {user.address || "Endereço não cadastrado no perfil."}</span>
            <span className="block text-slate-400 mt-2 text-[10px]">
              * Nota: O envio é totalmente gratuito. Se precisar de atualizar a sua morada de envio ou pretender o envio urgente via transportadora parceira, aceda ao seu Perfil ou contacte-nos directamente pelo canal WhatsApp do Orientador.
            </span>
          </div>
        </div>

        {/* Modal footer information */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs font-sans text-slate-400">
          <span>SISTEMA DE AUDITORIA PEDAGÓGICA CURSAQI</span>
          <span>© 2026 CURSAQI ACADEMIA</span>
        </div>
      </div>

      {/* Embedded print element style strictly active inside print tasks */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body * {
            visibility: hidden !important;
          }
          #print-certificate-target, #print-certificate-target * {
            visibility: visible !important;
          }
          #print-certificate-target {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            margin: 0 !important;
            padding: 30px !important;
            background: white !important;
            border: 8px solid #0a2540 !important;
            box-shadow: none !important;
            z-index: 99999999 !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: space-between !important;
            align-items: stretch !important;
            box-sizing: border-box !important;
          }
        }
      `}} />
    </div>
  </div>
  );
}
