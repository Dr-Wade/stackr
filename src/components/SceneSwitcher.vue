<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue';
import { useLibrary } from '@/composables/useLibrary';

const { library, activeScene, setActive, createScene, renameScene, duplicateScene, deleteScene, importSceneFromUrl } = useLibrary();

const open = ref(false);
const importing = ref(false);
const importInput = ref('');
const importError = ref<string | null>(null);
const importInputRef = ref<HTMLInputElement | null>(null);

const renamingId = ref<string | null>(null);
const renameDraft = ref('');
const renameInputRef = ref<HTMLInputElement | null>(null);

const trigger = ref<HTMLButtonElement | null>(null);
const popover = ref<HTMLElement | null>(null);

const scenesSorted = computed(() =>
  [...library.scenes].sort((a, b) => b.updatedAt - a.updatedAt),
);

function close() {
  open.value = false;
  importing.value = false;
  importError.value = null;
  importInput.value = '';
  renamingId.value = null;
}

function onDocClick(e: MouseEvent) {
  if (!open.value) return;
  const t = e.target as Node | null;
  if (popover.value?.contains(t)) return;
  if (trigger.value?.contains(t)) return;
  close();
}

function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape' && open.value) close();
}

onMounted(() => {
  document.addEventListener('mousedown', onDocClick);
  document.addEventListener('keydown', onKey);
});
onBeforeUnmount(() => {
  document.removeEventListener('mousedown', onDocClick);
  document.removeEventListener('keydown', onKey);
});

function pick(id: string) {
  if (renamingId.value === id) return; // ignore clicks while renaming
  setActive(id);
  close();
}

function newScene() {
  createScene();
  close();
}

function startImport() {
  importing.value = true;
  importError.value = null;
  nextTick(() => importInputRef.value?.focus());
}

function submitImport() {
  const result = importSceneFromUrl(importInput.value);
  if (!result.ok) {
    importError.value = result.reason === 'empty'
      ? 'Paste an output URL first.'
      : "That doesn't look like a Stackr URL.";
    return;
  }
  close();
}

function startRename(id: string, currentName: string, e: Event) {
  e.stopPropagation();
  renamingId.value = id;
  renameDraft.value = currentName;
  nextTick(() => renameInputRef.value?.focus());
}

function commitRename(id: string) {
  if (renameDraft.value.trim()) renameScene(id, renameDraft.value);
  renamingId.value = null;
}

function onDuplicate(id: string, e: Event) {
  e.stopPropagation();
  duplicateScene(id);
  close();
}

function onDelete(id: string, e: Event) {
  e.stopPropagation();
  const scene = library.scenes.find((s) => s.id === id);
  if (!scene) return;
  if (library.scenes.length > 1) {
    const confirmed = window.confirm(`Delete "${scene.name}"? This can't be undone.`);
    if (!confirmed) return;
  }
  deleteScene(id);
}
</script>

