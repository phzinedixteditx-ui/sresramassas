import React from 'react';
import { Building2 } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-navy-950 text-slate-400 py-16 border-t border-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-slate-800/80">
          
          {/* Left Details */}
          <div className="md:col-span-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-brand-400">
                <Building2 className="w-4 h-4" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">CLÍNICA HARMONY</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed max-w-md">
              Av. Getúlio Vargas, 5272 - Centro<br />
              Boa Vista - RR, 69301-030<br />
              Telefone: <a href="tel:+559532243579" className="text-white hover:underline">(95) 3224-3579</a>
            </p>
          </div>

          {/* Right Links */}
          <div className="md:col-span-6 flex flex-col md:items-end justify-between space-y-4">
            <nav className="flex flex-wrap gap-6 text-sm font-medium text-slate-300">
              <a href="#inicio" className="hover:text-white transition-colors">Início</a>
              <a href="#sobre" className="hover:text-white transition-colors">A Clínica</a>
              <a href="#atendimento" className="hover:text-white transition-colors">Atendimento</a>
              <a href="#avaliacoes" className="hover:text-white transition-colors">Avaliações</a>
              <a href="#localizacao" className="hover:text-white transition-colors">Localização</a>
            </nav>
          </div>

        </div>

        {/* Copyright */}
        <div className="pt-8 text-center md:text-left flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 Clínica Harmony. Todos os direitos reservados.</p>
          <p className="text-slate-600">Policlínica em Boa Vista, Roraima</p>
        </div>
      </div>
    </footer>
  );
}
