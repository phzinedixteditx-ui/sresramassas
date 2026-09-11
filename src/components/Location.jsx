import React from 'react';
import { MapPin, Phone, Hash, Clock, Navigation, ExternalLink, Building2 } from 'lucide-react';
import FadeIn from './reactbits/FadeIn';

export default function Location() {
  return (
    <section id="localizacao" className="py-20 md:py-28 bg-[#F8FAFC] border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="max-w-2xl mb-12">
          <FadeIn delay={0.1}>
            <span className="text-xs font-bold tracking-widest text-slate-400 uppercase">ONDE ENCONTRAR</span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-navy-900 tracking-tight mt-2">
              Estamos em Boa Vista
            </h2>
          </FadeIn>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left Details Block */}
          <div className="lg:col-span-5">
            <FadeIn delay={0.2} direction="right" className="h-full">
              <div className="bg-white rounded-2xl p-8 border border-slate-200/80 shadow-card flex flex-col justify-between space-y-8 h-full">
                <div className="space-y-6">
                  <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-navy-900">
                      <Building2 className="w-6 h-6 text-brand-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-extrabold text-navy-900">Clínica Harmony</h3>
                      <p className="text-xs text-slate-500 font-medium">Policlínica no Centro de Boa Vista</p>
                    </div>
                  </div>

                  <div className="space-y-4 text-slate-700 text-sm">
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-brand-600 mt-1 shrink-0" />
                      <div>
                        <p className="font-semibold text-slate-900">Endereço:</p>
                        <p>Av. Getúlio Vargas, 5272 - Centro</p>
                        <p>Boa Vista - RR, 69301-030</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Phone className="w-5 h-5 text-brand-600 mt-1 shrink-0" />
                      <div>
                        <p className="font-semibold text-slate-900">Telefone:</p>
                        <a href="tel:+559532243579" className="text-navy-900 font-bold hover:underline">(95) 3224-3579</a>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Hash className="w-5 h-5 text-brand-600 mt-1 shrink-0" />
                      <div>
                        <p className="font-semibold text-slate-900">Código de Localização (Plus Code):</p>
                        <p className="font-mono text-xs text-slate-600 bg-slate-100 px-2 py-1 rounded inline-block mt-0.5">R8FM+39 Centro, Boa Vista - RR</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Clock className="w-5 h-5 text-brand-600 mt-1 shrink-0" />
                      <div>
                        <p className="font-semibold text-slate-900">Horário Informado:</p>
                        <p className="text-slate-600">Aberto — fecha às 20:00</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <a href="https://maps.app.goo.gl/XAr6tsk4i6M8VhqW9" target="_blank" rel="noopener noreferrer" className="w-full inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-navy-900 hover:bg-slate-800 text-white font-bold text-sm transition-all duration-200 shadow-soft">
                    <Navigation className="w-4 h-4 text-brand-300" />
                    <span>Como chegar</span>
                  </a>
                </div>
              </div>
            </FadeIn>
          </div>

          {/* Right Integrated Google Maps */}
          <div className="lg:col-span-7">
            <FadeIn delay={0.3} direction="left" className="h-full">
              <div className="bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-card min-h-[380px] h-full relative">
                <iframe 
                  title="Mapa da Clínica Harmony em Boa Vista - RR"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3984.977359309219!2d-60.6713667!3d2.8227394!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8d93067321f457ad%3A0x71339ebf7f657929!2sClinica%20Harmony!5e0!3m2!1spt-BR!2sbr!4v1710000000000!5m2!1spt-BR!2sbr" 
                  width="100%" 
                  height="100%" 
                  style={{ border: 0, minHeight: '400px' }} 
                  allowFullScreen="" 
                  loading="lazy" 
                  referrerPolicy="no-referrer-when-downgrade"
                  className="w-full h-full min-h-[400px]"
                ></iframe>

                <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 bg-white/95 backdrop-blur-md p-3.5 rounded-xl shadow-lg border border-slate-200 flex items-center justify-between gap-4">
                  <div className="text-xs">
                    <p className="font-bold text-navy-900">Ver no Google Maps</p>
                    <p className="text-slate-500">Av. Getúlio Vargas, 5272</p>
                  </div>
                  <a href="https://maps.app.goo.gl/XAr6tsk4i6M8VhqW9" target="_blank" rel="noopener noreferrer" className="px-3.5 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs transition-colors shrink-0 flex items-center gap-1">
                    <span>Abrir Mapa</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </FadeIn>
          </div>

        </div>

      </div>
    </section>
  );
}
