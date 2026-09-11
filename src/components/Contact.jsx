import React from 'react';
import { PhoneCall, MapPin } from 'lucide-react';
import FadeIn from './reactbits/FadeIn';

export default function Contact() {
  return (
    <section className="py-20 md:py-28 bg-white border-t border-slate-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <FadeIn delay={0.1}>
          <div className="bg-gradient-to-b from-slate-50 to-white rounded-3xl p-8 sm:p-14 border border-slate-200/80 shadow-soft space-y-6">
            
            <div className="w-14 h-14 rounded-2xl bg-navy-900 text-brand-300 mx-auto flex items-center justify-center text-2xl shadow-md">
              <PhoneCall className="w-7 h-7" />
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-navy-900 tracking-tight">
              Precisa falar com a Clínica Harmony?
            </h2>

            <p className="text-slate-600 text-base sm:text-lg leading-relaxed max-w-xl mx-auto">
              Entre em contato para obter informações sobre consultas, atendimento e horários.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <a href="tel:+559532243579" className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-navy-900 hover:bg-slate-800 text-white font-bold text-base transition-all duration-200 shadow-card hover:shadow-floating active:scale-[0.98]">
                <PhoneCall className="w-5 h-5 text-brand-300" />
                <span>Ligar para a clínica: (95) 3224-3579</span>
              </a>

              <a href="https://maps.app.goo.gl/XAr6tsk4i6M8VhqW9" target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-4 rounded-xl bg-white hover:bg-slate-100 text-slate-800 font-semibold text-base border border-slate-200/90 transition-all duration-200 shadow-soft">
                <MapPin className="w-5 h-5 text-brand-600" />
                <span>Ver no Google Maps</span>
              </a>
            </div>

          </div>
        </FadeIn>
      </div>
    </section>
  );
}
