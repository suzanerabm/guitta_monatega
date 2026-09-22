// Acesso às mensagens SEM passar pelo next-intl.
//
// `getTranslations`/`setRequestLocale` são amarrados ao contexto de request
// (RSC), então não podem ser chamados de um route handler. Como os arquivos de
// mensagem são JSON comum, a camada de conteúdo lê direto — fica pura e serve
// tanto a página quanto a API.

import ptMessages from "@/i18n/messages/pt.json";
import enMessages from "@/i18n/messages/en.json";
import type { Locale } from "./types";

const MESSAGES: Record<Locale, typeof ptMessages> = {
	pt: ptMessages,
	en: enMessages as typeof ptMessages,
};

/**
 * Dicionário palavra→tradução usado pra rotular personagens cujo nome vem do
 * nome do arquivo de imagem (ex: "napcat dormindo" → "napcat sleeping").
 */
export function getWordDictionary(locale: Locale): Record<string, string> {
	return (MESSAGES[locale]?.common?.words ?? {}) as Record<string, string>;
}

/**
 * O bloco inteiro de mensagens de um idioma. O app Android monta a página do
 * universo e os títulos das seções a partir daqui, então precisa do bloco, não
 * de uma chave por vez.
 */
export function getMessages(locale: Locale): typeof ptMessages {
	return MESSAGES[locale] ?? MESSAGES.pt;
}
