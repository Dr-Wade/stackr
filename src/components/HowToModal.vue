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
                it; drag any edge or corner to resize. Sources
                <span class="text-text">snap</span> to canvas edges, the centre, and
                other sources — hold
                <kbd class="rounded bg-raised px-1.5 py-0.5 font-mono text-[11px] text-text">Alt</kbd>
                to disable snapping.
              </li>
              <li>
                Use the <span class="text-text">inspector</span> in the sidebar to set
                exact percentages and adjust opacity.
              </li>
              <li>
                <span class="text-text">Reorder, rename, hide, duplicate, reload, or remove</span>
                sources from the sidebar. Sources higher in the list render on top.
              </li>
              <li>
                <span class="text-text">Click a source row</span> to select it on the
                canvas — useful when it's hidden under a larger overlay.
              </li>
            </ol>
          </section>

          <section class="space-y-2">
            <h3 class="text-xs font-medium uppercase tracking-wide text-faint">
              Keyboard shortcuts
            </h3>
            <dl class="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 text-sm">
              <dt class="font-mono text-[11px] text-text">
                <kbd class="rounded bg-raised px-1.5 py-0.5">←</kbd>
                <kbd class="rounded bg-raised px-1.5 py-0.5">→</kbd>
                <kbd class="rounded bg-raised px-1.5 py-0.5">↑</kbd>
                <kbd class="rounded bg-raised px-1.5 py-0.5">↓</kbd>
              </dt>
              <dd>Nudge the selected source. Hold
                <kbd class="rounded bg-raised px-1.5 py-0.5 font-mono text-[11px] text-text">Shift</kbd>
                for fine,
                <kbd class="rounded bg-raised px-1.5 py-0.5 font-mono text-[11px] text-text">Alt</kbd>
                for coarse.
              </dd>
              <dt class="font-mono text-[11px] text-text">
                <kbd class="rounded bg-raised px-1.5 py-0.5">⌘</kbd>
                <kbd class="rounded bg-raised px-1.5 py-0.5">D</kbd>
              </dt>
              <dd>Duplicate the selected source.</dd>
              <dt class="font-mono text-[11px] text-text">
                <kbd class="rounded bg-raised px-1.5 py-0.5">⌘</kbd>
                <kbd class="rounded bg-raised px-1.5 py-0.5">S</kbd>
              </dt>
              <dd>Copy the output URL.</dd>
              <dt class="font-mono text-[11px] text-text">
                <kbd class="rounded bg-raised px-1.5 py-0.5">Delete</kbd>
              </dt>
              <dd>Remove the selected source (with undo).</dd>
              <dt class="font-mono text-[11px] text-text">
                <kbd class="rounded bg-raised px-1.5 py-0.5">Esc</kbd>
              </dt>
              <dd>Deselect.</dd>
            </dl>
          </section>

          <section class="space-y-2">
            <h3 class="text-xs font-medium uppercase tracking-wide text-faint">
              Source types
            </h3>
            <p>The <span class="text-text">Add source</span> button at the bottom of the
              sidebar offers six kinds of source:</p>
            <ul class="list-disc space-y-1 pl-5">
              <li><span class="text-text">Web</span> — any URL, rendered in an iframe. Use
                this for purpose-built overlays (StreamElements, Streamlabs, custom widgets).</li>
              <li><span class="text-text">Text</span> — a static label with full styling:
                font, weight, color, alignment, shadow, outline, letter spacing.</li>
              <li><span class="text-text">Timer / clock</span> — countdown (e.g. "5:00"),
                count-up, or current time. Reuses the text styling.</li>
              <li><span class="text-text">Image</span> — a static image from a URL.
                Honours PNG transparency.</li>
              <li><span class="text-text">Rectangle</span> — a solid (or translucent)
                colour fill with rounded corners. Useful for lower-third bars.</li>
              <li><span class="text-text">QR code</span> — generated locally as crisp SVG.
                Customise foreground / background / rounded modules / error correction.</li>
            </ul>
          </section>

          <section class="space-y-2">
            <h3 class="text-xs font-medium uppercase tracking-wide text-faint">
              Fonts
            </h3>
            <p>
              The font picker is backed by
              <a href="https://fonts.bunny.net" target="_blank" rel="noopener noreferrer" class="text-text underline decoration-faint underline-offset-2 hover:decoration-text">Bunny Fonts</a>
              — a GDPR-friendly mirror of Google Fonts. Pick from the curated list, or
              type any Bunny / Google font name into the
              <span class="text-text">Other…</span> field.
            </p>
            <p class="text-faint">
              Fonts load at <code class="font-mono text-[12px]">/view</code> time over the
              network. If OBS is offline, text falls back to the system default.
              Unrecognised names also silently fall back — there's no error.
            </p>
          </section>

          <section class="space-y-2">
            <h3 class="text-xs font-medium uppercase tracking-wide text-faint">
              Timers
            </h3>
            <p>
              Countdown and count-up timers use a <span class="text-text">relative
              duration</span> — they start from zero (or the configured duration) the
              moment <code class="font-mono text-[12px]">/view</code> loads. Refreshing
              the OBS browser source restarts them. For "stream starts at 8 PM" use, set
              the duration to the time remaining when you start the stream.
            </p>
            <p class="text-faint">
              Clock mode shows the local wall-clock time on the device rendering the
              scene (OBS, your browser, etc.).
            </p>
          </section>

          <section class="space-y-2">
            <h3 class="text-xs font-medium uppercase tracking-wide text-faint">
              Scenes
            </h3>
            <p>
              The dropdown at the top of the sidebar is your
              <span class="text-text">scene library</span>. Each scene has its own
              sources and its own output URL. Switch instantly, duplicate as a starting
              point, or rename them as you go.
            </p>
            <p>
              <span class="text-text">Import from URL</span> lets you paste any Stackr
              output URL into a new scene — handy for moving between browsers or
              recovering a scene from a URL you saved.
            </p>
          </section>

          <section class="space-y-2">
            <h3 class="text-xs font-medium uppercase tracking-wide text-faint">
              Using the output URL
            </h3>
            <p>
              The bar at the bottom shows a long URL containing the
              <span class="text-text">active scene</span> encoded into the hash. Copy
              it and paste it as a
              <span class="text-text">Browser Source in OBS</span> (or any tool that
              accepts a URL) at 1920×1080. There's no server and no account — the URL
              <em>is</em> the scene.
            </p>
            <p class="text-faint">
              Your scenes are saved in this browser automatically. To move a scene
              elsewhere, copy its output URL and open it on the other side — every
              scene's URL is self-contained.
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
