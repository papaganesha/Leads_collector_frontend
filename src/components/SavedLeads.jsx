import React, { useState, useEffect } from 'react';
import { supabase } from '../libs/supabase.js';

export default function SavedLeads() {
  const [savedLeads, setSavedLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCopy, setSelectedCopy] = useState(null);

  useEffect(() => {
    fetchSavedLeads();
  }, []);

  const fetchSavedLeads = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSavedLeads(data || []);
    } catch (err) {
      alert('Erro ao buscar leads do banco: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteLead = async (id) => {
    if (!confirm('Deseja realmente remover este lead do banco?')) return;
    try {
      const { error } = await supabase.from('leads').delete().eq('id', id);
      if (error) throw error;
      setSavedLeads(savedLeads.filter(l => l.id !== id));
    } catch (err) {
      alert('Erro ao excluir: ' + err.message);
    }
  };

  const exportToExcel = (leadsToExport) => {
    if (!leadsToExport.length) return alert('Nenhum lead para exportar.');

    const headers = ['Empresa', 'Nicho', 'Cidade', 'Telefone', 'Possui Site', 'URL do Site', 'Endereço', 'Data de Cadastro'];
    
    const rows = leadsToExport.map(l => [
      `"${(l.business_name || '').replace(/"/g, '""')}"`,
      `"${(l.niche || '').replace(/"/g, '""')}"`,
      `"${(l.city || '').replace(/"/g, '""')}"`,
      `"${(l.phone || '').replace(/"/g, '""')}"`,
      l.has_website ? 'Sim' : 'Não',
      `"${(l.website_url || '').replace(/"/g, '""')}"`,
      `"${(l.address || '').replace(/"/g, '""')}"`,
      `"${new Date(l.created_at).toLocaleDateString('pt-BR')}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map(e => e.join(';'))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `leads_jpas_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredLeads = savedLeads.filter(l => 
    l.business_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.niche.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full bg-white rounded-2xl shadow-xl border border-slate-200/80 overflow-hidden">
      {/* Header e Busca */}
      <div className="p-6 bg-slate-900 text-white flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-xl font-bold">Banco de Leads Salvos ({savedLeads.length})</h2>
          <p className="text-xs text-slate-400">Leads armazenados no Supabase</p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <input
            type="text"
            placeholder="Buscar por nome, nicho ou cidade..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs w-full md:w-64 focus:outline-none"
          />
          <button
            onClick={() => exportToExcel(filteredLeads)}
            className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center gap-2 whitespace-nowrap shadow-md"
          >
            <span>📊</span> Exportar Excel
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-500 animate-pulse">Carregando leads do Supabase...</div>
      ) : filteredLeads.length === 0 ? (
        <div className="p-12 text-center text-slate-500">Nenhum lead encontrado no banco.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700 uppercase text-xs font-bold border-b border-slate-200">
              <tr>
                <th className="p-4">Empresa / Cidade</th>
                <th className="p-4">Nicho</th>
                <th className="p-4">WhatsApp</th>
                <th className="p-4">Site</th>
                <th className="p-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLeads.map((lead) => (
                <tr key={lead.id} className="hover:bg-slate-50">
                  <td className="p-4">
                    <div className="font-bold text-slate-900">{lead.business_name}</div>
                    <div className="text-xs text-slate-400">{lead.city} • {lead.address}</div>
                  </td>
                  <td className="p-4 text-xs font-semibold">{lead.niche}</td>
                  <td className="p-4 font-mono text-xs">{lead.phone || 'Sem número'}</td>
                  <td className="p-4">
                    {lead.has_website ? (
                      <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded text-xs">Com Site</span>
                    ) : (
                      <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-xs font-bold">Sem Site</span>
                    )}
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button
                      onClick={() => setSelectedCopy(lead.whatsapp_template)}
                      className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-lg text-xs font-semibold"
                    >
                      Ver Copy
                    </button>
                    <button
                      onClick={() => deleteLead(lead.id)}
                      className="bg-rose-50 hover:bg-rose-100 text-rose-600 px-2.5 py-1.5 rounded-lg text-xs"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal da Copy */}
      {selectedCopy && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
            <h3 className="font-bold text-lg text-slate-900">Template WhatsApp</h3>
            <textarea
              readOnly
              className="w-full h-52 p-3 bg-slate-50 border rounded-xl text-xs font-mono"
              value={selectedCopy}
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(selectedCopy);
                  alert('Copy copiada!');
                }}
                className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-bold"
              >
                Copiar
              </button>
              <button onClick={() => setSelectedCopy(null)} className="bg-slate-200 px-4 py-2 rounded-xl text-xs font-bold">
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
