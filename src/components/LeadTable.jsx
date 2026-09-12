import React, { useState, useEffect } from 'react';
import { Instagram, Facebook, Globe, ImageIcon } from 'lucide-react';

export default function LeadTable({ leads, onSave, onClear, isSaving }) {
  const [selectedLeads, setSelectedLeads] = useState(leads.map((_, index) => index));
  const [selectedCopy, setSelectedCopy] = useState(null);
  const [selectedPhotos, setSelectedPhotos] = useState(null);

  // Estados de Paginação (Máximo 25 por página)
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 25;

  useEffect(() => {
    setSelectedLeads(leads.map((_, index) => index));
    setCurrentPage(1);
  }, [leads]);

  const toggleSelectAll = () => {
    if (selectedLeads.length === leads.length) {
      setSelectedLeads([]);
    } else {
      setSelectedLeads(leads.map((_, index) => index));
    }
  };

  const toggleSelectLead = (index) => {
    if (selectedLeads.includes(index)) {
      setSelectedLeads(selectedLeads.filter(i => i !== index));
    } else {
      setSelectedLeads([...selectedLeads, index]);
    }
  };

  const exportToExcel = () => {
    const leadsToExport = selectedLeads.map(i => leads[i]);
    if (!leadsToExport.length) return alert('Selecione ao menos um lead para exportar.');

    const headers = ['Empresa', 'Nicho', 'Cidade', 'Telefone', 'Tipo', 'Possui Site', 'Instagram', 'Facebook', 'Nota Google', 'Avaliações', 'Endereço'];
    const rows = leadsToExport.map(l => [
      `"${(l.business_name || '').replace(/"/g, '""')}"`,
      `"${(l.niche || '').replace(/"/g, '""')}"`,
      `"${(l.city || '').replace(/"/g, '""')}"`,
      `"${(l.phone || '').replace(/"/g, '""')}"`,
      l.phone_type || 'desconhecido',
      l.has_website ? 'Sim' : 'Não',
      `"${(l.instagram_url || '').replace(/"/g, '""')}"`,
      `"${(l.facebook_url || '').replace(/"/g, '""')}"`,
      l.rating || 'N/A',
      l.reviews_count || 0,
      `"${(l.address || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map(e => e.join(';'))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `leads_extraidos_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Cálculo da Paginação
  const totalPages = Math.ceil(leads.length / ITEMS_PER_PAGE) || 1;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const displayedLeads = leads.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <div className="w-full bg-white rounded-2xl shadow-xl border border-slate-200/80 overflow-hidden">
      
      {/* Barra de Ações com Ordem Reorganizada */}
      <div className="p-5 bg-slate-900 text-white flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-bold px-3 py-1.5 rounded-lg text-sm">
            {selectedLeads.length} de {leads.length} selecionados
          </span>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap sm:flex-nowrap justify-end">
          <button
            type="button"
            onClick={() => onSave(selectedLeads.map(i => leads[i]))}
            disabled={selectedLeads.length === 0 || isSaving}
            className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2.5 px-4 rounded-xl transition-all disabled:opacity-50 text-xs flex items-center gap-2 shadow-sm"
          >
            {isSaving ? 'Salvando...' : '💾 Salvar no Supabase'}
          </button>

          <button
            type="button"
            onClick={exportToExcel}
            disabled={selectedLeads.length === 0}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-xl transition-all disabled:opacity-50 text-xs flex items-center gap-2 shadow-sm"
          >
            📊 Exportar CSV
          </button>

          <button
            type="button"
            onClick={onClear}
            className="bg-rose-600 hover:bg-rose-700 text-white font-bold py-2.5 px-4 rounded-xl transition-all text-xs flex items-center gap-2 shadow-sm"
          >
            🗑️ Limpar
          </button>
        </div>
      </div>

      {/* Tabela */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 z-10 bg-slate-50/95 backdrop-blur-sm border-b border-slate-200">
            <tr className="text-slate-700 text-[10px] uppercase font-bold tracking-wider">
              <th className="p-4 w-12 text-center"><input type="checkbox" onChange={toggleSelectAll} checked={selectedLeads.length === leads.length && leads.length > 0} className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" /></th>
              <th className="p-4">Foto</th>
              <th className="p-4">Empresa</th>
              <th className="p-4">Social</th>
              <th className="p-4">Telefone</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {displayedLeads.map((lead, index) => {
              const actualIndex = startIndex + index;
              const isSelected = selectedLeads.includes(actualIndex);

              return (
                <tr key={actualIndex} className={`hover:bg-slate-50 transition-colors ${isSelected ? 'bg-indigo-50/50' : ''}`}>
                  <td className="p-4 text-center">
                    <input type="checkbox" checked={isSelected} onChange={() => toggleSelectLead(actualIndex)} />
                  </td>
                  <td className="p-4">
                    {lead.image_url ? (
                      <button onClick={() => setSelectedPhotos(lead.photos || [lead.image_url])} className="hover:opacity-80 transition-opacity">
                         <img src={lead.image_url} alt={lead.business_name} className="w-10 h-10 rounded-lg object-cover bg-slate-100" />
                      </button>
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400"><ImageIcon size={20} /></div>
                    )}
                  </td>
                  <td className="p-4 font-bold text-slate-900 text-sm">
                    {lead.business_name}
                    <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(lead.address)}`} target="_blank" rel="noreferrer" className="block text-[10px] text-slate-500 font-normal hover:text-indigo-600 underline">
                        {lead.address}
                    </a>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      {lead.instagram_url && <a href={lead.instagram_url} target="_blank" rel="noreferrer" className="text-pink-600 hover:text-pink-700"><Instagram size={18} /></a>}
                      {lead.facebook_url && <a href={lead.facebook_url} target="_blank" rel="noreferrer" className="text-blue-600 hover:text-blue-700"><Facebook size={18} /></a>}
                      {lead.website_url && <a href={lead.website_url} target="_blank" rel="noreferrer" className="text-slate-600 hover:text-slate-700"><Globe size={18} /></a>}
                    </div>
                  </td>
                  <td className="p-4">
                    {lead.phone ? (
                      <a href={`https://wa.me/${lead.phone.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="text-xs font-mono font-bold text-emerald-600 hover:text-emerald-700">
                        <span>💬</span> +{lead.phone}
                        {lead.phone_type === 'fixo' && <span className="text-[10px] text-slate-400 font-normal">(Fixo)</span>}
                      </a>
                    ) : (
                      <span className="text-slate-400 font-mono text-xs">Sem número</span>
                    )}
                  </td>
                  <td className="p-4">
                    {lead.has_website ? (
                      <span className="text-amber-800 bg-amber-100 text-xs px-2.5 py-1 rounded-full font-bold">Com Site</span>
                    ) : (
                      <span className="text-emerald-800 bg-emerald-100 text-xs px-2.5 py-1 rounded-full font-bold">Sem Site 🎯</span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <button
                      type="button"
                      onClick={() => setSelectedCopy(lead.whatsapp_template)}
                      className="text-indigo-600 hover:underline text-xs font-bold"
                    >
                      Ver Copy WA
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Controles de Paginação */}
      {totalPages > 1 && (
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
          <span>
            Mostrando <b>{startIndex + 1}</b> a <b>{Math.min(startIndex + ITEMS_PER_PAGE, leads.length)}</b> de <b>{leads.length}</b> leads
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-bold disabled:opacity-40 hover:bg-slate-100 transition-all"
            >
              ◀ Anterior
            </button>
            <span className="font-bold text-slate-800 px-2">
              Página {currentPage} de {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-bold disabled:opacity-40 hover:bg-slate-100 transition-all"
            >
              Próximo ▶
            </button>
          </div>
        </div>
      )}

      {/* Modal de Copy */}
      {selectedCopy && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
            <h3 className="font-bold text-lg text-slate-900">Template WhatsApp</h3>
            <textarea
              readOnly
              className="w-full h-48 p-3 bg-slate-50 border rounded-xl text-xs font-mono"
              value={selectedCopy}
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(selectedCopy);
                  alert('Copiado!');
                }}
                className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-bold"
              >
                Copiar
              </button>
              <button
                type="button"
                onClick={() => setSelectedCopy(null)}
                className="bg-slate-200 px-4 py-2 rounded-xl text-xs font-bold"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Fotos */}
      {selectedPhotos && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full space-y-4 shadow-2xl">
            <h3 className="font-bold text-lg text-slate-900">Galeria de Fotos</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-[60vh] overflow-y-auto">
              {selectedPhotos.map((photo, i) => (
                <img key={i} src={photo} alt="Lead" className="w-full h-32 object-cover rounded-lg border border-slate-200" />
              ))}
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedPhotos(null)}
                className="bg-slate-200 px-4 py-2 rounded-xl text-xs font-bold hover:bg-slate-300"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
