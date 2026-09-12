import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Download, 
  Trash2, 
  Save, 
  Star, 
  Globe, 
  Instagram, 
  Facebook, 
  MessageSquare, 
  Copy, 
  Check, 
  ChevronLeft, 
  ChevronRight,
  X
} from 'lucide-react';

export default function LeadTable({ leads, onSave, onClear, isSaving }) {
  const [selectedLeads, setSelectedLeads] = useState(leads.map((_, index) => index));
  const [selectedCopy, setSelectedCopy] = useState(null);

  // Estados de Paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setCurrentPage(1);
    setSelectedLeads(leads.map((_, index) => index));
  }, [leads]);

  const filteredLeads = leads.filter(lead => 
    (lead.business_name?.toLowerCase().includes(searchTerm.toLowerCase()) || '') ||
    (lead.niche?.toLowerCase().includes(searchTerm.toLowerCase()) || '') ||
    (lead.city?.toLowerCase().includes(searchTerm.toLowerCase()) || '')
  );

  const totalPages = Math.ceil(filteredLeads.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const displayedLeads = filteredLeads.slice(startIndex, startIndex + itemsPerPage);

  const toggleSelectAll = () => {
    if (selectedLeads.length === leads.length) {
      setSelectedLeads([]);
    } else {
      setSelectedLeads(leads.map((_, index) => index));
    }
  };

  const toggleSelect = (originalIndex) => {
    if (selectedLeads.includes(originalIndex)) {
      setSelectedLeads(selectedLeads.filter(i => i !== originalIndex));
    } else {
      setSelectedLeads([...selectedLeads, originalIndex]);
    }
  };

  const exportSelectedToExcel = () => {
    if (!selectedLeads.length) {
      return alert('Selecione ao menos um lead para exportar.');
    }

    const leadsToExport = selectedLeads.map(i => leads[i]);

    const headers = ['Empresa', 'Nicho', 'Cidade', 'Telefone', 'Tipo', 'Rating', 'Tem Site', 'Website', 'Instagram', 'Facebook', 'Endereco', 'Copy WA'];
    const rows = leadsToExport.map(l => [
      `"${(l.business_name || '').replace(/"/g, '""')}"`,
      `"${(l.niche || '').replace(/"/g, '""')}"`,
      `"${(l.city || '').replace(/"/g, '""')}"`,
      `"${(l.phone || '').replace(/"/g, '""')}"`,
      `"${l.phone_type || ''}"`,
      `"${l.rating || ''}"`,
      l.has_website ? 'Sim' : 'Não',
      `"${l.website_url || ''}"`,
      `"${l.instagram_url || ''}"`,
      `"${l.facebook_url || ''}"`,
      `"${(l.address || '').replace(/"/g, '""')}"`,
      `"${(l.whatsapp_template || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `mined_leads_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full bg-slate-900 rounded-2xl border border-slate-800/80 shadow-2xl overflow-hidden mt-6">
      
      {/* Topo da Tabela de Mineração */}
      <div className="p-5 bg-slate-950 border-b border-slate-800 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex flex-1 items-center gap-3 w-full">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input
              type="text"
              placeholder="🔍 Pesquisar nos resultados obtidos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs font-medium focus:border-violet-500 outline-none"
            />
          </div>

          <span className="bg-violet-500/10 text-violet-300 border border-violet-500/20 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap">
            {selectedLeads.length} de {leads.length} selecionados
          </span>
        </div>

        {/* Botões de Ação */}
        <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
          <button
            type="button"
            onClick={() => onSave(selectedLeads.map(i => leads[i]))}
            disabled={selectedLeads.length === 0 || isSaving}
            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-2 px-4 rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/20 disabled:opacity-50 transition-all"
          >
            <Save size={15} />
            <span>{isSaving ? 'Salvando...' : 'Salvar no Supabase'}</span>
          </button>

          <button
            type="button"
            onClick={exportSelectedToExcel}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold py-2 px-3.5 rounded-xl text-xs border border-slate-700 flex items-center gap-1.5 transition-colors"
          >
            <Download size={15} />
            <span>Exportar CSV</span>
          </button>

          <button
            type="button"
            onClick={onClear}
            className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-bold py-2 px-3 rounded-xl text-xs border border-rose-500/30 flex items-center gap-1 transition-colors"
          >
            <Trash2 size={15} />
            <span>Limpar</span>
          </button>
        </div>
      </div>

      {/* Tabela de Resultados */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-950/80 border-b border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-400 sticky top-0 backdrop-blur-md z-10">
              <th className="p-4 w-10 text-center">
                <input
                  type="checkbox"
                  checked={selectedLeads.length === leads.length && leads.length > 0}
                  onChange={toggleSelectAll}
                  className="rounded border-slate-700 bg-slate-900 text-violet-600 focus:ring-violet-500"
                />
              </th>
              <th className="p-4">Empresa</th>
              <th className="p-4">Nicho</th>
              <th className="p-4">Cidade / Local</th>
              <th className="p-4">Contato / WA</th>
              <th className="p-4">Status do Site</th>
              <th className="p-4 text-right">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-xs">
            {displayedLeads.map((lead) => {
              const originalIndex = leads.indexOf(lead);
              const isSelected = selectedLeads.includes(originalIndex);
              const isCelular = lead.phone_type === 'celular';
              const cleanPhone = lead.phone ? lead.phone.replace(/\D/g, '') : '';
              const waUrl = isCelular && cleanPhone ? `https://wa.me/${cleanPhone}` : null;

              return (
                <tr
                  key={originalIndex}
                  className={`transition-colors hover:bg-slate-800/40 ${
                    isSelected ? 'bg-violet-950/20' : ''
                  }`}
                >
                  <td className="p-4 text-center">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelect(originalIndex)}
                      className="rounded border-slate-700 bg-slate-900 text-violet-600 focus:ring-violet-500"
                    />
                  </td>

                  <td className="p-4 space-y-1">
                    <div className="font-bold text-slate-100 text-sm flex items-center gap-2">
                      <span>{lead.business_name}</span>
                      {lead.rating && (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                          <Star size={10} className="fill-amber-400" />
                          {lead.rating}
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="p-4">
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-violet-500/10 text-violet-300 border border-violet-500/20">
                      {lead.niche}
                    </span>
                  </td>

                  <td className="p-4 text-slate-400">
                    {lead.city}
                  </td>

                  <td className="p-4 font-mono text-xs">
                    {isCelular && waUrl ? (
                      <a
                        href={waUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-lg font-bold transition-all"
                      >
                        <MessageSquare size={13} />
                        <span>{lead.phone}</span>
                      </a>
                    ) : lead.phone ? (
                      <span className="text-slate-400 font-medium">
                        {lead.phone} <b className="text-amber-400 text-[10px] ml-1">(Fixo)</b>
                      </span>
                    ) : (
                      <span className="text-slate-500">Sem número</span>
                    )}
                  </td>

                  <td className="p-4">
                    {lead.has_website ? (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                        Com Site
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        SEM SITE 🎯
                      </span>
                    )}
                  </td>

                  <td className="p-4 text-right">
                    <button
                      type="button"
                      onClick={() => setSelectedCopy(lead.whatsapp_template)}
                      className="text-violet-400 hover:text-violet-300 font-bold hover:underline text-xs"
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
        <div className="p-4 bg-slate-950/80 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <span>
            Mostrando <b>{startIndex + 1}</b> a <b>{Math.min(startIndex + itemsPerPage, leads.length)}</b> de <b>{leads.length}</b> minerados
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="p-1.5 bg-slate-900 border border-slate-700 text-slate-300 rounded-lg disabled:opacity-40 hover:bg-slate-800 transition-all"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="font-bold text-slate-200 px-3 py-1 bg-slate-900 rounded-lg border border-slate-800">
              Página {currentPage} de {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-1.5 bg-slate-900 border border-slate-700 text-slate-300 rounded-lg disabled:opacity-40 hover:bg-slate-800 transition-all"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Modal de Copy */}
      {selectedCopy && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-white">Template de Abordagem WhatsApp</h3>
              <button 
                type="button"
                onClick={() => setSelectedCopy(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X size={18} />
              </button>
            </div>
            <textarea
              readOnly
              rows={8}
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-slate-200 outline-none"
              value={selectedCopy}
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(selectedCopy);
                  alert('Copy copiada para a área de transferência!');
                }}
                className="bg-violet-600 hover:bg-violet-500 text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors"
              >
                Copiar
              </button>
              <button 
                type="button"
                onClick={() => setSelectedCopy(null)} 
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-xl text-xs font-bold transition-colors"
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
