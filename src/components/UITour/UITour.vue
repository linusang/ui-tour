<script lang="ts">
  import { computed, defineComponent, h, provide, ref, VNode } from "vue";

  import { UI_TOUR_CONTEXT_KEY } from "./share";
  import type { UITourExposed, UITourStopContext } from "./types";
  import UITourInternal from "./UITourInternal.vue";
  import UITourStop from "./UITourStop.vue";

  export default defineComponent({
    props: {
      teleportTo: {
        type: String,
        required: false,
        default: "body",
      },
    },
    setup(props, { slots, expose }) {
      const currentIndex = ref(-1);

      let internalContainerVNode: VNode | null = null;

      const noOfStops = computed(() => slots.default?.().length ?? 0);

      function start() {
        addKeyDownListener();
        currentIndex.value = 0;
      }

      function prev() {
        currentIndex.value =
          (currentIndex.value - 1 + noOfStops.value) % noOfStops.value;
      }

      function next() {
        currentIndex.value = (currentIndex.value + 1) % noOfStops.value;
      }

      async function exit() {
        removeKeyDownListener();
        await internalContainerVNode?.component?.exposed?.exit();
        currentIndex.value = -1;
      }

      function registerStop(_: UITourStopContext) {
        return -1;
      }

      provide(UI_TOUR_CONTEXT_KEY, {
        prev,
        next,
        exit,
        currentIndex: computed(() => currentIndex.value),
        totalStops: noOfStops,
        registerStop,
      });

      const instance: UITourExposed = { start };
      expose(instance);

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

      return () => {
        const children = slots.default?.();

        const stops = children?.filter((child) => child.type === UITourStop);
        const currentStop = stops?.[currentIndex.value] ?? h("div");
        const internalContainer = h(
          UITourInternal,
          {
            teleportTo: props.teleportTo,
            currentIndex: currentIndex.value,
            placement: currentStop.props?.placement,
            elementId: currentStop.props?.["target-element-id"],
            spotlightPadding: currentStop.props?.["spotlight-padding"],
          },
          () => [currentStop]
        );
        internalContainerVNode = internalContainer;
        return internalContainer;
      };
    },
  });
</script>
