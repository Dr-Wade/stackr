<script setup lang="ts">
import { computed } from 'vue';
import { useScene } from '@/composables/useScene';
import { useToast } from '@/composables/useToast';
import SourceRow from './SourceRow.vue';
import AddSourceMenu from './AddSourceMenu.vue';
import SceneSwitcher from './SceneSwitcher.vue';
import SourceInspector from './SourceInspector.vue';

const {
  sortedSources,
  selectedId,
  removeSource,
  restoreSource,
  duplicateSource,
  updateSource,
  moveSource,
  reloadSource,
  indexOfSource,
} = useScene();
const { push } = useToast();

const orderedDescending = computed(() => [...sortedSources.value].reverse());

function onRemove(id: string) {
  const idx = indexOfSource(id);
  const removed = removeSource(id);
  if (!removed) return;
  push({
    message: `Removed "${removed.name}"`,
    kind: 'info',
    durationMs: 5000,
    action: {
      label: 'Undo',
      run: () => restoreSource(removed, idx),
    },
  });
}

function onReload(id: string) {
  reloadSource(id);
}
</script>

<template>
  <aside class="panel flex h-full w-full flex-col overflow-hidden">
    <div class="border-b border-border px-2.5 py-2.5">
      <SceneSwitcher />
    </div>
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
          @remove="onRemove"
          @move="(id, dir) => moveSource(id, dir === 'up' ? 'down' : 'up')"
          @duplicate="duplicateSource"
          @reload="onReload"
        />
      </div>
    </div>

    <SourceInspector />

    <div class="border-t border-border bg-bg/40 px-2.5 py-2.5">
      <AddSourceMenu />
    </div>
  </aside>
</template>
