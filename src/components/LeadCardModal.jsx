import React, { useState, useEffect } from 'react';
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
  Tag,
  Send,
  FileText
} from 'lucide-react';
import { INITIAL_DEFAULT_TEMPLATES } from './CopyTemplates.jsx';

export default function LeadCardModal({ lead, onClose, onUpdateStatus }) {
  const [selectedTemplateId, setSelectedTemplateId] = useState('default');
  const [customCopy, setCustomCopy] = useState('');
  const [copied, setCopied] = useState(false);

  // Carrega templates cadastrados no CopyTemplates (localStorage) junto com os padrões
  const [allTemplates, setAllTemplates] = useState(() => {
    try {
      const stored = localStorage.getItem('jpas_copy_templates_v1.3');
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return INITIAL_DEFAULT_TEMPLATES;
  });

  if (!lead) return null;

  // Função para interpolar variáveis ({empresa}, {nicho}, {city}, {rating}) no texto do template
  const formatTemplateText = (tplText, leadObj) => {
    return tplText
      .replace(/{empresa}/g, leadObj.business_name || 'sua empresa')
      .replace(/{nicho}/g, leadObj.niche || 'seu nicho')
      .replace(/{city}/g, leadObj.city || 'sua região')
      .replace(/{rating}/g, leadObj.rating || '5.0');
  };

  const currentTemplateObj = allTemplates.find(t => t.id === selectedTemplateId) || allTemplates[0];
  const activeMessage = customCopy !== '' 
    ? customCopy 
    : (currentTemplateObj ? formatTemplateText(currentTemplateObj.text, lead) : '');

  const handleTemplateChange = (e) => {
    const id = e.target.value;
    setSelectedTemplateId(id);
    const found = allTemplates.find(t => t.id === id);
    if (found) {
      setCustomCopy(formatTemplateText(found.text, lead));
    }
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(activeMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isCelular = lead.phone_type === 'celular';
  const cleanPhone = lead.phone ? lead.phone.replace(/\D/g, '') : '';
  const waUrl = isCelular && cleanPhone 
    ? `https://wa.me/55${cleanPhone.startsWith('55') ? cleanPhone.slice(2) : cleanPhone}?text=${encodeURIComponent(activeMessage)}` 
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Background Overlay */}
      <div 
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl z-50 flex flex-col max-h-[90vh] text-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-5 bg-slate-950/80 border-b border-slate-800 flex items-start justify-between">
          <div className="space-y-1 pr-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full text-sm font-bold bg-violet-500/10 text-violet-400 border border-violet-500/30 flex items-center gap-1.5 shadow-[0_0_10px_rgba(139,92,246,0.2)]">
                <Tag size={14} />
                {lead.niche || 'Geral'}
              </span>
              
              {lead.rating && (
                <span className="px-3 py-1 rounded-full text-sm font-extrabold bg-amber-500/10 text-amber-300 border border-amber-500/30 flex items-center gap-1.5">
                  <Star size={14} className="fill-amber-400 text-amber-400" />
                  {lead.rating} {lead.reviews_count ? `(${lead.reviews_count} avaliações)` : ''}
                </span>
              )}

              <span className="px-3 py-1 rounded-full text-sm font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                Status: <strong className="text-white uppercase">{lead.status || 'novo'}</strong>
              </span>
            </div>

            <h2 className="text-2xl font-black text-white tracking-tight mt-1 flex items-center gap-2">
              <Building2 className="text-violet-400" size={24} />
              {lead.business_name}
            </h2>
            <p className="text-sm text-slate-400 flex items-center gap-1">
              <MapPin size={15} className="text-violet-400 flex-shrink-0" />
              {lead.address || lead.city || 'Endereço não especificado'}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2.5 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-all border border-slate-700"
            title="Fechar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1 custom-scrollbar">
          
          {/* Grid de Informações de Contato e Redes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Contato Telefônico */}
            <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-2">
              <span className="text-sm font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                <Phone size={15} className="text-violet-400" />
                Telefone & WhatsApp
              </span>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-base font-mono font-bold text-white">
                    {lead.phone || 'Não informado'}
                  </span>
                  <div className="mt-1">
                    {lead.phone_type === 'celular' ? (
                      <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold">
                        📱 CELULAR (WhatsApp Disponível)
                      </span>
                    ) : lead.phone_type === 'fixo' ? (
                      <span className="px-2.5 py-0.5 rounded-md bg-slate-800 text-slate-400 border border-slate-700 text-xs font-bold">
                        ☎️ TELEFONE FIXO
                      </span>
                    ) : (
                      <span className="text-slate-500 text-xs">Não classificado</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Presença Digital (Site & Redes) */}
            <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-2">
              <span className="text-sm font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                <Globe size={15} className="text-violet-400" />
                Presença Digital
              </span>
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">Website:</span>
                  {lead.website ? (
                    <a 
                      href={lead.website.startsWith('http') ? lead.website : `https://${lead.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-violet-400 hover:underline flex items-center gap-1 font-bold truncate max-w-[180px]"
                    >
                      {lead.website} <ExternalLink size={13} />
                    </a>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold text-xs">
                      SEM SITE 🎯 (Oportunidade)
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between text-sm pt-1 border-t border-slate-800/80">
                  <span className="text-slate-400">Redes Sociais:</span>
                  <div className="flex items-center gap-2">
                    {lead.instagram_url ? (
                      <a 
                        href={lead.instagram_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg bg-pink-500/10 text-pink-400 hover:bg-pink-500/20 border border-pink-500/30 transition-all"
                        title="Instagram"
                      >
                        <Instagram size={15} />
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
                        <Facebook size={15} />
                      </a>
                    ) : null}
                    {!lead.instagram_url && !lead.facebook_url && (
                      <span className="text-slate-500 text-xs">Nenhuma cadastrada</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Gestão de Copy Integrada (Seletor de Templates da Página CopyTemplates) */}
          <div className="bg-slate-950/80 p-5 rounded-2xl border border-violet-500/30 space-y-4 shadow-[0_0_20px_rgba(139,92,246,0.05)]">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <h3 className="text-base font-black text-white flex items-center gap-2 uppercase tracking-wide">
                  <MessageSquare size={18} className="text-violet-400" />
                  Gerenciador de Copy & Abordagem WhatsApp
                </h3>
                <p className="text-sm text-slate-400">
                  Selecione um template cadastrado na aba "Modelos de Copy" ou ajuste a mensagem livremente.
                </p>
              </div>

              {/* Seletor de Templates */}
              <div className="w-full sm:w-auto">
                <select
                  value={selectedTemplateId}
                  onChange={handleTemplateChange}
                  className="w-full sm:w-72 px-3.5 py-2.5 rounded-xl text-sm font-bold bg-slate-900 border border-slate-700 text-slate-200 outline-none focus:border-violet-500 transition-all cursor-pointer"
                >
                  {allTemplates.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Campo de Texto Editável da Mensagem */}
            <div className="space-y-3">
              <textarea
                value={activeMessage}
                onChange={(e) => setCustomCopy(e.target.value)}
                rows={5}
                className="w-full p-4 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-sm font-mono focus:outline-none focus:border-violet-500 transition-all leading-relaxed"
                placeholder="Escreva ou ajuste a mensagem de abordagem..."
              />

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
                <span className="text-xs text-slate-400">
                  💡 As variáveis do lead foram preenchidas automaticamente.
                </span>

                {/* Botões de Ação (Copiar & WhatsApp) */}
                <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={handleCopyText}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm flex items-center gap-2 transition-all border border-slate-700"
                  >
                    {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
                    {copied ? 'Copiado!' : 'Copiar Texto'}
                  </button>

                  {isCelular && waUrl ? (
                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                    >
                      <MessageSquare size={16} className="fill-white" />
                      Enviar no WhatsApp 💬
                    </a>
                  ) : (
                    <span className="px-4 py-2.5 rounded-xl bg-slate-800/50 text-slate-500 font-bold text-sm border border-slate-800 cursor-not-allowed" title="Número fixo ou indisponível para WhatsApp direto">
                      WhatsApp Indisponível (Fixo)
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Fotos ou Galeria (se houver) */}
          {(lead.image_url || (lead.photos && lead.photos.length > 0)) && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <ImageIcon size={15} className="text-violet-400" />
                <span>Galeria de Fotos do Local</span>
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {lead.image_url && (
                  <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 aspect-video shadow-md">
                    <img 
                      src={lead.image_url} 
                      alt={lead.business_name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                {lead.photos && lead.photos.map((photoUrl, idx) => (
                  <div key={idx} className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 aspect-video shadow-md">
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

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-950/90 border-t border-slate-800 flex items-center justify-between">
          <span className="text-sm text-slate-500 font-mono">
            ID: {lead.id}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm transition-all border border-slate-700"
          >
            Fechar Janela
          </button>
        </div>

      </div>
    </div>
  );
}
