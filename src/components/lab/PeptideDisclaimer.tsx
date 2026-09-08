import { PEPTIDE_DISCLAIMER } from "@/data/peptideVaultData";

export function PeptideDisclaimer({ className = "" }: { className?: string }) {
  return (
    <p
      className={`text-[10px] leading-relaxed text-gray-500 border-t border-gray-800 pt-2 mt-2 ${className}`}
      data-testid="peptide-disclaimer"
    >
      {PEPTIDE_DISCLAIMER}
    </p>
  );
}
