import React, { useMemo, useState } from 'react';
import { Student, Classification, Observation, Forwarding, CLASS_TYPES, Turma } from '../types';
import { StudentProfileModal } from './StudentProfileModal';

interface TurmaListProps {
  modalidade: string;
  students: Student[];
  turmas: Turma[];
  classifications: Classification[];
  observations: Observation[];
  forwardings: Forwarding[];
  initialFilter?: string;
  onToggleClass: (studentId: number, classId: string) => void;
  onAddObs: (studentId: number) => void;
  onAddEnc: (studentId: number) => void;
  onDeleteStudent: (studentId: number) => void;
}

export function TurmaList({ modalidade, students, turmas, classifications, observations, forwardings, initialFilter, onToggleClass, onAddObs, onAddEnc, onDeleteStudent }: TurmaListProps) {
  const [busca, setBusca] = useState('');
  const [turma, setTurma] = useState('');
  const [serie, setSerie] = useState('');
  const [soObs, setSoObs] = useState(false);
  const [soEnc, setSoEnc] = useState(false);
  const [soPaed, setSoPaed] = useState(false);
  const [quick, setQuick] = useState(initialFilter || 'todos');
  const [selectedProfile, setSelectedProfile] = useState<Student | null>(null);

  const [openTurmas, setOpenTurmas] = useState<Set<string>>(new Set());

  const QUICK_FILTERS = [
    {id:'todos', label:'📋 Todos os Estudantes'},
    {id:'faltoso', label:'🔴 Apenas Faltosos'},
    {id:'abaixo', label:'🟠 Apenas Abaixo do Básico'},
    {id:'acompanhamento', label:'🟡 Apenas Acompanhamento'},
    {id:'media', label:'🟢 Apenas Na Média'},
    {id:'destaque', label:'🔵 Apenas Destaques'},
    {id:'socioemocional', label:'🟣 Apenas Socioemocional'},
    {id:'paedaee', label:'⚫ Apenas PAED/AEE'},
    {id:'evasao', label:'🟤 Apenas Risco de Evasão'},
    {id:'paedCadastro', label:'🆔 Apenas PAED (Cadastro)'},
    {id:'comObs', label:'📝 Apenas Com Observações'},
    {id:'comEnc', label:'📌 Apenas Com Encaminhamentos'},
  ];

  const baseList = useMemo(() => students.filter(s => s.modalidade === modalidade), [students, modalidade]);
  
  const turmasList = useMemo(() => {
    // Pegar turmas da nova tabela e também garantir as que vieram dos alunos, para compatibilidade
    const names = new Set(turmas.filter(t => t.modalidade === modalidade).map(t => t.nome));
    baseList.forEach(s => names.add(s.turma));
    return Array.from(names).sort();
  }, [turmas, baseList, modalidade]);

  const seriesList = useMemo(() => Array.from(new Set(baseList.map(s => s.serie))).sort(), [baseList]);

  const filtered = useMemo(() => {
    return baseList.filter(a => {
      if (busca && !a.nome.toLowerCase().includes(busca.toLowerCase()) && !(a.cod || '').includes(busca)) return false;
      if (turma && a.turma !== turma) return false;
      if (serie && a.serie !== serie) return false;
      if (soObs && !observations.some(o => o.studentId === a.id)) return false;
      if (soEnc && !forwardings.some(f => f.studentId === a.id)) return false;
      if (soPaed && !a.paed) return false;

      if (quick !== 'todos') {
        if (quick === 'comObs') return observations.some(o => o.studentId === a.id);
        if (quick === 'comEnc') return forwardings.some(f => f.studentId === a.id);
        if (quick === 'paedCadastro') return !!a.paed;
        return classifications.some(c => c.studentId === a.id && c.classId === quick);
      }
      return true;
    });
  }, [baseList, busca, turma, serie, soObs, soEnc, soPaed, quick, classifications, observations, forwardings]);

  const groups = useMemo(() => {
    const g: Record<string, Student[]> = {};
    filtered.forEach(a => {
      if (!g[a.turma]) g[a.turma] = [];
      g[a.turma].push(a);
    });
    return g;
  }, [filtered]);

  const toggleTurma = (t: string) => {
    const next = new Set(openTurmas);
    if (next.has(t)) next.delete(t);
    else next.add(t);
    setOpenTurmas(next);
  };

  const getTags = (studentId: number) => classifications.filter(c => c.studentId === studentId).map(c => c.classId);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
        <h2 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-4">Filtrar Turmas e Estudantes</h2>
        
        <div className="flex flex-wrap gap-2 mb-6">
          {QUICK_FILTERS.map(q => (
            <button key={q.id} className={`px-4 py-2 rounded-lg text-xs font-semibold border transition ${quick === q.id ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'}`} onClick={() => setQuick(q.id)}>
              {q.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex flex-col gap-1"><label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Nome do Aluno</label><input className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none text-slate-700" placeholder="Buscar..." value={busca} onChange={e => setBusca(e.target.value)} /></div>
          <div className="flex flex-col gap-1"><label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Turma</label><select className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none text-slate-700" value={turma} onChange={e => setTurma(e.target.value)}><option value="">Todas as Turmas</option>{turmasList.map(t => <option key={t}>{t}</option>)}</select></div>
          <div className="flex flex-col gap-1"><label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Série</label><select className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none text-slate-700" value={serie} onChange={e => setSerie(e.target.value)}><option value="">Todas as Séries</option>{seriesList.map(s => <option key={s}>{s}</option>)}</select></div>
          
          <div className="flex flex-col gap-3 pb-2 ml-2">
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 cursor-pointer"><input type="checkbox" className="w-4 h-4 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500" checked={soObs} onChange={e => setSoObs(e.target.checked)} /> Com Observações</label>
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 cursor-pointer"><input type="checkbox" className="w-4 h-4 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500" checked={soEnc} onChange={e => setSoEnc(e.target.checked)} /> Com Encaminhamentos</label>
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 cursor-pointer"><input type="checkbox" className="w-4 h-4 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500" checked={soPaed} onChange={e => setSoPaed(e.target.checked)} /> Somente PAED</label>
          </div>

          <button className="bg-slate-100 text-slate-600 font-bold px-4 py-2 rounded-lg text-sm hover:bg-slate-200 transition ml-auto" onClick={() => {setBusca(''); setTurma(''); setSerie(''); setSoObs(false); setSoEnc(false); setSoPaed(false); setQuick('todos');}}>
            Limpar Filtros
          </button>
        </div>
      </div>

      {Object.keys(groups).length === 0 ? (
        <div className="bg-white p-8 rounded-xl shadow-sm text-center text-slate-500 border border-slate-200">Nenhum estudante encontrado com os filtros selecionados.</div>
      ) : (
        Object.keys(groups).sort().map(t => {
          const alunos = groups[t];
          const isOpen = openTurmas.has(t) || Object.keys(groups).length === 1 || !!turma;
          return (
            <div key={t} className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-200 mb-6 flex flex-col">
              <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50 cursor-pointer hover:bg-slate-100/50 transition" onClick={() => toggleTurma(t)}>
                <div className="flex items-center gap-4">
                  <h3 className="font-bold text-slate-800 text-lg">{t}</h3>
                  <span className="text-[10px] font-bold bg-white text-slate-600 px-2 py-1 rounded uppercase tracking-wider border border-slate-200">{alunos[0].curso || 'Regular'}</span>
                  <span className="text-[10px] font-bold bg-white text-slate-600 px-2 py-1 rounded uppercase tracking-wider border border-slate-200">{alunos[0].turno}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="bg-indigo-600 text-white px-3 py-1 rounded-lg text-xs font-bold shadow-sm">{alunos.length} aluno{alunos.length > 1 ? 's' : ''}</span>
                  <span className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}>▼</span>
                </div>
              </div>
              
              {isOpen && (
                <div className="flex-1 overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-white text-slate-500 text-[10px] uppercase tracking-wider font-bold border-b border-slate-100">
                      <tr>
                        <th className="px-6 py-4">Estudante</th>
                        <th className="px-6 py-4">Série</th>
                        <th className="px-6 py-4">Situações Pedagógicas</th>
                        <th className="px-6 py-4 text-center">Obs.</th>
                        <th className="px-6 py-4 text-center">Enc.</th>
                        <th className="px-6 py-4 text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                      {alunos.map(a => {
                        const sTags = getTags(a.id);
                        return (
                          <tr key={a.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="px-6 py-4 font-bold text-slate-800">
                              {a.cod && <span className="text-slate-400 font-medium mr-2 text-xs">#{a.cod}</span>}
                              {a.nome}
                              {a.paed && <span className="ml-2 text-[10px] text-white bg-amber-500 px-2 py-0.5 rounded font-bold uppercase tracking-wider">PAED</span>}
                            </td>
                            <td className="px-6 py-4 text-slate-600 text-xs">{a.serie}</td>
                            <td className="px-6 py-4">
                              <div className="flex flex-wrap gap-2 max-w-[400px]">
                                {CLASS_TYPES.map(c => {
                                  const active = sTags.includes(c.id);
                                  return (
                                    <span key={c.id} onClick={() => onToggleClass(a.id, c.id)} className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-bold cursor-pointer transition select-none tracking-wide ${active ? 'bg-white shadow-sm' : 'bg-slate-50 text-slate-400 border-slate-200 hover:border-slate-300'}`} style={active ? { color: c.color, borderColor: c.color } : {}}>
                                      <span className="w-2 h-2 rounded-full border border-current" style={{ backgroundColor: active ? 'currentcolor' : 'transparent' }}></span>
                                      {c.label}
                                    </span>
                                  )
                                })}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-center"><span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-bold">{observations.filter(o => o.studentId === a.id).length}</span></td>
                            <td className="px-6 py-4 text-center"><span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-bold">{forwardings.filter(o => o.studentId === a.id).length}</span></td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex gap-2 justify-end">
                                <button className="w-8 h-8 flex items-center justify-center bg-indigo-50 border border-indigo-200 rounded shadow-sm hover:border-indigo-500 hover:text-indigo-600 text-indigo-500 transition" onClick={() => setSelectedProfile(a)} title="Ficha do Aluno">📄</button>
                                <button className="w-8 h-8 flex items-center justify-center bg-white border border-slate-200 rounded shadow-sm hover:border-indigo-500 hover:text-indigo-600 text-slate-500 transition" onClick={() => onAddObs(a.id)} title="Observações">📝</button>
                                <button className="w-8 h-8 flex items-center justify-center bg-white border border-slate-200 rounded shadow-sm hover:border-indigo-500 hover:text-indigo-600 text-slate-500 transition" onClick={() => onAddEnc(a.id)} title="Encaminhamentos">📌</button>
                                <button className="w-8 h-8 flex items-center justify-center bg-white border border-slate-200 rounded shadow-sm hover:border-red-500 hover:text-red-600 text-slate-500 transition" onClick={() => { if(window.confirm('Excluir aluno?')) onDeleteStudent(a.id) }} title="Excluir">🗑️</button>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )
        })
      )}

      {selectedProfile && (
        <StudentProfileModal 
          student={selectedProfile}
          classifications={classifications}
          observations={observations}
          forwardings={forwardings}
          onClose={() => setSelectedProfile(null)}
        />
      )}
    </div>
  );
}
