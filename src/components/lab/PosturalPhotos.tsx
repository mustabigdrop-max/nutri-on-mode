import { useState, useCallback, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Camera, Trash2, Plus, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface PosturalPhoto {
  id: string;
  photo_url: string;
  photo_date: string;
  category: string;
  notes: string | null;
  created_at: string;
  signedUrl?: string;
}

const CATEGORIES = [
  { value: "frontal", label: "Frontal" },
  { value: "lateral", label: "Lateral" },
  { value: "posterior", label: "Posterior" },
  { value: "geral", label: "Geral" },
];

const PosturalPhotos = () => {
  const { user } = useAuth();
  const [photos, setPhotos] = useState<PosturalPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [category, setCategory] = useState("frontal");
  const [notes, setNotes] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [compareIdx, setCompareIdx] = useState<number | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchPhotos = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from("postural_photos")
      .select("*")
      .eq("user_id", user.id)
      .order("photo_date", { ascending: false });

    if (data) {
      const withUrls = await Promise.all(
        data.map(async (p: any) => {
          const { data: signed } = await supabase.storage
            .from("postural-photos")
            .createSignedUrl(p.photo_url, 3600);
          return { ...p, signedUrl: signed?.signedUrl || "" } as PosturalPhoto;
        })
      );
      setPhotos(withUrls);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchPhotos(); }, [fetchPhotos]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleUpload = async () => {
    if (!user || !selectedFile) return;
    setUploading(true);
    try {
      const ext = selectedFile.name.split(".").pop() || "jpg";
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("postural-photos")
        .upload(path, selectedFile, { contentType: selectedFile.type });
      if (upErr) throw upErr;

      const { error: insErr } = await supabase.from("postural_photos").insert({
        user_id: user.id,
        photo_url: path,
        category,
        notes: notes || null,
      });
      if (insErr) throw insErr;

      toast.success("Foto postural salva!");
      setShowForm(false);
      setSelectedFile(null);
      setPreview(null);
      setNotes("");
      await fetchPhotos();
    } catch (e: any) {
      toast.error("Erro ao salvar: " + e.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (photo: PosturalPhoto) => {
    if (!user) return;
    await supabase.storage.from("postural-photos").remove([photo.photo_url]);
    await supabase.from("postural_photos").delete().eq("id", photo.id);
    setPhotos((prev) => prev.filter((p) => p.id !== photo.id));
    if (compareIdx !== null) setCompareIdx(null);
    toast.success("Foto removida");
  };

  const grouped: Record<string, PosturalPhoto[]> = {};
  for (const p of photos) {
    if (!grouped[p.category]) grouped[p.category] = [];
    grouped[p.category].push(p);
  }

  return (
    <div className="space-y-3 mt-4">
      <div className="flex items-center justify-between">
        <p className="text-foreground font-semibold text-sm flex items-center gap-1.5">
          <Camera className="w-4 h-4 text-primary" />
          Registro Fotográfico Postural
        </p>
        <Button
          size="sm"
          variant="outline"
          className="h-7 text-[10px] gap-1 border-primary/30 text-primary hover:bg-primary/10"
          onClick={() => setShowForm(!showForm)}
        >
          <Plus className="w-3 h-3" /> Nova Foto
        </Button>
      </div>

      {/* Upload form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card className="p-3 space-y-3 border-primary/20 bg-primary/5">
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleFileChange}
              />
              {preview ? (
                <div className="relative">
                  <img src={preview} alt="Preview" className="w-full max-h-48 object-contain rounded-lg" />
                  <Button
                    size="sm"
                    variant="ghost"
                    className="absolute top-1 right-1 h-6 w-6 p-0"
                    onClick={() => { setPreview(null); setSelectedFile(null); }}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  className="w-full h-20 border-dashed border-primary/30 text-muted-foreground text-xs gap-2"
                  onClick={() => fileRef.current?.click()}
                >
                  <Camera className="w-5 h-5" />
                  Tirar foto ou escolher da galeria
                </Button>
              )}

              <div className="flex gap-1.5 flex-wrap">
                {CATEGORIES.map((c) => (
                  <Badge
                    key={c.value}
                    variant={category === c.value ? "default" : "outline"}
                    className={`cursor-pointer text-[10px] ${
                      category === c.value
                        ? "bg-primary text-primary-foreground"
                        : "border-border text-muted-foreground hover:border-primary/40"
                    }`}
                    onClick={() => setCategory(c.value)}
                  >
                    {c.label}
                  </Badge>
                ))}
              </div>

              <Textarea
                placeholder="Observações (ex: após 4 semanas de protocolo UCS)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="text-xs min-h-[60px] bg-background"
              />

              <Button
                size="sm"
                className="w-full text-xs"
                disabled={!selectedFile || uploading}
                onClick={handleUpload}
              >
                {uploading ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : null}
                {uploading ? "Salvando..." : "Salvar Foto"}
              </Button>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-6">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Empty state */}
      {!loading && photos.length === 0 && (
        <Card className="p-4 text-center border-dashed border-border">
          <Camera className="w-8 h-8 mx-auto text-muted-foreground/40 mb-2" />
          <p className="text-xs text-muted-foreground">
            Nenhuma foto postural registrada.
            <br />
            Tire fotos frontal, lateral e posterior para acompanhar sua correção.
          </p>
        </Card>
      )}

      {/* Compare mode */}
      {compareIdx !== null && photos.length >= 2 && (
        <Card className="p-3 border-primary/20 bg-primary/5">
          <p className="text-[10px] text-muted-foreground uppercase font-bold mb-2">Comparação</p>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <img
                src={photos[photos.length - 1].signedUrl}
                alt="Primeira"
                className="w-full aspect-[3/4] object-cover rounded-lg"
              />
              <p className="text-[9px] text-center text-muted-foreground mt-1">
                {photos[photos.length - 1].photo_date}
              </p>
            </div>
            <div>
              <img
                src={photos[0].signedUrl}
                alt="Mais recente"
                className="w-full aspect-[3/4] object-cover rounded-lg"
              />
              <p className="text-[9px] text-center text-muted-foreground mt-1">
                {photos[0].photo_date}
              </p>
            </div>
          </div>
          <Button
            size="sm"
            variant="ghost"
            className="w-full mt-2 h-6 text-[10px] text-muted-foreground"
            onClick={() => setCompareIdx(null)}
          >
            Fechar comparação
          </Button>
        </Card>
      )}

      {/* Photo gallery by category */}
      {!loading && photos.length > 0 && (
        <div className="space-y-3">
          {photos.length >= 2 && compareIdx === null && (
            <Button
              size="sm"
              variant="outline"
              className="w-full h-7 text-[10px] gap-1 border-primary/30 text-primary"
              onClick={() => setCompareIdx(0)}
            >
              <ChevronLeft className="w-3 h-3" />
              Comparar primeira × última
              <ChevronRight className="w-3 h-3" />
            </Button>
          )}

          {Object.entries(grouped).map(([cat, catPhotos]) => (
            <div key={cat}>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
                {CATEGORIES.find((c) => c.value === cat)?.label || cat}
              </p>
              <div className="grid grid-cols-3 gap-1.5">
                {catPhotos.map((photo, i) => (
                  <motion.div
                    key={photo.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="relative group"
                  >
                    <div className="aspect-[3/4] rounded-lg overflow-hidden border border-border">
                      <img
                        src={photo.signedUrl}
                        alt={photo.category}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background/90 to-transparent p-1.5">
                        <p className="text-[8px] font-mono text-foreground">{photo.photo_date}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(photo)}
                      className="absolute top-1 right-1 w-5 h-5 rounded-full bg-destructive/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-2.5 h-2.5 text-destructive-foreground" />
                    </button>
                    {photo.notes && (
                      <p className="text-[8px] text-muted-foreground mt-0.5 line-clamp-1">{photo.notes}</p>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PosturalPhotos;
