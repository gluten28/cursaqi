import React, { useState, useEffect } from "react";
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

export default function RightAdsCard({ 
  onExploreCourses, 
  onCourseClick, 
  courses = [],
  banners = []
}: RightAdsCardProps) {
  const [currentAdIndex, setCurrentAdIndex] = useState(0);

  // Map active banners strictly from what is stored in the database (NO mock fallbacks)
  const activeBanners = (banners || []).filter(b => b.isActive);
  const sourceBanners = activeBanners.length > 0 ? activeBanners : (banners || []);

  const adsList: AdItem[] = sourceBanners.map((b, idx) => {
    let actionType: "whatsapp" | "course" | "link" | "catalog" = "catalog";
    if (b.linkUrl && b.linkUrl.trim()) {
      actionType = "link";
    } else if (b.courseId) {
      actionType = "course";
    } else if (b.buttonText && b.buttonText.toLowerCase().includes("whatsapp")) {
      actionType = "whatsapp";
    }

    return {
      id: b.id,
      badge: b.linkUrl ? "LINK OFICIAL" : (b.courseId ? "CURSO EM DESTAQUE" : "ANÚNCIO OFICIAL"),
      title: b.title,
      subtitle: b.subtitle || "",
      imageUrl: b.imageUrl || "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=720&auto=format&fit=crop",
      buttonText: b.buttonText || "Saber Mais",
      actionType,
      targetCourseId: b.courseId,
      targetLinkUrl: b.linkUrl,
      tagColor: idx % 2 === 0 ? "bg-[#0d9488] text-white" : "bg-[#25D366] text-white"
    };
  });

  useEffect(() => {
    if (adsList.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentAdIndex((prev) => (prev + 1) % adsList.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [adsList.length]);

  // If no banners are in the database, do NOT show hardcoded fallback mock ads
  if (adsList.length === 0) {
    return (
      <div 
        className="w-full h-full min-h-[350px] flex flex-col items-center justify-center bg-white border border-slate-200/90 rounded-2xl p-6 text-center shadow-xs"
        id="cursaqi-right-ads-card-empty"
      >
        <span className="text-[10px] font-mono font-bold tracking-widest text-[#0d9488] uppercase block mb-1">
          Anúncios Oficiais
        </span>
        <h4 className="font-display font-bold text-slate-800 text-sm">
          Nenhum anúncio ativo na base de dados
        </h4>
        <p className="text-[11px] text-slate-500 font-sans mt-1 max-w-xs leading-relaxed">
          Os anúncios e promoções cadastrados pelo administrador no painel serão exibidos aqui em tempo real.
        </p>
      </div>
    );
  }

  const ad = adsList[currentAdIndex] || adsList[0];

  const handleAction = () => {
    // 1. External link or specific URL configured in database by admin
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

    // 4. Default: explore courses
    if (onExploreCourses) {
      onExploreCourses();
    }
  };

  return (
    <div 
      className="w-full h-full flex flex-col bg-[#061528] rounded-2xl border border-slate-800 shadow-xl overflow-hidden group transition-all duration-300 hover:border-teal-500/40"
      id="cursaqi-right-ads-card"
    >
      {/* Instagram-style Header without icons */}
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
            <span className="text-xs font-bold text-white truncate font-sans">cursaqi_oficial</span>
            <span className="text-[9px] text-slate-400 font-mono leading-none">Patrocinado • Anúncio</span>
          </div>
        </div>

        <span className={`text-[8.5px] font-mono uppercase font-bold px-2 py-0.5 rounded-full ${ad.tagColor}`}>
          {ad.badge}
        </span>
      </div>

      {/* Visual Image Area (Vertical format: 4:5 Instagram aspect ratio) */}
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

      {/* Action CTA Bar without icons */}
      <div className="p-3 bg-[#0a2540] border-t border-slate-800 flex items-center justify-between gap-2 mt-auto">
        <div className="flex items-center gap-1.5">
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
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer shadow-md ${
            ad.actionType === "whatsapp"
              ? "bg-[#25D366] hover:bg-[#20ba59] text-white"
              : "bg-[#0d9488] hover:bg-[#0f766e] text-white"
          }`}
        >
          {ad.buttonText}
        </button>
      </div>
    </div>
  );
}
