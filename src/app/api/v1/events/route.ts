import { json, readLocale } from "@/lib/api/respond";
import { getEvents } from "@/lib/content/kammara";

/**
 * GET /api/v1/events?locale=pt
 *
 * `events: null` quando a seção está desligada no JSON ou não sobra evento de
 * planeta publicado.
 *
 * ATENÇÃO: este é o único endpoint cujo conteúdo sai bilíngue (`{pt, en}`) em
 * vez de resolvido. `planetNames` já vem resolvido.
 */
export function GET(request: Request) {
	const locale = readLocale(request);
	return json(request, `events:${locale}`, () => ({
		locale,
		events: getEvents(locale),
	}));
}
