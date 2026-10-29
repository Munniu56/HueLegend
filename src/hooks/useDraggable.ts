import { useState, useRef, useEffect, useCallback } from 'react';

// Hook tro giup keo tha popup (draggable modal) cho phep di chuyen va xuat hien ngay vi tri da bam
export function useDraggable(
  isOpen: boolean,
  clickPos?: { x: number; y: number } | null,
  estimatedModalSize: { width: number; height: number } = { width: 560, height: 480 }
) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const initialPosRef = useRef({ x: 0, y: 0 });

  // Tinh toan vi tri popup xuat hien ngay tai toa do con tro chuot/nut da bam khi mo
  useEffect(() => {
    if (isOpen) {
      if (clickPos && typeof window !== 'undefined' && clickPos.x > 0 && clickPos.y > 0) {
        const screenW = window.innerWidth;
        const screenH = window.innerHeight;

        // Offset tu tam man hinh toi toa do da bam
        const rawOffsetX = clickPos.x - screenW / 2;
        const rawOffsetY = clickPos.y - screenH / 2;

        // Tinh toan gioi han an toan (clamping) de popup khong bi tran hoac khuat qua mep man hinh
        const maxDx = Math.max(0, (screenW - estimatedModalSize.width) / 2 - 20);
        const maxDy = Math.max(0, (screenH - estimatedModalSize.height) / 2 - 20);

        const clampedX = Math.max(-maxDx, Math.min(maxDx, rawOffsetX));
        const clampedY = Math.max(-maxDy, Math.min(maxDy, rawOffsetY));

        setPosition({ x: clampedX, y: clampedY });
      } else {
        setPosition({ x: 0, y: 0 });
      }
    }
  }, [isOpen, clickPos?.x, clickPos?.y, estimatedModalSize.width, estimatedModalSize.height]);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    // Chi cho phep keo qua chuot trai hoac cam ung truyen thong
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    
    // Khong kich hoat keo neu bam vao nut bam hoac input inside header
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('input') || target.closest('a')) {
      return;
    }

    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    initialPosRef.current = { ...position };

    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch (err) {
      // Ignored fallback
    }
  }, [position]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    setPosition({
      x: initialPosRef.current.x + dx,
      y: initialPosRef.current.y + dy,
    });
  }, [isDragging]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (!isDragging) return;
    setIsDragging(false);
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch (err) {
      // Ignored fallback
    }
  }, [isDragging]);

  return {
    position,
    isDragging,
    dragHeaderProps: {
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: handlePointerUp,
      style: { cursor: isDragging ? 'grabbing' : 'grab', userSelect: 'none' as const }
    }
  };
}
