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

        const modalW = estimatedModalSize.width;
        const modalH = estimatedModalSize.height;

        let targetLeft: number;
        let targetTop: number;

        // Neu bam o ben phai man hinh (vi tri vi Wallet nut bam top-right), dat popup can phai o vi tri da bam
        if (clickPos.x > screenW / 2) {
          targetLeft = clickPos.x - modalW + 20;
        } else {
          targetLeft = clickPos.x - 20;
        }

        // Neu bam o phan tren man hinh, xuat hien ngay phia duoi diem bam
        if (clickPos.y > screenH / 2) {
          targetTop = clickPos.y - modalH - 10;
        } else {
          targetTop = clickPos.y + 12;
        }

        // Gioi han an toan 12px ngat khuat khoi mep man hinh
        const minLeft = 12;
        const maxLeft = Math.max(minLeft, screenW - modalW - 12);
        targetLeft = Math.max(minLeft, Math.min(maxLeft, targetLeft));

        const minTop = 12;
        const maxTop = Math.max(minTop, screenH - modalH - 12);
        targetTop = Math.max(minTop, Math.min(maxTop, targetTop));

        // Tinh gia tri translate so voi vi tri giua mac dinh cua container flex
        const defaultCenteredLeft = (screenW - modalW) / 2;
        const defaultCenteredTop = (screenH - modalH) / 2;

        const translateX = targetLeft - defaultCenteredLeft;
        const translateY = targetTop - defaultCenteredTop;

        setPosition({ x: translateX, y: translateY });
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
