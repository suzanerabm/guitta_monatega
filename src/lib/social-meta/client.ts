// Cliente Graph API compartilhado pelos publicadores de Kammara, Bichittos e Studio.
// Código puro: não guarda estado entre execuções nem credenciais. Cada instância vale
// para uma única plataforma de uma única ocorrência.
//
// Regras (docs/meta-social-publishing-incident-2026-10-15.md):
// - nenhuma chamada é repetida;
// - teto fixo de chamadas por instância;
// - tempo-limite curto por chamada;
// - uso informado pela Meta acima do limite interrompe a próxima chamada e pausa a marca;
// - cada chamada é registrada sem token, cabeçalhos ou corpo.

export const CALL_TIMEOUT_MS = 15_000;
export const USAGE_PAUSE_THRESHOLD = 50;

export type MetaErrorKind = "brand-critical" | "needs-review";

type MetaErrorBody = { message?: string; error_user_msg?: string; code?: number; error_subcode?: number; fbtrace_id?: string };

export class MetaPublishingError extends Error {
  constructor(
    message: string,
    readonly kind: MetaErrorKind,
    readonly details: { httpStatus?: number; code?: number; subcode?: number; traceId?: string } = {},
  ) {
    super(message);
    this.name = "MetaPublishingError";
  }
}

const BRAND_CRITICAL_HTTP = new Set([401, 403, 429]);
// 190/102: token; 10 e 200-299: permissão; 4/17/32/341/613 e 80000-80014: limites; 368: bloqueio por política.
const BRAND_CRITICAL_CODES = new Set([4, 10, 17, 32, 102, 190, 341, 368, 613]);
// 2207042: limite de publicação atingido; 2207051: atividade restrita.
const BRAND_CRITICAL_SUBCODES = new Set([2207042, 2207051]);

export function classifyMetaError(httpStatus: number, error?: MetaErrorBody): MetaErrorKind {
  if (BRAND_CRITICAL_HTTP.has(httpStatus)) return "brand-critical";
  const code = error?.code;
  if (code !== undefined && (BRAND_CRITICAL_CODES.has(code) || (code >= 200 && code < 300) || (code >= 80000 && code <= 80014))) return "brand-critical";
  if (error?.error_subcode !== undefined && BRAND_CRITICAL_SUBCODES.has(error.error_subcode)) return "brand-critical";
  return "needs-review";
}

function percentages(value: unknown): number[] {
  if (Array.isArray(value)) return value.flatMap(percentages);
  if (!value || typeof value !== "object") return [];
  return Object.entries(value).flatMap(([key, entry]) => {
    if (typeof entry === "number" && ["call_count", "total_cputime", "total_time"].includes(key)) return [entry];
    return typeof entry === "object" ? percentages(entry) : [];
  });
}

// Maior porcentagem de uso informada em X-App-Usage ou X-Business-Use-Case-Usage.
export function peakUsage(headers: Headers): number {
  let peak = 0;
  for (const name of ["x-app-usage", "x-business-use-case-usage"]) {
    const raw = headers.get(name);
    if (!raw) continue;
    try {
      peak = Math.max(peak, ...percentages(JSON.parse(raw)));
    } catch {
      // cabeçalho ilegível não interrompe nem libera nada
    }
  }
  return peak;
}

export type MetaCallLog = {
  event: "meta_call";
  correlationId: string;
  brand: string;
  occurrence: string;
  platform: string;
  operation: string;
  method: string;
  endpoint: string;
  call: number;
  limit: number;
  httpStatus: number | null;
  durationMs: number;
  usagePeak: number;
  outcome: "ok" | "meta-error" | "timeout" | "network-error";
  code?: number;
  subcode?: number;
  traceId?: string;
};

export type MetaClientOptions = {
  brand: string;
  occurrence: string;
  platform: "instagram" | "facebook";
  limit: number;
  correlationId: string;
  fetchImpl?: typeof fetch;
  log?: (entry: MetaCallLog) => void;
};

export type MetaPayload = { id?: string; post_id?: string; status_code?: string; status?: string; error?: MetaErrorBody };

export class MetaClient {
  private used = 0;
  private peak = 0;
  private stopReason: string | null = null;

  constructor(private readonly options: MetaClientOptions) {}

  get calls(): number { return this.used; }
  get usagePeak(): number { return this.peak; }
  // Motivo para pausar a marca depois desta execução, mesmo que a última chamada tenha dado certo.
  get pauseReason(): string | null { return this.stopReason; }

  async request(operation: string, url: string | URL, init: RequestInit = {}): Promise<MetaPayload> {
    const { brand, platform, limit } = this.options;
    if (this.stopReason) throw new MetaPublishingError(`${platform}: ${this.stopReason}; stopping before ${operation}.`, "brand-critical");
    if (this.used >= limit) throw new MetaPublishingError(`${platform}: Meta call budget of ${limit} exhausted before ${operation}; no retry.`, "needs-review");
    this.used += 1;

    const endpoint = new URL(String(url)).pathname;
    const started = Date.now();
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), CALL_TIMEOUT_MS);
    const record = (entry: Pick<MetaCallLog, "httpStatus" | "outcome"> & Partial<MetaCallLog>) => (this.options.log ?? defaultLog)({
      event: "meta_call",
      correlationId: this.options.correlationId,
      brand,
      occurrence: this.options.occurrence,
      platform,
      operation,
      method: init.method ?? "GET",
      endpoint,
      call: this.used,
      limit,
      durationMs: Date.now() - started,
      usagePeak: this.peak,
      ...entry,
    });

    let response: Response;
    try {
      response = await (this.options.fetchImpl ?? fetch)(url, { ...init, signal: controller.signal });
    } catch (error) {
      const timedOut = controller.signal.aborted;
      record({ httpStatus: null, outcome: timedOut ? "timeout" : "network-error" });
      const reason = timedOut ? `timed out after ${CALL_TIMEOUT_MS} ms` : `network error (${error instanceof Error ? error.message : String(error)})`;
      throw new MetaPublishingError(`${platform}: ${operation} ${reason}; result unknown, needs review, no retry.`, "needs-review");
    } finally {
      clearTimeout(timer);
    }

    this.peak = Math.max(this.peak, peakUsage(response.headers));
    if (this.peak >= USAGE_PAUSE_THRESHOLD) this.stopReason = `Meta usage reached ${this.peak}% (pause threshold ${USAGE_PAUSE_THRESHOLD}%)`;

    const payload = await response.json().catch(() => ({})) as MetaPayload;
    if (!response.ok || payload.error) {
      const details = { httpStatus: response.status, code: payload.error?.code, subcode: payload.error?.error_subcode, traceId: payload.error?.fbtrace_id };
      record({ httpStatus: response.status, outcome: "meta-error", code: details.code, subcode: details.subcode, traceId: details.traceId });
      const message = payload.error?.error_user_msg ?? payload.error?.message ?? `HTTP ${response.status}`;
      throw new MetaPublishingError(`${operation}: ${message}`, classifyMetaError(response.status, payload.error), details);
    }
    record({ httpStatus: response.status, outcome: "ok" });
    return payload;
  }
}

function defaultLog(entry: MetaCallLog): void {
  console.log(JSON.stringify(entry));
}
