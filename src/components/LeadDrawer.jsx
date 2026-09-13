import React, { useState } from 'react';
import { 
  X, 
  Star, 
  MapPin, 
  Phone, 
  Globe, 
  Instagram, 
  Facebook, 
  MessageSquare, 
  Copy, 
  Check, 
  Building2, 
  ExternalLink,
  Image as ImageIcon,
  Tag
} from 'lucide-react';

const STATUS_OPTIONS = [
  { id: 'novo', label: '🟡 Novo', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
  { id: 'contatado', label: '🔵 Contatado', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
  { id: 'em_negociacao', label: '🟣 Em Negociação', color: 'bg-purple-500/20 text-purple-300 border-purple-500/30' },
  { id: 'fechado', label: '🟢 Fechado', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
  { id: 'sem_interesse', label: '🔴 Sem Interesse', color: 'bg-rose-500/20 text-rose-300 border-rose-500/30' }
];

export default function LeadDrawer({ lead, onClose, onUpdateStatus }) {
  const [copied, setCopied] = useState(false);

  if (!lead) return null;

  const handleCopyTemplate = () => {
    if (!lead.whatsapp_template) return;
    navigator.clipboard.writeText(lead.whatsapp_template);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isCelular = lead.phone_type === 'celular';
  const cleanPhone = lead.phone ? lead.phone.replace(/\D/g, '') : '';
  const waUrl = isCelular && cleanPhone ? `https://wa.me/${cleanPhone}` : null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Background Overlay */}
      <div 
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Container */}
      <div className="relative w-full max-w-xl bg-slate-900 border-l border-slate-800/90 shadow-2xl z-50 flex flex-col h-full text-slate-100 overflow-y-auto">
        
        {/* Drawer Header */}
        <div className="sticky top-0 bg-slate-900/95 backdrop-blur-md p-6 border-b border-slate-800 flex items-start justify-between z-10">
          <div className="space-y-1 pr-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-violet-500/10 text-violet-400 border border-violet-500/20 flex items-center gap-1">
                <Tag size={12} />
                {lead.niche || 'Geral'}
              </span>
              
              {lead.rating && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20 flex items-center gap-1">
                  <Star size={12} className="fill-amber-400 text-amber-400" />
                  {lead.rating} {lead.reviews_count ? `(${lead.reviews_count})` : ''}
                </span>
              )}
            </div>

            <h2 className="text-xl font-extrabold text-white tracking-tight mt-1">
              {lead.business_name}
            </h2>
            <p className="text-xs text-slate-400 flex items-center gap-1">
              <MapPin size={13} className="text-slate-500" />
              {lead.city || 'Cidade não especificada'}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="p-6 space-y-6 flex-1">
          
          {/* Mudança Rápida de Status */}
          <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80 space-y-2">
            <label className="text-xs font-bold uppercase text-slate-400 tracking-wider block">
              Status do Pipeline
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {STATUS_OPTIONS.map((opt) => {
                const isSelected = lead.status === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => onUpdateStatus && onUpdateStatus(lead.id, opt.id)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all text-left flex items-center justify-between ${
                      isSelected
                        ? `${opt.color} ring-2 ring-violet-500/50 shadow-md`
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <span>{opt.label}</span>
                    {isSelected && <Check size={14} className="text-violet-400" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Ação Principal: WhatsApp CTA */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Ação de Contato Direct
            </h3>

            {isCelular && waUrl ? (
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-3 px-4 rounded-xl transition-all text-sm flex items-center justify-center gap-2.5 shadow-lg shadow-emerald-600/20"
              >
                <MessageSquare size={18} />
                <span>Iniciar Conversa no WhatsApp ({lead.phone})</span>
                <ExternalLink size={14} className="opacity-70" />
              </a>
            ) : (
              <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl text-xs text-slate-400 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Phone size={15} className="text-slate-500" />
                  <span>{lead.phone || 'Sem número'} <b className="text-amber-400">(Fixo)</b></span>
                </span>
                <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-mono">
                  Ligação Manual
                </span>
              </div>
            )}
          </div>

          {/* Template de Abordagem / Copy */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Template de Abordagem WhatsApp
              </h3>
              <button
                type="button"
                onClick={handleCopyTemplate}
                className="text-xs text-violet-400 hover:text-violet-300 font-bold flex items-center gap-1 bg-violet-500/10 hover:bg-violet-500/20 px-3 py-1 rounded-lg border border-violet-500/30 transition-all"
              >
                {copied ? (
                  <>
                    <Check size={14} className="text-emerald-400" />
                    <span className="text-emerald-400">Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy size={14} />
                    <span>Copiar Copy</span>
                  </>
                )}
              </button>
            </div>

            <textarea
              readOnly
              rows={6}
              value={lead.whatsapp_template || 'Nenhum template gerado para este lead.'}
              className="w-full p-3.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 font-mono leading-relaxed outline-none focus:border-violet-500 transition-colors"
            />
          </div>

          {/* Dados do Estabelecimento */}
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Detalhes Cadastrais
            </h3>

            <div className="bg-slate-950/60 rounded-xl border border-slate-800/80 divide-y divide-slate-800/60 text-xs">
              <div className="p-3 flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-2">
                  <Building2 size={15} className="text-slate-500" />
                  Razão / Nome:
                </span>
                <span className="font-semibold text-slate-200">{lead.business_name}</span>
              </div>

              <div className="p-3 flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-2">
                  <MapPin size={15} className="text-slate-500" />
                  Endereço:
                </span>
                <span className="font-medium text-slate-300 text-right max-w-[240px] truncate">
                  {lead.address || 'Não cadastrado'}
                </span>
              </div>

              <div className="p-3 flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-2">
                  <Globe size={15} className="text-slate-500" />
                  Website Institucional:
                </span>
                {lead.website_url ? (
                  <a 
                    href={lead.website_url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-violet-400 hover:underline font-bold flex items-center gap-1"
                  >
                    <span>Acessar Site</span>
                    <ExternalLink size={12} />
                  </a>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold text-[10px]">
                    Sem site
                  </span>
                )}
              </div>

              {/* Redes Sociais */}
              <div className="p-3 flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-2">
                  <Instagram size={15} className="text-slate-500" />
                  Redes Sociais:
                </span>
                <div className="flex items-center gap-2">
                  {lead.instagram_url ? (
                    <a
                      href={lead.instagram_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg bg-pink-500/10 text-pink-400 hover:bg-pink-500/20 border border-pink-500/30 transition-all"
                      title="Instagram"
                    >
                      <Instagram size={14} />
                    </a>
                  ) : null}

                  {lead.facebook_url ? (
                    <a
                      href={lead.facebook_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/30 transition-all"
                      title="Facebook"
                    >
                      <Facebook size={14} />
                    </a>
                  ) : null}

                  {!lead.instagram_url && !lead.facebook_url && (
                    <span className="text-slate-500 font-mono text-[11px]">Nenhuma cadastrada</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Galeria de Fotos / Imagem */}
          {(lead.image_url || (lead.photos && lead.photos.length > 0)) && (
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <ImageIcon size={14} />
                <span>Imagens do Local</span>
              </h3>

              <div className="grid grid-cols-2 gap-2">
                {lead.image_url && (
                  <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950 aspect-video">
                    <img 
                      src={lead.image_url} 
                      alt={lead.business_name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                {lead.photos && lead.photos.map((photoUrl, idx) => (
                  <div key={idx} className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950 aspect-video">
                    <img 
                      src={photoUrl} 
                      alt={`${lead.business_name} foto ${idx + 1}`} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Drawer Footer */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-all"
          >
            Fechar Painel
          </button>
        </div>

      </div>
    </div>
  );
}
