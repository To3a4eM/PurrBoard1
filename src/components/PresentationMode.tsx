import React, { useEffect, useState } from 'react';
import { BoardFrame, BoardElement } from '../types/board';
import { ChevronLeft, ChevronRight, X, Flame } from 'lucide-react';
import { soundManager } from '../utils/audio';

interface PresentationModeProps {
  isOpen: boolean;
  onClose: () => void;
  frames: BoardFrame[];
  activeFrameId: string;
  onSwitchFrame: (frameId: string) => void;
  onLaserEmit: (point: { x: number; y: number }) => void;
  isDarkMode: boolean;
}

export const PresentationMode: React.FC<PresentationModeProps> = ({
  isOpen,
  onClose,
  frames,
  activeFrameId,
  onSwitchFrame,
  onLaserEmit,
  isDarkMode,
}) => {
  const [laserPoints, setLaserPoints] = useState<{ x: number; y: number; time: number }[]>([]);

  useEffect(() => {
    if (!isOpen) return;
    const timer = setInterval(() => {
      const now = Date.now();
      setLaserPoints((prev) => prev.filter((p) => now - p.time < 1200));
    }, 60);
    return () => clearInterval(timer);
  }, [isOpen]);

  const currentIndex = frames.findIndex((f) => f.id === activeFrameId);
  const currentFrame = frames[currentIndex] || frames[0];

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
        if (currentIndex < frames.length - 1) {
          soundManager.playBell();
          onSwitchFrame(frames[currentIndex + 1].id);
        }
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        if (currentIndex > 0) {
          soundManager.playBell();
          onSwitchFrame(frames[currentIndex - 1].id);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, frames, onSwitchFrame, onClose]);

  if (!isOpen) return null;

  const handlePointerMove = (e: React.PointerEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setLaserPoints((prev) => [...prev, { x, y, time: Date.now() }]);
    onLaserEmit({ x, y });
  };

  return (
    <div
      onPointerMove={handlePointerMove}
      className={`fixed inset-0 z-50 overflow-hidden flex flex-col cursor-crosshair select-none ${
        isDarkMode ? 'bg-paw-pattern-dark text-white' : 'bg-paw-pattern-light text-stone-900'
      }`}
    >
      {/* Laser overlay in presentation */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-40">
        {laserPoints.map((p, idx) => {
          const age = Date.now() - p.time;
          const opacity = Math.max(0, 1 - age / 1200);
          return (
            <g key={idx}>
              <circle cx={p.x} cy={p.y} r={9 * opacity} fill="#F43F5E" fillOpacity={opacity * 0.8} />
              <circle cx={p.x} cy={p.y} r={3 * opacity} fill="#FFF" fillOpacity={opacity} />
            </g>
          );
        })}
      </svg>

      {/* Floating Presentation Top Bar */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-stone-900/80 backdrop-blur-md text-white rounded-2xl px-4 py-2 flex items-center gap-4 shadow-2xl">
        <span className="text-xs font-bold font-rounded">
          🐾 Презентация: Кадр {currentIndex + 1} из {frames.length}
        </span>
        <div className="flex items-center gap-1 border-l border-white/20 pl-3">
          <button
            onClick={() => {
              if (currentIndex > 0) {
                soundManager.playBell();
                onSwitchFrame(frames[currentIndex - 1].id);
              }
            }}
            disabled={currentIndex === 0}
            className="p-1 rounded-lg hover:bg-white/20 disabled:opacity-30"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              if (currentIndex < frames.length - 1) {
                soundManager.playBell();
                onSwitchFrame(frames[currentIndex + 1].id);
              }
            }}
            disabled={currentIndex === frames.length - 1}
            className="p-1 rounded-lg hover:bg-white/20 disabled:opacity-30"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="flex items-center gap-2 border-l border-white/20 pl-3 text-xs text-rose-300">
          <Flame className="w-3.5 h-3.5" />
          <span>Лазер активен</span>
        </div>
        <button
          onClick={onClose}
          className="p-1 text-white/70 hover:text-white hover:bg-white/20 rounded-lg ml-2"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Frame Elements rendered in presentation */}
      <div className="relative w-full h-full flex items-center justify-center">
        <div className="relative w-[1280px] h-[720px] max-w-full max-h-full">
          {currentFrame?.elements.map((elem: BoardElement) => {
            if (elem.type === 'path') {
              return null; // paths rendered on svg
            }
            if (!('width' in elem)) return null;

            return (
              <div
                key={elem.id}
                className="absolute select-none pointer-events-none"
                style={{
                  transform: `translate(${elem.x}px, ${elem.y}px) rotate(${elem.rotation || 0}deg)`,
                  width: `${elem.width}px`,
                  height: `${elem.height}px`,
                  zIndex: elem.zIndex || 10,
                }}
              >
                {elem.type === 'sticky' && (
                  <div
                    className="w-full h-full rounded-2xl p-4 flex flex-col justify-between shadow-lg text-stone-900"
                    style={{ backgroundColor: elem.color }}
                  >
                    <div
                      className="font-rounded font-semibold text-center whitespace-pre-wrap"
                      style={{ fontSize: `${elem.fontSize || 16}px` }}
                    >
                      {elem.text}
                    </div>
                  </div>
                )}
                {elem.type === 'text' && (
                  <div
                    className="font-rounded font-bold p-2"
                    style={{ fontSize: `${elem.fontSize || 22}px`, color: elem.color }}
                  >
                    {elem.text}
                  </div>
                )}
                {elem.type === 'image' && (
                  <img
                    src={elem.src}
                    alt=""
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-contain rounded-2xl shadow-lg"
                  />
                )}
                {elem.type === 'shape' && (
                  <div className="w-full h-full flex items-center justify-center text-7xl">
                    {elem.shapeType === 'paw' ? '🐾' : elem.shapeType === 'heart' ? '❤️' : '🐱'}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
