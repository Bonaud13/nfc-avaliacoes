"use client";

import type { ReactNode } from "react";
import { X } from "lucide-react";
import { statusLabel } from "./utils";

export function Panel({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`border border-black/10 bg-[#fffdf8] ${className}`}>
      {children}
    </div>
  );
}

export function SectionTitle({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-5 border-b border-black/10 pb-7 md:flex-row md:items-end md:justify-between">
      <div>
        {eyebrow && (
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#0f8a62]">
            {eyebrow}
          </p>
        )}
        <h1 className="mt-2 text-[34px] font-black leading-none tracking-[-0.055em] text-[#111] md:text-[46px]">
          {title}
        </h1>
        {description && (
          <p className="mt-3 max-w-[620px] text-[13px] leading-6 text-black/50">
            {description}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}

export function Button({
  children,
  onClick,
  type = "button",
  variant = "dark",
  disabled = false,
  className = "",
}: {
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  variant?: "dark" | "green" | "light" | "danger";
  disabled?: boolean;
  className?: string;
}) {
  const variants = {
    dark: "bg-[#111] text-white hover:bg-black/80",
    green: "bg-[#0f8a62] text-white hover:bg-[#0b7654]",
    light: "border border-black/10 bg-white text-[#111] hover:bg-black/[0.03]",
    danger: "bg-[#a32929] text-white hover:bg-[#8d2020]",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex h-10 items-center justify-center gap-2 px-4 text-[12px] font-bold transition disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

export function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.14em] text-black/45">
        {label}
      </span>
      {children}
    </label>
  );
}

export const inputClass =
  "h-11 w-full border border-black/10 bg-white px-3 text-[13px] text-[#111] outline-none transition placeholder:text-black/25 focus:border-[#0f8a62]";

export const textareaClass =
  "min-h-[96px] w-full resize-y border border-black/10 bg-white px-3 py-3 text-[13px] text-[#111] outline-none transition placeholder:text-black/25 focus:border-[#0f8a62]";

export function Modal({
  open,
  title,
  description,
  onClose,
  children,
  wide = false,
}: {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children: ReactNode;
  wide?: boolean;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/35 p-0 backdrop-blur-[2px] md:items-center md:p-6">
      <div
        className={`max-h-[92vh] w-full overflow-y-auto bg-[#f7f4ec] shadow-2xl ${
          wide ? "max-w-[900px]" : "max-w-[620px]"
        }`}
      >
        <div className="sticky top-0 z-10 flex items-start justify-between border-b border-black/10 bg-[#f7f4ec]/95 px-5 py-5 backdrop-blur md:px-7">
          <div>
            <h2 className="text-[24px] font-black tracking-[-0.045em]">{title}</h2>
            {description && (
              <p className="mt-1 text-[12px] text-black/45">{description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center border border-black/10 bg-white transition hover:bg-black/[0.03]"
            aria-label="Fechar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-5 md:p-7">{children}</div>
      </div>
    </div>
  );
}

export function EmptyState({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <div className="border border-dashed border-black/15 px-6 py-14 text-center">
      <p className="text-[15px] font-bold">{title}</p>
      <p className="mx-auto mt-2 max-w-[420px] text-[12px] leading-5 text-black/45">
        {text}
      </p>
    </div>
  );
}

export function StatusPill({ value }: { value: string }) {
  const good = ["pago", "instalada", "vendida"].includes(value);
  const warn = ["pendente", "parcial", "reservada", "manutencao"].includes(value);
  const bad = ["atrasado", "cancelado", "inativa"].includes(value);

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.08em] ${
        good
          ? "bg-[#dff4eb] text-[#0f6f51]"
          : warn
            ? "bg-[#f5ead1] text-[#8a5a11]"
            : bad
              ? "bg-[#f6dddd] text-[#922d2d]"
              : "bg-black/[0.05] text-black/55"
      }`}
    >
      {statusLabel[value] || value}
    </span>
  );
}
