<script setup lang="ts">
  import type { Placement } from "@floating-ui/vue";
  import {
    arrow,
    autoUpdate,
    flip,
    hide,
    offset,
    shift,
    useFloating,
  } from "@floating-ui/vue";
  import { useElementBounding, useElementSize } from "@vueuse/core";
  import type { StyleValue } from "vue";
  import { computed, nextTick, onMounted, ref, watch } from "vue";

  import { assertIsDefined } from "@/share/assertHelpers";

  const props = withDefaults(
    defineProps<{
      teleportTo?: string;
      currentIndex?: number;
      placement?: Placement | "modal";
      elementId?: string;
      spotlightPadding?: number;
    }>(),
    {
      teleportTo: "body",
      currentIndex: -1,
      placement: "bottom",
      elementId: undefined,
      spotlightPadding: 10,
    }
  );

  const overlay = ref<HTMLElement | null>(null);
  const spotlight = ref<SVGRectElement | null>(null);
  const currentTargetElement = ref<HTMLElement | null>(null);
  const floating = ref<HTMLElement | null>(null);
  const floatingArrow = ref<HTMLElement | null>(null);
  const floatingContent = ref<HTMLElement | null>(null);
  const modal = ref<HTMLElement | null>(null);
  const showContent = ref(false);

  const { top, left, width, height } = useElementBounding(currentTargetElement);

  const { floatingStyles, middlewareData, placement } = useFloating(
    spotlight,
    floating,
    {
      placement: computed(() =>
        props.placement === "modal" ? undefined : props.placement
      ),
      middleware: [
        offset(10),
        flip({
          fallbackAxisSideDirection: "start",
        }),
        shift(),
        arrow({ element: floatingArrow }),
        hide(),
      ],
      whileElementsMounted: autoUpdate,
    }
  );

  const arrowPositionStyles = computed(() => {
    if (!middlewareData.value?.arrow) return {};
    const { x, y } = middlewareData.value.arrow;

    const side = placement.value.split("-")[0];

    const staticSide = {
      top: "bottom",
      right: "left",
      bottom: "top",
      left: "right",
    }[side];

    assertIsDefined(staticSide);
    if (!floatingArrow.value) return {};

    return {
      left: x != null ? `${x}px` : "",
      top: y != null ? `${y}px` : "",
      [staticSide]: `${-floatingArrow.value.offsetWidth / 2}px`,
    };
  });

  const hideFloatingStyles = computed(() => {
    const hideData = middlewareData.value.hide;
    return {
      visibility: hideData?.referenceHidden ? "hidden" : "visible",
    };
  });

  const computedFloatingStyles = computed(() => {
    return {
      ...floatingStyles.value,
      ...hideFloatingStyles.value,
    };
  });

  const spotLightBounds = computed(() => {
    return {
      x: left.value - props.spotlightPadding,
      y: top.value - props.spotlightPadding,
      width: width.value + props.spotlightPadding * 2,
      height: height.value + props.spotlightPadding * 2,
    };
  });

  const { width: overlayWidth, height: overlayHeight } =
    useElementSize(overlay);

  const viewBox = computed(
    () => `0 0 ${overlayWidth.value} ${overlayHeight.value}`
  );

  function isInViewport(element: HTMLElement) {
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <=
        (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  }

  function awaitSpotlightTransitionEnd() {
    return new Promise((resolve) => {
      spotlight.value?.addEventListener("transitionend", resolve, {
        once: true,
      });
    });
  }

  async function exit() {
    currentTargetElement.value = overlay.value;
    showContent.value = false;
    await nextTick();
    spotlight.value?.classList.add("spotlight");
    await awaitSpotlightTransitionEnd();
    spotlight.value?.classList.remove("spotlight");
  }

  defineExpose({
    exit,
  });

  async function showFloatingContent() {
    const element = document.getElementById(props.elementId ?? "");
    if (element) {
      currentTargetElement.value = element;
      showContent.value = false;
      if (!isInViewport(currentTargetElement.value)) {
        currentTargetElement.value.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
      await nextTick();
      spotlight.value?.classList.add("spotlight");
      await awaitSpotlightTransitionEnd();
      spotlight.value?.classList.remove("spotlight");
      showContent.value = false;
      await nextTick();
      showContent.value = true;
      await nextTick();
      floatingContent.value?.classList.add("show");
    }
  }

  async function showModalContent() {
    showContent.value = true;
    await nextTick();
    currentTargetElement.value = modal.value;
    await nextTick();
    spotlight.value?.classList.add("spotlight");
    await awaitSpotlightTransitionEnd();
    spotlight.value?.classList.remove("spotlight");
    modal.value?.classList.add("show");
  }

  watch(
    () => props.currentIndex,
    async (newVal) => {
      if (newVal === -1) {
        currentTargetElement.value = overlay.value;
        showContent.value = false;
        return;
      }
      if (props.placement !== "modal") {
        await showFloatingContent();
      } else {
        await showModalContent();
      }
    }
  );

  onMounted(() => {
    currentTargetElement.value = overlay.value;
  });
</script>

<template>
  <Teleport :to="teleportTo">
    <div
      ref="overlay"
      class="fixed inset-0"
      :class="{ 'pointer-events-none': currentIndex === -1 }"
    >
      <svg v-if="currentIndex > -1" :viewBox="viewBox">
        <mask id="spotlight-mask">
          <rect
            x="0"
            y="0"
            :width="overlayWidth"
            :height="overlayHeight"
            fill="white"
          />
          <rect
            ref="spotlight"
            :x="spotLightBounds.x"
            :y="spotLightBounds.y"
            :width="spotLightBounds.width"
            :height="spotLightBounds.height"
            rx="10"
            fill="black"
          />
        </mask>
        <rect
          x="0"
          y="0"
          :width="overlayWidth"
          :height="overlayHeight"
          fill="black"
          fill-opacity="0.7"
          mask="url(#spotlight-mask)"
        />
      </svg>

      <div
        v-if="showContent && props.placement !== 'modal'"
        ref="floating"
        :style="(computedFloatingStyles as StyleValue)"
      >
        <div
          ref="floatingContent"
          class="floating-content"
          :data-placement="placement"
        >
          <slot />
          <div
            ref="floatingArrow"
            class="absolute h-[15px] w-[15px] rotate-45 bg-white"
            :style="arrowPositionStyles"
          ></div>
        </div>
      </div>

      <div
        v-if="showContent && props.placement === 'modal'"
        class="fixed inset-0 flex h-full items-center justify-center"
      >
        <div ref="modal" class="modal">
          <slot />
        </div>
      </div>

      <!-- debug -->
      <!-- <div
        class="absolute right-0 top-0 mr-auto border border-gray-300 bg-white p-4 text-xs"
      >
        <pre>{{ computedFloatingStyles }}</pre>
      </div> -->
    </div>
  </Teleport>
</template>

<style scoped>
  .spotlight {
    transition: all 0.35s cubic-bezier(0.23, 1, 0.32, 1);
  }

  .btn {
    @apply rounded bg-gray-300 px-2 py-1 hover:bg-gray-200;
  }

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
