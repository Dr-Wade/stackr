<script setup lang="ts">
import { computed } from 'vue';
import type { TextSpec } from '@/scene/types';
import { CURATED_FONTS } from '@/scene/fonts';

const props = defineProps<{ style: Omit<TextSpec, 'content'> }>();
const emit = defineEmits<{ (e: 'patch', patch: Partial<Omit<TextSpec, 'content'>>): void }>();

const weights = [300, 400, 500, 600, 700, 800] as const;
const aligns: Array<TextSpec['align']> = ['left', 'center', 'right'];

const isCurated = computed(() =>
  (CURATED_FONTS as readonly string[]).includes(props.style.font),
);
const customFont = computed({
  get: () => (isCurated.value ? '' : props.style.font),
  set: (v: string) => emit('patch', { font: v }),
});

function onFontDropdown(e: Event) {
  const val = (e.target as HTMLSelectElement).value;
  if (val === '__custom__') {
    // user picks "Other…" → switch to a placeholder string they'll overwrite
    emit('patch', { font: '' });
  } else {
    emit('patch', { font: val });
  }
}

function onShadow<K extends keyof TextSpec['shadow']>(key: K, val: TextSpec['shadow'][K]) {
  emit('patch', { shadow: { ...props.style.shadow, [key]: val } });
}

function onOutline<K extends keyof TextSpec['outline']>(key: K, val: TextSpec['outline'][K]) {
  emit('patch', { outline: { ...props.style.outline, [key]: val } });
}
</script>

