import React, { useMemo, useState } from 'react';
import { Student, Classification, Observation, Forwarding, CLASS_TYPES } from '../types';

interface DashboardProps {
  students: Student[];
  classifications: Classification[];
  observations: Observation[];
  forwardings: Forwarding[];
  onFilterClick: (modalidade: string, filter: string) => void;
}

export function Dashboard({ students, classifications, observations, forwardings, onFilterClick }: DashboardProps) {
  const [modalidade, setModalidade] = useState('');
  const [turma, setTurma] = useState('');

  const turmas = useMemo(() => {
    return Array.from(new Set(students.filter(s => !modalidade || s.modalidade === modalidade).map(s => s.turma))).sort();
  }, [students, modalidade]);

  const filtered = useMemo(() => {
    return students.filter(s => {
      if (modalidade && s.modalidade !== modalidade) return false;
      if (turma && s.turma !== turma) return false;
      return true;
    });
  }, [students, modalidade, turma]);

  const stats = useMemo(() => {
    const s = { total: filtered.length, totalFund: 0, totalMedio: 0, comObs: 0, comEnc: 0 } as Record<string, number>;
    CLASS_TYPES.forEach(c => s[c.id] = 0);
    
    filtered.forEach(a => {
      if (a.modalidade === 'Fundamental') s.totalFund++;
      else s.totalMedio++;
      
      const tags = classifications.filter(c => c.studentId === a.id).map(c => c.classId);
      tags.forEach(t => { if (s[t] !== undefined) s[t]++ });
      
      if (observations.some(o => o.studentId === a.id)) s.comObs++;
      if (forwardings.some(f => f.studentId === a.id)) s.comEnc++;
    });
    return s;
  }, [filtered, classifications, observations, forwardings]);

  const statCards = [
    { key: 'total', label: 'Total de Estudantes', ico: '👥', color: 'var(--azul-600)' },
    { key: 'totalFund', label: 'Total Ensino Fundamental', ico: '🏫', color: 'var(--azul-600)' },
    { key: 'totalMedio', label: 'Total Ensino Médio', ico: '🎓', color: 'var(--azul-600)' },
    { key: 'faltoso', label: 'Faltosos', ico: '🔴', color: 'var(--c-faltoso)' },
    { key: 'abaixo', label: 'Abaixo do Básico', ico: '🟠', color: 'var(--c-abaixo)' },
    { key: 'acompanhamento', label: 'Necessita Acompanhamento', ico: '🟡', color: 'var(--c-acompanhamento)' },
    { key: 'media', label: 'Na Média', ico: '🟢', color: 'var(--c-media)' },
    { key: 'destaque', label: 'Destaques', ico: '🔵', color: 'var(--c-destaque)' },
    { key: 'socioemocional', label: 'Questões Socioemocionais', ico: '🟣', color: 'var(--c-socioemocional)' },
    { key: 'paedaee', label: 'PAED / AEE', ico: '⚫', color: 'var(--c-paedaee)' },
    { key: 'evasao', label: 'Risco de Evasão', ico: '🟤', color: 'var(--c-evasao)' },
    { key: 'comObs', label: 'Com Observações', ico: '📝', color: 'var(--azul-700)' },
    { key: 'comEnc', label: 'Com Encaminhamentos', ico: '📌', color: 'var(--azul-700)' },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-2">
        <h2 className="font-bold text-slate-800 text-lg">Bem-vindo ao EduConselho</h2>
        <p className="text-slate-500 text-sm">Navegue pelas opções no menu lateral para consultar as turmas, registrar informações pedagógicas e gerar relatórios. Os dados são salvos no banco de dados centralizado.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
        <h2 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-4">Filtrar Visão Geral</h2>
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Modalidade</label>
            <select className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none text-slate-700" value={modalidade} onChange={e => {setModalidade(e.target.value); setTurma('');}}>
              <option value="">Todas</option>
              <option value="Fundamental">Ensino Fundamental</option>
              <option value="Médio">Ensino Médio</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Turma</label>
            <select className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none text-slate-700" value={turma} onChange={e => setTurma(e.target.value)}>
              <option value="">Todas</option>
              {turmas.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <button className="bg-slate-100 text-slate-600 font-bold px-4 py-2 rounded-lg text-sm hover:bg-slate-200 transition" onClick={() => {setModalidade(''); setTurma('');}}>
            Limpar Filtro
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
        {statCards.map(c => (
          <div key={c.key} onClick={() => onFilterClick(modalidade, c.key)} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm cursor-pointer hover:-translate-y-1 hover:shadow-md transition relative group overflow-hidden flex flex-col justify-between min-h-[100px]">
            <div className="text-slate-500 text-[10px] font-bold uppercase mb-1 tracking-wider pr-6 truncate z-10 relative">{c.label}</div>
            <div className="text-3xl font-black text-slate-900 z-10 relative">{stats[c.key] || 0}</div>
            <div className="absolute top-4 right-4 text-xl opacity-50 group-hover:scale-110 transition z-0">{c.ico}</div>
            <div className="absolute bottom-0 left-0 w-full h-1 bg-slate-100 z-10">
              <div className="h-full" style={{ width: '100%', backgroundColor: c.color }}></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
