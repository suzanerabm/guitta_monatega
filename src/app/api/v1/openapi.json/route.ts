import { json, fail } from "@/lib/api/respond";
import { API_DOCS_ENABLED } from "@/lib/api/docs-gate";
import { openApiDocument } from "@/lib/api/openapi";

/**
 * GET /api/v1/openapi.json
 *
 * A especificação OpenAPI 3.1 da API. Importável direto no Swagger Editor, no
 * Postman ou no openapi-generator.
 *
 * Fechada por padrão: só responde com `API_DOCS=true`. Sem isso devolve 404 —
 * e não 403 — pra não confirmar que a rota existe.
 */
export function GET(request: Request) {
	if (!API_DOCS_ENABLED) {
		return fail(404, "not_found", "Documentação da API desabilitada.");
	}
	return json(request, "openapi", () => openApiDocument);
}
