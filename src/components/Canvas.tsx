import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  ToolType,
  BoardElement,
  PathElement,
  StickyElement,
  TextElement,
  ShapeElement,
  ImageElement,
  StickerElement,
  User,
  LaserPoint,
  BackgroundPattern,
  CanvasViewport,
} from '../types/board';
import { soundManager } from '../utils/audio';
import { CAT_STICKERS, CAT_AVATARS } from '../utils/catStickers';
import { RotateCw, Trash2, Copy, ZoomIn, ZoomOut, Maximize } from 'lucide-react';

interface CanvasProps {
  currentTool: ToolType;
  elements: BoardElement[];
  onElementsChange: (elements: BoardElement[]) => void;
  onElementCreate: (element: BoardElement) => void;
  onElementUpdate: (id: string, updates: Partial<BoardElement>) => void;
  onElementDelete: (id: string) => void;
  // Pen state
  penColor: string;
  penWidth: number;
  penMode: 'pen' | 'brush' | 'marker';
  // Laser
  onLaserEmit: (point: { x: number; y: number }) => void;
  remoteLaserPoints: LaserPoint[];
  // Cursors
  currentUser: User;
  remoteUsers: User[];
  onCursorMove: (cursor: { x: number; y: number } | null) => void;
  // Background
  backgroundPattern: BackgroundPattern;
  backgroundColor: string;
  isDarkMode: boolean;
  // Quick adds from empty state
  onQuickAddSticky: () => void;
}

