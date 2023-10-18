<script setup lang="ts">
  import type { Placement } from "@floating-ui/vue";
  import { defineSlots, inject } from "vue";

  import { assertIsDefined } from "@/share/assertHelpers";

  import { UI_TOUR_CONTEXT_KEY } from "./share";
  import { UITourStopSlotProps } from "./types";

  interface Props {
    targetElementId?: string;
    placement: Placement | "modal";
    spotlightPadding?: number;
  }
  withDefaults(defineProps<Props>(), {
    targetElementId: undefined,
    spotlightPadding: 10,
  });

  defineSlots<{
    default?: (props: UITourStopSlotProps) => any;
  }>();

  const context = inject(UI_TOUR_CONTEXT_KEY);

  assertIsDefined(context);

  const { prev, next, exit, currentIndex, totalStops } = context;
</script>

<template>
  <slot
    :prev="prev"
    :next="next"
    :exit="exit"
    :current-index="currentIndex"
    :total-stops="totalStops"
  />
</template>
