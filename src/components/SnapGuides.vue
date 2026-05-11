<script setup lang="ts">
import type { SnapGuide } from '@/composables/useSnap';

defineProps<{ guides: SnapGuide[] }>();
</script>

<template>
  <div class="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
    <template v-for="(g, i) in guides" :key="i">
      <div
        v-if="g.axis === 'x'"
        class="absolute top-0 bottom-0 w-px bg-accent/80 shadow-[0_0_4px_rgba(255,107,107,0.6)]"
        :style="{ left: `${g.value * 100}%` }"
      ></div>
      <div
        v-else
        class="absolute left-0 right-0 h-px bg-accent/80 shadow-[0_0_4px_rgba(255,107,107,0.6)]"
        :style="{ top: `${g.value * 100}%` }"
      ></div>
    </template>
  </div>
</template>
