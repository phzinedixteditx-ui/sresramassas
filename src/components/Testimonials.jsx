import React from 'react';
import { Star, Quote } from 'lucide-react';
import FadeIn from './reactbits/FadeIn';

export default function Testimonials() {
  return (
    <section id="avaliacoes" className="py-20 md:py-28 bg-white border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <FadeIn delay={0.1}>
            <span className="text-xs font-bold tracking-widest text-slate-400 uppercase">PROVA SOCIAL</span>
          </FadeIn>
          
          <FadeIn delay={0.2}>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-navy-900 tracking-tight">
              Avaliações dos Pacientes
            </h2>
          </FadeIn>
          
          <FadeIn delay={0.3}>
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-2xl font-black text-navy-900">4,1</span>
              <div className="flex items-center gap-1 text-amber-500 text-sm">
                <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                <Star className="w-4 h-4 fill-amber-500/50 text-amber-500" />
              </div>
              <span className="text-xs font-medium text-slate-500">· 22 avaliações no Google</span>
            </div>
          </FadeIn>
        </div>

        {/* Testimonials Grid (ONLY REAL REVIEWS FROM BRIEFING) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12 max-w-4xl mx-auto">
          
          {/* Review 1 */}
          <FadeIn delay={0.2} direction="up">
            <div className="bg-slate-50 rounded-2xl p-8 border border-slate-200/70 shadow-soft relative flex flex-col justify-between h-full">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-amber-500">
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  </div>
                  <Quote className="w-8 h-8 text-slate-300 stroke-[1.5]" />
                </div>

                <p className="text-slate-700 text-base italic leading-relaxed">
                  "É uma clínica ótima, excelentes profissionais."
                </p>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-500">
                <span className="font-semibold text-slate-700">Paciente — Avaliação Pública</span>
                <span className="flex items-center gap-1"><i className="fa-brands fa-google text-slate-400"></i> Google Review</span>
              </div>
            </div>
          </FadeIn>

          {/* Review 2 */}
          <FadeIn delay={0.3} direction="up">
            <div className="bg-slate-50 rounded-2xl p-8 border border-slate-200/70 shadow-soft relative flex flex-col justify-between h-full">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-amber-500">
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  </div>
                  <Quote className="w-8 h-8 text-slate-300 stroke-[1.5]" />
                </div>

                <p className="text-slate-700 text-base italic leading-relaxed">
                  "fui a uma consulta com o dr ryan schuler, otima experiencia foi super atencioso"
                </p>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-500">
                <span className="font-semibold text-slate-700">Paciente — Avaliação Pública</span>
                <span className="flex items-center gap-1"><i className="fa-brands fa-google text-slate-400"></i> Google Review</span>
              </div>
            </div>
          </FadeIn>

        </div>

      </div>
    </section>
  );
}
