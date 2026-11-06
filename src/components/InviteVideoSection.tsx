import React, { useState } from "react";
import { extractWistiaId } from "../utils/videoUtils";
import { useWistia } from "../hooks/useWistia";

// ============================================================================
// CONFIGURAÇÃO DO VÍDEO DE CONVITE (WISTIA)
// Para alterar o vídeo de convite, basta colar abaixo o link do Wistia
// (ex: "https://fast.wistia.net/embed/iframe/b84w9s3h6v")
// ou o Media ID de 10 caracteres (ex: "b84w9s3h6v").
// ============================================================================
export const WISTIA_INVITE_VIDEO_URL = "https://fast.wistia.net/embed/iframe/b84w9s3h6v";

interface InviteVideoSectionProps {
  videoUrl?: string;
  onRegisterClick: () => void;
  onLoginClick: () => void;
  onExploreCourses?: () => void;
}

export default function InviteVideoSection({
  videoUrl = WISTIA_INVITE_VIDEO_URL,
  onRegisterClick,
  onLoginClick,
  onExploreCourses,
}: InviteVideoSectionProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const isWistiaReady = useWistia();

  // Extract Wistia ID if available
  const wistiaMediaId = extractWistiaId(videoUrl);

  return (
    <section 
      className="w-full bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-8 text-left relative overflow-hidden transition-all"
      id="invite-video-section"
    >
      {/* Background soft ambient accents */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-teal-50/70 via-indigo-50/20 to-transparent rounded-full blur-3xl pointer-events-none -mr-24 -mt-24" />

      <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Left Column (7 cols): Wistia Video Player Frame */}
        <div className="lg:col-span-7 flex flex-col space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#0d9488] bg-teal-50 px-2.5 py-1 rounded-md border border-teal-200/60">
              Vídeo de Convite e Apresentação
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              Duração: ~2 minutos
            </span>
          </div>

          {/* Video Container Aspect Ratio 16:9 */}
          <div className="relative w-full aspect-video bg-slate-900 rounded-xl overflow-hidden border border-slate-200 shadow-md">
            {isPlaying && wistiaMediaId ? (
              <iframe
                src={`https://fast.wistia.net/embed/iframe/${wistiaMediaId}?autoPlay=true`}
                title="Vídeo de Convite • Formador Aldo Valige"
                allow="autoplay; fullscreen"
                allowFullScreen
                className="w-full h-full border-0"
              />
            ) : (
              /* Video Poster with Play Button */
              <div 
                onClick={() => setIsPlaying(true)}
                className="relative w-full h-full cursor-pointer group flex items-center justify-center overflow-hidden"
              >
                <img
                  src="https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=1280&auto=format&fit=crop"
                  alt="Apresentação do Formador Aldo Valige"
                  className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500 opacity-90"
                />
                
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a2540]/90 via-[#0a2540]/40 to-transparent" />

                {/* Big Animated Play Button */}
                <div className="relative z-10 flex flex-col items-center gap-3">
                  <div className="w-16 h-16 rounded-full bg-[#0d9488] hover:bg-[#0f766e] text-white flex items-center justify-center shadow-lg transition-transform group-hover:scale-110">
                    <svg 
                      className="w-7 h-7 ml-1 fill-current" 
                      viewBox="0 0 24 24"
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                  <div className="text-center">
                    <span className="block text-xs font-bold text-white uppercase tracking-wider drop-shadow-sm">
                      Assistir Mensagem do Formador
                    </span>
                    <span className="block text-[10px] text-teal-200 font-mono mt-0.5">
                      Clique para reproduzir o vídeo
                    </span>
                  </div>
                </div>

                {/* Bottom Card Title Inside Frame */}
                <div className="absolute bottom-3 left-4 right-4 z-10 flex items-center justify-between text-white/90">
                  <span className="text-xs font-medium font-sans truncate">
                    Mensagem de Boas-Vindas • Formador Aldo Valige
                  </span>
                  <span className="text-[9.5px] font-mono bg-black/40 px-2 py-0.5 rounded text-white shrink-0">
                    Wistia HD
                  </span>
                </div>
              </div>
            )}
          </div>

          <p className="text-[10.5px] text-slate-400 font-sans italic text-left">
            * O vídeo acima explica como funciona a dinâmica dos cursos gravados, questionários e emissão de certificados na CUrsaQi.
          </p>
        </div>

        {/* Right Column (5 cols): Persuasive Copy and Direct Actions */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-5 text-left">
          
          <div className="space-y-3">
            <h2 className="font-display font-black text-xl sm:text-2xl text-[#0a2540] tracking-tight leading-snug">
              Aprenda Informática de Verdade, <span className="text-[#0d9488]">Sem Complicação</span>
            </h2>

            <p className="text-xs sm:text-sm text-slate-600 font-sans leading-relaxed">
              Olá! Eu criei a CUrsaQi para responder à necessidade real de Moçambique: um ensino prático, voltado para quem quer dominar o computador e resolver problemas técnicos do mercado de trabalho.
            </p>
          </div>

          {/* 3 Natural Commitments (Without Fake Statistics) */}
          <div className="space-y-2.5">
            <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl">
              <span className="text-[10px] font-mono font-bold text-[#0d9488] uppercase block tracking-wider">
                1. Passo a Passo do Zero
              </span>
              <p className="text-xs text-slate-700 font-sans mt-0.5 leading-normal">
                Você acompanha aulas gravadas na tela, podendo pausar, praticar e rever sempre que precisar.
              </p>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl">
              <span className="text-[10px] font-mono font-bold text-indigo-600 uppercase block tracking-wider">
                2. Fixação e Exame Final
              </span>
              <p className="text-xs text-slate-700 font-sans mt-0.5 leading-normal">
                Responda a questionários ao final de cada módulo para fixar o aprendizado e testar seus conhecimentos.
              </p>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl">
              <span className="text-[10px] font-mono font-bold text-amber-600 uppercase block tracking-wider">
                3. Certificado de Participação
              </span>
              <p className="text-xs text-slate-700 font-sans mt-0.5 leading-normal">
                Ao concluir o exame do curso, emita o seu certificado oficial de participação para enriquecer seu currículo.
              </p>
            </div>
          </div>

          {/* Persuasive Call-To-Action Buttons */}
          <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              onClick={onRegisterClick}
              className="flex-1 py-3 px-5 bg-[#0d9488] hover:bg-[#0f766e] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-sm cursor-pointer text-center"
            >
              Criar Conta Gratuita
            </button>

            <button
              onClick={onLoginClick}
              className="py-3 px-5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold uppercase tracking-wider rounded-xl transition-colors cursor-pointer text-center"
            >
              Iniciar Sessão
            </button>
          </div>

        </div>

      </div>
    </section>
  );
}
