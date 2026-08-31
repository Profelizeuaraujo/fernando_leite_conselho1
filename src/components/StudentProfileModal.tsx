import React from 'react';
import { Student, Classification, Observation, Forwarding, CLASS_TYPES } from '../types';
import { X, Printer, User, AlertCircle, BookOpen, GraduationCap, CheckCircle } from 'lucide-react';

interface StudentProfileModalProps {
  student: Student;
  classifications: Classification[];
  observations: Observation[];
  forwardings: Forwarding[];
  onClose: () => void;
}

export function StudentProfileModal({ student, classifications, observations, forwardings, onClose }: StudentProfileModalProps) {
  const studentClasses = classifications.filter(c => c.studentId === student.id);
  const studentObs = observations.filter(o => o.studentId === student.id);
  const studentEnc = forwardings.filter(f => f.studentId === student.id);

  const getStatusText = () => {
    if (studentClasses.some(c => c.classId === 'reprovado')) return 'Reprovado';
    if (studentClasses.some(c => c.classId === 'conselho')) return 'Aprovado pelo Conselho';
    if (studentClasses.length === 0) return 'Sem Conselho';
    return 'Aprovado';
  };

  const status = getStatusText();

  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50 print:bg-white print:p-0">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto print:shadow-none print:max-w-full print:max-h-full print:overflow-visible relative flex flex-col">
        
        {/* Header - Hidden on Print, Print Header shown instead */}
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center z-10 print:hidden rounded-t-xl">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <User className="w-5 h-5 text-indigo-600" />
            Ficha do Aluno
          </h2>
          <div className="flex gap-2">
            <button 
              onClick={() => window.print()}
              className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg text-sm font-medium transition"
            >
              <Printer className="w-4 h-4" />
              Imprimir
            </button>
            <button 
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Print Header */}
        <div className="hidden print:block text-center border-b-2 border-slate-900 pb-4 mb-6 pt-4">
          <h1 className="text-2xl font-bold uppercase tracking-wider">EE Prof. Fernando Leite de Campos</h1>
          <h2 className="text-lg font-semibold mt-1">Ficha Individual do Aluno - Conselho de Classe</h2>
        </div>

        <div className="p-6 space-y-8 print:p-0">
          
          {/* Dados Pessoais */}
          <section>
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2 flex items-center gap-2">
              <GraduationCap className="w-4 h-4" /> Dados Escolares
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-100 print:bg-white print:border-slate-300 print:gap-2">
              <div><span className="text-slate-500 text-xs block">Nome Completo</span> <strong className="text-slate-900 text-lg">{student.nome}</strong></div>
              <div><span className="text-slate-500 text-xs block">RA / Código</span> <strong className="text-slate-900">{student.cod}</strong></div>
              <div><span className="text-slate-500 text-xs block">Turma</span> <strong className="text-slate-900">{student.turma}</strong></div>
              <div><span className="text-slate-500 text-xs block">Série / Curso</span> <strong className="text-slate-900">{student.serie} - {student.curso}</strong></div>
              <div><span className="text-slate-500 text-xs block">Turno</span> <strong className="text-slate-900">{student.turno}</strong></div>
              <div><span className="text-slate-500 text-xs block">PAED (Público Alvo Ed. Especial)</span> 
                <strong className={student.paed ? "text-amber-600" : "text-slate-900"}>{student.paed ? 'SIM' : 'NÃO'}</strong>
              </div>
            </div>
          </section>

          {/* Situação no Conselho */}
          <section>
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" /> Situação e Classificações
            </h3>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-slate-600 font-medium">Status Final:</span>
              <span className={`px-3 py-1 rounded-full text-sm font-bold print:border print:px-2 ${
                status === 'Reprovado' ? 'bg-rose-100 text-rose-700 print:border-rose-700' :
                status === 'Aprovado pelo Conselho' ? 'bg-amber-100 text-amber-700 print:border-amber-700' :
                status === 'Aprovado' ? 'bg-emerald-100 text-emerald-700 print:border-emerald-700' :
                'bg-slate-100 text-slate-700 print:border-slate-500'
              }`}>
                {status}
              </span>
            </div>
            
            {studentClasses.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {studentClasses.map(sc => {
                  const classDef = CLASS_TYPES.find(c => c.id === sc.classId);
                  return classDef ? (
                    <span key={sc.id} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 print:border-slate-400">
                      <span>{classDef.emoji}</span>
                      <span>{classDef.label}</span>
                    </span>
                  ) : null;
                })}
              </div>
            ) : (
              <p className="text-sm text-slate-500 italic">Nenhuma classificação registrada no conselho.</p>
            )}
          </section>

          {/* Observações e Encaminhamentos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 print:block print:space-y-8">
            <section>
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2 flex items-center gap-2">
                <BookOpen className="w-4 h-4" /> Observações
              </h3>
              {studentObs.length > 0 ? (
                <ul className="space-y-3">
                  {studentObs.map(obs => (
                    <li key={obs.id} className="bg-amber-50/50 p-3 rounded-lg border border-amber-100 text-sm text-slate-800 print:border-slate-300 print:bg-transparent">
                      {obs.texto}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-500 italic">Nenhuma observação registrada.</p>
              )}
            </section>

            <section>
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" /> Encaminhamentos
              </h3>
              {studentEnc.length > 0 ? (
                <ul className="space-y-3">
                  {studentEnc.map(enc => (
                    <li key={enc.id} className="bg-rose-50/50 p-3 rounded-lg border border-rose-100 text-sm text-slate-800 print:border-slate-300 print:bg-transparent">
                      {enc.texto}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-500 italic">Nenhum encaminhamento registrado.</p>
              )}
            </section>
          </div>

          <div className="hidden print:block mt-16 pt-8 border-t border-slate-300 text-center">
            <div className="w-64 mx-auto border-b border-slate-400 mb-2"></div>
            <p className="text-sm text-slate-600">Assinatura da Coordenação / Direção</p>
            <p className="text-xs text-slate-400 mt-4">Documento gerado em {new Date().toLocaleDateString('pt-BR')}</p>
          </div>

        </div>
      </div>
    </div>
  );
}
