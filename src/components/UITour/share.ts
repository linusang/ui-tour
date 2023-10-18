import type { InjectionKey } from "vue";

import { UITourContext } from "./types";

export const UI_TOUR_CONTEXT_KEY = Symbol(
  "UITourContext"
) as InjectionKey<UITourContext>;
