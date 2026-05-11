<script setup lang="ts">
import { computed } from 'vue';
import { useScene } from '@/composables/useScene';
import SourceRow from './SourceRow.vue';
import AddSourceForm from './AddSourceForm.vue';

const { sortedSources, selectedId, addSource, removeSource, updateSource, moveSource } = useScene();

const orderedDescending = computed(() => [...sortedSources.value].reverse());

function onAdd(url: string) {
  addSource(url);
}
</script>

<template>
  <aside class="panel flex h-full w-full flex-col overflow-hidden">
    <header class="flex items-center justify-between border-b border-border px-3 py-2.5">
      <h2 class="text-xs font-medium uppercase tracking-wide text-muted">Sources</h2>
      <span class="font-mono text-[11px] text-faint">{{ sortedSources.length }}</span>
    </header>

    <div class="flex-1 overflow-y-auto px-2 py-2">
      <div v-if="orderedDescending.length === 0" class="px-2 py-4 text-center text-xs text-faint">
        No sources yet.<br />Add one below to begin.
      </div>
      <div v-else class="flex flex-col gap-1">
        <SourceRow
          v-for="(src, i) in orderedDescending"
          :key="src.id"
          :source="src"
          :selected="selectedId === src.id"
          :can-move-up="i > 0"
          :can-move-down="i < orderedDescending.length - 1"
          @select="selectedId = $event"
          @toggle-visible="updateSource($event, { visible: !src.visible })"
          @rename="(id, name) => updateSource(id, { name })"
          @remove="removeSource"
          @move="(id, dir) => moveSource(id, dir === 'up' ? 'down' : 'up')"
        />
      </div>
    </div>

    <div class="border-t border-border bg-bg/40 px-2.5 py-2.5">
      <AddSourceForm @add="onAdd" />
    </div>
  </aside>
</template>
