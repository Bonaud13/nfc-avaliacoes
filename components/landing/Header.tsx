"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function Header() {
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    gsap.fromTo(
      headerRef.current,
      { y: -70, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.9,
        ease: "power3.out",
      }
    );
  }, []);

  return (
    <header
      ref={headerRef}
      className="fixed inset-x-0 top-0 z-50 border-b border-black/[0.06] bg-white/90 backdrop-blur-md"
    >
      <div className="mx-auto flex h-[68px] max-w-[1380px] items-center justify-between px-6 md:px-10">
        <a
          href="#inicio"
          className="text-[21px] font-bold tracking-[-0.055em] text-[#101820]"
        >
          PPRT<span className="text-[#087fe7]">.IA</span>
        </a>

        <nav className="hidden items-center gap-9 md:flex">
          <a
            href="#produto"
            className="text-[13px] text-[#4f575e] transition hover:text-black"
          >
            Produto
          </a>

          <a
            href="#google"
            className="text-[13px] text-[#4f575e] transition hover:text-black"
          >
            Como funciona
          </a>

          <a
            href="#metricas"
            className="text-[13px] text-[#4f575e] transition hover:text-black"
          >
            Métricas
          </a>

          <a
            href="#onde-usar"
            className="text-[13px] text-[#4f575e] transition hover:text-black"
          >
            Onde usar
          </a>
        </nav>

        <a
          href="#contato"
          className="group flex items-center gap-2 text-[13px] font-semibold text-[#101820]"
        >
          Conhecer

          <span className="transition-transform duration-300 group-hover:translate-x-1">
            →
          </span>
        </a>
      </div>
    </header>
  );
}
