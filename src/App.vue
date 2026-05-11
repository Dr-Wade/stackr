<script setup lang="ts">
import { useRoute } from 'vue-router';
import { computed } from 'vue';

const route = useRoute();
const isOutput = computed(() => route.path === '/view');
</script>

<template>
  <div :class="isOutput ? 'h-full bg-transparent' : 'h-full bg-bg text-text'">
    <RouterView />
  </div>
</template>
