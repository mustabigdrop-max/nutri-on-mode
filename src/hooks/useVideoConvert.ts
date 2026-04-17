import { useState } from 'react'
import { supabase } from '@/integrations/supabase/client'

export function useVideoConvert() {
  const [isConverting, setIsConverting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const needsConversion = (file: File): boolean => {
    const name = file.name.toLowerCase()
    const type = file.type.toLowerCase()
    return (
      name.endsWith('.mov') ||
      name.endsWith('.avi') ||
      name.endsWith('.mkv') ||
      name.endsWith('.3gp') ||
      name.endsWith('.wmv') ||
      type === 'video/quicktime' ||
      type === 'video/x-msvideo' ||
      type === 'video/x-matroska'
    )
  }

  const convert = async (file: File): Promise<File> => {
    setIsConverting(true)
    setProgress(10)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('video', file)

      setProgress(30)

      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/convert-video`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      )

      setProgress(80)

      if (!response.ok) {
        const err = await response.json().catch(() => ({ error: `Erro HTTP ${response.status}` }))
        throw new Error(err.error || `Erro HTTP ${response.status}`)
      }

      const mp4Blob = await response.blob()
      setProgress(100)

      return new File(
        [mp4Blob],
        file.name.replace(/\.[^.]+$/, '.mp4'),
        { type: 'video/mp4' }
      )
    } catch (err) {
      const msg = (err as Error).message || 'Falha na conversão'
      setError(msg)
      throw new Error(msg)
    } finally {
      setIsConverting(false)
    }
  }

  // Mantém compatibilidade com a API anterior
  const convertWithFallback = async (file: File): Promise<File> => {
    try {
      return await convert(file)
    } catch (err) {
      console.warn('[convert-video] conversão falhou, tentando fallback direto:', err)
      return file
    }
  }

  return { convert, convertWithFallback, needsConversion, isConverting, progress, error, isLoading: false }
}
