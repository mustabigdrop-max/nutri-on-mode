import { ImagePlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { compressImageFile } from "@/lib/socialMediaFrames";
import { toast } from "sonner";

export default function ContentPhotoPicker({
  value,
  onChange,
  description = "A foto entra no conteúdo gerado.",
  disabled = false,
}: {
  value: string | null;
  onChange: (value: string | null) => void;
  description?: string;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-3 rounded-lg border border-border/60 bg-muted/20 p-3">
      <p className="text-xs font-bold uppercase tracking-wide text-primary">Foto (opcional)</p>
      {value && (
        <img
          src={value}
          alt="Prévia da foto escolhida"
          className="max-h-52 w-full rounded-md border border-border/60 object-cover"
        />
      )}
      <div className="flex flex-wrap gap-2">
        <Button asChild type="button" size="sm" variant="outline" className="gap-2" disabled={disabled}>
          <label className="cursor-pointer">
            <ImagePlus className="h-4 w-4" />
            {value ? "Trocar foto" : "Adicionar foto"}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              disabled={disabled}
              onChange={async (event) => {
                const file = event.target.files?.[0];
                event.target.value = "";
                if (!file) return;
                const photo = await compressImageFile(file, 1600);
                if (!photo) return toast.error("Não consegui ler essa foto.");
                onChange(photo);
              }}
            />
          </label>
        </Button>
        {value && (
          <Button type="button" size="sm" variant="ghost" className="gap-2" onClick={() => onChange(null)} disabled={disabled}>
            <X className="h-4 w-4" /> Remover
          </Button>
        )}
      </div>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  );
}