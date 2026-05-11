export type Rect = { x: number; y: number; w: number; h: number };

export type SnapGuide =
  | { axis: 'x'; value: number } // vertical line at canvas-fraction x
  | { axis: 'y'; value: number }; // horizontal line at canvas-fraction y

export type SnapMode = 'move' | 'resize-tl' | 'resize-tr' | 'resize-bl' | 'resize-br' | 'resize-t' | 'resize-b' | 'resize-l' | 'resize-r';

export type SnapResult = {
  rect: Rect;
  guides: SnapGuide[];
};

/**
 * Snap a moving rectangle (in canvas-fraction units, all 0..1) against:
 *   - canvas edges (0, 0.5, 1) on both axes
 *   - other static rectangles' edges and centers
 *
 * Threshold is given in canvas pixels and converted to fractional units per axis.
 * Returns the snapped rect plus the guide lines that fired (in fraction coords).
 *
 * Pure function — no Vue reactivity inside. Called from the drag handler.
 */
export function snap(
  moving: Rect,
  others: Rect[],
  canvasW: number,
  canvasH: number,
  mode: SnapMode,
  thresholdPx = 6,
): SnapResult {
  const thrX = canvasW > 0 ? thresholdPx / canvasW : 0;
  const thrY = canvasH > 0 ? thresholdPx / canvasH : 0;

  // Candidate snap lines on each axis, sourced from canvas + siblings.
  const xCandidates = new Set<number>([0, 0.5, 1]);
  const yCandidates = new Set<number>([0, 0.5, 1]);
  for (const o of others) {
    xCandidates.add(o.x);
    xCandidates.add(o.x + o.w);
    xCandidates.add(o.x + o.w / 2);
    yCandidates.add(o.y);
    yCandidates.add(o.y + o.h);
    yCandidates.add(o.y + o.h / 2);
  }

  let rect = { ...moving };
  const guides: SnapGuide[] = [];

  // Which edges of the moving rect can snap, given the mode
  const snapLeft =
    mode === 'move' ||
    mode === 'resize-tl' ||
    mode === 'resize-bl' ||
    mode === 'resize-l';
  const snapRight =
    mode === 'move' ||
    mode === 'resize-tr' ||
    mode === 'resize-br' ||
    mode === 'resize-r';
  const snapTop =
    mode === 'move' ||
    mode === 'resize-tl' ||
    mode === 'resize-tr' ||
    mode === 'resize-t';
  const snapBottom =
    mode === 'move' ||
    mode === 'resize-bl' ||
    mode === 'resize-br' ||
    mode === 'resize-b';
  const snapCenters = mode === 'move'; // only snap centers while moving, not resizing

  // For each axis, find the best (smallest absolute delta) candidate among
  // the moving rect's relevant edges + center.
  type Best = { delta: number; candidate: number; sourceEdge: 'l' | 'r' | 'c' | 't' | 'b' };

  let bestX: Best | null = null;
  for (const c of xCandidates) {
    if (snapLeft) {
      const d = c - rect.x;
      if (Math.abs(d) < thrX && (!bestX || Math.abs(d) < Math.abs(bestX.delta))) {
        bestX = { delta: d, candidate: c, sourceEdge: 'l' };
      }
    }
    if (snapRight) {
      const d = c - (rect.x + rect.w);
      if (Math.abs(d) < thrX && (!bestX || Math.abs(d) < Math.abs(bestX.delta))) {
        bestX = { delta: d, candidate: c, sourceEdge: 'r' };
      }
    }
    if (snapCenters) {
      const d = c - (rect.x + rect.w / 2);
      if (Math.abs(d) < thrX && (!bestX || Math.abs(d) < Math.abs(bestX.delta))) {
        bestX = { delta: d, candidate: c, sourceEdge: 'c' };
      }
    }
  }

  if (bestX) {
    if (mode === 'move' || bestX.sourceEdge === 'c') {
      // Translate: shift x by delta
      rect.x += bestX.delta;
    } else if (bestX.sourceEdge === 'l') {
      // Resize from left: keep right edge, change x and w
      const right = rect.x + rect.w;
      rect.x += bestX.delta;
      rect.w = right - rect.x;
    } else if (bestX.sourceEdge === 'r') {
      // Resize from right: change w, keep x
      rect.w += bestX.delta;
    }
    guides.push({ axis: 'x', value: bestX.candidate });
  }

  let bestY: Best | null = null;
  for (const c of yCandidates) {
    if (snapTop) {
      const d = c - rect.y;
      if (Math.abs(d) < thrY && (!bestY || Math.abs(d) < Math.abs(bestY.delta))) {
        bestY = { delta: d, candidate: c, sourceEdge: 't' };
      }
    }
    if (snapBottom) {
      const d = c - (rect.y + rect.h);
      if (Math.abs(d) < thrY && (!bestY || Math.abs(d) < Math.abs(bestY.delta))) {
        bestY = { delta: d, candidate: c, sourceEdge: 'b' };
      }
    }
    if (snapCenters) {
      const d = c - (rect.y + rect.h / 2);
      if (Math.abs(d) < thrY && (!bestY || Math.abs(d) < Math.abs(bestY.delta))) {
        bestY = { delta: d, candidate: c, sourceEdge: 'c' };
      }
    }
  }

  if (bestY) {
    if (mode === 'move' || bestY.sourceEdge === 'c') {
      rect.y += bestY.delta;
    } else if (bestY.sourceEdge === 't') {
      const bottom = rect.y + rect.h;
      rect.y += bestY.delta;
      rect.h = bottom - rect.y;
    } else if (bestY.sourceEdge === 'b') {
      rect.h += bestY.delta;
    }
    guides.push({ axis: 'y', value: bestY.candidate });
  }

  return { rect, guides };
}
