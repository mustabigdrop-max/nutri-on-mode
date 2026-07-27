import { auth, defineMcp } from "@lovable.dev/mcp-js";
import getProfileTool from "./tools/get-profile";
import listMealLogsTool from "./tools/list-meal-logs";
import logWeightTool from "./tools/log-weight";
import listWeightLogsTool from "./tools/list-weight-logs";
import listTrainingProtocolsTool from "./tools/list-training-protocols";
import getTrainingProtocolTool from "./tools/get-training-protocol";

const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "nutrion-mcp",
  title: "nutriON",
  version: "0.1.0",
  instructions:
    "Ferramentas do nutriON para o usuário autenticado: leitura do perfil nutricional e metas, histórico de refeições e de peso, registro de novo peso e consulta dos protocolos de treino (TrainingON). Não prescreve medicamentos nem substitui avaliação clínica.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [
    getProfileTool,
    listMealLogsTool,
    listWeightLogsTool,
    logWeightTool,
    listTrainingProtocolsTool,
    getTrainingProtocolTool,
  ],
});
