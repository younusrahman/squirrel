import { CreateSquirrelStore, CombineSquirrelStore } from "squirrel";
import { storeA } from "./ComponentA";
import { storeB } from "./ComponentB";
import { storeC } from "./ComponentC";
import { storeD } from "./ComponentD";
import { storeE } from "./ComponentE"; // Add this
import { storeF } from "./ComponentF"; // Add this

export const allCounters = CombineSquirrelStore(() => ({
  A: storeA,
  B: storeB,
  C: storeC,
  D: storeD,
  E: storeE, // Include E
  F: storeF, // Include F
}));
