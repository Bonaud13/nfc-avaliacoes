"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function AboutCTA() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".cta-line", {
        y: 70,
        opacity: 0,
        duration: 1,
        stagger: 0.12,
        ease: "power4.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 72%",
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="contato"
      className="bg-[#087fe7] px-6 py-28 text-white md:px-10 md:py-40"
    >
      <div className="mx-auto max-w-[1180px]">
        <div className="overflow-hidden">
          <p className="cta-line text-[12px] uppercase tracking-[0.18em] text-white/55">
            PPRT.IA
          </p>
        </div>

        <div className="mt-8 overflow-hidden">
          <h2 className="cta-line max-w-[1000px] text-[54px] font-semibold leading-[0.95] tracking-[-0.06em] md:text-[86px]">
            Uma boa experiência
          </h2>
        </div>

        <div className="overflow-hidden">
          <div className="cta-line text-[54px] font-semibold leading-[0.95] tracking-[-0.06em] text-white/55 md:text-[86px]">
            merece ser lembrada.
          </div>
        </div>

        <div className="cta-line mt-16 flex flex-col gap-8 border-t border-white/25 pt-8 md:flex-row md:items-center md:justify-between">
          <p className="max-w-[420px] text-[15px] leading-6 text-white/65">
            Encurte o caminho entre o atendimento e a avaliação.
          </p>

          <a
            href="#inicio"
            className="group inline-flex items-center gap-5 text-[15px] font-semibold"
          >
            Quero conhecer

            <span className="text-[24px] transition-transform duration-300 group-hover:translate-x-2">
              →
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}
