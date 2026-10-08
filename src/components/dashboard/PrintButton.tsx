"use client";

/** Opens the browser print dialog (save-as-PDF / print the report card). */
export default function PrintButton({ className = "" }: { className?: string }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className={`rounded-full border border-ivory-100/20 px-5 py-2 text-sm font-semibold text-ivory-100 transition hover:border-gold-500 hover:text-gold-500 ${className}`}
    >
      Print / save PDF
    </button>
  );
}
