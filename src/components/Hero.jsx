import React from 'react';
import { Phone, MapPin, Star, Building } from 'lucide-react';
import FadeIn from './reactbits/FadeIn';

export default function Hero() {
  return (
    <section id="inicio" className="relative pt-10 pb-20 md:pt-16 md:pb-28 overflow-hidden bg-gradient-to-b from-white via-slate-50 to-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column (Text & CTAs) */}
          <div className="lg:col-span-7 space-y-8">
            <FadeIn delay={0.1}>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 border border-slate-200/80 text-navy-900 text-xs font-bold tracking-wider uppercase">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>CLÍNICA HARMONY</span>
              </div>
            </FadeIn>

            <FadeIn delay={0.2}>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-navy-900 tracking-tight leading-[1.15]">
                Cuidado, confiança e atendimento em um só lugar.
              </h1>
            </FadeIn>

            <FadeIn delay={0.3}>
              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
                Uma clínica localizada no Centro de Boa Vista, preparada para receber seus pacientes com um espaço amplo e acolhedor.
              </p>
            </FadeIn>

            <FadeIn delay={0.4}>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
                <a href="tel:+559532243579" className="inline-flex items-center justify-center gap-3 px-7 py-4 rounded-xl bg-navy-900 hover:bg-slate-800 text-white font-semibold text-base transition-all duration-200 shadow-card hover:shadow-floating active:scale-[0.98]">
                  <Phone className="w-5 h-5 text-brand-300" />
                  <span>Entrar em contato</span>
                </a>
                
                <a href="https://maps.app.goo.gl/XAr6tsk4i6M8VhqW9" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2.5 px-7 py-4 rounded-xl bg-white hover:bg-slate-100 text-slate-800 font-semibold text-base border border-slate-200/90 transition-all duration-200 shadow-soft hover:border-slate-300">
                  <MapPin className="w-5 h-5 text-brand-600" />
                  <span>Ver localização</span>
                </a>
              </div>
            </FadeIn>

            <FadeIn delay={0.5}>
              <div className="pt-4 flex items-center gap-4 border-t border-slate-200/60">
                <div className="flex items-center gap-1 text-amber-500 text-sm">
                  <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                  <span className="font-bold text-slate-900 text-base ml-1">4,1</span>
                </div>
                <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                <span className="text-sm font-medium text-slate-500">22 avaliações públicas</span>
                <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                <span className="text-sm font-medium text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2.5 py-0.5 rounded-md flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Aberto agora
                </span>
              </div>
            </FadeIn>
          </div>

          {/* Right Column (Sophisticated Image Composition) */}
          <div className="lg:col-span-5">
            <FadeIn delay={0.3} direction="left">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                <div className="absolute -inset-2 rounded-3xl bg-slate-200/50 -rotate-1 blur-sm"></div>
                
                <div className="relative rounded-2xl overflow-hidden shadow-card border border-slate-200/80 bg-white">
                  <img
                    src="https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1000&q=85" 
                    alt="Ambiente moderno da recepção e instalações da Clínica Harmony" 
                    className="w-full h-[380px] sm:h-[440px] object-cover hover:scale-105 transition-transform duration-700"
                    loading="eager"
                  />
                  
                  <div className="p-4 bg-white/95 backdrop-blur-sm border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-brand-700">
                        <Building className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-navy-900">Centro de Boa Vista</p>
                        <p className="text-[11px] text-slate-500">Av. Getúlio Vargas, 5272</p>
                      </div>
                    </div>
                    <span className="text-[11px] font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md">Policlínica</span>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>

        </div>
      </div>
    </section>
  );
}
