<script setup lang="ts">
import { ref } from 'vue';

const emit = defineEmits<{ (e: 'add', url: string): void }>();

const url = ref('');
const error = ref<string | null>(null);

function submit() {
  const trimmed = url.value.trim();
  if (!trimmed) {
    error.value = 'Paste a URL first';
    return;
  }
  let normalized = trimmed;
  if (!/^https?:\/\//i.test(normalized)) {
    normalized = `https://${normalized}`;
  }
  try {
    new URL(normalized);
  } catch {
    error.value = "That doesn't look like a URL";
    return;
  }
  error.value = null;
  emit('add', normalized);
  url.value = '';
}
</script>

<template>
  <form class="flex flex-col gap-1.5" @submit.prevent="submit">
    <div class="flex items-center gap-2">
      <input
        v-model="url"
        type="text"
        autocomplete="off"
        spellcheck="false"
        placeholder="https://overlay.example.com/widget"
        class="flex-1 rounded-md border border-border bg-bg px-2.5 py-1.5 text-sm text-text placeholder:text-faint focus:border-border-strong focus:outline-none"
      />
      <button
        type="submit"
        class="rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-bg transition-colors duration-150 hover:bg-accent-hover"
      >
        Add
      </button>
    </div>
    <p v-if="error" class="text-xs text-red">{{ error }}</p>
  </form>
</template>
