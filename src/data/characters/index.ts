/**
 * Central registry of all character data, keyed by contextId.
 *
 * A contextId combines the universe and the section, e.g. "kammara/lunnp1"
 * or "bichittos/napcat". The CharacterStrip / CharacterInfoPanel use this
 * id to look up which character set is in scope.
 */

import type { Character } from "./types";

// Kammara
import kammaraLunnp1 from "./kammara/lunnp1.json";
import kammaraEni4 from "./kammara/eni4.json";
import kammaraTriplec from "./kammara/triplec.json";
import kammaraOrfv from "./kammara/orfv.json";
import kammaraZ1 from "./kammara/z1.json";
import kammaraGotto from "./kammara/gotto.json";
import kammaraKammara from "./kammara/kammara.json";

// Bichittos
import bichittosNapcat from "./bichittos/napcat.json";
import bichittosZeco from "./bichittos/zeco.json";
import bichittosTaylo from "./bichittos/taylo.json";
import bichittosMiscelania from "./bichittos/miscelania.json";

export const charactersByContext: Record<string, Character[]> = {
  "kammara/lunnp1": kammaraLunnp1 as Character[],
  "kammara/eni4": kammaraEni4 as Character[],
  "kammara/triplec": kammaraTriplec as Character[],
  "kammara/orfv": kammaraOrfv as Character[],
  "kammara/z1": kammaraZ1 as Character[],
  "kammara/gotto": kammaraGotto as Character[],
  "kammara/kammara": kammaraKammara as Character[],
  "bichittos/napcat": bichittosNapcat as Character[],
  "bichittos/zeco": bichittosZeco as Character[],
  "bichittos/taylo": bichittosTaylo as Character[],
  "bichittos/miscelania": bichittosMiscelania as Character[],
};

export type ContextId = keyof typeof charactersByContext;
