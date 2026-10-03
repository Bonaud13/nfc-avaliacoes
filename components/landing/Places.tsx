"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const places = [
  ["Restaurantes", "Mesa, balcão ou caixa"],
  ["Clínicas", "Recepção e saída"],
  ["Barbearias", "Balcão de atendimento"],
  ["Academias", "Recepção e catraca"],
  ["Lojas", "Caixa e balcão"],
  ["Escritórios", "Recepção e atendimento"],
];

export default function Places() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".place-title", {
        y: 50,
        opacity: 0,
        duration: 0.9,
        ease: "power3.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 75%",
        },
      });

      gsap.from(".use-row", {
        y: 45,
        opacity: 0,
        duration: 0.7,
        stagger: 0.09,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".use-list",
          start: "top 80%",
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="onde-usar"
      className="bg-[#f3f1ec] px-6 py-24 md:px-10 md:py-36"
    >
      <div className="mx-auto max-w-[1180px]">

        <div className="place-title grid gap-8 border-b border-black/10 pb-12 lg:grid-cols-2">
          <h2 className="text-[50px] font-semibold leading-[0.98] tracking-[-0.055em] text-[#101820] md:text-[70px]">
            Onde existe
            <br />
            atendimento,
            <br />
            existe espaço.
          </h2>

          <div className="flex items-end">
            <p className="max-w-[360px] text-[16px] leading-7 text-[#6c706f]">
              A placa fica perto do cliente no momento em que a experiência ainda está fresca.
            </p>
          </div>
        </div>


        <div className="use-list mt-10">
          {places.map(([name, description], index) => (
            <a
              key={name}
              href="#contato"
              className="use-row group grid items-center border-b border-black/10 py-7 md:grid-cols-[70px_1fr_1fr_40px]"
            >
              <span className="hidden text-[11px] text-[#a0a19e] md:block">
                0{index + 1}
              </span>

              <h3 className="text-[29px] font-semibold tracking-[-0.045em] text-[#101820] transition-transform duration-300 group-hover:translate-x-2 md:text-[38px]">
                {name}
              </h3>

              <p className="mt-2 text-[13px] text-[#8a8c89] md:mt-0">
                {description}
              </p>

              <span className="mt-3 text-[23px] transition-transform duration-300 group-hover:translate-x-2 md:mt-0">
                →
              </span>
            </a>
          ))}
        </div>

      </div>
    </section>
  );
}
