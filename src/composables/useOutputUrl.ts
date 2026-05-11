import { computed } from 'vue';
import { useScene } from './useScene';
import { encodeScene } from './useSceneEncoding';

export function useOutputUrl() {
  const { scene } = useScene();

  const encoded = computed(() => encodeScene(scene));

  const outputUrl = computed(() => {
    const base = `${window.location.origin}/view`;
    return `${base}#${encoded.value}`;
  });

  return { outputUrl, encoded };
}
