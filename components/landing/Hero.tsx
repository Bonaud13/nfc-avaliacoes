"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const timeline = gsap.timeline({
        defaults: {
          ease: "power3.out",
        },
      });

      timeline
        .from(".hero-line", {
          y: 55,
          opacity: 0,
          duration: 1,
          stagger: 0.12,
        })
        .from(
          ".hero-copy",
          {
            y: 25,
            opacity: 0,
            duration: 0.8,
          },
          "-=.55"
        )
        .from(
          ".hero-action",
          {
            y: 20,
            opacity: 0,
            duration: 0.7,
          },
          "-=.5"
        );

      gsap.fromTo(
        imageRef.current,
        {
          y: 0,
          scale: 1,
        },
        {
          y: 38,
          scale: 1.025,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top top",
            end: "bottom top",
            scrub: 1,
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="inicio"
      className="relative min-h-[760px] overflow-hidden bg-[#f3f1ec] pt-[68px] md:min-h-[820px]"
    >
      {/* FOTO */}
      <div
        ref={imageRef}
        className="absolute inset-x-0 bottom-[-45px] top-[68px]"
      >
        <Image
          src="/images/pprt-review-hero.png"
          alt="Placa NFC para avaliação no Google ao lado de um celular"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
      </div>

      {/* 
        ÚNICA INTERFERÊNCIA NA FOTO.
        LIMITADA A 30% DA ESQUERDA.
      */}
      <div
        className="pointer-events-none absolute bottom-0 left-0 top-[68px] z-10 hidden w-[30%] md:block"
        style={{
          background:
            "linear-gradient(90deg, rgba(250,249,246,.94) 0%, rgba(250,249,246,.82) 32%, rgba(250,249,246,.48) 58%, rgba(250,249,246,.13) 82%, rgba(250,249,246,0) 100%)",
          backdropFilter: "blur(1.5px)",
          WebkitBackdropFilter: "blur(1.5px)",
          maskImage:
            "linear-gradient(90deg, black 0%, black 30%, rgba(0,0,0,.55) 65%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(90deg, black 0%, black 30%, rgba(0,0,0,.55) 65%, transparent 100%)",
        }}
      />

      {/* MOBILE */}
      <div className="pointer-events-none absolute inset-x-0 top-[68px] z-10 h-[50%] bg-gradient-to-b from-[#faf9f6] via-[#faf9f6]/75 to-transparent md:hidden" />

      <div className="relative z-20 mx-auto flex min-h-[692px] max-w-[1380px] items-center px-6 md:min-h-[752px] md:px-10">
        <div
          ref={contentRef}
          className="mb-[340px] max-w-[500px] md:mb-0 md:max-w-[410px]"
        >
          <div className="overflow-hidden">
            <h1 className="hero-line text-[52px] font-bold leading-[0.93] tracking-[-0.065em] text-[#111820] sm:text-[62px] md:text-[68px]">
              Aproxime.
            </h1>
          </div>

          <div className="overflow-hidden">
            <div className="hero-line text-[52px] font-bold leading-[0.93] tracking-[-0.065em] text-[#087fe7] sm:text-[62px] md:text-[68px]">
              Facilite
            </div>
          </div>

          <div className="overflow-hidden">
            <div className="hero-line text-[52px] font-bold leading-[0.93] tracking-[-0.065em] text-[#087fe7] sm:text-[62px] md:text-[68px]">
              a avaliação.
            </div>
          </div>

          <p className="hero-copy mt-7 max-w-[370px] text-[16px] leading-7 text-[#505960]">
            Uma aproximação leva seu cliente direto à avaliação da sua empresa no Google.
          </p>

          <a
            href="#produto"
            className="hero-action group mt-8 inline-flex items-center gap-4 border-b border-[#101820] pb-2 text-[14px] font-semibold text-[#101820]"
          >
            Descubra como funciona

            <span className="transition-transform duration-300 group-hover:translate-x-1">
              →
            </span>
          </a>
        </div>
      </div>

      {/* INDICAÇÃO DE SCROLL */}
      <div className="absolute bottom-8 left-1/2 z-20 hidden -translate-x-1/2 items-center gap-3 text-[10px] uppercase tracking-[0.16em] text-white/70 md:flex">
        <span className="h-[1px] w-10 bg-white/50" />
        role para explorar
      </div>
    </section>
  );
}
