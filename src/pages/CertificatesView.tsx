import React from "react";
import { Award, ShieldCheck, Calendar, ExternalLink, ShieldAlert, MapPin, Truck } from "lucide-react";
import { UserProfile, Course } from "../types";

interface CertificatesViewProps {
  user: UserProfile;
  courses: Course[];
  onViewCertificate: (course: Course, examScore: number, examDate: string, certificateId: string) => void;
}

export default function CertificatesView({
  user,
  courses,
  onViewCertificate,
}: CertificatesViewProps) {
  // Extract all eligible progress records with an exam score of >= 80
  const passProgress = user.enrolledCourseProgress?.filter(
    (p) => p.examScore !== undefined && p.examScore >= 80
  ) || [];

  // Match corresponding course objects
  const certificatesData = passProgress.map((prog) => {
    const course = courses.find((c) => c.id === prog.courseId);
    return {
      progress: prog,
      course: course,
    };
  }).filter((item) => item.course !== undefined) as { progress: any; course: Course }[];

  return (
    <div className="w-full bg-[#f8fafc] font-sans min-h-screen py-10 px-4" id="certificates-view-tab">
      <div className="w-full max-w-5xl mx-auto space-y-6">
        
        {/* Info Banner about Physical Certificate */}
        <div className="bg-[#0a2540] text-white p-6 rounded-sm text-left shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-6" id="physical-cert-promo-banner">
          <div className="space-y-2 max-w-2xl">
            <h3 className="font-display font-bold text-lg md:text-xl text-[#0d9488] tracking-tight flex items-center gap-2">
              <Award className="h-6 w-6 text-[#0d9488]" />
              Direito a Certificado de Participação Físico
            </h3>
            <p className="text-xs text-slate-350 leading-relaxed font-sans">
              Sabia? Na nossa plataforma, além do seu certificado digital instantâneo, no final de cada curso concluído você terá direito a um <strong>certificado de participação físico oficial</strong>, impresso em papel timbrado institucional de alta gramatura e assinado pela Direcção Pedagógica.
            </p>
            <p className="text-[11px] text-slate-400 font-sans flex items-center gap-1.5 mt-2">
              <MapPin className="h-3.5 w-3.5 text-[#0d9488] shrink-0" />
              Será enviado gratuitamente para a sua morada de registo: <strong className="text-white">{user.address || "Endereço não cadastrado no seu perfil."}</strong>
            </p>
          </div>
          <div className="flex flex-col justify-center items-center md:items-end bg-slate-800/40 p-4 border border-slate-700/40 rounded-sm shrink-0">
            <Truck className="h-8 w-8 text-[#0d9488] mb-1.5" />
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">Envio Postal Grátis</span>
          </div>
        </div>

        {certificatesData.length === 0 ? (
          /* Empty state: No certificates earned yet */
          <div className="w-full max-w-2xl mx-auto text-center py-16 bg-white border border-slate-200 rounded-sm shadow-xs space-y-6">
            <Award className="h-16 w-16 text-slate-300 mx-auto" />
            <div className="space-y-2">
              <h2 className="font-display font-bold text-xl md:text-2xl text-[#0a2540] tracking-tight">
                Nenhum Certificado Obtido
              </h2>
              <p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
                Você ainda não possui certificados emitidos. Complete as aulas em vídeo de qualquer curso em que está matriculado e realize o exame final com aproveitamento igual ou superior a <strong>80%</strong> para obter a sua certificação.
              </p>
            </div>
          </div>
        ) : (
          /* Certificates listing grid */
          <div className="space-y-4">
            <h3 className="font-display font-bold text-lg text-[#0a2540] text-left border-b border-slate-200 pb-2">
              Seus Certificados Disponíveis ({certificatesData.length})
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {certificatesData.map(({ progress, course }) => (
                <div 
                  key={progress.certificateId} 
                  className="bg-white border border-slate-200 rounded-sm overflow-hidden flex flex-col justify-between p-5 text-left shadow-xs hover:shadow-sm transition-all"
                  id={`cert-card-${progress.certificateId}`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-mono bg-teal-50 text-[#0d9488] border border-teal-200 px-2 py-0.5 rounded-sm uppercase tracking-wider font-bold">
                        Aproveitamento: {progress.examScore}%
                      </span>
                      <span className="text-[9px] font-mono text-slate-400">
                        {progress.examDate}
                      </span>
                    </div>

                    <h4 className="font-display font-bold text-sm text-[#0a2540] line-clamp-2">
                      {course.title}
                    </h4>

                    <div className="border-t border-slate-100 pt-2.5 flex flex-col text-[10.5px] font-mono text-slate-500 space-y-0.5">
                      <span>ID: <strong className="text-slate-700">{progress.certificateId}</strong></span>
                      <span>Docente: <strong className="text-slate-700">{course.instructorName}</strong></span>
                    </div>
                  </div>

                  <div className="border-t border-slate-100 mt-4 pt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                    <div className="text-[10px] text-slate-400 leading-tight text-left">
                      <span className="block font-semibold text-[#0d9488]">Certificado Físico:</span>
                      <span className="block">Pronto para envio para: {user.address ? `${user.address.slice(0, 25)}...` : "Morada não registada"}</span>
                    </div>
                    <button
                      onClick={() => onViewCertificate(course, progress.examScore, progress.examDate, progress.certificateId)}
                      className="bg-[#0a2540] hover:bg-[#0d9488] text-white text-[11px] font-bold uppercase tracking-wider py-2 px-4 rounded-sm transition-colors cursor-pointer inline-flex items-center justify-center gap-1.5"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      <span>Ver Certificado</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

