import React, { useState, useEffect } from "react";
import { Sparkles, ArrowRight, MessageCircle, CheckCircle2, ChevronRight, ExternalLink } from "lucide-react";
import { Course, PromoBanner } from "../types";

interface RightAdsCardProps {
  onExploreCourses?: () => void;
  onCourseClick?: (course: Course) => void;
  courses?: Course[];
  banners?: PromoBanner[];
}

interface AdItem {
  id: string;
  badge: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  buttonText: string;
  actionType: "whatsapp" | "course" | "link" | "catalog";
  targetCourseId?: string;
  targetLinkUrl?: string;
  tagColor: string;
}

const DEFAULT_ADS: AdItem[] = [
  {
    id: "ad-whatsapp-vip",
    badge: "OFERTA EXCLUSIVA",
    title: "Aprenda Informática e Programação do Zero",
    subtitle: "Atendimento personalizado e suporte direto com o Formador Aldo Valige no WhatsApp.",
    imageUrl: "https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=720&auto=format&fit=crop",
    buttonText: "Falar no WhatsApp",
    actionType: "whatsapp",
    tagColor: "bg-[#25D366] text-white"
  },
  {
    id: "ad-certificados",
    badge: "CERTIFICADO INCLUSO",
    title: "Qualifique o Seu Currículo Profissional",
    subtitle: "Conclua aulas práticas, realize o exame final e emita o seu certificado oficial.",
    imageUrl: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=720&auto=format&fit=crop",
    buttonText: "Ver Todos os Cursos",
    actionType: "catalog",
    tagColor: "bg-[#0d9488] text-white"
  },
  {
    id: "ad-redes-dev",
    badge: "NOVO MÓDULO",
    title: "Redes de Computadores e Segurança Prática",
    subtitle: "Formação técnica completa e direta ao ponto para o mercado de trabalho em Moçambique.",
    imageUrl: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=720&auto=format&fit=crop",
    buttonText: "Explorar Programa",
    actionType: "catalog",
    tagColor: "bg-[#0a2540] text-teal-300 border border-teal-500/30"
  }
];

