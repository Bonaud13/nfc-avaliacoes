"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const data = [28, 38, 34, 51, 45, 62, 56, 75, 66, 88, 79, 100];

export default function Metrics() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".metric-number", {
        y: 60,
        opacity: 0,
        duration: 1,
        ease: "power4.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 70%",
        },
      });

      gsap.from(".metric-bar", {
        scaleY: 0,
        duration: 1,
        stagger: 0.06,
        ease: "power3.out",
        transformOrigin: "bottom",
        scrollTrigger: {
          trigger: ".metric-chart",
          start: "top 78%",
        },
      });

      gsap.from(".metric-detail", {
        y: 30,
        opacity: 0,
        duration: 0.75,
        stagger: 0.12,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".metric-details",
          start: "top 85%",
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="metricas"
      className="bg-[#111820] px-6 py-24 text-white md:px-10 md:py-36"
    >
      <div className="mx-auto max-w-[1180px]">

        <div className="grid gap-12 lg:grid-cols-[.75fr_1.25fr]">

          <div>
            <p className="text-[12px] uppercase tracking-[0.16em] text-white/35">
              Interações
            </p>

            <div className="overflow-hidden">
              <div className="metric-number mt-5 text-[82px] font-semibold leading-none tracking-[-0.075em] md:text-[120px]">
                1.284
              </div>
            </div>

            <p className="mt-6 max-w-[300px] text-[15px] leading-6 text-white/45">
              Exemplo de acessos registrados pelas placas nos últimos 30 dias.
            </p>
          </div>


          <div className="metric-chart flex min-h-[360px] items-end gap-2 border-b border-white/15 md:gap-4">
            {data.map((height, index) => (
              <div
                key={index}
                className="metric-bar flex-1 bg-[#edf3f5]"
                style={{
                  height: `${height}%`,
                  opacity: 0.25 + index * 0.055,
                }}
              />
            ))}
          </div>
        </div>


        <div className="metric-details mt-16 grid border-t border-white/15 md:grid-cols-3">
          <div className="metric-detail border-b border-white/15 py-8 md:border-b-0 md:border-r md:pr-8">
            <p className="text-[11px] uppercase tracking-[0.14em] text-white/30">
              Mais acessada
            </p>

            <p className="mt-5 text-[32px] font-semibold tracking-[-0.045em]">
              Balcão
            </p>
          </div>

          <div className="metric-detail border-b border-white/15 py-8 md:border-b-0 md:border-r md:px-8">
            <p className="text-[11px] uppercase tracking-[0.14em] text-white/30">
              Maior atividade
            </p>

            <p className="mt-5 text-[32px] font-semibold tracking-[-0.045em]">
              18h — 20h
            </p>
          </div>

          <div className="metric-detail py-8 md:pl-8">
            <p className="text-[11px] uppercase tracking-[0.14em] text-white/30">
              Últimos 7 dias
            </p>

            <p className="mt-5 text-[32px] font-semibold tracking-[-0.045em]">
              286
            </p>
          </div>
        </div>


        <p className="mt-10 text-[10px] text-white/25">
          Dados demonstrativos. Interações representam acessos à placa, não avaliações confirmadas.
        </p>

      </div>
    </section>
  );
}
