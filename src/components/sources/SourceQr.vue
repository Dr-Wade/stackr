<script setup lang="ts">
import { computed } from 'vue';
import QRCode from 'qrcode';
import type { QrSource, QrSpec } from '@/scene/types';

const props = defineProps<{ source: QrSource }>();

type QrRender = {
  size: number; // total modules across including margin
  bgRect: { width: number; height: number; fill: string } | null;
  modules: { x: number; y: number }[];
  radius: number; // px on the 'size' unit grid
};

function renderQr(spec: QrSpec): QrRender | null {
  if (!spec.data) return null;
  try {
    const code = QRCode.create(spec.data, {
      errorCorrectionLevel: spec.errorCorrection,
    });
    const moduleCount = code.modules.size;
    const data = code.modules.data; // Uint8Array, row-major, length = moduleCount²
    const total = moduleCount + spec.margin * 2;
    const modules: { x: number; y: number }[] = [];
    for (let r = 0; r < moduleCount; r++) {
      for (let c = 0; c < moduleCount; c++) {
        const bit = data[r * moduleCount + c];
        if (bit) {
          modules.push({ x: c + spec.margin, y: r + spec.margin });
        }
      }
    }
    return {
      size: total,
      bgRect:
        spec.bgColor && spec.bgColor !== 'transparent'
          ? { width: total, height: total, fill: spec.bgColor }
          : null,
      modules,
      radius: Math.max(0, Math.min(0.5, spec.radius)),
    };
  } catch {
    // Likely "data too long for chosen EC level" — show a placeholder
    return null;
  }
}

const rendered = computed(() => renderQr(props.source.qr));
const viewBox = computed(() =>
  rendered.value ? `0 0 ${rendered.value.size} ${rendered.value.size}` : '0 0 1 1',
);
const moduleRx = computed(() => (rendered.value ? rendered.value.radius : 0));
</script>

<template>
  <div class="pointer-events-none flex h-full w-full items-center justify-center">
    <svg
      v-if="rendered"
      :viewBox="viewBox"
      preserveAspectRatio="xMidYMid meet"
      class="h-full w-full"
      shape-rendering="geometricPrecision"
    >
      <rect
        v-if="rendered.bgRect"
        x="0"
        y="0"
        :width="rendered.bgRect.width"
        :height="rendered.bgRect.height"
        :fill="rendered.bgRect.fill"
      />
      <g :fill="source.qr.fgColor">
        <rect
          v-for="(m, i) in rendered.modules"
          :key="i"
          :x="m.x"
          :y="m.y"
          width="1"
          height="1"
          :rx="moduleRx"
          :ry="moduleRx"
        />
      </g>
    </svg>
    <div
      v-else
      class="flex h-full w-full flex-col items-center justify-center gap-1 rounded-sm border border-dashed border-border-strong bg-bg/40 px-2 text-center text-xs text-faint"
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
        <line x1="14" y1="14" x2="21" y2="14" />
        <line x1="14" y1="21" x2="21" y2="21" />
      </svg>
      <span>QR data is empty or too long</span>
    </div>
  </div>
</template>
