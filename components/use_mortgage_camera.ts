import { useEffect, useMemo, useRef, useState } from 'react';
import type { KeyboardEvent, MouseEvent, PointerEvent } from 'react';
import {
  build_mortgage_graph,
  fit_camera,
  graph_bounds,
  zoom_camera,
  type Camera,
  type GraphNode,
} from '@/lib/mortgage_graph';
import type { MortgageView } from '@/lib/mortgage_state';

// Owns spatial state and gestures; reader navigation never writes camera state.
export function useMortgageCamera({
  graph,
  view,
  selected,
  depth,
  branch_filter,
  topic_filter,
}: {
  graph: GraphNode[];
  view: MortgageView;
  selected: string | null;
  depth: number;
  branch_filter: string;
  topic_filter: string;
}) {
  const [camera, set_camera] = useState<Camera>({ x: 0, y: 0, scale: 0.5 });
  const [size, set_size] = useState({ width: 1000, height: 650 });
  const [is_dragging, set_is_dragging] = useState(false);
  const canvas_ref = useRef<HTMLDivElement>(null);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const pending_focus = useRef<string | null>(null);
  const has_measured = useRef(false);
  const previous_layout = useRef<{
    key: string;
    width: number;
    height: number;
  } | null>(null);
  const connection_selection = view === 'connections' ? selected : null;
  const positions = useMemo(
    () => new Map(graph.map((node) => [node.id, node])),
    [graph],
  );
  const bounds = useMemo(() => graph_bounds(graph), [graph]);
  useEffect(() => {
    const canvas = canvas_ref.current;
    if (!canvas || view === 'list' || view === 'compare' || view === 'paths')
      return;
    const observer = new ResizeObserver(([entry]) => {
      if (!has_measured.current) {
        previous_layout.current = null;
        has_measured.current = true;
      }
      set_size({
        width: entry.contentRect.width,
        height: entry.contentRect.height,
      });
    });
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [view]);
  useEffect(() => {
    const key = `${view}:${connection_selection}:${depth}:${branch_filter}:${topic_filter}`;
    const previous = previous_layout.current;
    const focus = pending_focus.current
      ? positions.get(pending_focus.current)
      : undefined;
    if (focus && view === 'map') {
      set_camera({
        x: size.width / 2 - focus.x,
        y: size.height / 2 - focus.y,
        scale: 1,
      });
      pending_focus.current = null;
    } else if (view === 'connections') {
      set_camera(fit_camera(bounds, size.width, size.height));
    } else if (previous?.key === key) {
      set_camera((c) => ({
        ...c,
        x: c.x + (size.width - previous.width) / 2,
        y: c.y + (size.height - previous.height) / 2,
      }));
    } else {
      set_camera(fit_camera(bounds, size.width, size.height));
    }
    previous_layout.current = { key, ...size };
  }, [
    bounds,
    positions,
    size,
    view,
    connection_selection,
    depth,
    branch_filter,
    topic_filter,
  ]);
  function prepare_concept(id: string) {
    const node = positions.get(id);
    const layout_is_ready = depth === 2 && !!node;
    if (view === 'map') {
      pending_focus.current = layout_is_ready ? null : id;
      if (layout_is_ready)
        set_camera({
          x: size.width / 2 - node!.x,
          y: size.height / 2 - node!.y,
          scale: 1,
        });
    }
    return layout_is_ready;
  }
  function focus_selected() {
    const node = selected ? positions.get(selected) : undefined;
    if (node)
      set_camera({
        x: size.width / 2 - node.x,
        y: size.height / 2 - node.y,
        scale: 1,
      });
  }
  function overview() {
    pending_focus.current = null;
    set_camera(
      fit_camera(
        graph_bounds(build_mortgage_graph(0)),
        size.width,
        size.height,
      ),
    );
  }
  function key_canvas(event: KeyboardEvent<HTMLDivElement>) {
    if (event.target !== event.currentTarget) return;
    const offsets: Record<string, [number, number]> = {
      ArrowLeft: [90, 0],
      ArrowRight: [-90, 0],
      ArrowUp: [0, 90],
      ArrowDown: [0, -90],
    };
    if (offsets[event.key]) {
      event.preventDefault();
      const [x, y] = offsets[event.key];
      set_camera((c) => ({ ...c, x: c.x + x, y: c.y + y }));
    } else if (['+', '=', '-'].includes(event.key)) {
      event.preventDefault();
      set_camera((c) =>
        zoom_camera(
          c,
          event.key === '-' ? 0.8 : 1.25,
          size.width / 2,
          size.height / 2,
        ),
      );
    } else if (event.key === 'Home') {
      event.preventDefault();
      set_camera(fit_camera(bounds, size.width, size.height));
    }
  }
  function pointer_down(event: PointerEvent<HTMLDivElement>) {
    if (
      event.button !== 0 ||
      (event.target as HTMLElement).closest('button,a,input,select')
    )
      return;
    event.currentTarget.setPointerCapture(event.pointerId);
    pointers.current.set(event.pointerId, {
      x: event.clientX,
      y: event.clientY,
    });
    set_is_dragging(true);
  }
  function pointer_move(event: PointerEvent<HTMLDivElement>) {
    const previous = pointers.current.get(event.pointerId);
    if (!previous) return;
    const next = { x: event.clientX, y: event.clientY };
    if (pointers.current.size === 2) {
      const other = [...pointers.current.entries()].find(
        ([id]) => id !== event.pointerId,
      )![1];
      const old_distance = Math.hypot(
        previous.x - other.x,
        previous.y - other.y,
      );
      const distance = Math.hypot(next.x - other.x, next.y - other.y);
      const rect = event.currentTarget.getBoundingClientRect();
      const old_x = (previous.x + other.x) / 2 - rect.left;
      const old_y = (previous.y + other.y) / 2 - rect.top;
      set_camera((c) => {
        const zoomed = zoom_camera(
          c,
          old_distance > 0 ? distance / old_distance : 1,
          old_x,
          old_y,
        );
        return {
          ...zoomed,
          x: zoomed.x + (next.x - previous.x) / 2,
          y: zoomed.y + (next.y - previous.y) / 2,
        };
      });
    } else
      set_camera((c) => ({
        ...c,
        x: c.x + next.x - previous.x,
        y: c.y + next.y - previous.y,
      }));
    pointers.current.set(event.pointerId, next);
  }
  function pointer_up(event: PointerEvent<HTMLDivElement>) {
    pointers.current.delete(event.pointerId);
    if (event.currentTarget.hasPointerCapture(event.pointerId))
      event.currentTarget.releasePointerCapture(event.pointerId);
    if (!pointers.current.size) set_is_dragging(false);
  }

  function zoom(factor: number) {
    set_camera((c) => zoom_camera(c, factor, size.width / 2, size.height / 2));
  }
  function fit() {
    set_camera(fit_camera(bounds, size.width, size.height));
  }
  function reveal_node(node: GraphNode, target: HTMLButtonElement) {
    const rect = target.getBoundingClientRect();
    const frame = canvas_ref.current?.getBoundingClientRect();
    if (
      frame &&
      (rect.left < frame.left ||
        rect.right > frame.right ||
        rect.top < frame.top ||
        rect.bottom > frame.bottom)
    )
      set_camera((c) => ({
        ...c,
        x: size.width / 2 - node.x * c.scale,
        y: size.height / 2 - node.y * c.scale,
      }));
  }
  function recenter(event: MouseEvent<HTMLButtonElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const sx = bounds.width / rect.width;
    const sy = bounds.height / rect.height;
    const x = bounds.x + (event.clientX - rect.left) * sx;
    const y = bounds.y + (event.clientY - rect.top) * sy;
    if (event.detail === 0)
      set_camera(fit_camera(bounds, size.width, size.height));
    else
      set_camera((c) => ({
        ...c,
        x: size.width / 2 - x * c.scale,
        y: size.height / 2 - y * c.scale,
      }));
  }
  return {
    camera,
    size,
    positions,
    bounds,
    canvas_ref,
    is_dragging,
    prepare_concept,
    focus_selected,
    overview,
    zoom,
    fit,
    reveal_node,
    recenter,
    key_canvas,
    pointer_down,
    pointer_move,
    pointer_up,
  };
}
export type MortgageCamera = ReturnType<typeof useMortgageCamera>;
