const BOTTOM_SLACK_PX = 24;

export function isNearSheetBottom(el: {
  scrollTop: number;
  clientHeight: number;
  scrollHeight: number;
}): boolean {
  if (el.scrollHeight <= el.clientHeight + 1) return false;
  return el.scrollTop + el.clientHeight >= el.scrollHeight - BOTTOM_SLACK_PX;
}

export function isOutsideScrollport(
  container: { getBoundingClientRect: () => DOMRect },
  el: { getBoundingClientRect: () => DOMRect },
): boolean {
  const c = container.getBoundingClientRect();
  const r = el.getBoundingClientRect();
  return r.bottom < c.top || r.top > c.bottom;
}
