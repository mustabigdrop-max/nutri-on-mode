import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { uploadSocialMedia, type UploadableMedia } from "@/lib/socialMediaUpload";
import { useFFmpegConvert } from "@/hooks/useFFmpegConvert";

export type PublishMediaKind = "IMAGE" | "REELS" | "STORIES";

export type PublishResult = { ig_media_id?: string; permalink: string | null };

/**
 * Publica uma foto ou vídeo direto no Instagram do coach: converte o vídeo
 * pra um formato aceito (se preciso), sobe a mídia pro Storage (URL assinada
 * temporária) e chama a função `instagram-publish`. É o atalho "peguei a
 * mídia → postei", sem o usuário precisar hospedar nada manualmente.
 */
export function usePublishToInstagram() {
  const ff = useFFmpegConvert();
  const [publishing, setPublishing] = useState(false);
  const [stage, setStage] = useState("");

  const publish = async (opts: {
    coachId: string;
    file: UploadableMedia;
    mediaKind: PublishMediaKind;
    caption: string;
    calendarId?: string | null;
    /** Força a conversão pra MP4/H.264 mesmo sem detectar extensão problemática
     *  (necessário pra vídeo gravado via MediaRecorder no navegador, ex: webm). */
    forceConvert?: boolean;
    /** Comentário pra postar sozinho logo após publicar (puxa DM/engajamento). */
    selfComment?: string | null;
    /** Também posta a mesma mídia nos Stories logo em seguida (mais alcance, sem esforço extra). */
    alsoStory?: boolean;
  }): Promise<PublishResult> => {
    setPublishing(true);
    try {
      const isVideo = opts.mediaKind !== "IMAGE";
      let toUpload: UploadableMedia = opts.file;

      if (isVideo) {
        const asFile = opts.file instanceof File
          ? opts.file
          : new File([opts.file], `socialon-${Date.now()}.webm`, { type: opts.file.type || "video/webm" });
        if (opts.forceConvert || ff.needsConversion(asFile)) {
          setStage("Convertendo vídeo para um formato aceito pelo Instagram...");
          toUpload = await ff.convertWithFallback(asFile);
        } else {
          toUpload = asFile;
        }
      }

      setStage("Enviando mídia...");
      const mediaUrl = await uploadSocialMedia(toUpload, { coachId: opts.coachId, kind: isVideo ? "video" : "image" });

      setStage("Publicando no Instagram...");
      const { data, error } = await supabase.functions.invoke("instagram-publish", {
        body: {
          action: "publish",
          media_type: opts.mediaKind,
          media_url: mediaUrl,
          caption: opts.caption,
          calendar_id: opts.calendarId ?? null,
          self_comment: opts.selfComment ?? null,
        },
      });
      if (error) throw new Error(error.message);
      if ((data as { error?: string })?.error) throw new Error((data as { error?: string }).error);
      const result = (data as { result: PublishResult }).result;

      if (opts.alsoStory && opts.mediaKind !== "STORIES") {
        setStage("Postando também nos Stories...");
        try {
          await supabase.functions.invoke("instagram-publish", {
            body: { action: "publish", media_type: "STORIES", media_url: mediaUrl },
          });
        } catch {
          // best-effort: o post principal já saiu, o repost pro Stories é bônus
        }
      }

      return result;
    } finally {
      setPublishing(false);
      setStage("");
    }
  };

  /** Mesmo pipeline (converte + sobe), mas agenda pra publicar sozinho no horário escolhido. */
  const schedule = async (opts: {
    coachId: string;
    file: UploadableMedia;
    mediaKind: PublishMediaKind;
    caption: string;
    scheduledAt: string | Date;
    calendarId?: string | null;
    forceConvert?: boolean;
    /** Comentário pra postar sozinho logo após publicar (puxa DM/engajamento). */
    selfComment?: string | null;
    /** Também agenda a mesma mídia pros Stories, no mesmo horário (mais alcance, sem esforço extra). */
    alsoStory?: boolean;
  }): Promise<{ post: { id: string } }> => {
    setPublishing(true);
    try {
      const isVideo = opts.mediaKind !== "IMAGE";
      let toUpload: UploadableMedia = opts.file;

      if (isVideo) {
        const asFile = opts.file instanceof File
          ? opts.file
          : new File([opts.file], `socialon-${Date.now()}.webm`, { type: opts.file.type || "video/webm" });
        if (opts.forceConvert || ff.needsConversion(asFile)) {
          setStage("Convertendo vídeo para um formato aceito pelo Instagram...");
          toUpload = await ff.convertWithFallback(asFile);
        } else {
          toUpload = asFile;
        }
      }

      setStage("Enviando mídia...");
      const scheduledAtIso = opts.scheduledAt instanceof Date ? opts.scheduledAt.toISOString() : opts.scheduledAt;
      const mediaUrl = await uploadSocialMedia(toUpload, {
        coachId: opts.coachId,
        kind: isVideo ? "video" : "image",
        validUntil: scheduledAtIso,
      });

      setStage("Agendando...");
      const { data, error } = await supabase.functions.invoke("instagram-publish", {
        body: {
          action: "schedule",
          kind: opts.mediaKind === "STORIES" ? "stories" : "reel",
          media_type: opts.mediaKind,
          media_url: mediaUrl,
          caption: opts.caption,
          calendar_id: opts.calendarId ?? null,
          scheduled_at: scheduledAtIso,
          self_comment: opts.selfComment ?? null,
        },
      });
      if (error) throw new Error(error.message);
      if ((data as { error?: string })?.error) throw new Error((data as { error?: string }).error);
      const result = (data as { result: { post: { id: string } } }).result;

      if (opts.alsoStory && opts.mediaKind !== "STORIES") {
        try {
          await supabase.functions.invoke("instagram-publish", {
            body: { action: "schedule", kind: "stories", media_type: "STORIES", media_url: mediaUrl, scheduled_at: scheduledAtIso },
          });
        } catch {
          // best-effort: o agendamento principal já foi feito, o repost pro Stories é bônus
        }
      }

      return result;
    } finally {
      setPublishing(false);
      setStage("");
    }
  };

  /** Publica um carrossel (2 a 10 imagens) direto no Instagram — sobe cada imagem e cria os containers. */
  const publishCarousel = async (opts: {
    coachId: string;
    images: UploadableMedia[];
    caption: string;
    calendarId?: string | null;
    selfComment?: string | null;
  }): Promise<PublishResult> => {
    if (opts.images.length < 2) throw new Error("Carrossel precisa de pelo menos 2 imagens.");
    setPublishing(true);
    try {
      setStage("Enviando imagens...");
      const mediaUrls: string[] = [];
      for (const img of opts.images) {
        mediaUrls.push(await uploadSocialMedia(img, { coachId: opts.coachId, kind: "image" }));
      }

      setStage("Publicando carrossel no Instagram...");
      const { data, error } = await supabase.functions.invoke("instagram-publish", {
        body: {
          action: "publish",
          media_type: "CAROUSEL",
          media_urls: mediaUrls,
          caption: opts.caption,
          calendar_id: opts.calendarId ?? null,
          self_comment: opts.selfComment ?? null,
        },
      });
      if (error) throw new Error(error.message);
      if ((data as { error?: string })?.error) throw new Error((data as { error?: string }).error);
      return (data as { result: PublishResult }).result;
    } finally {
      setPublishing(false);
      setStage("");
    }
  };

  return {
    publish,
    schedule,
    publishCarousel,
    publishing,
    stage,
    converting: ff.isConverting,
    convertProgress: ff.progress,
    convertError: ff.error,
  };
}

export default usePublishToInstagram;