<template>
  <div class="relative">
    <button
      ref="trigger"
      type="button"
      class="flex w-full items-center justify-between gap-2 rounded-md border border-border bg-bg/40 px-2.5 py-1.5 text-left text-sm text-text transition-colors duration-150 hover:bg-hover"
      :aria-expanded="open"
      aria-haspopup="menu"
      @click="open = !open"
    >
      <span class="flex min-w-0 items-center gap-2">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" class="shrink-0 text-faint">
          <path d="M4 4h6v6H4z" />
          <path d="M14 4h6v6h-6z" />
          <path d="M4 14h6v6H4z" />
          <path d="M14 14h6v6h-6z" />
        </svg>
        <span class="truncate">{{ activeScene.name }}</span>
      </span>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" class="shrink-0 text-muted transition-transform duration-150" :class="{ 'rotate-180': open }">
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </button>

    <Transition
      enter-active-class="transition duration-150 ease-out"
      leave-active-class="transition duration-100 ease-out"
      enter-from-class="opacity-0 -translate-y-1"
      leave-to-class="opacity-0 -translate-y-1"
    >
      <div
        v-if="open"
        ref="popover"
        class="absolute top-full left-0 right-0 z-50 mt-1.5 max-h-[min(60vh,420px)] overflow-hidden rounded-lg border border-border-strong bg-panel shadow-[0_20px_60px_-20px_rgba(0,0,0,0.6)]"
        role="menu"
      >
        <div class="max-h-72 overflow-y-auto px-1.5 py-1.5">
          <div
            v-for="scene in scenesSorted"
            :key="scene.id"
            class="group flex items-center gap-1 rounded-md px-1.5 py-1.5 text-sm transition-colors duration-100"
            :class="scene.id === activeScene.id ? 'bg-accent/10 text-text' : 'text-text hover:bg-hover'"
            role="menuitem"
            @click="pick(scene.id)"
          >
            <span
              class="flex h-4 w-4 shrink-0 items-center justify-center"
              :class="scene.id === activeScene.id ? 'text-accent' : 'text-transparent'"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </span>
            <input
              v-if="renamingId === scene.id"
              ref="renameInputRef"
              v-model="renameDraft"
              type="text"
              class="min-w-0 flex-1 rounded bg-bg px-1 py-0.5 text-sm text-text outline-none focus:ring-1 focus:ring-accent-ring"
              @click.stop
              @blur="commitRename(scene.id)"
              @keydown.enter="commitRename(scene.id)"
              @keydown.escape="renamingId = null"
            />
            <span v-else class="min-w-0 flex-1 truncate">{{ scene.name }}</span>

            <div class="flex shrink-0 items-center opacity-0 transition-opacity group-hover:opacity-100">
              <button
                type="button"
                class="flex h-6 w-6 items-center justify-center rounded text-muted hover:bg-raised hover:text-text"
                aria-label="Rename"
                title="Rename"
                @click="(e) => startRename(scene.id, scene.name, e)"
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                </svg>
              </button>
              <button
                type="button"
                class="flex h-6 w-6 items-center justify-center rounded text-muted hover:bg-raised hover:text-text"
                aria-label="Duplicate"
                title="Duplicate"
                @click="(e) => onDuplicate(scene.id, e)"
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
              </button>
              <button
                type="button"
                class="flex h-6 w-6 items-center justify-center rounded text-muted hover:bg-raised hover:text-red"
                aria-label="Delete"
                title="Delete"
                @click="(e) => onDelete(scene.id, e)"
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div class="border-t border-border bg-bg/40 p-1.5">
          <template v-if="!importing">
            <button
              type="button"
              class="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-text transition-colors hover:bg-hover"
              @click="newScene"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" class="text-muted">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              <span>New scene</span>
            </button>
            <button
              type="button"
              class="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-text transition-colors hover:bg-hover"
              @click="startImport"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" class="text-muted">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              <span>Import from URL</span>
            </button>
          </template>
          <form v-else class="flex flex-col gap-1.5 p-1" @submit.prevent="submitImport">
            <label class="text-[11px] font-medium uppercase tracking-wide text-faint">
              Paste an output URL
            </label>
            <input
              ref="importInputRef"
              v-model="importInput"
              type="text"
              autocomplete="off"
              spellcheck="false"
              placeholder="https://…/view#…"
              class="w-full rounded-md border border-border bg-bg px-2 py-1.5 font-mono text-[12px] text-text placeholder:text-faint focus:border-border-strong focus:outline-none"
            />
            <p v-if="importError" class="text-xs text-red">{{ importError }}</p>
            <div class="flex justify-end gap-1.5">
              <button
                type="button"
                class="rounded-md px-2 py-1 text-xs text-muted hover:text-text"
                @click="importing = false; importError = null"
              >
                Cancel
              </button>
              <button
                type="submit"
                class="rounded-md bg-accent px-2.5 py-1 text-xs font-medium text-bg transition-colors hover:bg-accent-hover"
              >
                Import
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </div>
</template>