export default function RightAdsCard({ 
  onExploreCourses, 
  onCourseClick, 
  courses = [],
  banners = []
}: RightAdsCardProps) {
  const [currentAdIndex, setCurrentAdIndex] = useState(0);

  // Map active banners from Admin panel into AdItem format, or fallback to defaults
  const activeBanners = (banners || []).filter(b => b.isActive);
  const adsList: AdItem[] = activeBanners.length > 0
    ? activeBanners.map((b, idx) => {
        let actionType: "whatsapp" | "course" | "link" | "catalog" = "catalog";
        if (b.linkUrl && b.linkUrl.trim()) {
          actionType = "link";
        } else if (b.courseId) {
          actionType = "course";
        } else if (b.buttonText.toLowerCase().includes("whatsapp")) {
          actionType = "whatsapp";
        }

        return {
          id: b.id,
          badge: b.linkUrl ? "LINK OFICIAL" : (b.courseId ? "CURSO EM DESTAQUE" : "ANÚNCIO OFICIAL"),
          title: b.title,
          subtitle: b.subtitle,
          imageUrl: b.imageUrl || "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=720&auto=format&fit=crop",
          buttonText: b.buttonText || "Saber Mais",
          actionType,
          targetCourseId: b.courseId,
          targetLinkUrl: b.linkUrl,
          tagColor: idx % 2 === 0 ? "bg-[#0d9488] text-white" : "bg-[#25D366] text-white"
        };
      })
    : DEFAULT_ADS;

  useEffect(() => {
    if (adsList.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentAdIndex((prev) => (prev + 1) % adsList.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [adsList.length]);

  const ad = adsList[currentAdIndex] || adsList[0] || DEFAULT_ADS[0];

  const handleAction = () => {
    // 1. External link or specific URL configured by admin
    if (ad.targetLinkUrl && ad.targetLinkUrl.trim()) {
      let target = ad.targetLinkUrl.trim();
      if (!target.startsWith("http://") && !target.startsWith("https://") && !target.startsWith("//")) {
        if (target.startsWith("wa.me") || target.startsWith("api.whatsapp.com")) {
          target = `https://${target}`;
        } else if (!target.startsWith("/")) {
          target = `https://${target}`;
        }
      }
      window.open(target, "_blank", "noopener,noreferrer");
      return;
    }

    // 2. WhatsApp action
    if (ad.actionType === "whatsapp") {
      window.open("https://wa.me/258873308934?text=Ol%C3%A1%20Formador%20Aldo%20Valige!%20Tenho%20interesse%20nos%20cursos%20da%20CUrsaQi.", "_blank");
      return;
    }

    // 3. Specific course click
    if (ad.actionType === "course" && ad.targetCourseId && onCourseClick) {
      const found = courses.find(c => c.id === ad.targetCourseId);
      if (found) {
        onCourseClick(found);
        return;
      }
      if (onExploreCourses) onExploreCourses();
      return;
    }

    // 4. Default fallback: explore courses
    if (onExploreCourses) {
      onExploreCourses();
    }
  };

  return (
    <div 
      className="w-full h-full flex flex-col bg-[#061528] rounded-2xl border border-slate-800 shadow-xl overflow-hidden group transition-all duration-300 hover:border-teal-500/40"
      id="cursaqi-right-ads-card"
    >
      {/* Instagram-style Header */}
      <div className="p-3 bg-[#0a2540]/90 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <div className="relative">
            <img
              src="https://ik.imagekit.io/mdsiwq57o/CursaQI/Logotipo.png"
              alt="CUrsaQi"
              className="w-7 h-7 rounded-full object-cover border border-teal-500/50"
              referrerPolicy="no-referrer"
            />
            <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 border border-[#0a2540]" />
          </div>
          <div className="flex flex-col text-left min-w-0">
            <div className="flex items-center gap-1">
              <span className="text-xs font-bold text-white truncate font-sans">cursaqi_oficial</span>
              <CheckCircle2 className="h-3 w-3 text-teal-400 shrink-0" />
            </div>
            <span className="text-[9px] text-slate-400 font-mono leading-none">Patrocinado • Anúncio</span>
          </div>
        </div>

        <span className={`text-[8px] font-mono uppercase font-bold px-2 py-0.5 rounded-full ${ad.tagColor}`}>
          {ad.badge}
        </span>
      </div>

      {/* Visual Image Area (Vertical format: 4:5 / 9:16 Instagram aspect ratio) */}
      <div className="relative w-full aspect-[4/5] sm:aspect-[4/4.5] lg:aspect-[4/5] overflow-hidden bg-slate-900">
        <img
          src={ad.imageUrl}
          alt={ad.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 select-none"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#061528] via-[#061528]/30 to-transparent" />

        {/* Content Overlay at bottom of visual */}
        <div className="absolute bottom-0 inset-x-0 p-3.5 text-left space-y-1.5">
          <h4 className="text-sm font-display font-bold text-white leading-tight drop-shadow-md line-clamp-2">
            {ad.title}
          </h4>
          <p className="text-[11px] text-slate-200 font-sans leading-snug line-clamp-2 drop-shadow-sm">
            {ad.subtitle}
          </p>
        </div>
      </div>

      {/* Action CTA Bar */}
      <div className="p-3 bg-[#0a2540] border-t border-slate-800 flex items-center justify-between gap-2 mt-auto">
        <div className="flex items-center gap-1">
          {adsList.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentAdIndex(idx)}
              className={`h-1.5 rounded-full transition-all cursor-pointer ${
                idx === currentAdIndex ? "w-4 bg-teal-400" : "w-1.5 bg-slate-700 hover:bg-slate-500"
              }`}
              aria-label={`Ver anúncio ${idx + 1}`}
            />
          ))}
        </div>

        <button
          onClick={handleAction}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer shadow-md ${
            ad.actionType === "whatsapp"
              ? "bg-[#25D366] hover:bg-[#20ba59] text-white"
              : "bg-[#0d9488] hover:bg-[#0f766e] text-white"
          }`}
        >
          {ad.actionType === "whatsapp" ? (
            <MessageCircle className="h-3.5 w-3.5" />
          ) : ad.actionType === "link" ? (
            <ExternalLink className="h-3 w-3" />
          ) : null}
          <span>{ad.buttonText}</span>
          {ad.actionType !== "link" && <ArrowRight className="h-3 w-3" />}
        </button>
      </div>
    </div>
  );
}

