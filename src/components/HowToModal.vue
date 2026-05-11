<script setup lang="ts">
import { onMounted, onBeforeUnmount, watch } from 'vue';

const props = defineProps<{ open: boolean }>();
const emit = defineEmits<{ (e: 'close'): void }>();

function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape' && props.open) emit('close');
}

onMounted(() => window.addEventListener('keydown', onKey));
onBeforeUnmount(() => window.removeEventListener('keydown', onKey));

watch(
  () => props.open,
  (v) => {
    document.body.style.overflow = v ? 'hidden' : '';
  },
);
</script>

<template>
  <Transition
    enter-active-class="transition-opacity duration-150 ease-out"
    leave-active-class="transition-opacity duration-100 ease-out"
    enter-from-class="opacity-0"
    leave-to-class="opacity-0"
  >
    <div
      v-if="open"
      class="fixed inset-0 z-2147483000 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="howto-title"
      @click.self="emit('close')"
    >
      <div
        class="panel relative flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden"
      >
        <header class="flex shrink-0 items-center justify-between border-b border-border px-5 py-3.5">
          <h2 id="howto-title" class="text-sm font-semibold tracking-tight text-text">
            How to use Stackr
          </h2>
          <button
            type="button"
            class="flex h-7 w-7 items-center justify-center rounded-md text-muted transition-colors hover:bg-hover hover:text-text"
            aria-label="Close"
            @click="emit('close')"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </header>

        <div class="flex-1 space-y-6 overflow-y-auto px-5 py-5 text-sm leading-relaxed text-muted">
          <section class="space-y-2">
            <h3 class="text-xs font-medium uppercase tracking-wide text-faint">
              The idea
            </h3>
            <p>
              Stackr is a tiny browser-based scene compositor for web overlays — like the
              browser-source side of OBS, minus the video encoding. Add URLs, position
              them on a 1920×1080 canvas, and copy a single output URL that renders the
              whole stack composited together.
            </p>
          </section>

          <section class="space-y-2">
            <h3 class="text-xs font-medium uppercase tracking-wide text-faint">
              Building a scene
            </h3>
            <ol class="list-decimal space-y-1.5 pl-5">
              <li>
                <span class="text-text">Paste a URL</span> into the field at the bottom
                of the sidebar and press <kbd class="rounded bg-raised px-1.5 py-0.5 font-mono text-[11px] text-text">Add</kbd>.
              </li>
              <li>
                <span class="text-text">Drag</span> the source on the canvas to reposition
                it; drag the bottom-right corner to resize.
              </li>
              <li>
                <span class="text-text">Reorder, rename, hide, or remove</span> sources
                from the sidebar. Sources higher in the list render on top.
              </li>
              <li>
                <span class="text-text">Click a source row</span> to select it on the
                canvas — useful when it's hidden under a larger overlay.
              </li>
            </ol>
          </section>

          <section class="space-y-2">
            <h3 class="text-xs font-medium uppercase tracking-wide text-faint">
              Using the output URL
            </h3>
            <p>
              The bar at the bottom shows a long URL containing your entire scene encoded
              into the hash. Copy it and paste it as a
              <span class="text-text">Browser Source in OBS</span> (or any tool that
              accepts a URL) at 1920×1080. There's no server and no account — the URL
              <em>is</em> the scene.
            </p>
            <p class="text-faint">
              Re-opening Stackr in the same browser restores your last scene
              automatically. To edit the same scene elsewhere, just open the output URL —
              it's self-contained.
            </p>
          </section>

          <section class="space-y-2">
            <h3 class="text-xs font-medium uppercase tracking-wide text-faint">
              Transparency
            </h3>
            <p>
              For overlays to composite cleanly, the source page itself must declare a
              transparent background. Purpose-built overlay services
              (<span class="font-mono text-[12px] text-text">StreamElements</span>,
              <span class="font-mono text-[12px] text-text">Streamlabs</span>,
              custom OBS widgets) already do this.
            </p>
            <p>
              Arbitrary websites paint their own background and will render as opaque
              boxes — that's a limitation of cross-origin iframes, not something Stackr
              can override.
            </p>
          </section>

          <section class="space-y-2">
            <h3 class="text-xs font-medium uppercase tracking-wide text-faint">
              Limitations to know
            </h3>
            <ul class="list-disc space-y-1.5 pl-5">
              <li>
                <span class="text-text">No audio routing.</span> This is a visual
                compositor; audio plays inline from each source.
              </li>
              <li>
                <span class="text-text">Cross-origin restrictions apply.</span> Sites
                that block embedding (via
                <span class="font-mono text-[12px] text-text">X-Frame-Options</span> or
                <span class="font-mono text-[12px] text-text">CSP frame-ancestors</span>)
                will not render. Most overlay providers explicitly allow embedding.
              </li>
              <li>
                <span class="text-text">Scenes are local to your browser.</span> If you
                clear site data, your in-progress scene is gone — but as long as you
                copied the output URL somewhere, you can re-import it.
              </li>
              <li>
                <span class="text-text">The output URL changes</span> every time you
                tweak the scene. Copy a fresh one and update your OBS source after
                edits — it's a "publish" step, not a live link.
              </li>
            </ul>
          </section>
        </div>

        <footer class="flex shrink-0 items-center justify-end border-t border-border px-5 py-3">
          <button
            type="button"
            class="rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-bg transition-colors duration-150 hover:bg-accent-hover"
            @click="emit('close')"
          >
            Got it
          </button>
        </footer>
      </div>
    </div>
  </Transition>
</template>
