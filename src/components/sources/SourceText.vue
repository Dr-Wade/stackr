<script setup lang="ts">
import { computed, inject, onMounted, watch } from 'vue';
import type { TextSource, TextSpec } from '@/scene/types';
import { ensureFont, fontFamilyValue } from '@/composables/useFonts';

const props = defineProps<{ source: TextSource }>();

// canvasScale = current canvas height in screen pixels / 1080.
// Provided by CanvasPreview (editor) and OutputView (= 1, native).
const canvasScale = inject<{ value: number }>('canvasScale', { value: 1 });

const style = computed(() => sourceTextStyle(props.source.text, canvasScale.value));

onMounted(() => ensureFont(props.source.text.font));
watch(() => props.source.text.font, (f) => ensureFont(f));
</script>

<script lang="ts">
export function sourceTextStyle(text: TextSpec, scale = 1) {
  const sizePx = text.size * scale;
  const shadow = text.shadow.enabled
    ? `0 ${text.shadow.offsetY * scale}px ${text.shadow.blur * scale}px ${text.shadow.color}`
    : undefined;
  return {
    fontFamily: fontFamilyValue(text.font),
    fontSize: `${sizePx}px`,
    fontWeight: text.weight,
    color: text.color,
    textAlign: text.align,
    letterSpacing: `${text.letterSpacing * scale}px`,
    textShadow: shadow,
    WebkitTextStrokeWidth: text.outline.enabled ? `${text.outline.width * scale}px` : '0',
    WebkitTextStrokeColor: text.outline.color,
    paintOrder: 'stroke fill',
    lineHeight: 1.1,
  } as Record<string, string | number | undefined>;
}
</script>

<template>
  <div
    class="pointer-events-none flex h-full w-full items-center"
    :class="{
      'justify-start': source.text.align === 'left',
      'justify-center': source.text.align === 'center',
      'justify-end': source.text.align === 'right',
    }"
  >
    <div class="w-full whitespace-pre-wrap break-words" :style="style">
      {{ source.text.content }}
    </div>
  </div>
</template>
