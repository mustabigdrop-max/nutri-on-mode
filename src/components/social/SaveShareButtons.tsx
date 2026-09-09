import { useState } from "react";
import { Download, Loader2, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { canShareFiles, saveManyToDevice, shareAll } from "@/lib/socialImageKit";

type Item = { url: string; filename: string };

/**
 * Botões padrão de saída das imagens geradas:
 * — Salvar no álbum (baixa os arquivos, um a um)
 * — Compartilhar tudo (abre a folha do celular com todas as imagens em sequência)
 */
export default function SaveShareButtons({
  items,
  texto,
  labelSalvar,
  className,
}: {
  items: Item[];
  texto?: string;
  labelSalvar?: string;
  className?: string;
}) {
  const [busy, setBusy] = useState<"save" | "share" | null>(null);
  const podeCompartilhar = canShareFiles();
  const n = items.length;

  const salvar = async () => {
    setBusy("save");
    try {
      const ok = await saveManyToDevice(items);
      if (ok > 0) toast.success(`${ok} imagem${ok > 1 ? "ns" : ""} salva${ok > 1 ? "s" : ""} no seu aparelho.`);
      else toast.error("Não consegui salvar as imagens agora.");
    } finally {
      setBusy(null);
    }
  };

  const compartilhar = async () => {
    setBusy("share");
    try {
      const r = await shareAll(items, texto);
      if (!r.shared && r.count > 0) toast.success("Compartilhamento indisponível aqui — as imagens foram salvas.");
    } catch {
      toast.error("Não consegui abrir o compartilhamento.");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className={`flex flex-wrap justify-center gap-2 ${className || ""}`}>
      <Button variant="outline" className="gap-2" disabled={busy !== null} onClick={salvar}>
        {busy === "save" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
        {labelSalvar || `Salvar ${n} no álbum`}
      </Button>
      {podeCompartilhar && (
        <Button variant="outline" className="gap-2" disabled={busy !== null} onClick={compartilhar}>
          {busy === "share" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Share2 className="h-4 w-4" />}
          Compartilhar todas
        </Button>
      )}
    </div>
  );
}
