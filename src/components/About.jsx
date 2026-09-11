import React from 'react';
import { MapPin, Maximize2, Sofa } from 'lucide-react';
import FadeIn from './reactbits/FadeIn';

export default function About() {
  return (
    <section id="sobre" className="py-20 md:py-28 bg-white border-y border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Photography */}
          <div className="lg:col-span-6 order-2 lg:order-1">
            <FadeIn delay={0.2} direction="right">
              <div className="rounded-2xl overflow-hidden shadow-card border border-slate-100 bg-slate-50">
                <img 
                  src="https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=1000&q=85" 
                  alt="Sala de espera e espaço amplo de atendimento da Clínica Harmony" 
                  className="w-full h-[360px] sm:h-[420px] object-cover"
                  loading="lazy"
                />
              </div>
            </FadeIn>
          </div>

          {/* Right Text Content */}
          <div className="lg:col-span-6 order-1 lg:order-2 space-y-6">
            <FadeIn delay={0.1}>
              <span className="text-xs font-bold tracking-widest text-slate-400 uppercase">A CLÍNICA</span>
            </FadeIn>
            
            <FadeIn delay={0.2}>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-navy-900 tracking-tight leading-tight">
                Um espaço pensado para receber você
              </h2>
            </FadeIn>

            <FadeIn delay={0.3}>
              <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
                A Clínica Harmony está localizada em uma região central de Boa Vista, oferecendo um espaço amplo e uma sala de espera preparada para receber seus pacientes.
              </p>
            </FadeIn>

            {/* Highlights */}
            <FadeIn delay={0.4}>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60">
                  <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-navy-900 mb-3 border border-slate-100">
                    <MapPin className="w-4 h-4 text-brand-600" />
                  </div>
                  <h3 className="text-sm font-bold text-navy-900">Localização central</h3>
                  <p className="text-xs text-slate-500 mt-1">Fácil acesso na Av. Getúlio Vargas</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60">
                  <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-navy-900 mb-3 border border-slate-100">
                    <Maximize2 className="w-4 h-4 text-brand-600" />
                  </div>
                  <h3 className="text-sm font-bold text-navy-900">Espaço amplo</h3>
                  <p class="text-xs text-slate-500 mt-1">Estrutura física bem distribuída</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60">
                  <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-navy-900 mb-3 border border-slate-100">
                    <Sofa className="w-4 h-4 text-brand-600" />
                  </div>
                  <h3 className="text-sm font-bold text-navy-900">Ambiente de atendimento</h3>
                  <p className="text-xs text-slate-500 mt-1">Recepção confortável e organizada</p>
                </div>
              </div>
            </FadeIn>
          </div>

        </div>
      </div>
    </section>
  );
}
