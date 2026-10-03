"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const places = [
  ["Café da Praça", "Cafeteria", "4,8"],
  ["Studio Central", "Barbearia", "4,5"],
  ["Clínica Horizonte", "Clínica", "4,3"],
  ["Restaurante Aurora", "Restaurante", "4,7"],
];

export default function GoogleDestination() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".google-heading", {
        y: 50,
        opacity: 0,
        duration: 0.9,
        ease: "power3.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 75%",
        },
      });

      gsap.from(".place-row", {
        x: -35,
        opacity: 0,
        duration: 0.7,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".places-list",
          start: "top 78%",
        },
      });

      gsap.from(".map-shell", {
        x: 80,
        opacity: 0,
        duration: 1,
        ease: "power4.out",
        scrollTrigger: {
          trigger: ".map-shell",
          start: "top 82%",
        },
      });

      gsap.from(".map-pin", {
        scale: 0,
        y: -25,
        opacity: 0,
        duration: 0.65,
        stagger: 0.12,
        ease: "back.out(1.8)",
        scrollTrigger: {
          trigger: ".map-shell",
          start: "top 70%",
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="google"
      className="overflow-hidden bg-white px-6 py-24 md:px-10 md:py-36"
    >
      <div className="mx-auto max-w-[1180px]">
        <div className="google-heading grid gap-8 border-b border-black/10 pb-12 lg:grid-cols-2">
          <h2 className="text-[48px] font-semibold leading-[0.98] tracking-[-0.055em] text-[#101820] md:text-[68px]">
            Do balcão
            <br />
            para o Google.
          </h2>

          <div className="flex items-end">
            <p className="max-w-[420px] text-[16px] leading-7 text-[#686d70]">
              Seu cliente chega à avaliação da empresa sem precisar procurar nome, endereço ou link.
            </p>
          </div>
        </div>

        <div className="mt-14 grid items-center gap-14 lg:grid-cols-[.78fr_1.22fr]">

          {/* LOCAIS */}
          <div className="places-list">
            <p className="mb-5 text-[12px] uppercase tracking-[0.16em] text-[#989b9c]">
              Ao redor
            </p>

            {places.map(([name, category, rating], index) => (
              <div
                key={name}
                className="place-row group flex items-center justify-between border-t border-black/10 py-6 last:border-b"
              >
                <div className="flex items-center gap-5">
                  <span className="w-5 text-[11px] text-[#a0a3a4]">
                    0{index + 1}
                  </span>

                  <div>
                    <h3 className="text-[20px] font-semibold tracking-[-0.035em] text-[#101820] transition group-hover:translate-x-1">
                      {name}
                    </h3>

                    <p className="mt-1 text-[12px] text-[#969a9c]">
                      {category}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <strong className="text-[13px] text-[#101820]">
                    {rating}
                  </strong>

                  <div className="mt-1 text-[9px] tracking-[1px] text-[#f2a516]">
                    ★★★★★
                  </div>
                </div>
              </div>
            ))}
          </div>


          {/* MAPA */}
          <div className="map-shell relative h-[430px] overflow-hidden bg-[#e1edf0] md:h-[500px]">

            {/* BLOCOS */}
            <div className="absolute -left-10 top-10 h-32 w-44 rounded-[40%] bg-[#cadfc9]" />
            <div className="absolute bottom-8 right-10 h-32 w-40 rounded-[38%] bg-[#cadfc9]" />
            <div className="absolute right-[36%] top-[39%] h-20 w-28 rounded-[35%] bg-[#cadfc9]/70" />

            {/* RUAS */}
            <div className="absolute -left-[10%] top-[22%] h-[8px] w-[125%] rotate-[8deg] bg-white" />
            <div className="absolute -left-[10%] top-[62%] h-[10px] w-[125%] -rotate-[7deg] bg-white" />
            <div className="absolute left-[24%] top-[-10%] h-[125%] w-[8px] rotate-[11deg] bg-white" />
            <div className="absolute left-[68%] top-[-10%] h-[125%] w-[8px] -rotate-[8deg] bg-white" />

            {/* PINS SECUNDÁRIOS */}
            <div className="map-pin absolute left-[19%] top-[26%] h-5 w-5 rounded-full border-[3px] border-white bg-[#087fe7] shadow-lg" />
            <div className="map-pin absolute right-[17%] top-[27%] h-5 w-5 rounded-full border-[3px] border-white bg-[#087fe7] shadow-lg" />
            <div className="map-pin absolute bottom-[20%] left-[23%] h-5 w-5 rounded-full border-[3px] border-white bg-[#087fe7] shadow-lg" />
            <div className="map-pin absolute bottom-[25%] right-[18%] h-5 w-5 rounded-full border-[3px] border-white bg-[#087fe7] shadow-lg" />

            {/* EMPRESA */}
            <div className="map-pin absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2">
              <div className="min-w-[175px] bg-[#101820] px-5 py-4 text-white shadow-[0_18px_45px_rgba(0,0,0,.18)]">
                <p className="text-[11px] text-white/50">
                  Você está aqui
                </p>

                <h3 className="mt-1 text-[16px] font-semibold">
                  Sua Empresa
                </h3>

                <div className="mt-2 flex items-center gap-2">
                  <strong className="text-[12px]">
                    5,0
                  </strong>

                  <span className="text-[10px] tracking-[1px] text-[#ffd45b]">
                    ★★★★★
                  </span>
                </div>
              </div>

              <div className="mx-auto h-6 w-[2px] bg-[#101820]" />

              <div className="mx-auto h-7 w-7 rounded-full border-[5px] border-white bg-[#087fe7] shadow-lg" />
            </div>

            <span className="absolute bottom-4 left-4 text-[9px] uppercase tracking-[0.13em] text-[#67757a]">
              representação visual
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
