import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

function getExt(filename: string): string {
  const m = filename.match(/\.[^.]+$/)
  return m ? m[0] : '.mov'
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const formData = await req.formData()
    const file = formData.get('video') as File | null

    if (!file) {
      return new Response(
        JSON.stringify({ error: 'Nenhum arquivo enviado' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const fileBytes = await file.arrayBuffer()
    const ts = Date.now()
    const inputPath = `/tmp/input_${ts}${getExt(file.name)}`
    const outputPath = `/tmp/output_${ts}.mp4`

    await Deno.writeFile(inputPath, new Uint8Array(fileBytes))

    const cmd = new Deno.Command('ffmpeg', {
      args: [
        '-i', inputPath,
        '-c:v', 'libx264',
        '-profile:v', 'baseline',
        '-level', '3.0',
        '-preset', 'ultrafast',
        '-crf', '28',
        '-c:a', 'aac',
        '-b:a', '128k',
        '-ac', '2',
        '-movflags', '+faststart',
        '-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2',
        '-y',
        outputPath,
      ],
      stdout: 'piped',
      stderr: 'piped',
    })

    const { code, stderr } = await cmd.output()

    if (code !== 0) {
      const errorMsg = new TextDecoder().decode(stderr)
      console.error('FFmpeg error:', errorMsg)
      await Deno.remove(inputPath).catch(() => {})
      throw new Error('Falha na conversão: ' + errorMsg.slice(-300))
    }

    const mp4Bytes = await Deno.readFile(outputPath)

    await Deno.remove(inputPath).catch(() => {})
    await Deno.remove(outputPath).catch(() => {})

    return new Response(mp4Bytes, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'video/mp4',
        'Content-Disposition': 'attachment; filename="converted.mp4"',
      },
    })
  } catch (err) {
    console.error('convert-video error:', err)
    return new Response(
      JSON.stringify({ error: (err as Error).message || 'Erro desconhecido' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
