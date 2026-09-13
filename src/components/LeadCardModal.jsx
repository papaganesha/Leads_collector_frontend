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
  Tag,
  Send,
  FileText
} from 'lucide-react';

// Templates de Copy pré-definidos para o Seletor
const DEFAULT_TEMPLATES = [
  {
    id: 'default',
    name: '🎯 Padrão de Prospecção (Personalizado)',
    text: (lead) => `Olá ${lead.business_name || 'Tudo bem?'}, tudo bem? Soube que vocês são referência em ${lead.niche || 'sua região'} em ${lead.city || 'sua cidade'}. Olhei o perfil de vocês no Google e notei que vocês ainda não possuem um site profissional otimizado para captar clientes na internet. Nós da Jpas Tech criamos máquinas de vendas automatizadas que colocam seu negócio no topo do Google. Faz sentido conversarmos 5 minutinhos esta semana?`
  },
  {
    id: 'sem_site',
    name: '🚀 Focado em Oportunidade (Sem Site)',
    text: (lead) => `Olá equipe da ${lead.business_name || 'Empresa'}, achei vocês aqui pelo Google Maps e vi que estão com excelentes avaliações (${lead.rating || '5.0'} ⭐)! Uma pena que notei que vocês não têm site próprio. Hoje mais de 80% dos clientes buscam serviços no Google antes de decidir. Vocês estão perdendo clientes para a concorrência todos os dias. Posso te mostrar como resolver isso em 10 minutos?`
  },
  {
    id: 'curto',
    name: '⚡ Abordagem Curta & Direta',
    text: (lead) => `Oi ${lead.business_name}, tudo bem? Soube que vocês são destaque em ${lead.niche || 'seu nicho'} em ${lead.city || 'sua cidade'}. Sou especialista em posicionar empresas no topo do Google e gerar novos clientes no automático. Tem 5 minutos hoje para eu te mostrar uma demonstração rápida?`
  }
];