export const Canvas: React.FC<CanvasProps> = ({
  currentTool,
  elements,
  onElementCreate,
  onElementUpdate,
  onElementDelete,
  penColor,
  penWidth,
  penMode,
  onLaserEmit,
  remoteLaserPoints,
  currentUser,
  remoteUsers,
  onCursorMove,
  backgroundPattern,
  backgroundColor,
  isDarkMode,
  onQuickAddSticky,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgOverlayRef = useRef<SVGSVGElement>(null);

  // Viewport Pan & Zoom
  const [viewport, setViewport] = useState<CanvasViewport>({ x: 0, y: 0, zoom: 1 });
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Selected Element
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);

  // Drawing state
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentStrokePoints, setCurrentStrokePoints] = useState<number[]>([]);

  // Dragging / Resizing Element
  const [isDraggingElement, setIsDraggingElement] = useState(false);
  const [isResizingElement, setIsResizingElement] = useState<string | null>(null); // 'se', 'sw', 'ne', 'nw'
  const [isRotatingElement, setIsRotatingElement] = useState(false);
  const dragStartRef = useRef<{
    pointerX: number;
    pointerY: number;
    elemX: number;
    elemY: number;
    elemW: number;
    elemH: number;
    elemRot: number;
  }>({
    pointerX: 0,
    pointerY: 0,
    elemX: 0,
    elemY: 0,
    elemW: 0,
    elemH: 0,
    elemRot: 0,
  });

  // Local laser points
  const [localLaserTrail, setLocalLaserTrail] = useState<{ x: number; y: number; time: number }[]>([]);

  // Fade out laser points periodically
  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      setLocalLaserTrail((prev) => prev.filter((p) => now - p.time < 1200));
    }, 60);
    return () => clearInterval(timer);
  }, []);

  // Coordinate conversion: Screen client coordinates -> Canvas Scene coordinates
  const screenToScene = useCallback(
    (clientX: number, clientY: number) => {
      if (!containerRef.current) return { x: clientX, y: clientY };
      const rect = containerRef.current.getBoundingClientRect();
      const x = (clientX - rect.left - viewport.x) / viewport.zoom;
      const y = (clientY - rect.top - viewport.y) / viewport.zoom;
      return { x, y };
    },
    [viewport]
  );

  // Space key tracking for Pan
  const isSpacePressedRef = useRef(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (e.code === 'Space') {
        isSpacePressedRef.current = true;
      }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedElementId) {
          onElementDelete(selectedElementId);
          setSelectedElementId(null);
          soundManager.playPurr();
        }
      } else if (e.key === 'Escape') {
        setSelectedElementId(null);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        isSpacePressedRef.current = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [selectedElementId, onElementDelete]);

  // Handle Zoom with Wheel
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
    const newZoom = Math.min(Math.max(viewport.zoom * zoomFactor, 0.3), 3.0);

    // Zoom centered around mouse cursor
    const newX = mouseX - (mouseX - viewport.x) * (newZoom / viewport.zoom);
    const newY = mouseY - (mouseY - viewport.y) * (newZoom / viewport.zoom);

    setViewport({ x: newX, y: newY, zoom: newZoom });
  };

  // Pointer Down
  const handlePointerDown = (e: React.PointerEvent) => {
    // Middle click or space down -> Pan
    if (e.button === 1 || isSpacePressedRef.current) {
      setIsPanning(true);
      panStartRef.current = { x: e.clientX - viewport.x, y: e.clientY - viewport.y };
      return;
    }

    if (e.button !== 0) return; // Only primary button

    const { x, y } = screenToScene(e.clientX, e.clientY);

    // If Laser tool
    if (currentTool === 'laser') {
      soundManager.playLaser();
      setLocalLaserTrail((prev) => [...prev, { x, y, time: Date.now() }]);
      onLaserEmit({ x, y });
      return;
    }

    // If Pen / Brush / Marker tool
    if (currentTool === 'pen' || currentTool === 'brush' || currentTool === 'marker') {
      setIsDrawing(true);
      setCurrentStrokePoints([x, y]);
      setSelectedElementId(null);
      return;
    }

    // If Eraser tool
    if (currentTool === 'eraser') {
      checkAndEraseAt(x, y);
      return;
    }

    // If Select tool clicked on empty canvas -> deselect
    if (e.target === containerRef.current || (e.target as HTMLElement).id === 'canvas-board') {
      setSelectedElementId(null);
    }
  };

  // Pointer Move
  const handlePointerMove = (e: React.PointerEvent) => {
    const { x, y } = screenToScene(e.clientX, e.clientY);

    // Broadcast cursor position to collaborators
    onCursorMove({ x, y });

    // Handle Pan
    if (isPanning) {
      setViewport((prev) => ({
        ...prev,
        x: e.clientX - panStartRef.current.x,
        y: e.clientY - panStartRef.current.y,
      }));
      return;
    }

    // Handle Laser Drag
    if (currentTool === 'laser' && e.buttons === 1) {
      setLocalLaserTrail((prev) => [...prev, { x, y, time: Date.now() }]);
      onLaserEmit({ x, y });
      return;
    }

    // Handle Drawing
    if (isDrawing) {
      setCurrentStrokePoints((prev) => [...prev, x, y]);
      return;
    }

    // Handle Eraser drag
    if (currentTool === 'eraser' && e.buttons === 1) {
      checkAndEraseAt(x, y);
      return;
    }

    // Handle Dragging selected element
    if (isDraggingElement && selectedElementId) {
      const deltaX = (e.clientX - dragStartRef.current.pointerX) / viewport.zoom;
      const deltaY = (e.clientY - dragStartRef.current.pointerY) / viewport.zoom;
      onElementUpdate(selectedElementId, {
        x: Math.round(dragStartRef.current.elemX + deltaX),
        y: Math.round(dragStartRef.current.elemY + deltaY),
      });
      return;
    }

    // Handle Resizing selected element
    if (isResizingElement && selectedElementId) {
      const deltaX = (e.clientX - dragStartRef.current.pointerX) / viewport.zoom;
      const deltaY = (e.clientY - dragStartRef.current.pointerY) / viewport.zoom;

      let newW = dragStartRef.current.elemW;
      let newH = dragStartRef.current.elemH;
      let newX = dragStartRef.current.elemX;
      let newY = dragStartRef.current.elemY;

      if (isResizingElement === 'se') {
        newW = Math.max(60, dragStartRef.current.elemW + deltaX);
        newH = Math.max(60, dragStartRef.current.elemH + deltaY);
      } else if (isResizingElement === 'sw') {
        newW = Math.max(60, dragStartRef.current.elemW - deltaX);
        newH = Math.max(60, dragStartRef.current.elemH + deltaY);
        newX = dragStartRef.current.elemX + (dragStartRef.current.elemW - newW);
      } else if (isResizingElement === 'ne') {
        newW = Math.max(60, dragStartRef.current.elemW + deltaX);
        newH = Math.max(60, dragStartRef.current.elemH - deltaY);
        newY = dragStartRef.current.elemY + (dragStartRef.current.elemH - newH);
      } else if (isResizingElement === 'nw') {
        newW = Math.max(60, dragStartRef.current.elemW - deltaX);
        newH = Math.max(60, dragStartRef.current.elemH - deltaY);
        newX = dragStartRef.current.elemX + (dragStartRef.current.elemW - newW);
        newY = dragStartRef.current.elemY + (dragStartRef.current.elemH - newH);
      }

      onElementUpdate(selectedElementId, {
        x: Math.round(newX),
        y: Math.round(newY),
        width: Math.round(newW),
        height: Math.round(newH),
      });
      return;
    }

    // Handle Rotating selected element
    if (isRotatingElement && selectedElementId) {
      const selectedElem = elements.find((el) => el.id === selectedElementId);
      if (selectedElem && 'rotation' in selectedElem) {
        const centerX = selectedElem.x + selectedElem.width / 2;
        const centerY = selectedElem.y + selectedElem.height / 2;
        const rad = Math.atan2(y - centerY, x - centerX);
        let deg = Math.round((rad * 180) / Math.PI) - 90;
        onElementUpdate(selectedElementId, { rotation: deg });
      }
    }
  };

  // Pointer Up
  const handlePointerUp = () => {
    setIsPanning(false);

    if (isDrawing && currentStrokePoints.length >= 4) {
      const newPath: PathElement = {
        id: `path-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        type: 'path',
        points: currentStrokePoints,
        strokeColor: penColor,
        strokeWidth: penWidth,
        toolType: penMode,
        opacity: penMode === 'marker' ? 0.45 : 1,
        zIndex: elements.length + 1,
        authorId: currentUser.id,
        authorName: currentUser.name,
      };
      onElementCreate(newPath);
    }

    setIsDrawing(false);
    setCurrentStrokePoints([]);
    setIsDraggingElement(false);
    setIsResizingElement(null);
    setIsRotatingElement(false);
  };

  // Erase detection
  const checkAndEraseAt = (x: number, y: number) => {
    // First check path strokes near (x, y)
    for (let i = elements.length - 1; i >= 0; i--) {
      const el = elements[i];
      if (el.type === 'path') {
        const pts = el.points;
        for (let p = 0; p < pts.length; p += 2) {
          const px = pts[p];
          const py = pts[p + 1];
          const dist = Math.hypot(px - x, py - y);
          if (dist < 20 + el.strokeWidth / 2) {
            onElementDelete(el.id);
            soundManager.playPop();
            return;
          }
        }
      } else if (
        x >= el.x &&
        x <= el.x + el.width &&
        y >= el.y &&
        y <= el.y + el.height
      ) {
        onElementDelete(el.id);
        soundManager.playPop();
        return;
      }
    }
  };

  // Element interaction handlers
  const handleElementPointerDown = (e: React.PointerEvent, elem: BoardElement) => {
    if (currentTool === 'eraser') {
      e.stopPropagation();
      onElementDelete(elem.id);
      soundManager.playPop();
      return;
    }

    if (currentTool !== 'select') return;

    e.stopPropagation();
    setSelectedElementId(elem.id);
    setIsDraggingElement(true);

    if ('width' in elem) {
      dragStartRef.current = {
        pointerX: e.clientX,
        pointerY: e.clientY,
        elemX: elem.x,
        elemY: elem.y,
        elemW: elem.width,
        elemH: elem.height,
        elemRot: elem.rotation || 0,
      };
    }
  };

  const handleResizeHandlePointerDown = (
    e: React.PointerEvent,
    handle: string,
    elem: BoardElement
  ) => {
    e.stopPropagation();
    setIsResizingElement(handle);
    if ('width' in elem) {
      dragStartRef.current = {
        pointerX: e.clientX,
        pointerY: e.clientY,
        elemX: elem.x,
        elemY: elem.y,
        elemW: elem.width,
        elemH: elem.height,
        elemRot: elem.rotation || 0,
      };
    }
  };

  const handleRotateHandlePointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    setIsRotatingElement(true);
  };

  // Convert points array to smooth SVG path string
  const renderSmoothPath = (points: number[]) => {
    if (points.length < 4) return '';
    let d = `M ${points[0]} ${points[1]}`;
    for (let i = 2; i < points.length - 2; i += 2) {
      const xc = (points[i] + points[i + 2]) / 2;
      const yc = (points[i + 1] + points[i + 3]) / 2;
      d += ` Q ${points[i]} ${points[i + 1]}, ${xc} ${yc}`;
    }
    d += ` L ${points[points.length - 2]} ${points[points.length - 1]}`;
    return d;
  };

  // Background CSS class
  const getBackgroundClass = () => {
    if (backgroundPattern === 'paw') {
      return isDarkMode ? 'bg-paw-pattern-dark' : 'bg-paw-pattern-light';
    }
    if (backgroundPattern === 'dots') {
      return isDarkMode ? 'bg-dot-pattern-dark' : 'bg-dot-pattern-light';
    }
    if (backgroundPattern === 'grid') {
      return isDarkMode ? 'bg-grid-pattern-dark' : 'bg-grid-pattern-light';
    }
    return isDarkMode ? 'bg-stone-900' : 'bg-amber-50/30';
  };

  const getAvatarSrc = (avatarKey: string) => {
    const found = CAT_AVATARS.find((a) => a.id === avatarKey);
    return found ? found.src : CAT_AVATARS[0].src;
  };

  const selectedElement = elements.find((el) => el.id === selectedElementId);

  return (
    <div
      ref={containerRef}
      onWheel={handleWheel}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={() => onCursorMove(null)}
      className={`relative w-full h-[calc(100vh-4rem)] overflow-hidden cursor-crosshair select-none ${getBackgroundClass()}`}
      style={{
        backgroundColor: backgroundPattern === 'blank' ? backgroundColor : undefined,
        cursor:
          currentTool === 'select'
            ? isPanning
              ? 'grabbing'
              : 'default'
            : currentTool === 'eraser'
            ? 'cell'
            : currentTool === 'laser'
            ? 'crosshair'
            : 'crosshair',
      }}
    >
      {/* Transformed Canvas Container (Pan & Zoom) */}
      <div
        id="canvas-board"
        className="absolute origin-top-left will-change-transform"
        style={{
          transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
          width: '5000px',
          height: '5000px',
        }}
      >
        {/* SVG LAYER: Vector Paths & Drawing Strokes */}
        <svg
          ref={svgOverlayRef}
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ width: '5000px', height: '5000px' }}
        >
          {/* Render Committed Drawing Paths */}
          {elements
            .filter((el): el is PathElement => el.type === 'path')
            .map((path) => (
              <path
                key={path.id}
                d={renderSmoothPath(path.points)}
                stroke={path.strokeColor}
                strokeWidth={path.strokeWidth}
                strokeOpacity={path.opacity}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            ))}

          {/* Active Drawing Preview */}
          {isDrawing && currentStrokePoints.length >= 4 && (
            <path
              d={renderSmoothPath(currentStrokePoints)}
              stroke={penColor}
              strokeWidth={penWidth}
              strokeOpacity={penMode === 'marker' ? 0.45 : 1}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          )}

          {/* Laser Trails (Local & Remote) */}
          {localLaserTrail.map((p, idx) => {
            const age = Date.now() - p.time;
            const opacity = Math.max(0, 1 - age / 1200);
            return (
              <g key={`local-laser-${idx}`}>
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={8 * opacity}
                  fill="#F43F5E"
                  fillOpacity={opacity * 0.8}
                />
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={3 * opacity}
                  fill="#FFF"
                  fillOpacity={opacity}
                />
              </g>
            );
          })}

          {remoteLaserPoints.map((lp, idx) => {
            const age = Date.now() - lp.timestamp;
            const opacity = Math.max(0, 1 - age / 1200);
            return (
              <g key={`remote-laser-${idx}`}>
                <circle
                  cx={lp.x}
                  cy={lp.y}
                  r={9 * opacity}
                  fill={lp.authorColor || '#3B82F6'}
                  fillOpacity={opacity * 0.8}
                />
                <circle
                  cx={lp.x}
                  cy={lp.y}
                  r={3 * opacity}
                  fill="#FFF"
                  fillOpacity={opacity}
                />
              </g>
            );
          })}
        </svg>

        {/* DOM OBJECTS LAYER: Stickies, Images, Shapes, Stickers, Text */}
        {elements
          .filter((el) => el.type !== 'path')
          .map((elem) => {
            if (!('width' in elem)) return null;
            const isSelected = selectedElementId === elem.id;

            return (
              <div
                key={elem.id}
                onPointerDown={(e) => handleElementPointerDown(e, elem)}
                className={`absolute select-none group touch-none ${
                  isSelected ? 'ring-2 ring-amber-500 shadow-2xl z-40' : 'hover:ring-1 hover:ring-amber-300/80'
                }`}
                style={{
                  transform: `translate(${elem.x}px, ${elem.y}px) rotate(${elem.rotation || 0}deg)`,
                  width: `${elem.width}px`,
                  height: `${elem.height}px`,
                  zIndex: elem.zIndex || 10,
                  cursor: currentTool === 'select' ? 'move' : 'inherit',
                }}
              >
                {/* 1. STICKY NOTE */}
                {elem.type === 'sticky' && (
                  <div
                    className="w-full h-full relative rounded-2xl p-4 flex flex-col justify-between shadow-md transition-shadow"
                    style={{ backgroundColor: elem.color }}
                  >
                    {/* Cat ears decoration if style === 'cat-ears' */}
                    {elem.style === 'cat-ears' && (
                      <div className="absolute -top-4 left-0 right-0 flex justify-between px-3 pointer-events-none">
                        <div
                          className="w-6 h-6 rounded-tl-full rounded-tr-md shadow-xs border-t border-l border-black/10"
                          style={{ backgroundColor: elem.color }}
                        >
                          <div className="w-3 h-3 bg-rose-300/70 rounded-tl-full mt-1.5 ml-1.5" />
                        </div>
                        <div
                          className="w-6 h-6 rounded-tr-full rounded-tl-md shadow-xs border-t border-r border-black/10"
                          style={{ backgroundColor: elem.color }}
                        >
                          <div className="w-3 h-3 bg-rose-300/70 rounded-tr-full mt-1.5 mr-1.5" />
                        </div>
                      </div>
                    )}

                    {/* Cat face whiskers decoration if style === 'cat-face' */}
                    {elem.style === 'cat-face' && (
                      <>
                        <div className="absolute -top-3 left-4 w-5 h-5 rounded-tl-full" style={{ backgroundColor: elem.color }} />
                        <div className="absolute -top-3 right-4 w-5 h-5 rounded-tr-full" style={{ backgroundColor: elem.color }} />
                        <div className="absolute top-2 right-2 text-xs opacity-65 pointer-events-none">
                          (=^･ω･^=)
                        </div>
                      </>
                    )}

                    {/* Text area */}
                    <textarea
                      value={elem.text}
                      onChange={(e) => onElementUpdate(elem.id, { text: e.target.value })}
                      placeholder="Мяу! Напиши идею сюда..."
                      className="w-full h-full bg-transparent resize-none outline-none font-rounded placeholder-black/30 font-medium text-stone-900"
                      style={{
                        fontSize: `${elem.fontSize || 16}px`,
                        textAlign: elem.textAlign || 'center',
                      }}
                    />

                    {/* Author label bottom-right */}
                    {elem.authorName && (
                      <div className="text-[10px] text-stone-600/70 text-right truncate">
                        🐾 {elem.authorName}
                      </div>
                    )}
                  </div>
                )}

                {/* 2. TEXT ELEMENT */}
                {elem.type === 'text' && (
                  <div
                    className="w-full h-full p-2 flex items-center"
                    style={{
                      backgroundColor: elem.backgroundColor || 'transparent',
                      borderRadius: '12px',
                    }}
                  >
                    <textarea
                      value={elem.text}
                      onChange={(e) => onElementUpdate(elem.id, { text: e.target.value })}
                      placeholder="Введите текст..."
                      className="w-full h-full bg-transparent resize-none outline-none font-rounded font-semibold text-stone-900 dark:text-stone-100"
                      style={{
                        fontSize: `${elem.fontSize || 22}px`,
                        color: elem.color,
                        textAlign: elem.textAlign || 'left',
                      }}
                    />
                  </div>
                )}

                {/* 3. SHAPE */}
                {elem.type === 'shape' && (
                  <div className="w-full h-full flex items-center justify-center">
                    {elem.shapeType === 'rectangle' && (
                      <div
                        className="w-full h-full rounded-2xl shadow-sm"
                        style={{
                          backgroundColor: elem.fillColor,
                          border: `${elem.strokeWidth}px solid ${elem.strokeColor}`,
                        }}
                      />
                    )}
                    {elem.shapeType === 'circle' && (
                      <div
                        className="w-full h-full rounded-full shadow-sm"
                        style={{
                          backgroundColor: elem.fillColor,
                          border: `${elem.strokeWidth}px solid ${elem.strokeColor}`,
                        }}
                      />
                    )}
                    {elem.shapeType === 'heart' && (
                      <div className="w-full h-full flex items-center justify-center text-7xl select-none">
                        ❤️
                      </div>
                    )}
                    {elem.shapeType === 'paw' && (
                      <div className="w-full h-full flex items-center justify-center text-7xl select-none animate-pulse">
                        🐾
                      </div>
                    )}
                    {elem.shapeType === 'cat-head' && (
                      <div className="w-full h-full flex items-center justify-center text-7xl select-none">
                        🐱
                      </div>
                    )}
                    {elem.shapeType === 'fish' && (
                      <div className="w-full h-full flex items-center justify-center text-7xl select-none">
                        🐟
                      </div>
                    )}
                    {elem.shapeType === 'yarn' && (
                      <div className="w-full h-full flex items-center justify-center text-7xl select-none">
                        🧶
                      </div>
                    )}
                    {elem.shapeType === 'star' && (
                      <div className="w-full h-full flex items-center justify-center text-7xl select-none">
                        ⭐
                      </div>
                    )}
                    {elem.shapeType === 'arrow' && (
                      <div className="w-full h-full flex items-center justify-center text-7xl select-none">
                        ➔
                      </div>
                    )}
                  </div>
                )}

                {/* 4. STICKER */}
                {elem.type === 'sticker' && (
                  <div className="w-full h-full flex items-center justify-center p-1">
                    {elem.emoji ? (
                      <span className="text-7xl select-none">{elem.emoji}</span>
                    ) : (
                      (() => {
                        const stickerDef = CAT_STICKERS.find((s) => s.id === elem.stickerId);
                        const svgData = elem.customSvg || (stickerDef ? stickerDef.svg : '');
                        return (
                          <div
                            className="w-full h-full flex items-center justify-center"
                            dangerouslySetInnerHTML={{ __html: svgData }}
                          />
                        );
                      })()
                    )}
                  </div>
                )}

                {/* 5. IMAGE & GIF */}
                {elem.type === 'image' && (
                  <div className="w-full h-full rounded-2xl overflow-hidden shadow-md bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700">
                    <img
                      src={elem.src}
                      alt={elem.caption || 'Кошачье изображение'}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-contain pointer-events-none"
                    />
                  </div>
                )}

                {/* RESIZE & ROTATE HANDLES (When Selected) */}
                {isSelected && (
                  <>
                    {/* Corners */}
                    <div
                      onPointerDown={(e) => handleResizeHandlePointerDown(e, 'nw', elem)}
                      className="absolute -top-2 -left-2 w-4 h-4 bg-white border-2 border-amber-500 rounded-full cursor-nwse-resize shadow-xs z-50 hover:scale-125"
                    />
                    <div
                      onPointerDown={(e) => handleResizeHandlePointerDown(e, 'ne', elem)}
                      className="absolute -top-2 -right-2 w-4 h-4 bg-white border-2 border-amber-500 rounded-full cursor-nesw-resize shadow-xs z-50 hover:scale-125"
                    />
                    <div
                      onPointerDown={(e) => handleResizeHandlePointerDown(e, 'se', elem)}
                      className="absolute -bottom-2 -right-2 w-4 h-4 bg-white border-2 border-amber-500 rounded-full cursor-nwse-resize shadow-xs z-50 hover:scale-125"
                    />
                    <div
                      onPointerDown={(e) => handleResizeHandlePointerDown(e, 'sw', elem)}
                      className="absolute -bottom-2 -left-2 w-4 h-4 bg-white border-2 border-amber-500 rounded-full cursor-nesw-resize shadow-xs z-50 hover:scale-125"
                    />

                    {/* Rotation stem & handle */}
                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 flex flex-col items-center z-50">
                      <div
                        onPointerDown={handleRotateHandlePointerDown}
                        className="w-5 h-5 bg-amber-400 border-2 border-white rounded-full flex items-center justify-center cursor-grab active:cursor-grabbing shadow-sm hover:scale-110"
                        title="Повернуть объект"
                      >
                        <RotateCw className="w-2.5 h-2.5 text-stone-900" />
                      </div>
                      <div className="w-0.5 h-2 bg-amber-500" />
                    </div>

                    {/* Floating quick actions for selected object */}
                    <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 bg-stone-900/90 text-white rounded-xl px-2 py-1 flex items-center gap-2 shadow-lg z-50 animate-in fade-in">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const cloned = {
                            ...elem,
                            id: `${elem.type}-${Date.now()}`,
                            x: elem.x + 24,
                            y: elem.y + 24,
                            zIndex: elements.length + 1,
                          };
                          onElementCreate(cloned);
                          soundManager.playPop();
                        }}
                        title="Дублировать"
                        className="p-1 hover:text-amber-400"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onElementDelete(elem.id);
                          soundManager.playPop();
                          setSelectedElementId(null);
                        }}
                        title="Удалить"
                        className="p-1 hover:text-rose-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            );
          })}

        {/* REMOTE COLLABORATORS LIVE CURSORS WITH CAT AVATARS */}
        {remoteUsers.map((u) => {
          if (!u.cursor) return null;
          return (
            <div
              key={`remote-cursor-${u.id}`}
              className="absolute pointer-events-none transition-all duration-75 z-50"
              style={{
                transform: `translate(${u.cursor.x}px, ${u.cursor.y}px)`,
              }}
            >
              {/* Cute Cat Paw Cursor icon */}
              <div className="relative">
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill={u.color || '#F97316'}
                  stroke="#FFF"
                  strokeWidth="1.5"
                  className="drop-shadow-md transform -rotate-12"
                >
                  <path d="M12 2C8 2 6 5 6 8c0 2 1 3 2 4l-1 5c0 1 1 2 2 2h6c1 0 2-1 2-2l-1-5c1-1 2-2 2-4 0-3-2-6-6-6z" />
                  <circle cx="8" cy="6" r="1.5" fill="#FFF" />
                  <circle cx="12" cy="5" r="1.5" fill="#FFF" />
                  <circle cx="16" cy="6" r="1.5" fill="#FFF" />
                </svg>

                {/* Nickname & Avatar Tag */}
                <div
                  className="absolute left-6 top-3 flex items-center gap-1.5 px-2 py-0.5 rounded-full shadow-md text-white text-[11px] font-semibold whitespace-nowrap"
                  style={{ backgroundColor: u.color || '#F97316' }}
                >
                  <img
                    src={getAvatarSrc(u.avatar)}
                    alt={u.name}
                    className="w-4 h-4 rounded-full object-cover"
                  />
                  <span>{u.name}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* EMPTY STATE: "Доска пустая… котики ждут твоих идей 🐱" */}
      {elements.length === 0 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10 p-6">
          <div className="bg-white/80 dark:bg-stone-900/80 backdrop-blur-md p-6 rounded-3xl border border-amber-200/80 dark:border-stone-800 shadow-xl max-w-sm text-center pointer-events-auto animate-in fade-in zoom-in-95">
            <div className="text-5xl mb-3 animate-bounce">🐱💤</div>
            <h3 className="font-bold text-stone-800 dark:text-stone-100 text-lg mb-1 font-rounded">
              Доска пустая…
            </h3>
            <p className="text-xs text-stone-600 dark:text-stone-400 mb-4 font-medium">
              Котики свернулись клубочком и ждут твоих идей и рисунков!
            </p>
            <div className="flex flex-col gap-2">
              <button
                onClick={onQuickAddSticky}
                className="w-full py-2 px-3 text-xs font-semibold bg-amber-400 hover:bg-amber-300 text-stone-900 rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Наклеить первый кото-стикер 🐾</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FLOATING VIEWPORT ZOOM CONTROLS (BOTTOM RIGHT) */}
      <div className="absolute right-4 bottom-4 z-20 flex items-center gap-1 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md p-1.5 rounded-2xl border border-amber-200/80 dark:border-stone-800 shadow-lg text-xs font-medium text-stone-700 dark:text-stone-300">
        <button
          onClick={() => setViewport((v) => ({ ...v, zoom: Math.max(0.3, v.zoom - 0.15) }))}
          title="Уменьшить масштаб"
          className="p-1.5 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <span
          onClick={() => setViewport({ x: 0, y: 0, zoom: 1 })}
          title="Сбросить масштаб на 100%"
          className="px-2 py-0.5 hover:bg-amber-100 dark:hover:bg-stone-800 rounded-lg cursor-pointer font-mono tabular-nums"
        >
          {Math.round(viewport.zoom * 100)}%
        </span>
        <button
          onClick={() => setViewport((v) => ({ ...v, zoom: Math.min(3.0, v.zoom + 0.15) }))}
          title="Увеличить масштаб"
          className="p-1.5 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => setViewport({ x: 0, y: 0, zoom: 1 })}
          title="По центру"
          className="p-1.5 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 ml-1 border-l border-stone-200 dark:border-stone-700"
        >
          <Maximize className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
