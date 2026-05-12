<script setup lang="ts">
import type { WebSource } from '@/scene/types';

defineProps<{
  source: WebSource;
  reloadKey: number;
}>();
</script>

<template>
  <iframe
    :key="reloadKey"
    :src="source.url"
    :title="source.name"
    class="pointer-events-none h-full w-full border-0"
    :style="{ background: 'transparent', colorScheme: 'light' }"
    sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
    referrerpolicy="no-referrer-when-downgrade"
    loading="lazy"
  ></iframe>
</template>
