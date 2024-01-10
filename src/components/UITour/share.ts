import type { InjectionKey } from "vue";

import { UITourContext, UITourInternalContext } from "./types";

export const UI_TOUR_CONTEXT_KEY = Symbol(
  "UITourContext"
) as InjectionKey<UITourContext>;

export const UI_TOUR_INTERNAL_CONTEXT_KEY = Symbol(
  "UITourInternalContext"
) as InjectionKey<UITourInternalContext>;
