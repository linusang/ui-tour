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
  import { computed, nextTick, onMounted, provide, ref, watch } from "vue";

  import { assertIsDefined } from "@/share/assertHelpers";

  import { UI_TOUR_INTERNAL_CONTEXT_KEY } from "./share";

  const props = withDefaults(
    defineProps<{
      teleportTo?: string;
      currentIndex?: number;
      placement?: Placement | "modal";
      spotlightPadding?: number;
    }>(),
    {
      teleportTo: "body",
      currentIndex: -1,
      placement: "bottom",
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

  async function showFloatingContent(elementId?: string) {
    const element = document.getElementById(elementId ?? "");
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
    } else {
      console.log(`element ${elementId} not found`);
    }
  }

  async function showModalContent() {
    console.log("showModalContent");
    showContent.value = true;
    await nextTick();
    currentTargetElement.value = modal.value;
    await nextTick();
    spotlight.value?.classList.add("spotlight");
    await awaitSpotlightTransitionEnd();
    spotlight.value?.classList.remove("spotlight");
    modal.value?.classList.add("show");
  }

  function setFloating(el: HTMLElement) {
    floating.value = el;
  }

  function setFloatingContent(el: HTMLElement) {
    floatingContent.value = el;
  }

  function setModal(el: HTMLElement) {
    modal.value = el;
  }

  function setFloatingArrow(el: HTMLElement) {
    floatingArrow.value = el;
  }

  provide(UI_TOUR_INTERNAL_CONTEXT_KEY, {
    showFloatingContent,
    showModalContent,
    showContent,
    setFloating,
    setFloatingContent,
    setModal,
    setFloatingArrow,
    computedFloatingStyles,
    arrowPositionStyles,
  });

  defineExpose({
    exit,
  });

  watch(
    () => props.currentIndex,
    async (newVal) => {
      if (newVal === -1) {
        currentTargetElement.value = overlay.value;
        showContent.value = false;
        return;
      }
      // if (props.placement !== "modal") {
      //   await showFloatingContent();
      // } else {
      //   await showModalContent();
      // }
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

      <slot />
    </div>
  </Teleport>
</template>

<style scoped>
  .spotlight {
    transition: all 0.35s cubic-bezier(0.23, 1, 0.32, 1);
  }
</style>
