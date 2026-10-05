import React, { useState, useMemo } from 'react';
import { Turma, Student, Classification, Observation, Forwarding } from '../types';
import { Plus, Trash2, Users, FileText, X } from 'lucide-react';

interface TurmasProps {
  turmas: Turma[];
  students: Student[];
  classifications: Classification[];
  observations: Observation[];
  forwardings: Forwarding[];
  token: string | null;
  onDataChanged: () => void;
}

export function TurmasConfig({ turmas, students, classifications, observations, forwardings, token, onDataChanged }: TurmasProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [viewingTurma, setViewingTurma] = useState<Turma | null>(null);
  
  const [formData, setFormData] = useState({
    nome: '',
    modalidade: 'Fundamental',
    turno: 'Matutino',
    curso: 'Regular',
    serie: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/turmas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      setIsAdding(false);
      setFormData({ nome: '', modalidade: 'Fundamental', turno: 'Matutino', curso: 'Regular', serie: '' });
      onDataChanged();
    } catch (err) {
      alert("Erro ao salvar turma");
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Tem certeza que deseja excluir esta turma? Os alunos não serão excluídos, mas ficarão sem turma associada se remover a referência.")) {
      try {
        await fetch(`/api/turmas/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });
        onDataChanged();
      } catch (err) {
        alert("Erro ao excluir turma");
      }
    }
  };

  const getStatus = (studentId: number) => {
    const studentClassifications = classifications.filter(c => c.studentId === studentId);
    if (studentClassifications.length === 0) return 'Sem Conselho';
    const hasReprovado = studentClassifications.some(c => c.classId === 'reprovado');
    const hasConselho = studentClassifications.some(c => c.classId === 'conselho');
    if (hasReprovado) return 'Reprovado';
    if (hasConselho) return 'Aprovado pelo Conselho';
    return 'Aprovado';
  };

  const viewingTurmaStudents = useMemo(() => {
    if (!viewingTurma) return [];
    return students
      .filter(s => s.turma === viewingTurma.nome)
      .sort((a, b) => a.nome.localeCompare(b.nome));
  }, [students, viewingTurma]);

  return (
    <div className="space-y-6 relative">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Gerenciar Turmas</h2>
          <p className="text-sm text-slate-500">Cadastre e organize as turmas da escola.</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-medium transition"
        >
          <Plus className="w-4 h-4" />
          Nova Turma
        </button>
      </div>

      {isAdding && (
        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Adicionar Nova Turma</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Nome da Turma (Ex: 6º Ano A)</label>
              <input required type="text" value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})} className="w-full p-2 border border-slate-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Modalidade</label>
              <select value={formData.modalidade} onChange={e => setFormData({...formData, modalidade: e.target.value})} className="w-full p-2 border border-slate-300 rounded-md bg-white">
                <option value="Fundamental">Ensino Fundamental</option>
                <option value="Médio">Ensino Médio</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Série / Ano</label>
              <input required type="text" placeholder="Ex: 6º Ano" value={formData.serie} onChange={e => setFormData({...formData, serie: e.target.value})} className="w-full p-2 border border-slate-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Turno</label>
              <select value={formData.turno} onChange={e => setFormData({...formData, turno: e.target.value})} className="w-full p-2 border border-slate-300 rounded-md bg-white">
                <option value="Matutino">Matutino</option>
                <option value="Vespertino">Vespertino</option>
                <option value="Noturno">Noturno</option>
                <option value="Integral">Integral</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Curso</label>
              <input type="text" placeholder="Ex: Regular" value={formData.curso} onChange={e => setFormData({...formData, curso: e.target.value})} className="w-full p-2 border border-slate-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
            
            <div className="col-span-2 flex justify-end gap-3 mt-4">
              <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-md font-medium transition">Cancelar</button>
              <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-medium transition">Salvar Turma</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {turmas.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-500 bg-white rounded-lg border border-slate-200">
            Nenhuma turma cadastrada. Adicione uma turma para começar.
          </div>
        )}
        {turmas.map(turma => {
          const count = students.filter(s => s.turma === turma.nome).length;
          
          return (
          <div key={turma.id} className="bg-white rounded-lg border border-slate-200 shadow-sm p-5 flex flex-col relative group">
            <button 
              onClick={() => handleDelete(turma.id)} 
              className="absolute top-4 right-4 text-slate-300 hover:text-rose-500 hover:bg-rose-50 p-1.5 rounded transition opacity-0 group-hover:opacity-100"
              title="Excluir Turma"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 leading-tight">{turma.nome}</h3>
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                  {turma.modalidade}
                </span>
              </div>
            </div>
            
            <div className="space-y-2 text-sm text-slate-600 mb-4 flex-grow">
              <div className="flex justify-between">
                <span className="text-slate-400">Quantidade de Alunos:</span>
                <span className="font-medium text-indigo-600">{count} aluno(s)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Série:</span>
                <span className="font-medium text-slate-800">{turma.serie}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Turno:</span>
                <span className="font-medium text-slate-800">{turma.turno}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Curso:</span>
                <span className="font-medium text-slate-800">{turma.curso || 'N/A'}</span>
              </div>
            </div>

            <button 
              onClick={() => setViewingTurma(turma)}
              className="mt-2 flex items-center justify-center gap-2 w-full py-2 bg-slate-50 hover:bg-indigo-50 text-indigo-600 border border-slate-200 hover:border-indigo-200 rounded-md font-medium transition"
            >
              <FileText className="w-4 h-4" />
              Ver Alunos ({count})
            </button>
          </div>
        )})}
      </div>

      {/* Modal para exibir os alunos da turma */}
      {viewingTurma && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-7xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-slate-200 shrink-0">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Alunos: {viewingTurma.nome}</h3>
                <p className="text-sm text-slate-500">
                  {viewingTurma.modalidade} - {viewingTurma.serie} ({viewingTurma.turno})
                </p>
              </div>
              <button 
                onClick={() => setViewingTurma(null)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-auto bg-slate-50 flex-1">
              <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
                <div className="mb-4 text-sm text-slate-500 p-4 border-b border-slate-100">
                  Total na turma: {viewingTurmaStudents.length} aluno(s).
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                      <tr>
                        <th className="px-4 py-3">Nome do Aluno</th>
                        <th className="px-4 py-3">PAED</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Observações</th>
                        <th className="px-4 py-3">Encaminhamentos</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {viewingTurmaStudents.map(student => {
                        const status = getStatus(student.id);
                        const obsList = observations.filter(o => o.studentId === student.id);
                        const encList = forwardings.filter(f => f.studentId === student.id);
                        
                        let statusColor = "text-slate-600";
                        if (status === 'Reprovado') statusColor = "text-rose-600 font-medium";
                        if (status === 'Aprovado pelo Conselho') statusColor = "text-amber-600 font-medium";
                        if (status === 'Aprovado') statusColor = "text-emerald-600 font-medium";

                        return (
                          <tr key={student.id} className="hover:bg-slate-50">
                            <td className="px-4 py-3 align-top font-medium text-slate-800">{student.nome}</td>
                            <td className="px-4 py-3 align-top text-slate-500">
                              {student.paed ? (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                                  Sim
                                </span>
                              ) : 'Não'}
                            </td>
                            <td className={`px-4 py-3 align-top ${statusColor}`}>{status}</td>
                            <td className="px-4 py-3 align-top">
                              {obsList.length > 0 ? (
                                <ul className="list-disc pl-4 space-y-1 text-slate-600">
                                  {obsList.map(o => <li key={o.id}>{o.texto}</li>)}
                                </ul>
                              ) : <span className="text-slate-400 italic">Nenhuma</span>}
                            </td>
                            <td className="px-4 py-3 align-top">
                              {encList.length > 0 ? (
                                <ul className="list-disc pl-4 space-y-1 text-slate-600">
                                  {encList.map(f => <li key={f.id}>{f.texto}</li>)}
                                </ul>
                              ) : <span className="text-slate-400 italic">Nenhum</span>}
                            </td>
                          </tr>
                        );
                      })}
                      {viewingTurmaStudents.length === 0 && (
                        <tr>
                          <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                            Nenhum aluno associado a esta turma.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-slate-200 bg-white flex justify-end shrink-0 rounded-b-xl">
               <button 
                  onClick={() => setViewingTurma(null)}
                  className="px-6 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 font-medium transition"
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
