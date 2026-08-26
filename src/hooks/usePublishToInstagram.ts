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
    publishing,
    stage,
    converting: ff.isConverting,
    convertProgress: ff.progress,
    convertError: ff.error,
  };
}

export default usePublishToInstagram;
