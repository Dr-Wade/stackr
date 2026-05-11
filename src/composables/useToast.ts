import { reactive } from 'vue';
import { nanoid } from 'nanoid';

export type ToastAction = {
  label: string;
  run: () => void;
};

export type ToastKind = 'info' | 'success' | 'warn';

export type Toast = {
  id: string;
  message: string;
  kind: ToastKind;
  action?: ToastAction;
  durationMs: number;
};

const state = reactive<{ toasts: Toast[] }>({ toasts: [] });
const timers = new Map<string, ReturnType<typeof setTimeout>>();

function dismiss(id: string) {
  const idx = state.toasts.findIndex((t) => t.id === id);
  if (idx >= 0) state.toasts.splice(idx, 1);
  const timer = timers.get(id);
  if (timer) {
    clearTimeout(timer);
    timers.delete(id);
  }
}

function push(opts: {
  message: string;
  kind?: ToastKind;
  action?: ToastAction;
  durationMs?: number;
}): string {
  const id = nanoid(6);
  const toast: Toast = {
    id,
    message: opts.message,
    kind: opts.kind ?? 'info',
    action: opts.action,
    durationMs: opts.durationMs ?? 3500,
  };
  state.toasts.push(toast);
  if (toast.durationMs > 0) {
    timers.set(
      id,
      setTimeout(() => dismiss(id), toast.durationMs),
    );
  }
  return id;
}

export function useToast() {
  return {
    toasts: state.toasts,
    push,
    dismiss,
  };
}
