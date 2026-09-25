// Origem canônica do site.
//
// Há 3 domínios apontando pro mesmo app (guitta, kammara, bichittos), então
// a variável explícita vence o host que a Vercel expõe.

/** Base URL do site, sem barra no fim. */
export const SITE_URL =
	process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") ||
	"https://guittamonatega.com";
