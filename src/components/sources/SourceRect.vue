<script setup lang="ts">
import { inject } from 'vue';
import type { RectSource } from '@/scene/types';

defineProps<{ source: RectSource }>();

const canvasScale = inject<{ value: number }>('canvasScale', { value: 1 });
</script>

<template>
  <div
    class="pointer-events-none h-full w-full"
    :style="{
      background: source.color,
      borderRadius: `${source.radius * canvasScale.value}px`,
    }"
  ></div>
</template>
