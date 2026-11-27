/** Cancellable two-frame correction for the demo-only scroll return. */
export function createDemoBackToTopCorrection(
  requestFrame: (callback: () => void) => number,
  cancelFrame: (id: number) => void,
) {
  let frame: number | null = null;
  let generation = 0;
  function cancel() {
    generation += 1;
    if (frame !== null) cancelFrame(frame);
    frame = null;
  }
  function schedule(correct: () => void) {
    cancel();
    const token = generation;
    frame = requestFrame(() => {
      if (token !== generation) return;
      frame = requestFrame(() => {
        if (token !== generation) return;
        frame = null;
        correct();
      });
    });
  }
  return { cancel, schedule };
}
