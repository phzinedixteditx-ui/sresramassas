import React, { useState } from 'react';
import { Phone, Building2, Menu, X, MapPin } from 'lucide-react';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <a href="#inicio" className="flex items-center gap-3 group focus:outline-none" aria-label="Clínica Harmony - Voltar ao início">
          <div className="w-10 h-10 rounded-xl bg-navy-900 flex items-center justify-center text-white shadow-md shadow-navy-900/10 transition-transform duration-300 group-hover:scale-105">
            <Building2 className="w-5 h-5 text-brand-400" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-[10px] font-bold tracking-[0.2em] text-slate-500 uppercase">CLÍNICA</span>
            <span className="text-xl font-extrabold text-navy-900 tracking-tight group-hover:text-brand-700 transition-colors">HARMONY</span>
          </div>
        </a>

        {/* Desktop Menu Links */}
        <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-600" aria-label="Menu principal">
          <a href="#inicio" className="hover:text-navy-900 transition-colors duration-200 py-1">Início</a>
          <a href="#sobre" className="hover:text-navy-900 transition-colors duration-200 py-1">A Clínica</a>
          <a href="#atendimento" className="hover:text-navy-900 transition-colors duration-200 py-1">Atendimento</a>
          <a href="#avaliacoes" className="hover:text-navy-900 transition-colors duration-200 py-1">Avaliações</a>
          <a href="#localizacao" className="hover:text-navy-900 transition-colors duration-200 py-1">Localização</a>
        </nav>

        {/* Right CTA Button (Desktop) */}
        <div className="hidden md:flex items-center gap-4">
          <a href="tel:+559532243579" className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-navy-900 hover:bg-slate-800 text-white font-semibold text-sm transition-all duration-200 shadow-soft hover:shadow-card active:scale-[0.98]">
            <Phone className="w-4 h-4 text-brand-300" />
            <span>Entrar em contato</span>
          </a>
        </div>

        {/* Hamburger Button (Mobile) */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          type="button"
          className="md:hidden p-2.5 rounded-xl text-slate-700 hover:bg-slate-100 focus:outline-none"
          aria-label="Abrir menu de navegação"
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-6 space-y-4 shadow-xl transition-all duration-300">
          <nav className="flex flex-col space-y-3 font-medium text-slate-700">
            <a href="#inicio" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg hover:bg-slate-50 hover:text-navy-900">Início</a>
            <a href="#sobre" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg hover:bg-slate-50 hover:text-navy-900">A Clínica</a>
            <a href="#atendimento" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg hover:bg-slate-50 hover:text-navy-900">Atendimento</a>
            <a href="#avaliacoes" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg hover:bg-slate-50 hover:text-navy-900">Avaliações</a>
            <a href="#localizacao" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg hover:bg-slate-50 hover:text-navy-900">Localização</a>
          </nav>
          <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
            <a href="tel:+559532243579" className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-navy-900 text-white font-semibold text-sm shadow-md">
              <Phone className="w-4 h-4 text-brand-300" />
              <span>Entrar em contato</span>
            </a>
            <a href="https://maps.app.goo.gl/XAr6tsk4i6M8VhqW9" target="_blank" rel="noopener noreferrer" className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium text-sm">
              <MapPin className="w-4 h-4 text-brand-600" />
              <span>Ver localização no mapa</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