export default function LeadCardModal({ lead, onClose, onUpdateStatus }) {
  const [selectedTemplateId, setSelectedTemplateId] = useState('default');
  const [customCopy, setCustomCopy] = useState('');
  const [copied, setCopied] = useState(false);
  const [savedTemplates, setSavedTemplates] = useState(() => {
    try {
      const stored = localStorage.getItem('jpas_saved_copy_templates');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [newTemplateName, setNewTemplateName] = useState('');
  const [showSaveBox, setShowSaveBox] = useState(false);

  if (!lead) return null;

  // Inicializa o texto da copy baseado no template selecionado
  const allTemplates = [
    ...DEFAULT_TEMPLATES.map(t => ({ id: t.id, name: t.name, text: t.text(lead) })),
    ...savedTemplates.map(t => ({ id: t.id, name: t.name, text: t.text }))
  ];

  const currentTemplateObj = allTemplates.find(t => t.id === selectedTemplateId) || allTemplates[0];
  const activeMessage = customCopy !== '' ? customCopy : (currentTemplateObj ? currentTemplateObj.text : '');

  const handleTemplateChange = (e) => {
    const id = e.target.value;
    setSelectedTemplateId(id);
    const found = allTemplates.find(t => t.id === id);
    if (found) {
      setCustomCopy(found.text);
    }
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(activeMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveCurrentAsTemplate = () => {
    if (!newTemplateName.trim()) {
      alert('Digite um nome para o novo template.');
      return;
    }
    const newTpl = {
      id: 'custom_' + Date.now(),
      name: `💾 ${newTemplateName.trim()}`,
      text: activeMessage
    };
    const updated = [...savedTemplates, newTpl];
    setSavedTemplates(updated);
    localStorage.setItem('jpas_saved_copy_templates', JSON.stringify(updated));
    setNewTemplateName('');
    setShowSaveBox(false);
    setSelectedTemplateId(newTpl.id);
    alert('Template salvo com sucesso!');
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

      {/* Modal Container (Dark SaaS Slate-950 / Slate-900 / Violet Neon Accent) */}
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl z-50 flex flex-col max-h-[90vh] text-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-5 bg-slate-950/80 border-b border-slate-800 flex items-start justify-between">
          <div className="space-y-1 pr-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-violet-500/10 text-violet-400 border border-violet-500/30 flex items-center gap-1.5 shadow-[0_0_10px_rgba(139,92,246,0.2)]">
                <Tag size={13} />
                {lead.niche || 'Geral'}
              </span>
              
              {lead.rating && (
                <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-amber-500/10 text-amber-300 border border-amber-500/30 flex items-center gap-1.5">
                  <Star size={13} className="fill-amber-400 text-amber-400" />
                  {lead.rating} {lead.reviews_count ? `(${lead.reviews_count} avaliações)` : ''}
                </span>
              )}

              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                Status: <strong className="text-white uppercase">{lead.status || 'novo'}</strong>
              </span>
            </div>

            <h2 className="text-2xl font-black text-white tracking-tight mt-1 flex items-center gap-2">
              <Building2 className="text-violet-400" size={24} />
              {lead.business_name}
            </h2>
            <p className="text-xs text-slate-400 flex items-center gap-1">
              <MapPin size={14} className="text-violet-400 flex-shrink-0" />
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
              <span className="text-xs font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                <Phone size={14} className="text-violet-400" />
                Telefone & WhatsApp
              </span>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-base font-mono font-bold text-white">
                    {lead.phone || 'Não informado'}
                  </span>
                  <div className="mt-1">
                    {lead.phone_type === 'celular' ? (
                      <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                        📱 CELULAR (WhatsApp Disponível)
                      </span>
                    ) : lead.phone_type === 'fixo' ? (
                      <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 border border-slate-700 text-[10px] font-bold">
                        ☎️ TELEFONE FIXO
                      </span>
                    ) : (
                      <span className="text-slate-500 text-[10px]">Não classificado</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Presença Digital (Site & Redes) */}
            <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-2">
              <span className="text-xs font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                <Globe size={14} className="text-violet-400" />
                Presença Digital
              </span>
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Website:</span>
                  {lead.website ? (
                    <a 
                      href={lead.website.startsWith('http') ? lead.website : `https://${lead.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-violet-400 hover:underline flex items-center gap-1 font-bold truncate max-w-[180px]"
                    >
                      {lead.website} <ExternalLink size={12} />
                    </a>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold text-[10px]">
                      SEM SITE 🎯 (Oportunidade)
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800/80">
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
                      <span className="text-slate-500 text-[11px]">Nenhuma cadastrada</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Gestão de Copy Integrada (Seletor de Templates & Área Editável) */}
          <div className="bg-slate-950/80 p-5 rounded-2xl border border-violet-500/30 space-y-4 shadow-[0_0_20px_rgba(139,92,246,0.05)]">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <h3 className="text-sm font-black text-white flex items-center gap-2 uppercase tracking-wide">
                  <MessageSquare size={16} className="text-violet-400" />
                  Gerenciador de Copy & Abordagem WhatsApp
                </h3>
                <p className="text-xs text-slate-400">
                  Selecione um template estratégico ou personalize a mensagem antes de disparar.
                </p>
              </div>

              {/* Seletor de Templates */}
              <div className="w-full sm:w-auto">
                <select
                  value={selectedTemplateId}
                  onChange={handleTemplateChange}
                  className="w-full sm:w-64 px-3 py-2 rounded-xl text-xs font-bold bg-slate-900 border border-slate-700 text-slate-200 outline-none focus:border-violet-500 transition-all cursor-pointer"
                >
                  <optgroup label="Modelos Padrão">
                    {DEFAULT_TEMPLATES.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </optgroup>
                  {savedTemplates.length > 0 && (
                    <optgroup label="Modelos Salvos por Você">
                      {savedTemplates.map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </optgroup>
                  )}
                </select>
              </div>
            </div>

            {/* Campo de Texto Editável da Mensagem */}
            <div className="space-y-2">
              <textarea
                value={activeMessage}
                onChange={(e) => setCustomCopy(e.target.value)}
                rows={4}
                className="w-full p-4 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs font-mono focus:outline-none focus:border-violet-500 transition-all leading-relaxed"
                placeholder="Escreva ou ajuste a mensagem de abordagem..."
              />

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
                {/* Salvar como novo template */}
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  {!showSaveBox ? (
                    <button
                      type="button"
                      onClick={() => setShowSaveBox(true)}
                      className="text-xs text-violet-400 hover:text-violet-300 font-bold flex items-center gap-1 transition-all"
                    >
                      + Salvar esta copy como template
                    </button>
                  ) : (
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <input
                        type="text"
                        placeholder="Nome do template..."
                        value={newTemplateName}
                        onChange={(e) => setNewTemplateName(e.target.value)}
                        className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleSaveCurrentAsTemplate}
                        className="px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs transition-all shadow-md"
                      >
                        Salvar
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowSaveBox(false)}
                        className="text-slate-400 hover:text-white text-xs"
                      >
                        Cancelar
                      </button>
                    </div>
                  )}
                </div>

                {/* Botões de Ação (Copiar & WhatsApp) */}
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={handleCopyText}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1.5 transition-all border border-slate-700"
                  >
                    {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                    {copied ? 'Copiado!' : 'Copiar Texto'}
                  </button>

                  {isCelular && waUrl ? (
                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                    >
                      <MessageSquare size={14} className="fill-white" />
                      Enviar no WhatsApp 💬
                    </a>
                  ) : (
                    <span className="px-4 py-2 rounded-xl bg-slate-800/50 text-slate-500 font-bold text-xs border border-slate-800 cursor-not-allowed" title="Número fixo ou indisponível para WhatsApp direto">
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
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <ImageIcon size={14} className="text-violet-400" />
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
          <span className="text-xs text-slate-500 font-mono">
            ID: {lead.id}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-all border border-slate-700"
          >
            Fechar Janela
          </button>
        </div>

      </div>
    </div>
  );
}
