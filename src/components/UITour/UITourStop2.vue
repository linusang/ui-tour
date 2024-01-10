<script setup lang="ts">
  import type { Placement } from "@floating-ui/vue";
  import type { StyleValue } from "vue";
  import { defineSlots, inject, watch } from "vue";

  import { assertIsDefined } from "@/share/assertHelpers";

  import { UI_TOUR_CONTEXT_KEY, UI_TOUR_INTERNAL_CONTEXT_KEY } from "./share";
  import { UITourStopSlotProps } from "./types";

  interface Props {
    targetElementId?: string;
    placement: Placement | "modal";
    spotlightPadding?: number;
  }
  const props = withDefaults(defineProps<Props>(), {
    targetElementId: undefined,
    spotlightPadding: 10,
  });

  defineSlots<{
    default?: (props: UITourStopSlotProps) => any;
  }>();

  const context = inject(UI_TOUR_CONTEXT_KEY);
  assertIsDefined(context);

  const internalContext = inject(UI_TOUR_INTERNAL_CONTEXT_KEY);
  assertIsDefined(internalContext);

  const { prev, next, exit, currentIndex, totalStops, registerStop } = context;

  const {
    showContent,
    computedFloatingStyles,
    arrowPositionStyles,
    setFloating,
    setFloatingContent,
    setFloatingArrow,
    setModal,
    showFloatingContent,
    showModalContent,
  } = internalContext;

  const myIndex = registerStop({
    targetElementId: props.targetElementId,
    placement: props.placement,
    spotlightPadding: props.spotlightPadding,
  });

  watch(currentIndex, async (newVal) => {
    if (newVal === myIndex) {
      if (props.placement !== "modal" && props.targetElementId) {
        await showFloatingContent(props.targetElementId);
      } else {
        await showModalContent();
      }
    }
  });
</script>

<template>
  <div
    v-if="currentIndex === myIndex && showContent && placement !== 'modal'"
    :ref="(el: any) => setFloating(el)"
    :style="(computedFloatingStyles as StyleValue)"
  >
    <div
      :ref="(el: any) => setFloatingContent(el)"
      class="floating-content"
      :data-placement="placement"
    >
      <slot
        :prev="prev"
        :next="next"
        :exit="exit"
        :current-index="currentIndex"
        :total-stops="totalStops"
      />
      <div
        :ref="(el: any) => setFloatingArrow(el)"
        class="absolute h-[15px] w-[15px] rotate-45 bg-white"
        :style="arrowPositionStyles"
      />
    </div>
  </div>

  <div
    v-if="currentIndex === myIndex && showContent && placement === 'modal'"
    class="fixed inset-0 flex h-full items-center justify-center"
  >
    <div :ref="(el: any) => setModal(el)" class="modal">
      <slot
        :prev="prev"
        :next="next"
        :exit="exit"
        :current-index="currentIndex"
        :total-stops="totalStops"
      />
    </div>
  </div>
</template>

<style scoped>
  .floating-content {
    transition: transform 0.2s cubic-bezier(0.075, 0.82, 0.165, 1),
      opacity 0.2s linear;
  }

  .floating-content[data-placement="top"] {
    @apply -translate-y-5 opacity-0;
  }
  .floating-content[data-placement="bottom"] {
    @apply translate-y-5 opacity-0;
  }
  .floating-content[data-placement="left"] {
    @apply -translate-x-5 opacity-0;
  }
  .floating-content[data-placement="right"] {
    @apply translate-x-5 opacity-0;
  }

  .floating-content[data-placement="top"].show,
  .floating-content[data-placement="right"].show,
  .floating-content[data-placement="bottom"].show,
  .floating-content[data-placement="left"].show {
    @apply translate-x-0 translate-y-0 opacity-100;
  }

  .modal {
    @apply opacity-0;
    transition: opacity 0.2s linear;
  }
  .modal.show {
    @apply scale-100 opacity-100;
  }
</style>
