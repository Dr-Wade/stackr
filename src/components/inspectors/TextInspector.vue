<script setup lang="ts">
import type { TextSource, TextSpec } from '@/scene/types';
import TextStyleControls from './TextStyleControls.vue';

const props = defineProps<{ source: TextSource }>();
const emit = defineEmits<{ (e: 'patch', patch: Partial<TextSource>): void }>();

function patchText(text: Partial<TextSpec>) {
  emit('patch', { text: { ...props.source.text, ...text } });
}

function patchStyle(style: Partial<Omit<TextSpec, 'content'>>) {
  patchText(style as Partial<TextSpec>);
}
</script>

<template>
  <div class="space-y-2.5">
    <label class="block space-y-1">
      <span class="text-[11px] font-medium uppercase tracking-wide text-faint">Content</span>
      <textarea
        :value="source.text.content"
        rows="2"
        class="w-full resize-y rounded bg-bg px-2 py-1.5 text-sm text-text outline-none focus:ring-1 focus:ring-accent-ring"
        @input="(e) => patchText({ content: (e.target as HTMLTextAreaElement).value })"
      ></textarea>
    </label>

    <TextStyleControls :style="source.text" @patch="patchStyle" />
  </div>
</template>
