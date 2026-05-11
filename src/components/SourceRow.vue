<script setup lang="ts">
import { computed, nextTick, ref } from 'vue';
import type { Source } from '@/scene/types';
import { usePreflight } from '@/composables/usePreflight';

const props = defineProps<{
  source: Source;
  selected: boolean;
  canMoveUp: boolean;
  canMoveDown: boolean;
}>();

const emit = defineEmits<{
  (e: 'select', id: string): void;
  (e: 'toggle-visible', id: string): void;
  (e: 'rename', id: string, name: string): void;
  (e: 'remove', id: string): void;
  (e: 'move', id: string, dir: 'up' | 'down'): void;
  (e: 'duplicate', id: string): void;
  (e: 'reload', id: string): void;
}>();

const { status } = usePreflight();
const preflightStatus = computed(() => status[props.source.id] ?? 'unknown');

const editing = ref(false);
const draftName = ref(props.source.name);
const nameInput = ref<HTMLInputElement | null>(null);

function startEdit() {
  draftName.value = props.source.name;
  editing.value = true;
  nextTick(() => nameInput.value?.focus());
}
function commit() {
  const name = draftName.value.trim() || props.source.name;
  emit('rename', props.source.id, name);
  editing.value = false;
}

function openInNewTab(e: Event) {
  e.stopPropagation();
  window.open(props.source.url, '_blank', 'noopener,noreferrer');
}
</script>

<template>
  <div
    :class="[
      'group flex items-center gap-2 rounded-md border px-2 py-1.5 transition-colors duration-150',
      selected
        ? 'border-accent/40 bg-accent/8'
        : 'border-transparent hover:bg-hover/60',
    ]"
    @click="emit('select', source.id)"
  >
    <button
      type="button"
      class="flex h-6 w-6 shrink-0 items-center justify-center rounded text-muted transition-colors hover:bg-raised hover:text-text"
      :aria-label="source.visible ? 'Hide source' : 'Show source'"
      :title="source.visible ? 'Hide' : 'Show'"
      @click.stop="emit('toggle-visible', source.id)"
    >
      <svg v-if="source.visible" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
      <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-faint">
        <path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-6.5 0-10-7-10-7a18.78 18.78 0 0 1 4.06-5.06M9.9 4.24A10.94 10.94 0 0 1 12 4c6.5 0 10 7 10 7a18.66 18.66 0 0 1-2.16 3.19" />
        <line x1="1" y1="1" x2="23" y2="23" />
      </svg>
    </button>

    <div class="min-w-0 flex-1">
      <div class="flex items-center gap-1.5">
        <input
          v-if="editing"
          ref="nameInput"
          v-model="draftName"
          type="text"
          class="min-w-0 flex-1 rounded bg-bg px-1 py-0.5 text-sm text-text outline-none focus:ring-1 focus:ring-accent-ring"
          @click.stop
          @blur="commit"
          @keydown.enter="commit"
          @keydown.escape="editing = false"
        />
        <button
          v-else
          type="button"
          class="min-w-0 flex-1 truncate text-left text-sm text-text"
          @click.stop="startEdit"
        >
          {{ source.name }}
        </button>
        <button
          v-if="preflightStatus === 'refused'"
          type="button"
          class="flex h-5 items-center gap-1 rounded bg-amber/15 px-1.5 text-[10px] font-medium text-amber transition-colors hover:bg-amber/25"
          title="This site may refuse embedding. Click to test in a new tab."
          aria-label="Embedding warning — test in new tab"
          @click="openInNewTab"
        >
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          <span>blocked?</span>
        </button>
        <span
          v-else-if="preflightStatus === 'pending'"
          class="h-2 w-2 shrink-0 animate-pulse rounded-full bg-faint"
          title="Checking embedding…"
        ></span>
      </div>
      <p class="truncate font-mono text-[11px] text-faint">{{ source.url }}</p>
    </div>

    <div class="flex shrink-0 items-center opacity-0 transition-opacity group-hover:opacity-100" :class="{ '!opacity-100': selected }">
      <button
        type="button"
        class="flex h-6 w-6 items-center justify-center rounded text-muted hover:bg-raised hover:text-text"
        aria-label="Reload"
        title="Reload"
        @click.stop="emit('reload', source.id)"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="23 4 23 10 17 10" />
          <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
        </svg>
      </button>
      <button
        type="button"
        class="flex h-6 w-6 items-center justify-center rounded text-muted hover:bg-raised hover:text-text"
        aria-label="Duplicate"
        title="Duplicate"
        @click.stop="emit('duplicate', source.id)"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="9" y="9" width="13" height="13" rx="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
      </button>
      <button
        type="button"
        class="flex h-6 w-6 items-center justify-center rounded text-muted hover:bg-raised hover:text-text disabled:opacity-30"
        :disabled="!canMoveUp"
        aria-label="Move up"
        title="Move up"
        @click.stop="emit('move', source.id, 'up')"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="18 15 12 9 6 15" />
        </svg>
      </button>
      <button
        type="button"
        class="flex h-6 w-6 items-center justify-center rounded text-muted hover:bg-raised hover:text-text disabled:opacity-30"
        :disabled="!canMoveDown"
        aria-label="Move down"
        title="Move down"
        @click.stop="emit('move', source.id, 'down')"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      <button
        type="button"
        class="flex h-6 w-6 items-center justify-center rounded text-muted hover:bg-raised hover:text-red"
        aria-label="Remove source"
        title="Remove"
        @click.stop="emit('remove', source.id)"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  </div>
</template>
