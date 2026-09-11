import React from 'react';
import { Phone } from 'lucide-react';
import FadeIn from './reactbits/FadeIn';

export default function Services() {
  return (
    <section id="atendimento" className="py-20 md:py-28 bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn delay={0.1}>
          <div className="bg-navy-900 rounded-3xl p-8 sm:p-12 lg:p-16 text-white shadow-floating relative overflow-hidden">
            <div className="absolute -right-16 -bottom-16 w-80 h-80 rounded-full bg-brand-600/10 blur-3xl pointer-events-none"></div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
              <div className="lg:col-span-7 space-y-6">
                <span className="inline-block px-3 py-1 rounded-md bg-white/10 text-brand-200 text-xs font-bold tracking-wider uppercase backdrop-blur-sm">
                  INFORMAÇÕES DE ATENDIMENTO
                </span>

                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight">
                  Atendimento
                </h2>

                <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-xl">
                  Para informações sobre consultas, especialidades disponíveis e horários de atendimento, entre em contato diretamente com a Clínica Harmony.
                </p>

                <div className="pt-2">
                  <a href="tel:+559532243579" className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-white hover:bg-slate-100 text-navy-900 font-bold text-base transition-all duration-200 shadow-md active:scale-[0.98]">
                    <Phone className="w-5 h-5 text-brand-600" />
                    <span>Falar com a clínica</span>
                  </a>
                </div>
              </div>

              <div className="lg:col-span-5 hidden lg:block">
                <div className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                  <img 
                    src="https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=800&q=85" 
                    alt="Ambiente de consulta e recepção médica" 
                    className="w-full h-64 object-cover opacity-90 hover:opacity-100 transition-opacity duration-300"
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
