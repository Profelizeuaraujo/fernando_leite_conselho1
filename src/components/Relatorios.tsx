import React, { useState } from 'react';
import { Student, Classification, Observation, Forwarding } from '../types';
import { Printer, Download, Filter } from 'lucide-react';

interface RelatoriosProps {
  students: Student[];
  classifications: Classification[];
  observations: Observation[];
  forwardings: Forwarding[];
}

export function Relatorios({ students, classifications, observations, forwardings }: RelatoriosProps) {
  const [selectedTurma, setSelectedTurma] = useState<string>('TODAS');
  const [selectedStatus, setSelectedStatus] = useState<string>('TODOS');

  // Obter lista única de turmas
  const turmas = Array.from(new Set(students.map(s => s.turma))).sort();

  const getStatus = (studentId: number) => {
    const studentClassifications = classifications.filter(c => c.studentId === studentId);
    if (studentClassifications.length === 0) return 'Sem Conselho';
    const hasReprovado = studentClassifications.some(c => c.classId === 'reprovado');
    const hasConselho = studentClassifications.some(c => c.classId === 'conselho');
    if (hasReprovado) return 'Reprovado';
    if (hasConselho) return 'Aprovado pelo Conselho';
    return 'Aprovado';
  };

  const filteredStudents = students.filter(student => {
    if (selectedTurma !== 'TODAS' && student.turma !== selectedTurma) return false;
    if (selectedStatus !== 'TODOS') {
      const status = getStatus(student.id);
      if (selectedStatus === 'Aprovados' && status !== 'Aprovado') return false;
      if (selectedStatus === 'Reprovados' && status !== 'Reprovado') return false;
      if (selectedStatus === 'Conselho' && status !== 'Aprovado pelo Conselho') return false;
    }
    return true;
  });

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const headers = ['RA', 'Nome', 'Turma', 'Turno', 'Status', 'Observações', 'Encaminhamentos'];
    const rows = filteredStudents.map(student => {
      const status = getStatus(student.id);
      const obs = observations.filter(o => o.studentId === student.id).map(o => o.texto).join('; ');
      const enc = forwardings.filter(f => f.studentId === student.id).map(f => f.texto).join('; ');
      return [
        student.cod,
        student.nome,
        student.turma,
        student.turno,
        status,
        `"${obs.replace(/"/g, '""')}"`,
        `"${enc.replace(/"/g, '""')}"`
      ].join(',');
    });
    
    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `relatorio_${selectedTurma}_${new Date().getTime()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center print:hidden">
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-slate-400" />
            <select 
              value={selectedTurma} 
              onChange={e => setSelectedTurma(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 bg-white"
            >
              <option value="TODAS">Todas as Turmas</option>
              {turmas.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <select 
            value={selectedStatus} 
            onChange={e => setSelectedStatus(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 bg-white"
          >
            <option value="TODOS">Todos os Status</option>
            <option value="Aprovados">Somente Aprovados</option>
            <option value="Reprovados">Somente Reprovados</option>
            <option value="Conselho">Aprovados pelo Conselho</option>
          </select>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-md hover:bg-slate-200 font-medium transition border border-slate-200"
          >
            <Download className="w-4 h-4" />
            Exportar CSV
          </button>
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-medium transition shadow-sm"
          >
            <Printer className="w-4 h-4" />
            Imprimir Relatório
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 shadow-sm print:shadow-none print:border-none p-6">
        <div className="hidden print:block text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Relatório Final do Conselho de Classe</h1>
          <h2 className="text-lg text-slate-600">EE PROF. FERNANDO LEITE DE CAMPOS</h2>
          <p className="text-sm text-slate-500 mt-2">
            Filtro: {selectedTurma === 'TODAS' ? 'Todas as Turmas' : selectedTurma} | Status: {selectedStatus}
          </p>
        </div>

        <div className="mb-4 text-sm text-slate-500 print:hidden">
          Mostrando {filteredStudents.length} aluno(s).
        </div>

        <table className="w-full text-left text-sm print:text-xs">
          <thead className="bg-slate-50 print:bg-white border-b border-slate-200 text-slate-600 font-semibold">
            <tr>
              <th className="px-4 py-3 print:px-1">Nome do Aluno</th>
              <th className="px-4 py-3 print:px-1">Turma</th>
              <th className="px-4 py-3 print:px-1">Status</th>
              <th className="px-4 py-3 print:px-1">Observações</th>
              <th className="px-4 py-3 print:px-1">Encaminhamentos</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredStudents.map(student => {
              const status = getStatus(student.id);
              const obsList = observations.filter(o => o.studentId === student.id);
              const encList = forwardings.filter(f => f.studentId === student.id);
              
              let statusColor = "text-slate-600";
              if (status === 'Reprovado') statusColor = "text-rose-600 font-medium";
              if (status === 'Aprovado pelo Conselho') statusColor = "text-amber-600 font-medium";
              if (status === 'Aprovado') statusColor = "text-emerald-600 font-medium";

              return (
                <tr key={student.id} className="hover:bg-slate-50 print:hover:bg-white break-inside-avoid">
                  <td className="px-4 py-3 print:px-1 align-top font-medium text-slate-800">{student.nome}</td>
                  <td className="px-4 py-3 print:px-1 align-top text-slate-500">{student.turma}</td>
                  <td className={`px-4 py-3 print:px-1 align-top ${statusColor}`}>{status}</td>
                  <td className="px-4 py-3 print:px-1 align-top">
                    {obsList.length > 0 ? (
                      <ul className="list-disc pl-4 space-y-1 text-slate-600">
                        {obsList.map(o => <li key={o.id}>{o.texto}</li>)}
                      </ul>
                    ) : <span className="text-slate-400 italic">Nenhuma</span>}
                  </td>
                  <td className="px-4 py-3 print:px-1 align-top">
                    {encList.length > 0 ? (
                      <ul className="list-disc pl-4 space-y-1 text-slate-600">
                        {encList.map(f => <li key={f.id}>{f.texto}</li>)}
                      </ul>
                    ) : <span className="text-slate-400 italic">Nenhum</span>}
                  </td>
                </tr>
              );
            })}
            {filteredStudents.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                  Nenhum registro encontrado para os filtros selecionados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
