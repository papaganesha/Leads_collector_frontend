import React, { useState, useEffect } from 'react';
import { supabase } from '../libs/supabase.js';

const CRM_STATUSES = {
  novo: { label: '🟡 Novo', bg: 'bg-amber-50 text-amber-700 border-amber-200' },
  contatado: { label: '🔵 Contatado', bg: 'bg-blue-50 text-blue-700 border-blue-200' },
  em_negociacao: { label: '🟣 Em Negociação', bg: 'bg-purple-50 text-purple-700 border-purple-200' },
  fechado: { label: '🟢 Fechado', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  sem_interesse: { label: '🔴 Sem Interesse', bg: 'bg-rose-50 text-rose-700 border-rose-200' }
};

export default function SavedLeads() {
  const [savedLeads, setSavedLeads] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [statusFilter, setStatusFilter] = useState('all');
  const [nicheFilter, setNicheFilter] = useState('all');
  const [selectedCopy, setSelectedCopy] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 25;

  useEffect(() => {
    fetchSavedLeads();
  }, []);

  const filteredLeads = savedLeads.filter(l => 
    (statusFilter === 'all' || l.status === statusFilter) &&
    (nicheFilter === 'all' || l.niche === nicheFilter) &&
    (l.business_name?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const metrics = {
    total: savedLeads.length,
    open: savedLeads.filter(l => l.status === 'novo' || l.status === 'contatado').length,
    closed: savedLeads.filter(l => l.status === 'fechado').length
  };

  const fetchSavedLeads = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSavedLeads(data || []);
      setSelectedIds([]);
    } catch (err) {
      alert('Erro ao buscar leads do banco: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className=\"space-y-6\">
      {/* Dashboard Metrics */}
      <div className=\"grid grid-cols-1 md:grid-cols-3 gap-4\">
        {loading ? [...Array(3)].map((_, i) => <div key={i} className=\"h-24 bg-slate-100 rounded-xl animate-pulse\" />) : (
          <>
            <div className=\"bg-white p-6 rounded-xl border border-slate-200 shadow-sm\">
              <div className=\"text-sm text-slate-500\">Total na Base</div>
              <div className=\"text-2xl font-bold text-slate-900\">{metrics.total}</div>
            </div>
            <div className=\"bg-white p-6 rounded-xl border border-slate-200 shadow-sm\">
              <div className=\"text-sm text-slate-500\">Leads em Aberto</div>
              <div className=\"text-2xl font-bold text-slate-900\">{metrics.open}</div>
            </div>
            <div className=\"bg-white p-6 rounded-xl border border-slate-200 shadow-sm\">
              <div className=\"text-sm text-slate-500\">Clientes Fechados</div>
              <div className=\"text-2xl font-bold text-slate-900\">{metrics.closed}</div>
            </div>
          </>
        )}
      </div>

      {/* Tabela Polida */}
      <div className=\"bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm\">
        <table className=\"w-full text-left\">
          <thead className=\"bg-slate-50\">
            <tr>
              <th className=\"p-4 text-xs font-semibold text-slate-500 uppercase\">Empresa</th>
              <th className=\"p-4 text-xs font-semibold text-slate-500 uppercase\">Contato</th>
              <th className=\"p-4 text-xs font-semibold text-slate-500 uppercase\">Ações</th>
            </tr>
          </thead>
          <tbody className=\"divide-y divide-slate-100\">
            {filteredLeads.slice(0, ITEMS_PER_PAGE).map(lead => (
              <tr key={lead.id} className=\"hover:bg-slate-50\">
                <td className=\"p-4 font-medium\">{lead.business_name}</td>
                <td className=\"p-4\">
                  {lead.phone ? (
                    lead.phone_type === 'celular' ? (
                      <a href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}`} target=\"_blank\" rel=\"noopener noreferrer\" className=\"text-emerald-600 underline font-medium text-xs\">
                        💬 {lead.phone}
                      </a>
                    ) : (
                      <span className=\"text-slate-600 bg-slate-100 px-2 py-1 rounded text-xs\">{lead.phone} (Fixo)</span>
                    )
                  ) : <span className=\"text-slate-400 text-xs\">Sem telefone</span>}
                </td>
                <td className=\"p-4\">
                   <button onClick={() => setSelectedCopy(lead.whatsapp_template)} className=\"text-indigo-600 text-xs font-semibold\">
                     Ver Copy
                   </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
