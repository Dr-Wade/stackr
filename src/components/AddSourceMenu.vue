<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue';
import { useScene } from '@/composables/useScene';

const { addSource } = useScene();

const open = ref(false);
const webMode = ref(false);
const url = ref('');
const urlError = ref<string | null>(null);
const urlInputRef = ref<HTMLInputElement | null>(null);

const trigger = ref<HTMLButtonElement | null>(null);
const popover = ref<HTMLElement | null>(null);

function close() {
  open.value = false;
  webMode.value = false;
  url.value = '';
  urlError.value = null;
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

function startWeb() {
  webMode.value = true;
  nextTick(() => urlInputRef.value?.focus());
}

function submitWeb() {
  const trimmed = url.value.trim();
  if (!trimmed) {
    urlError.value = 'Paste a URL first';
    return;
  }
  let normalized = trimmed;
  if (!/^https?:\/\//i.test(normalized)) normalized = `https://${normalized}`;
  try {
    new URL(normalized);
  } catch {
    urlError.value = "That doesn't look like a URL";
    return;
  }
  addSource({ type: 'web', url: normalized });
  close();
}

function quickAdd(type: 'text' | 'timer' | 'rect' | 'qr') {
  // Switch so each call site picks the right overload.
  switch (type) {
    case 'text':
      addSource({ type: 'text' });
      break;
    case 'timer':
      addSource({ type: 'timer' });
      break;
    case 'rect':
      addSource({ type: 'rect' });
      break;
    case 'qr':
      addSource({ type: 'qr' });
      break;
  }
  close();
}

function quickAddImage() {
  // For images we still need a URL — open a tiny prompt inline. Easiest UX:
  // pre-fill an empty URL, the inspector lets the user paste / change it.
  addSource({ type: 'image', url: '' });
  close();
}
</script>

<template>
  <div class="relative">
    <button
      ref="trigger"
      type="button"
      class="flex w-full items-center justify-center gap-1.5 rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-bg transition-colors duration-150 hover:bg-accent-hover"
      :aria-expanded="open"
      aria-haspopup="menu"
      @click="open = !open"
    >
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
      </svg>
      <span>Add source</span>
    </button>

    <Transition
      enter-active-class="transition duration-150 ease-out"
      leave-active-class="transition duration-100 ease-out"
      enter-from-class="opacity-0 translate-y-1"
      leave-to-class="opacity-0 translate-y-1"
    >
      <div
        v-if="open"
        ref="popover"
        class="absolute bottom-full left-0 right-0 z-50 mb-1.5 overflow-hidden rounded-lg border border-border-strong bg-panel shadow-[0_-20px_60px_-20px_rgba(0,0,0,0.6)]"
        role="menu"
      >
        <div v-if="!webMode" class="p-1.5">
          <button
            type="button"
            class="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-text transition-colors hover:bg-hover"
            @click="startWeb"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-muted">
              <circle cx="12" cy="12" r="10" />
              <line x1="2" y1="12" x2="22" y2="12" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
            <span class="flex-1">Web source</span>
            <span class="text-[11px] text-faint">URL</span>
          </button>
          <button
            type="button"
            class="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-text transition-colors hover:bg-hover"
            @click="quickAdd('text')"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-muted">
              <polyline points="4 7 4 4 20 4 20 7" />
              <line x1="9" y1="20" x2="15" y2="20" />
              <line x1="12" y1="4" x2="12" y2="20" />
            </svg>
            <span>Text</span>
          </button>
          <button
            type="button"
            class="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-text transition-colors hover:bg-hover"
            @click="quickAdd('timer')"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-muted">
              <circle cx="12" cy="13" r="8" />
              <polyline points="12 9 12 13 14 15" />
              <line x1="9" y1="2" x2="15" y2="2" />
            </svg>
            <span>Timer / clock</span>
          </button>
          <button
            type="button"
            class="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-text transition-colors hover:bg-hover"
            @click="quickAddImage"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-muted">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
            <span>Image</span>
          </button>
          <button
            type="button"
            class="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-text transition-colors hover:bg-hover"
            @click="quickAdd('rect')"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-muted">
              <rect x="3" y="6" width="18" height="12" rx="2" />
            </svg>
            <span>Rectangle</span>
          </button>
          <button
            type="button"
            class="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-text transition-colors hover:bg-hover"
            @click="quickAdd('qr')"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-muted">
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
              <line x1="14" y1="14" x2="21" y2="14" />
              <line x1="14" y1="21" x2="21" y2="21" />
              <line x1="17.5" y1="17.5" x2="17.5" y2="21" />
            </svg>
            <span>QR code</span>
          </button>
        </div>

        <form v-else class="flex flex-col gap-1.5 p-2" @submit.prevent="submitWeb">
          <label class="text-[11px] font-medium uppercase tracking-wide text-faint">
            Web source URL
          </label>
          <input
            ref="urlInputRef"
            v-model="url"
            type="text"
            autocomplete="off"
            spellcheck="false"
            placeholder="https://overlay.example.com/widget"
            class="w-full rounded-md border border-border bg-bg px-2 py-1.5 text-sm text-text placeholder:text-faint focus:border-border-strong focus:outline-none"
          />
          <p v-if="urlError" class="text-xs text-red">{{ urlError }}</p>
          <div class="flex justify-end gap-1.5">
            <button
              type="button"
              class="rounded-md px-2 py-1 text-xs text-muted hover:text-text"
              @click="webMode = false; urlError = null"
            >
              Back
            </button>
            <button
              type="submit"
              class="rounded-md bg-accent px-2.5 py-1 text-xs font-medium text-bg transition-colors hover:bg-accent-hover"
            >
              Add
            </button>
          </div>
        </form>
      </div>
    </Transition>
  </div>
</template>
