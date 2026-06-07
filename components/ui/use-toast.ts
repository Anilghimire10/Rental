"use client";

// Adapted from shadcn/ui's toast hook (simplified).
import * as React from "react";
import type { ToastProps } from "@/components/ui/toast";

const TOAST_LIMIT = 3;
const TOAST_REMOVE_DELAY = 4000;

type ToasterToast = ToastProps & {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
};

let count = 0;
function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER;
  return count.toString();
}

type State = { toasts: ToasterToast[] };
const listeners: Array<(state: State) => void> = [];
let memoryState: State = { toasts: [] };
const timeouts = new Map<string, ReturnType<typeof setTimeout>>();

function dispatch(next: State) {
  memoryState = next;
  listeners.forEach((l) => l(memoryState));
}

function scheduleRemove(id: string) {
  if (timeouts.has(id)) return;
  const t = setTimeout(() => {
    timeouts.delete(id);
    dispatch({ toasts: memoryState.toasts.filter((x) => x.id !== id) });
  }, TOAST_REMOVE_DELAY);
  timeouts.set(id, t);
}

export function toast(props: Omit<ToasterToast, "id">) {
  const id = genId();
  const dismiss = () => dispatch({ toasts: memoryState.toasts.filter((x) => x.id !== id) });

  dispatch({
    toasts: [{ ...props, id, open: true, onOpenChange: (open: boolean) => !open && dismiss() }, ...memoryState.toasts].slice(0, TOAST_LIMIT),
  });
  scheduleRemove(id);
  return { id, dismiss };
}

export function useToast() {
  const [state, setState] = React.useState<State>(memoryState);
  React.useEffect(() => {
    listeners.push(setState);
    return () => {
      const i = listeners.indexOf(setState);
      if (i > -1) listeners.splice(i, 1);
    };
  }, []);
  return { ...state, toast };
}
