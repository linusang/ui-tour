<script setup lang="ts">
  import { ref } from "vue";

  import { UITourExposed } from "./components/UITour/types";
  import UITour from "./components/UITour/UITour.vue";
  import UITourStop from "./components/UITour/UITourStop.vue";

  const uiTour = ref<UITourExposed>();

  function startTour() {
    uiTour.value?.start();
  }
</script>

<template>
  <div class="space-y-10">
    <div class="flex justify-center">
      <button class="btn" @click="startTour()">Start Tour</button>
    </div>
    <div class="flex items-center justify-around">
      <div
        id="red-box"
        class="relative flex h-12 w-12 items-center justify-center bg-red-500 text-white"
      >
        red
      </div>
      <div
        id="green-box"
        class="flex items-center justify-center bg-green-500 p-4 text-white"
      >
        green
      </div>
      <div
        id="blue-box"
        class="flex items-center justify-center bg-blue-500 p-6 text-white"
      >
        blue
      </div>
    </div>
    <div class="flex items-center justify-around" style="margin-top: 3000px">
      <div
        id="red-box-2"
        class="relative flex h-12 w-12 items-center justify-center bg-red-500 text-white"
      >
        red2
      </div>
      <div
        id="green-box-2"
        class="flex items-center justify-center bg-green-500 p-4 text-white"
      >
        green2
      </div>
      <div
        id="blue-box-2"
        class="flex items-center justify-center bg-blue-500 p-6 text-white"
      >
        blue2
      </div>
    </div>
    <div class="flex items-center justify-around" style="margin-top: 3000px">
      <div
        id="red-box-3"
        class="relative flex h-12 w-12 items-center justify-center bg-red-500 text-white"
      >
        red3
      </div>
      <div
        id="green-box-3"
        class="flex items-center justify-center bg-green-500 p-4 text-white"
      >
        green3
      </div>
      <div
        id="blue-box-3"
        class="flex items-center justify-center bg-blue-500 p-6 text-white"
      >
        blue3
      </div>
    </div>
  </div>

  <UITour ref="uiTour">
    <UITourStop
      v-slot="{ prev, next, exit }"
      placement="modal"
      :spotlight-padding="0"
    >
      <div class="rounded bg-white">
        <div class="w-64 space-y-4 rounded bg-emerald-400 p-4 text-white">
          <div>Welcome</div>
          <div class="flex justify-between">
            <button class="btn" @click="exit">exit</button>
            <button class="btn" @click="prev">prev</button>
            <button class="btn" @click="next">next</button>
          </div>
        </div>
      </div>
    </UITourStop>
    <UITourStop
      v-slot="{ prev, next, exit }"
      target-element-id="red-box"
      placement="right"
    >
      <div class="rounded bg-white">
        <div class="h-24 w-64 rounded border border-gray-300 p-4">
          <div>this is first stop</div>
          <div class="flex justify-between">
            <button class="btn" @click="exit">exit</button>
            <button class="btn" @click="prev">prev</button>
            <button class="btn" @click="next">next</button>
          </div>
        </div>
      </div>
    </UITourStop>
    <UITourStop
      v-slot="{ prev, next, exit }"
      target-element-id="green-box"
      placement="bottom"
    >
      <div class="rounded bg-white">
        <div class="h-24 w-64 rounded border border-gray-300 p-4">
          <div>this is second stop</div>
          <div class="flex justify-between">
            <button class="btn" @click="exit">exit</button>
            <button class="btn" @click="prev">prev</button>
            <button class="btn" @click="next">next</button>
          </div>
        </div>
      </div>
    </UITourStop>
    <UITourStop
      v-slot="{ prev, next, exit }"
      target-element-id="blue-box"
      placement="left"
    >
      <div class="rounded bg-white">
        <div class="h-24 w-64 rounded border border-gray-300 p-4">
          <div>this is third stop</div>
          <div class="flex justify-between">
            <button class="btn" @click="exit">exit</button>
            <button class="btn" @click="prev">prev</button>
            <button class="btn" @click="next">next</button>
          </div>
        </div>
      </div>
    </UITourStop>
    <UITourStop
      v-slot="{ prev, next, exit }"
      target-element-id="red-box-2"
      placement="right"
    >
      <div class="rounded bg-white">
        <div class="h-24 w-64 rounded border border-gray-300 p-4">
          <div>this is forth stop</div>
          <div class="flex justify-between">
            <button class="btn" @click="exit">exit</button>
            <button class="btn" @click="prev">prev</button>
            <button class="btn" @click="next">next</button>
          </div>
        </div>
      </div>
    </UITourStop>
    <UITourStop
      v-slot="{ prev, next, exit }"
      target-element-id="green-box-2"
      placement="top"
    >
      <div class="rounded bg-white">
        <div class="h-24 w-64 rounded border border-gray-300 p-4">
          <div>this is fifth stop</div>
          <div class="flex justify-between">
            <button class="btn" @click="exit">exit</button>
            <button class="btn" @click="prev">prev</button>
            <button class="btn" @click="next">next</button>
          </div>
        </div>
      </div>
    </UITourStop>
    <UITourStop
      v-slot="{ prev, next, exit }"
      placement="modal"
      :spotlight-padding="0"
    >
      <div class="rounded bg-white">
        <div class="w-96 space-y-4 rounded p-4">
          <div>The End! Have fun!</div>
          <div class="flex justify-between">
            <button class="btn" @click="exit">exit</button>
            <button class="btn" @click="prev">prev</button>
            <button class="btn" @click="next">next</button>
          </div>
        </div>
      </div>
    </UITourStop>
  </UITour>
</template>
