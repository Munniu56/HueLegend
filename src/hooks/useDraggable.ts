import { useState, useRef, useEffect, useCallback } from 'react';

// Hook tro giup keo tha popup (draggable modal) cho phep di chuyen linh hoat tren man hinh
export function useDraggable(isOpen: boolean) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const initialPosRef = useRef({ x: 0, y: 0 });

  // Reset vi tri ve chinh dien giua man hinh khi popup duoc mo
  useEffect(() => {
    if (isOpen) {
      setPosition({ x: 0, y: 0 });
    }
  }, [isOpen]);

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
