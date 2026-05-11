<script setup lang="ts">
import { useToast } from '@/composables/useToast';

const { toasts, dismiss } = useToast();

function kindClasses(kind: 'info' | 'success' | 'warn') {
  switch (kind) {
    case 'success':
      return 'border-green/30';
    case 'warn':
      return 'border-amber/40';
    default:
      return 'border-border-strong';
  }
}
</script>

<template>
  <div
    class="pointer-events-none fixed inset-x-0 bottom-4 z-2147482000 flex justify-center px-4"
    aria-live="polite"
    aria-atomic="true"
  >
    <TransitionGroup
      tag="div"
      class="flex w-full max-w-md flex-col items-center gap-2"
      enter-active-class="transition-all duration-200 ease-out"
      leave-active-class="transition-all duration-150 ease-out"
      enter-from-class="opacity-0 translate-y-2"
      leave-to-class="opacity-0 translate-y-2"
    >
      <div
        v-for="t in toasts"
        :key="t.id"
        :class="[
          'pointer-events-auto flex items-center gap-3 rounded-lg border bg-panel px-3 py-2 text-sm text-text shadow-[0_20px_40px_-20px_rgba(0,0,0,0.6)] backdrop-blur',
          kindClasses(t.kind),
        ]"
        role="status"
      >
        <span class="min-w-0 flex-1">{{ t.message }}</span>
        <button
          v-if="t.action"
          type="button"
          class="rounded-md border border-border-strong bg-raised px-2 py-0.5 text-xs font-medium text-text transition-colors hover:bg-hover"
          @click="() => { t.action!.run(); dismiss(t.id); }"
        >
          {{ t.action.label }}
        </button>
        <button
          type="button"
          class="flex h-6 w-6 shrink-0 items-center justify-center rounded text-muted hover:bg-hover hover:text-text"
          aria-label="Dismiss"
          @click="dismiss(t.id)"
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>
