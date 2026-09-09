export type VisualViewportBox = {
  offsetTop: number;
  offsetLeft: number;
  width: number;
  height: number;
};

/** Pin a `position: fixed; inset-0` overlay to the visual viewport (above the keyboard). */
export function applyVisualViewportFrame(
  node: HTMLElement,
  viewport: VisualViewportBox,
) {
  node.style.top = `${viewport.offsetTop}px`;
  node.style.left = `${viewport.offsetLeft}px`;
  node.style.right = "auto";
  node.style.bottom = "auto";
  node.style.width = `${viewport.width}px`;
  node.style.height = `${viewport.height}px`;
}

export function clearVisualViewportFrame(node: HTMLElement) {
  node.style.top = "";
  node.style.left = "";
  node.style.right = "";
  node.style.bottom = "";
  node.style.width = "";
  node.style.height = "";
}
