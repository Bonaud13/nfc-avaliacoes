export default function Footer() {
  return (
    <footer className="border-t border-black/[0.06] bg-[#f3f1ec]">
      <div className="mx-auto flex max-w-[1180px] flex-col gap-6 px-6 py-10 text-[11px] text-[#8b8d8b] md:flex-row md:items-center md:justify-between md:px-10">
        <div className="text-[18px] font-bold tracking-[-0.05em] text-[#101820]">
          PPRT<span className="text-[#087fe7]">.IA</span>
        </div>

        <p>
          Tecnologia aplicada a problemas reais.
        </p>

        <p>
          Rio de Janeiro, Brasil
        </p>
      </div>
    </footer>
  );
}
