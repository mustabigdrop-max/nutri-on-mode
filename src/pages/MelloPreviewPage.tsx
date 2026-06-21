/**
 * Rota standalone /training/preview-mello
 * Renderiza o MelloProtocolViewer com o fixture, sem layout do app.
 * Usado para iteração visual antes da integração com a Edge Function.
 */

import { MelloProtocolViewer } from "@/components/training/MelloProtocolViewer";
import { melloFixture } from "@/types/melloProtocolFixture";

export default function MelloPreviewPage() {
  return <MelloProtocolViewer protocol={melloFixture} />;
}