<template>
  <div class="space-y-2.5">
    <!-- Font -->
    <label class="block space-y-1">
      <span class="text-[11px] font-medium uppercase tracking-wide text-faint">Font</span>
      <select
        :value="isCurated ? style.font : '__custom__'"
        class="w-full rounded bg-bg px-2 py-1 text-xs text-text outline-none focus:ring-1 focus:ring-accent-ring"
        @change="onFontDropdown"
      >
        <option v-for="f in CURATED_FONTS" :key="f" :value="f">{{ f }}</option>
        <option value="__custom__">Other…</option>
      </select>
      <input
        v-if="!isCurated"
        v-model="customFont"
        type="text"
        placeholder="Any Bunny/Google font name"
        class="mt-1 w-full rounded bg-bg px-2 py-1 font-mono text-[11px] text-text outline-none focus:ring-1 focus:ring-accent-ring"
      />
    </label>

    <!-- Size + weight -->
    <div class="grid grid-cols-2 gap-2">
      <label class="space-y-1">
        <span class="text-[11px] font-medium uppercase tracking-wide text-faint">Size</span>
        <input
          type="number"
          min="8"
          max="400"
          step="1"
          :value="style.size"
          class="w-full rounded bg-bg px-2 py-1 font-mono text-[12px] text-text outline-none focus:ring-1 focus:ring-accent-ring"
          @input="(e) => emit('patch', { size: parseInt((e.target as HTMLInputElement).value, 10) || 8 })"
        />
      </label>
      <label class="space-y-1">
        <span class="text-[11px] font-medium uppercase tracking-wide text-faint">Color</span>
        <div class="flex items-center gap-1.5">
          <input
            type="color"
            :value="style.color"
            class="h-7 w-7 cursor-pointer rounded bg-bg"
            @input="(e) => emit('patch', { color: (e.target as HTMLInputElement).value })"
          />
          <input
            type="text"
            :value="style.color"
            class="min-w-0 flex-1 rounded bg-bg px-1.5 py-1 font-mono text-[11px] text-text outline-none focus:ring-1 focus:ring-accent-ring"
            @input="(e) => emit('patch', { color: (e.target as HTMLInputElement).value })"
          />
        </div>
      </label>
    </div>

    <!-- Weight -->
    <div class="space-y-1">
      <span class="text-[11px] font-medium uppercase tracking-wide text-faint">Weight</span>
      <div class="flex gap-0.5 rounded bg-bg p-0.5">
        <button
          v-for="w in weights"
          :key="w"
          type="button"
          class="flex-1 rounded px-1 py-0.5 text-[11px] transition-colors"
          :class="style.weight === w ? 'bg-accent text-bg' : 'text-muted hover:text-text'"
          @click="emit('patch', { weight: w })"
        >{{ w }}</button>
      </div>
    </div>

    <!-- Alignment -->
    <div class="space-y-1">
      <span class="text-[11px] font-medium uppercase tracking-wide text-faint">Align</span>
      <div class="flex gap-0.5 rounded bg-bg p-0.5">
        <button
          v-for="a in aligns"
          :key="a"
          type="button"
          class="flex-1 rounded px-1 py-1 text-[11px] capitalize transition-colors"
          :class="style.align === a ? 'bg-accent text-bg' : 'text-muted hover:text-text'"
          @click="emit('patch', { align: a })"
        >{{ a }}</button>
      </div>
    </div>

    <!-- Letter spacing -->
    <label class="block space-y-1">
      <span class="text-[11px] font-medium uppercase tracking-wide text-faint">Letter spacing</span>
      <input
        type="number"
        min="-4"
        max="16"
        step="0.5"
        :value="style.letterSpacing"
        class="w-full rounded bg-bg px-2 py-1 font-mono text-[12px] text-text outline-none focus:ring-1 focus:ring-accent-ring"
        @input="(e) => emit('patch', { letterSpacing: parseFloat((e.target as HTMLInputElement).value) || 0 })"
      />
    </label>

    <!-- Shadow -->
    <div class="space-y-1.5 rounded-md border border-border bg-bg/40 px-2 py-1.5">
      <label class="flex items-center gap-2 text-xs text-text">
        <input
          type="checkbox"
          :checked="style.shadow.enabled"
          class="accent-accent"
          @change="(e) => onShadow('enabled', (e.target as HTMLInputElement).checked)"
        />
        <span>Shadow</span>
      </label>
      <div v-if="style.shadow.enabled" class="grid grid-cols-3 gap-1.5">
        <label class="space-y-0.5">
          <span class="text-[10px] uppercase text-faint">Color</span>
          <input
            type="color"
            :value="style.shadow.color.startsWith('#') ? style.shadow.color : '#000000'"
            class="h-6 w-full cursor-pointer rounded"
            @input="(e) => onShadow('color', (e.target as HTMLInputElement).value)"
          />
        </label>
        <label class="space-y-0.5">
          <span class="text-[10px] uppercase text-faint">Blur</span>
          <input
            type="number"
            min="0"
            max="60"
            :value="style.shadow.blur"
            class="w-full rounded bg-bg px-1 py-0.5 font-mono text-[11px] text-text outline-none"
            @input="(e) => onShadow('blur', parseFloat((e.target as HTMLInputElement).value) || 0)"
          />
        </label>
        <label class="space-y-0.5">
          <span class="text-[10px] uppercase text-faint">Y</span>
          <input
            type="number"
            min="-30"
            max="30"
            :value="style.shadow.offsetY"
            class="w-full rounded bg-bg px-1 py-0.5 font-mono text-[11px] text-text outline-none"
            @input="(e) => onShadow('offsetY', parseFloat((e.target as HTMLInputElement).value) || 0)"
          />
        </label>
      </div>
    </div>

    <!-- Outline -->
    <div class="space-y-1.5 rounded-md border border-border bg-bg/40 px-2 py-1.5">
      <label class="flex items-center gap-2 text-xs text-text">
        <input
          type="checkbox"
          :checked="style.outline.enabled"
          class="accent-accent"
          @change="(e) => onOutline('enabled', (e.target as HTMLInputElement).checked)"
        />
        <span>Outline</span>
      </label>
      <div v-if="style.outline.enabled" class="grid grid-cols-2 gap-1.5">
        <label class="space-y-0.5">
          <span class="text-[10px] uppercase text-faint">Color</span>
          <input
            type="color"
            :value="style.outline.color"
            class="h-6 w-full cursor-pointer rounded"
            @input="(e) => onOutline('color', (e.target as HTMLInputElement).value)"
          />
        </label>
        <label class="space-y-0.5">
          <span class="text-[10px] uppercase text-faint">Width</span>
          <input
            type="number"
            min="0.5"
            max="20"
            step="0.5"
            :value="style.outline.width"
            class="w-full rounded bg-bg px-1 py-0.5 font-mono text-[11px] text-text outline-none"
            @input="(e) => onOutline('width', parseFloat((e.target as HTMLInputElement).value) || 0)"
          />
        </label>
      </div>
    </div>
  </div>
</template>
