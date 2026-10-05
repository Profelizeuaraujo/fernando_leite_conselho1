import React, { useState } from 'react';
import { Student, Classification, Observation, Forwarding, CLASS_TYPES } from '../types';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface RelatoriosProps {
  students: Student[];
  classifications: Classification[];
  observations: Observation[];
  forwardings: Forwarding[];
}

export function Relatorios({ students, classifications, observations, forwardings }: RelatoriosProps) {
  const [agruparPor, setAgruparPor] = useState<string>('Série');
  const [modalidade, setModalidade] = useState<string>('Todos');
  const [turma, setTurma] = useState<string>('Todos');
  const [pesquisaTurma, setPesquisaTurma] = useState<string>('');
  const [turno, setTurno] = useState<string>('Todos');
  const [somentePaed, setSomentePaed] = useState<boolean>(false);
  const [reportTitle, setReportTitle] = useState<string>('Relatório Final do Conselho de Classe');
  
  const [showReport, setShowReport] = useState<boolean>(false);

  // Extrair listas únicas
  const modalidadesUnicas = Array.from(new Set(students.map(s => s.modalidade))).filter(Boolean).sort();
  const turmasUnicas = Array.from(new Set(students.map(s => s.turma))).filter(Boolean).sort();
  const turnosUnicos = Array.from(new Set(students.map(s => s.turno))).filter(Boolean).sort();

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
    if (modalidade !== 'Todos' && student.modalidade !== modalidade) return false;
    if (turma !== 'Todos' && student.turma !== turma) return false;
    if (turno !== 'Todos' && student.turno !== turno) return false;
    if (somentePaed && !student.paed) return false;
    if (pesquisaTurma && !student.turma.toLowerCase().includes(pesquisaTurma.toLowerCase())) return false;
    return true;
  });

  // Sort by the 'agruparPor' field
  const sortedStudents = [...filteredStudents].sort((a, b) => {
    if (agruparPor === 'Série') {
      return (a.serie || '').localeCompare(b.serie || '') || a.nome.localeCompare(b.nome);
    } else if (agruparPor === 'Turma') {
      return (a.turma || '').localeCompare(b.turma || '') || a.nome.localeCompare(b.nome);
    } else if (agruparPor === 'Turno') {
      return (a.turno || '').localeCompare(b.turno || '') || a.nome.localeCompare(b.nome);
    }
    return a.nome.localeCompare(b.nome);
  });

  const handlePrint = () => {
    window.print();
  };

  const exportData = (type: 'csv' | 'excel') => {
    const headers = ['RA', 'Nome', 'Série', 'Turma', 'Turno', 'Modalidade', 'PAED', 'Status', 'Observações', 'Encaminhamentos'];
    
    const rows = sortedStudents.map(student => {
      const status = getStatus(student.id);
      const obs = observations.filter(o => o.studentId === student.id).map(o => o.texto).join('; ');
      const enc = forwardings.filter(f => f.studentId === student.id).map(f => f.texto).join('; ');
      
      return [
        student.cod,
        student.nome,
        student.serie || '',
        student.turma,
        student.turno || '',
        student.modalidade || '',
        student.paed ? 'Sim' : 'Não',
        status,
        `"${obs.replace(/"/g, '""')}"`,
        `"${enc.replace(/"/g, '""')}"`
      ].join(type === 'csv' ? ',' : '\t');
    });
    
    const content = [headers.join(type === 'csv' ? ',' : '\t'), ...rows].join('\n');
    const mimeType = type === 'csv' ? 'text/csv;charset=utf-8;' : 'application/vnd.ms-excel;charset=utf-8;';
    const extension = type === 'csv' ? 'csv' : 'xls';
    
    const blob = new Blob([content], { type: mimeType });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `relatorio_${new Date().getTime()}.${extension}`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportPDF = () => {
    const doc = new jsPDF('landscape');
    
    // Configurações do título
    doc.setFontSize(18);
    doc.text('Relatório Consolidado - Conselho de Classe', 14, 22);
    
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text('EE PROF. FERNANDO LEITE DE CAMPOS', 14, 30);
    doc.text(`Gerado em ${new Date().toLocaleDateString('pt-BR')}`, 14, 36);

    const headers = [['Nome', 'Série', 'Turma', 'Turno', 'PAED', 'Status', 'Observações', 'Encaminhamentos']];
    
    const data = sortedStudents.map(student => {
      const status = getStatus(student.id);
      const obs = observations.filter(o => o.studentId === student.id).map(o => o.texto).join('\n- ');
      const enc = forwardings.filter(f => f.studentId === student.id).map(f => f.texto).join('\n- ');
      
      return [
        student.nome,
        student.serie || '-',
        student.turma,
        student.turno || '-',
        student.paed ? 'Sim' : 'Não',
        status,
        obs ? `- ${obs}` : 'Nenhuma',
        enc ? `- ${enc}` : 'Nenhum'
      ];
    });

    autoTable(doc, {
      startY: 45,
      head: headers,
      body: data,
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [17, 50, 100], textColor: [255, 255, 255], fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      columnStyles: {
        0: { cellWidth: 40 }, // Nome
        1: { cellWidth: 15 }, // Série
        2: { cellWidth: 25 }, // Turma
        3: { cellWidth: 15 }, // Turno
        4: { cellWidth: 12 }, // PAED
        5: { cellWidth: 25 }, // Status
        6: { cellWidth: 65 }, // Observações
        7: { cellWidth: 65 }  // Encaminhamentos
      }
    });

    doc.save(`relatorio_conselho_${new Date().getTime()}.pdf`);
  };

  const exportFinalReportPDF = () => {
    const doc = new jsPDF('portrait');
    
    // Configurações do título
    doc.setFontSize(18);
    const finalTitle = reportTitle.trim() || 'Relatório Final do Conselho de Classe';
    doc.text(finalTitle, 14, 22);
    
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text('EE PROF. FERNANDO LEITE DE CAMPOS', 14, 30);
    doc.text(`Gerado em ${new Date().toLocaleDateString('pt-BR')}`, 14, 36);

    const headers = [['Aluno / Turma', 'Perfil (Classificações)', 'Observações', 'Encaminhamentos']];
    
    const data = sortedStudents.map(student => {
      const status = getStatus(student.id);
      
      const studentClassifications = classifications
        .filter(c => c.studentId === student.id)
        .map(c => CLASS_TYPES.find(t => t.id === c.classId)?.label || c.classId)
        .join('\n• ');

      const obs = observations.filter(o => o.studentId === student.id).map(o => o.texto).join('\n• ');
      const enc = forwardings.filter(f => f.studentId === student.id).map(f => f.texto).join('\n• ');
      
      return [
        `${student.nome}\nSérie: ${student.serie || '-'}\nTurma: ${student.turma}\nStatus: ${status}`,
        studentClassifications ? `• ${studentClassifications}` : 'Nenhuma',
        obs ? `• ${obs}` : 'Nenhuma',
        enc ? `• ${enc}` : 'Nenhum'
      ];
    });

    autoTable(doc, {
      startY: 45,
      head: headers,
      body: data,
      theme: 'grid',
      styles: { fontSize: 9, cellPadding: 3, overflow: 'linebreak' },
      headStyles: { fillColor: [17, 50, 100], textColor: [255, 255, 255], fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [250, 250, 250] },
      columnStyles: {
        0: { cellWidth: 45, fontStyle: 'bold' }, // Aluno / Turma
        1: { cellWidth: 45 }, // Perfil
        2: { cellWidth: 45 }, // Observações
        3: { cellWidth: 45 }  // Encaminhamentos
      }
    });

    doc.save(`relatorio_final_${new Date().getTime()}.pdf`);
  };

  return (
    <div className="space-y-6">
      {/* Container Principal de Filtros */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 print:hidden p-6">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 mb-6">
          📄 Gerar Relatório
        </h2>

        {/* Row 1: Filtros */}
        <div className="flex flex-wrap items-end gap-4 mb-6">
          <div className="flex-1 min-w-[140px]">
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Agrupar Por
            </label>
            <select 
              value={agruparPor} 
              onChange={e => setAgruparPor(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 bg-white text-sm"
            >
              <option value="Série">Série</option>
              <option value="Turma">Turma</option>
              <option value="Turno">Turno</option>
            </select>
          </div>

          <div className="flex-1 min-w-[160px]">
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Modalidade
            </label>
            <select 
              value={modalidade} 
              onChange={e => setModalidade(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 bg-white text-sm"
            >
              <option value="Todos">Todos</option>
              {modalidadesUnicas.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>

          <div className="flex-1 min-w-[140px]">
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Turma
            </label>
            <select 
              value={turma} 
              onChange={e => setTurma(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 bg-white text-sm"
            >
              <option value="Todos">Todas</option>
              {turmasUnicas.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div className="flex-1 min-w-[180px]">
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
              🔍 Pesquisar por Turma
            </label>
            <input 
              type="text" 
              value={pesquisaTurma} 
              onChange={e => setPesquisaTurma(e.target.value)}
              placeholder="Digite o nome da turma..."
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 bg-white text-sm"
            />
          </div>

          <div className="flex-1 min-w-[140px]">
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Turno
            </label>
            <select 
              value={turno} 
              onChange={e => setTurno(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 bg-white text-sm"
            >
              <option value="Todos">Todos</option>
              {turnosUnicos.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div className="flex items-center gap-4 mb-2 min-w-[280px]">
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={somentePaed} 
                onChange={e => setSomentePaed(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
              />
              <span className="text-sm font-medium text-slate-700">Somente PAED</span>
            </label>

            <button 
              onClick={() => setShowReport(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#2563eb] hover:bg-blue-700 text-white rounded-md font-semibold transition ml-auto text-sm"
            >
              📄 Gerar Relatório
            </button>
          </div>
        </div>

        {/* Row 2: Ações */}
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={() => exportData('excel')}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-md hover:bg-slate-200 font-semibold transition text-sm"
          >
            📊 Exportar Excel
          </button>
          <button 
            onClick={() => exportData('csv')}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-md hover:bg-slate-200 font-semibold transition text-sm"
          >
            📋 Exportar CSV
          </button>
          <button 
            onClick={exportPDF}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-md hover:bg-slate-200 font-semibold transition text-sm"
          >
            📄 Exportar PDF
          </button>
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-md hover:bg-slate-200 font-semibold transition text-sm"
          >
            🖨️ Imprimir Relatório
          </button>
        </div>

        {/* Row 3: Relatório Final Personalizado */}
        <div className="mt-6 pt-6 border-t border-slate-200 print:hidden">
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
            Relatório Final Detalhado
          </label>
          <div className="flex flex-wrap items-center gap-3">
            <input 
              type="text" 
              value={reportTitle} 
              onChange={e => setReportTitle(e.target.value)}
              placeholder="Ex: Relatório Final do Conselho de Classe 2º Bimestre"
              className="flex-1 min-w-[300px] px-3 py-2 border border-slate-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 bg-white text-sm"
            />
            <button 
              onClick={exportFinalReportPDF}
              className="flex items-center justify-center gap-2 px-6 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-md font-semibold transition text-sm"
            >
              📄 Gerar Relatório Final do Conselho
            </button>
          </div>
          <p className="text-xs text-slate-500 mt-2">Gera um PDF completo com todas as classificações (perfil), observações e encaminhamentos detalhados de cada aluno filtrado.</p>
        </div>
      </div>

      {/* Relatório Gerado */}
      {showReport && (
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm print:shadow-none print:border-none p-6">
          <div className="hidden print:block text-center mb-8">
            <h1 className="text-2xl font-bold text-slate-900">Relatório Consolidado</h1>
            <h2 className="text-lg text-slate-600">EE PROF. FERNANDO LEITE DE CAMPOS</h2>
            <p className="text-sm text-slate-500 mt-2">
              Gerado em {new Date().toLocaleDateString('pt-BR')}
            </p>
          </div>

          <div className="mb-4 text-sm text-slate-500 print:hidden">
            Mostrando {sortedStudents.length} aluno(s).
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm print:text-xs">
              <thead className="bg-slate-50 print:bg-white border-b border-slate-200 text-slate-600 font-semibold">
                <tr>
                  <th className="px-4 py-3 print:px-1">Nome do Aluno</th>
                  <th className="px-4 py-3 print:px-1">Série</th>
                  <th className="px-4 py-3 print:px-1">Turma</th>
                  <th className="px-4 py-3 print:px-1">Turno</th>
                  <th className="px-4 py-3 print:px-1">PAED</th>
                  <th className="px-4 py-3 print:px-1">Status</th>
                  <th className="px-4 py-3 print:px-1">Observações</th>
                  <th className="px-4 py-3 print:px-1">Encaminhamentos</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sortedStudents.map(student => {
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
                      <td className="px-4 py-3 print:px-1 align-top text-slate-500">{student.serie || '-'}</td>
                      <td className="px-4 py-3 print:px-1 align-top text-slate-500">{student.turma}</td>
                      <td className="px-4 py-3 print:px-1 align-top text-slate-500">{student.turno || '-'}</td>
                      <td className="px-4 py-3 print:px-1 align-top text-slate-500">
                        {student.paed ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                            Sim
                          </span>
                        ) : 'Não'}
                      </td>
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
                {sortedStudents.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-slate-500">
                      Nenhum registro encontrado para os filtros selecionados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
