/**
 * Central registry of all character data, keyed by contextId.
 *
 * A contextId combines the universe and the section, e.g. "kammara/lunnp1"
 * or "bichittos/napcat". The CharacterStrip / CharacterInfoPanel use this
 * id to look up which character set is in scope.
 */

import type { Character } from "./types";

// Kammara
import kammaraLunnp1 from "./kammara/lunnp1_characters.json";
import kammaraEni4 from "./kammara/eni4_characters.json";
import kammaraTriplec from "./kammara/triplec_characters.json";
import kammaraTriplecMalloc from "./kammara/triplec-malloc_characters.json";
import kammaraTriplecMesh from "./kammara/triplec-mesh_characters.json";
import kammaraTriplecSharp from "./kammara/triplec-sharp_characters.json";
import kammaraOrfv from "./kammara/orfv_characters.json";
import kammaraZ1 from "./kammara/z1_characters.json";
import kammaraGotto from "./kammara/gotto_characters.json";
import kammaraKammara from "./kammara/kammara_characters.json";

// Bichittos
import bichittosNapcat from "./bichittos/napcat.json";
import bichittosZeco from "./bichittos/zeco.json";
import bichittosTaylo from "./bichittos/taylo.json";
import bichittosMiscelania from "./bichittos/miscelania.json";
import bichittosCheiodebolinha from "./bichittos/cheiodebolinha.json";

export const charactersByContext: Record<string, Character[]> = {
  "kammara/lunnp1": kammaraLunnp1 as Character[],
  "kammara/eni4": kammaraEni4 as Character[],
  "kammara/triplec": kammaraTriplec as Character[],
  "kammara/triplec/malloc": kammaraTriplecMalloc as Character[],
  "kammara/triplec/mesh": kammaraTriplecMesh as Character[],
  "kammara/triplec/sharp": kammaraTriplecSharp as Character[],
  "kammara/orfv": kammaraOrfv as Character[],
  "kammara/z1": kammaraZ1 as Character[],
  "kammara/gotto": kammaraGotto as Character[],
  "kammara/kammara": kammaraKammara as Character[],
  "bichittos/napcat": bichittosNapcat as Character[],
  "bichittos/zeco": bichittosZeco as Character[],
  "bichittos/taylo": bichittosTaylo as Character[],
  "bichittos/miscelania": bichittosMiscelania as Character[],
  "bichittos/cheiodebolinha": bichittosCheiodebolinha as Character[],
};

export type ContextId = keyof typeof charactersByContext;
