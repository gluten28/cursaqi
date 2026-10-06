import React, { useState, useEffect } from "react";
import { X, Copy, Check, Share2, MessageCircle, Send, ExternalLink } from "lucide-react";
import { getSocialShareLinks, copyToClipboard, triggerNativeShare } from "../utils/shareUtils";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  url: string;
  imageUrl?: string;
  onCopiedToast?: (message: string) => void;
}

export default function ShareModal({
  isOpen,
  onClose,
  title,
  description,
  url,
  imageUrl,
  onCopiedToast,
}: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const [supportsNativeShare, setSupportsNativeShare] = useState(false);

  useEffect(() => {
    if (typeof navigator !== "undefined" && !!navigator.share) {
      setSupportsNativeShare(true);
    }
  }, []);

  // Reset copied status when opened or URL changes
  useEffect(() => {
    if (isOpen) {
      setCopied(false);
    }
  }, [isOpen, url]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const shareText = description || "Confira este conteúdo formativo na plataforma CUrsaQi!";
  const shareLinks = getSocialShareLinks({
    title,
    text: shareText,
    url,
  });

  const handleCopy = async () => {
    const success = await copyToClipboard(url);
    if (success) {
      setCopied(true);
      if (onCopiedToast) {
        onCopiedToast("Link copiado para a área de transferência!");
      }
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleNativeShare = async () => {
    const shared = await triggerNativeShare({
      title,
      text: shareText,
      url,
    });
    if (shared) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-modal-title"
    >
      <div 
        className="bg-white w-full max-w-md rounded-md shadow-2xl border border-slate-200 overflow-hidden transform transition-all text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#0a2540] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#0d9488]/20 flex items-center justify-center text-[#0d9488]">
              <Share2 className="h-4 w-4" />
            </div>
            <div>
              <h3 id="share-modal-title" className="font-display font-bold text-base text-white">
                Partilhar Conteúdo
              </h3>
              <p className="text-[11px] text-slate-300">
                Divulgue este curso com colegas e nas suas redes sociais
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
            aria-label="Fechar janela"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content body */}
        <div className="p-5 space-y-5">
          {/* Preview Card */}
          <div className="flex items-start gap-3 p-3 bg-slate-50 border border-slate-200 rounded-sm">
            {imageUrl && (
              <img 
                src={imageUrl} 
                alt={title} 
                className="w-16 h-16 rounded-xs object-cover border border-slate-200 shrink-0" 
                referrerPolicy="no-referrer"
              />
            )}
            <div className="min-w-0 flex-1">
              <span className="text-[9px] font-mono uppercase font-bold tracking-wider text-[#0d9488] block">
                CUrsaQi // Partilha
              </span>
              <h4 className="font-display font-bold text-xs text-[#0a2540] truncate mt-0.5">
                {title}
              </h4>
              {description && (
                <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 leading-snug">
                  {description}
                </p>
              )}
            </div>
          </div>

          {/* Social Network Buttons */}
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-slate-400 block mb-3">
              Partilhar nas Redes Sociais:
            </span>
            <div className="grid grid-cols-5 gap-2 text-center">
              {/* WhatsApp */}
              <a
                href={shareLinks.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-1.5 p-2.5 rounded-sm hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 transition-colors border border-transparent hover:border-emerald-200 group"
                title="Partilhar no WhatsApp"
              >
                <div className="w-10 h-10 rounded-full bg-[#25D366]/15 group-hover:bg-[#25D366] text-[#25D366] group-hover:text-white flex items-center justify-center transition-colors shadow-xs">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                  </svg>
                </div>
                <span className="text-[10px] font-sans font-medium text-slate-600 group-hover:text-emerald-700">
                  WhatsApp
                </span>
              </a>

              {/* Facebook */}
              <a
                href={shareLinks.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-1.5 p-2.5 rounded-sm hover:bg-blue-50 text-slate-700 hover:text-blue-700 transition-colors border border-transparent hover:border-blue-200 group"
                title="Partilhar no Facebook"
              >
                <div className="w-10 h-10 rounded-full bg-[#1877F2]/15 group-hover:bg-[#1877F2] text-[#1877F2] group-hover:text-white flex items-center justify-center transition-colors shadow-xs">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </div>
                <span className="text-[10px] font-sans font-medium text-slate-600 group-hover:text-blue-700">
                  Facebook
                </span>
              </a>

              {/* X / Twitter */}
              <a
                href={shareLinks.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-1.5 p-2.5 rounded-sm hover:bg-slate-100 text-slate-700 hover:text-black transition-colors border border-transparent hover:border-slate-300 group"
                title="Partilhar no X (Twitter)"
              >
                <div className="w-10 h-10 rounded-full bg-slate-200 group-hover:bg-black text-slate-800 group-hover:text-white flex items-center justify-center transition-colors shadow-xs">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </div>
                <span className="text-[10px] font-sans font-medium text-slate-600 group-hover:text-black">
                  X
                </span>
              </a>

              {/* LinkedIn */}
              <a
                href={shareLinks.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-1.5 p-2.5 rounded-sm hover:bg-sky-50 text-slate-700 hover:text-[#0A66C2] transition-colors border border-transparent hover:border-sky-200 group"
                title="Partilhar no LinkedIn"
              >
                <div className="w-10 h-10 rounded-full bg-[#0A66C2]/15 group-hover:bg-[#0A66C2] text-[#0A66C2] group-hover:text-white flex items-center justify-center transition-colors shadow-xs">
                  <svg className="w-4.5 h-4.5 fill-current" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                  </svg>
                </div>
                <span className="text-[10px] font-sans font-medium text-slate-600 group-hover:text-[#0A66C2]">
                  LinkedIn
                </span>
              </a>

              {/* Telegram */}
              <a
                href={shareLinks.telegram}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-1.5 p-2.5 rounded-sm hover:bg-sky-50 text-slate-700 hover:text-[#229ED9] transition-colors border border-transparent hover:border-sky-200 group"
                title="Partilhar no Telegram"
              >
                <div className="w-10 h-10 rounded-full bg-[#229ED9]/15 group-hover:bg-[#229ED9] text-[#229ED9] group-hover:text-white flex items-center justify-center transition-colors shadow-xs">
                  <Send className="w-4.5 h-4.5" />
                </div>
                <span className="text-[10px] font-sans font-medium text-slate-600 group-hover:text-[#229ED9]">
                  Telegram
                </span>
              </a>
            </div>
          </div>

          {/* Copy Link Section */}
          <div className="pt-2 border-t border-slate-100">
            <label className="text-[10px] font-mono uppercase tracking-wider font-bold text-slate-400 block mb-2">
              Ou Copiar Ligação Direta:
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={url}
                className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-sm font-mono text-slate-600 select-all focus:outline-hidden focus:ring-1 focus:ring-[#0d9488]"
                onClick={(e) => (e.target as HTMLInputElement).select()}
              />
              <button
                type="button"
                onClick={handleCopy}
                className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-sm transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                  copied
                    ? "bg-emerald-600 text-white"
                    : "bg-[#0a2540] hover:bg-[#0d9488] text-white"
                }`}
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4" />
                    <span>Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    <span>Copiar</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Native Mobile Share Button (if supported) */}
          {supportsNativeShare && (
            <button
              onClick={handleNativeShare}
              className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider rounded-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <ExternalLink className="h-4 w-4 text-[#0d9488]" />
              <span>Abrir Opções de Partilha do Dispositivo</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
