import React from 'react';
import { BoardFrame } from '../../types/board';
import { Plus, Trash2, Copy, X } from 'lucide-react';
import { soundManager } from '../../utils/audio';

interface FrameDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  frames: BoardFrame[];
  activeFrameId: string;
  onSelectFrame: (id: string) => void;
  onCreateFrame: () => void;
  onDuplicateFrame: (id: string) => void;
  onDeleteFrame: (id: string) => void;
}

export const FrameDrawer: React.FC<FrameDrawerProps> = ({
  isOpen,
  onClose,
  frames,
  activeFrameId,
  onSelectFrame,
  onCreateFrame,
  onDuplicateFrame,
  onDeleteFrame,
}) => {
  if (!isOpen) return null;

  return (
    <div className="absolute top-16 left-0 right-0 z-30 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border-b border-amber-200/80 dark:border-stone-800 shadow-xl py-4 px-6 animate-in slide-in-from-top-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-stone-900 dark:text-stone-100 font-rounded">
              🐱 Обзор всех кадров доски
            </span>
            <span className="text-xs text-stone-500 dark:text-stone-400">
              ({frames.length} {frames.length === 1 ? 'кадр' : 'кадра'})
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Horizontal scroll of frame thumbnails */}
        <div className="flex items-center gap-4 overflow-x-auto pb-2 pt-1">
          {frames.map((frame, index) => {
            const isActive = frame.id === activeFrameId;
            return (
              <div
                key={frame.id}
                onClick={() => {
                  soundManager.playBell();
                  onSelectFrame(frame.id);
                }}
                className={`relative group shrink-0 w-44 h-28 rounded-2xl p-2 cursor-pointer transition-all border-2 flex flex-col justify-between shadow-xs ${
                  isActive
                    ? 'border-amber-400 bg-amber-50/70 dark:bg-amber-950/40 ring-2 ring-amber-300'
                    : 'border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 hover:border-amber-300'
                }`}
              >
                {/* Thumbnail header */}
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-stone-700 dark:text-stone-300 truncate">
                    {index + 1}. {frame.title || `Кадр ${index + 1}`}
                  </span>
                  <span className="text-[10px] text-stone-400">
                    {frame.elements.length} эл.
                  </span>
                </div>

                {/* Miniature preview representation */}
                <div className="w-full h-12 bg-white/70 dark:bg-stone-900/70 rounded-lg flex items-center justify-center overflow-hidden border border-black/5">
                  {frame.elements.length === 0 ? (
                    <span className="text-[10px] text-stone-400">🐾 Пусто</span>
                  ) : (
                    <div className="flex items-center gap-1 opacity-70 scale-90">
                      {frame.elements.slice(0, 3).map((el, i) => (
                        <div
                          key={i}
                          className="w-4 h-4 rounded-sm bg-amber-300 text-[8px] flex items-center justify-center"
                        >
                          {el.type === 'sticky' ? '📝' : el.type === 'path' ? '✏️' : '🐱'}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Hover actions: Duplicate & Delete */}
                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      soundManager.playPop();
                      onDuplicateFrame(frame.id);
                    }}
                    title="Дублировать кадр"
                    className="p-1 text-stone-600 dark:text-stone-300 hover:text-amber-600 rounded-md hover:bg-white dark:hover:bg-stone-700"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                  {frames.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm('Удалить этот кадр?')) {
                          soundManager.playPurr();
                          onDeleteFrame(frame.id);
                        }
                      }}
                      title="Удалить кадр"
                      className="p-1 text-stone-600 dark:text-stone-300 hover:text-rose-600 rounded-md hover:bg-white dark:hover:bg-stone-700"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {/* Add Frame Card */}
          <button
            onClick={() => {
              soundManager.playPop();
              onCreateFrame();
            }}
            className="shrink-0 w-36 h-28 rounded-2xl border-2 border-dashed border-amber-300 dark:border-stone-700 hover:border-amber-400 hover:bg-amber-50/50 dark:hover:bg-stone-800 flex flex-col items-center justify-center gap-1.5 transition-colors text-amber-700 dark:text-amber-400 group"
          >
            <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Plus className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold">Новый кадр</span>
          </button>
        </div>
      </div>
    </div>
  );
};
