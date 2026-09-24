import { json, notFound, readLocale } from "@/lib/api/respond";
import { getWorld } from "@/lib/content/kammara";

/**
 * GET /api/v1/worlds/:id?locale=pt
 */
export async function GET(
	request: Request,
	ctx: RouteContext<"/api/v1/worlds/[id]">,
) {
	const { id } = await ctx.params;
	const locale = readLocale(request);
	const world = getWorld(id, locale);
	if (!world) return notFound("Mundo", id);
	return json(request, `world:${id}:${locale}`, () => ({ locale, world }));
}
