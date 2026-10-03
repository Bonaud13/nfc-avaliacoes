"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function ProductStory() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".product-word", {
        y: 80,
        opacity: 0,
        duration: 1,
        stagger: 0.12,
        ease: "power4.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 72%",
        },
      });

      gsap.from(".product-detail", {
        y: 35,
        opacity: 0,
        duration: 0.8,
        stagger: 0.12,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".product-details",
          start: "top 80%",
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="produto"
      className="bg-[#f7f6f2] px-6 py-24 md:px-10 md:py-36"
    >
      <div className="mx-auto max-w-[1180px]">
        <div className="max-w-[1000px]">
          <div className="overflow-hidden">
            <p className="product-word text-[13px] uppercase tracking-[0.18em] text-[#7a7d7e]">
              Uma aproximação
            </p>
          </div>

          <div className="mt-7 overflow-hidden">
            <h2 className="product-word text-[52px] font-semibold leading-[0.98] tracking-[-0.055em] text-[#101820] md:text-[78px]">
              Menos passos.
            </h2>
          </div>

          <div className="overflow-hidden">
            <div className="product-word text-[52px] font-semibold leading-[0.98] tracking-[-0.055em] text-[#101820] md:text-[78px]">
              Mais avaliações.
            </div>
          </div>
        </div>

        <div className="product-details mt-20 grid border-t border-black/10 md:grid-cols-3">
          <div className="product-detail border-b border-black/10 py-8 md:border-b-0 md:border-r md:pr-10">
            <span className="text-[12px] text-[#90908c]">
              01
            </span>

            <h3 className="mt-10 text-[26px] font-semibold tracking-[-0.04em] text-[#101820]">
              Aproxime
            </h3>

            <p className="mt-3 max-w-[250px] text-[14px] leading-6 text-[#6c706f]">
              O cliente aproxima o celular da placa NFC.
            </p>
          </div>

          <div className="product-detail border-b border-black/10 py-8 md:border-b-0 md:border-r md:px-10">
            <span className="text-[12px] text-[#90908c]">
              02
            </span>

            <h3 className="mt-10 text-[26px] font-semibold tracking-[-0.04em] text-[#101820]">
              Abra
            </h3>

            <p className="mt-3 max-w-[250px] text-[14px] leading-6 text-[#6c706f]">
              O acesso é aberto diretamente no celular.
            </p>
          </div>

          <div className="product-detail py-8 md:pl-10">
            <span className="text-[12px] text-[#90908c]">
              03
            </span>

            <h3 className="mt-10 text-[26px] font-semibold tracking-[-0.04em] text-[#101820]">
              Avalie
            </h3>

            <p className="mt-3 max-w-[250px] text-[14px] leading-6 text-[#6c706f]">
              A página da empresa fica pronta para receber a avaliação.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
