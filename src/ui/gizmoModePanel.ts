// src/ui/gizmoModePanel.ts
export type GizmoMode = 'translate' | 'rotate' | 'scale';

export interface GizmoModePanel {
  /** update the visual selection from outside if needed */
  setMode(mode: GizmoMode): void;
  /** remove event listeners */
  dispose(): void;
}

export function createGizmoModePanel(
  onModeChange: (mode: GizmoMode) => void
): GizmoModePanel {
  const container = document.getElementById('gizmo-modes');
  if (!container) {
    throw new Error('GizmoModePanel: #gizmo-modes not found in DOM');
  }

  const buttons = Array.from(
    container.querySelectorAll<HTMLButtonElement>('button[data-mode]')
  );

  if (buttons.length === 0) {
    throw new Error('GizmoModePanel: no buttons with data-mode found');
  }

  function setMode(mode: GizmoMode) {
    // update button highlighting
    for (const btn of buttons) {
      const btnMode = btn.dataset.mode as GizmoMode | undefined;
      btn.classList.toggle('active', btnMode === mode);
    }
  }

  function handleClick(ev: MouseEvent) {
    const btn = ev.currentTarget as HTMLButtonElement;
    const mode = btn.dataset.mode as GizmoMode | undefined;
    if (!mode) return;

    setMode(mode);
    onModeChange(mode);
  }

  // hook up listeners
  for (const btn of buttons) {
    btn.addEventListener('click', handleClick);
  }

  // default mode in UI
  setMode('translate');

  return {
    setMode,
    dispose() {
      for (const btn of buttons) {
        btn.removeEventListener('click', handleClick);
      }
    },
  };
}
