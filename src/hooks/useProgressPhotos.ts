import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface ProgressPhoto {
  id: string;
  photo_url: string;
  photo_date: string;
  weight_kg: number | null;
  body_fat_pct: number | null;
  streak_days: number;
  kcal_target: number | null;
  notes: string | null;
  tags: string[];
  created_at: string;
  signedUrl?: string;
}

export const useProgressPhotos = () => {
  const { user } = useAuth();
  const [photos, setPhotos] = useState<ProgressPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const fetchPhotos = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from("progress_photos")
      .select("*")
      .eq("user_id", user.id)
      .order("photo_date", { ascending: false });

    if (data) {
      // Get signed URLs for private bucket
      const withUrls = await Promise.all(
        data.map(async (p) => {
          const { data: signed } = await supabase.storage
            .from("progress-photos")
            .createSignedUrl(p.photo_url, 3600);
          return { ...p, signedUrl: signed?.signedUrl || "" } as ProgressPhoto;
        })
      );
      setPhotos(withUrls);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchPhotos(); }, [fetchPhotos]);

  const uploadPhoto = useCallback(async (
    file: File,
    meta: { weight_kg?: number; body_fat_pct?: number; notes?: string; streak_days?: number; kcal_target?: number }
  ) => {
    if (!user) return;
    setUploading(true);
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { error: uploadErr } = await supabase.storage
        .from("progress-photos")
        .upload(path, file, { contentType: file.type });
      if (uploadErr) throw uploadErr;

      const { error: insertErr } = await supabase.from("progress_photos").insert({
        user_id: user.id,
        photo_url: path,
        weight_kg: meta.weight_kg || null,
        body_fat_pct: meta.body_fat_pct || null,
        notes: meta.notes || null,
        streak_days: meta.streak_days || 0,
        kcal_target: meta.kcal_target || null,
        tags: ["manual"],
      });
      if (insertErr) throw insertErr;
      await fetchPhotos();
    } catch (e) {
      console.error("Upload error:", e);
      throw e;
    } finally {
      setUploading(false);
    }
  }, [user, fetchPhotos]);

  const deletePhoto = useCallback(async (photo: ProgressPhoto) => {
    if (!user) return;
    await supabase.storage.from("progress-photos").remove([photo.photo_url]);
    await supabase.from("progress_photos").delete().eq("id", photo.id);
    setPhotos(prev => prev.filter(p => p.id !== photo.id));
  }, [user]);

  return { photos, loading, uploading, uploadPhoto, deletePhoto, refetch: fetchPhotos };
};
