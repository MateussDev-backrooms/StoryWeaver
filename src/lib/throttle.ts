// lib/throttle.ts
export function throttle<T extends (...args: any[]) => void>(fn: T, ms: number): T {
  let last = 0;
  let timer: ReturnType<typeof setTimeout> | null = null;
  let pending: any[] | null = null;

  return function (this: any, ...args: any[]) {
    const now = Date.now();
    const remaining = ms - (now - last);
    pending = args;

    if (remaining <= 0) {
      if (timer) { clearTimeout(timer); timer = null; }
      last = now;
      fn.apply(this, args);
      pending = null;
    } else if (!timer) {
      timer = setTimeout(() => {
        timer = null;
        last = Date.now();
        if (pending) fn.apply(this, pending);
        pending = null;
      }, remaining);
    }
  } as T;
}