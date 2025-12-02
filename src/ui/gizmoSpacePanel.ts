// src/ui/gizmoSpacePanel.ts
export type GizmoSpace = 'world' | 'local';

export interface GizmoSpacePanel {
  setSpace(space: GizmoSpace): void;
  dispose(): void;
}

export function createGizmoSpacePanel(
  onSpaceChange: (space: GizmoSpace) => void
): GizmoSpacePanel {
  const container = document.getElementById('gizmo-space');
  if (!container) {
    throw new Error('GizmoSpacePanel: #gizmo-space not found in DOM');
  }

  const buttons = Array.from(
    container.querySelectorAll<HTMLButtonElement>('button[data-space]')
  );

  if (buttons.length === 0) {
    throw new Error('GizmoSpacePanel: no buttons with data-space found');
  }

  function setSpace(space: GizmoSpace) {
    for (const btn of buttons) {
      const btnSpace = btn.dataset.space as GizmoSpace | undefined;
      btn.classList.toggle('active', btnSpace === space);
    }
  }

  function handleClick(ev: MouseEvent) {
    const btn = ev.currentTarget as HTMLButtonElement;
    const space = btn.dataset.space as GizmoSpace | undefined;
    if (!space) return;

    setSpace(space);
    onSpaceChange(space);
  }

  for (const btn of buttons) {
    btn.addEventListener('click', handleClick);
  }

  // default
  setSpace('world');

  return {
    setSpace,
    dispose() {
      for (const btn of buttons) {
        btn.removeEventListener('click', handleClick);
      }
    },
  };
}
