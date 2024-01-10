<script setup lang="ts">
  import { computed, provide, ref } from "vue";

  import { UI_TOUR_CONTEXT_KEY } from "./share";
  import { UITourStopContext } from "./types";
  import UITourInternal2 from "./UITourInternal2.vue";
  withDefaults(
    defineProps<{
      teleportTo?: string;
    }>(),
    { teleportTo: "body" }
  );

  const currentIndex = ref(-1);
  const uiTourInternal = ref<InstanceType<typeof UITourInternal2>>();
  const stops = ref<UITourStopContext[]>([]);

  function start() {
    addKeyDownListener();
    if (stops.value.length > 0) {
      currentIndex.value = 0;
    } else {
      console.log("No stops to show");
    }
  }

  function prev() {
    currentIndex.value =
      (currentIndex.value - 1 + stops.value.length) % stops.value.length;
  }

  function next() {
    currentIndex.value = (currentIndex.value + 1) % stops.value.length;
  }

  async function exit() {
    removeKeyDownListener();
    await uiTourInternal.value?.exit();
    currentIndex.value = -1;
  }

  async function keyDownHandler(e: KeyboardEvent) {
    if (e.key === "ArrowRight") {
      next();
    } else if (e.key === "ArrowLeft") {
      prev();
    } else if (e.key === "Escape") {
      await exit();
    }
  }

  function addKeyDownListener() {
    window.addEventListener("keydown", keyDownHandler);
  }

  function removeKeyDownListener() {
    window.removeEventListener("keydown", keyDownHandler);
  }

  function registerStop(stop: UITourStopContext) {
    stops.value.push(stop);
    const result = stops.value.indexOf(stop);
    console.log("registerStop", stop, result);
    return result;
  }

  defineExpose({ start });

  provide(UI_TOUR_CONTEXT_KEY, {
    prev,
    next,
    exit,
    currentIndex: computed(() => currentIndex.value),
    totalStops: computed(() => stops.value.length),
    registerStop,
  });

  //   const elementId = computed(() => {
  //     const stop = stops.value[currentIndex.value];
  //     return stop?.targetElementId;
  //   });

  const placement = computed(() => {
    const stop = stops.value[currentIndex.value];
    return stop?.placement;
  });

  const spotlightPadding = computed(() => {
    const stop = stops.value[currentIndex.value];
    return stop?.spotlightPadding;
  });
</script>

<template>
  <UITourInternal2
    ref="uiTourInternal"
    :teleport-to="teleportTo"
    :current-index="currentIndex"
    :placement="placement"
    :spotlight-padding="spotlightPadding"
  >
    <slot />
  </UITourInternal2>
</template>
