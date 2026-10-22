export type LoginErrorKind = "credentials" | "timeout" | "network" | "domain" | "server" | "confirmation" | "rate_limit" | "unknown";

export function loginErrorDetails(error: unknown) {
  const value = error && typeof error === "object" ? error as Record<string, unknown> : {};
  return {
    status: typeof value.status === "number" ? value.status : null,
    message: typeof value.message === "string" ? value.message : typeof error === "string" ? error : "Unknown authentication error",
    code: typeof value.code === "string" ? value.code : null,
    name: typeof value.name === "string" ? value.name : null,
  };
}

export function classifyLoginError(error: unknown): LoginErrorKind {
  const { status, message, code, name } = loginErrorDetails(error);
  const text = `${message} ${code ?? ""} ${name ?? ""}`.toLowerCase();
  if (status !== null && status >= 500) return "server";
  if (/invalid login credentials|invalid_credentials/.test(text)) return "credentials";
  if (/email not confirmed|email_not_confirmed/.test(text)) return "confirmation";
  if (status === 429 || /rate limit|security purposes|too many/.test(text)) return "rate_limit";
  if (/cors|cross-origin|redirect_uri.*not.*allowed|redirect.*not.*allowed|unauthorized domain|domain.*not.*authorized|origin.*not.*allowed/.test(text)) return "domain";
  if (/timeout|timed out|aborterror/.test(text)) return "timeout";
  if (/failed to fetch|fetch failed|networkerror|network request failed|load failed|authretryablefetcherror/.test(text)) return "network";
  return "unknown";
}

const MESSAGES: Record<LoginErrorKind, string> = {
  credentials: "Email ou senha incorretos.",
  timeout: "O servidor demorou demais para responder ao login. Tente novamente em instantes.",
  network: "Não foi possível alcançar o servidor de login. Pode haver indisponibilidade do serviço ou bloqueio de conexão; tente novamente em instantes.",
  domain: "O domínio foi bloqueado ou não está autorizado para autenticação. Verifique a configuração de acesso do nutriON.",
  server: "O servidor de login está temporariamente indisponível. Tente novamente em instantes.",
  confirmation: "Confirme seu email antes de entrar — verifique sua caixa de entrada (e o spam).",
  rate_limit: "Muitas tentativas seguidas. Aguarde um minuto e tente de novo.",
  unknown: "Não foi possível concluir o login. Tente novamente em instantes.",
};

export function loginErrorMessage(error: unknown): string {
  return MESSAGES[classifyLoginError(error)];
}

/** Log only response diagnostics, never credentials, sessions or the request body. */
export function logLoginError(error: unknown) {
  console.error("[AUTH] login error", {
    ...loginErrorDetails(error),
    kind: classifyLoginError(error),
    origin: window.location.origin,
  });
}