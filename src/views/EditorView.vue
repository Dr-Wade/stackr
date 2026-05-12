<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
import SourceList from '@/components/SourceList.vue';
import CanvasPreview from '@/components/CanvasPreview.vue';
import OutputUrlBar from '@/components/OutputUrlBar.vue';
import HowToModal from '@/components/HowToModal.vue';
import ToastContainer from '@/components/ToastContainer.vue';
import { useScene, type NudgeStep } from '@/composables/useScene';
import { useToast } from '@/composables/useToast';
import { useOutputUrl } from '@/composables/useOutputUrl';
import { useClipboard } from '@vueuse/core';

const howToOpen = ref(false);

const { selectedId, removeSource, restoreSource, duplicateSource, nudgeSelected, indexOfSource } = useScene();
const { push } = useToast();
const { outputUrl } = useOutputUrl();
const { copy } = useClipboard({ legacy: true });

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName.toLowerCase();
  if (tag === 'input' || tag === 'textarea' || tag === 'select') return true;
  if (target.isContentEditable) return true;
  return false;
}

function step(e: KeyboardEvent): NudgeStep {
  if (e.shiftKey) return 'fine';
  if (e.altKey) return 'coarse';
  return 'normal';
}

function onKey(e: KeyboardEvent) {
  // Allow modal/dialog code to handle Escape themselves
  if (howToOpen.value) return;
  if (isTypingTarget(e.target)) return;

  const meta = e.metaKey || e.ctrlKey;

  // Cmd/Ctrl+S → copy output URL (no save dialog, please)
  if (meta && e.key.toLowerCase() === 's') {
    e.preventDefault();
    copy(outputUrl.value);
    push({ message: 'Output URL copied', kind: 'success', durationMs: 2000 });
    return;
  }

  // Cmd/Ctrl+D → duplicate selected
  if (meta && e.key.toLowerCase() === 'd') {
    if (!selectedId.value) return;
    e.preventDefault();
    duplicateSource(selectedId.value);
    return;
  }

  if (!selectedId.value) return;

  switch (e.key) {
    case 'Escape':
      e.preventDefault();
      selectedId.value = null;
      return;
    case 'Delete':
    case 'Backspace': {
      e.preventDefault();
      const id = selectedId.value;
      const idx = indexOfSource(id);
      const removed = removeSource(id);
      if (removed) {
        push({
          message: `Removed "${removed.name}"`,
          kind: 'info',
          durationMs: 5000,
          action: { label: 'Undo', run: () => restoreSource(removed, idx) },
        });
      }
      return;
    }
    case 'ArrowLeft':
      e.preventDefault();
      nudgeSelected(-1, 0, step(e));
      return;
    case 'ArrowRight':
      e.preventDefault();
      nudgeSelected(1, 0, step(e));
      return;
    case 'ArrowUp':
      e.preventDefault();
      nudgeSelected(0, -1, step(e));
      return;
    case 'ArrowDown':
      e.preventDefault();
      nudgeSelected(0, 1, step(e));
      return;
  }
}

onMounted(() => window.addEventListener('keydown', onKey));
onBeforeUnmount(() => window.removeEventListener('keydown', onKey));
</script>

<template>
  <div class="flex h-full w-full flex-col gap-3 p-3">
    <header class="flex items-center justify-between px-1">
      <div class="flex items-center gap-2">
        <span class="inline-flex h-6 w-6 items-center justify-center rounded-md bg-accent text-bg">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="4" y="4" width="13" height="8" rx="1.5" />
            <rect x="7" y="9" width="13" height="8" rx="1.5" fill="currentColor" fill-opacity="0.25" />
            <rect x="10" y="14" width="11" height="7" rx="1.5" fill="currentColor" />
          </svg>
        </span>
        <h1 class="text-sm font-semibold tracking-tight text-text">Stackr</h1>
        <span class="font-mono text-[11px] text-faint">v0.3</span>
      </div>
      <button
        type="button"
        class="flex items-center gap-1.5 rounded-md border border-border-strong bg-raised px-2.5 py-1 text-xs text-text transition-colors duration-150 hover:bg-hover"
        @click="howToOpen = true"
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
        <span>How-To</span>
      </button>
    </header>

    <HowToModal :open="howToOpen" @close="howToOpen = false" />
    <ToastContainer />

    <div class="grid min-h-0 flex-1 grid-cols-1 gap-3 lg:grid-cols-[280px_1fr]">
      <SourceList />
      <main class="panel min-h-0 overflow-hidden">
        <CanvasPreview />
      </main>
    </div>

    <OutputUrlBar />
  </div>
</template>
