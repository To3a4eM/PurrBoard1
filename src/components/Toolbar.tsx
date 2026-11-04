import React, { useState, useRef } from 'react';
import {
  MousePointer,
  PenTool,
  Eraser,
  StickyNote,
  PlusCircle,
  Shapes,
  Type,
  Flame,
  Upload,
  Smile,
  Film,
  Circle,
  Square,
  Heart,
  ArrowRight,
  Star,
  Check,
} from 'lucide-react';
import { ToolType, StickyStyle, ShapeType, CAT_COLORS, STICKY_PALETTE } from '../types/board';
import { soundManager } from '../utils/audio';

interface ToolbarProps {
  currentTool: ToolType;
  onSelectTool: (tool: ToolType) => void;
  // Pen settings
  penColor: string;
  onSelectPenColor: (color: string) => void;
  penWidth: number;
  onSelectPenWidth: (width: number) => void;
  penMode: 'pen' | 'brush' | 'marker';
  onSelectPenMode: (mode: 'pen' | 'brush' | 'marker') => void;
  // Sticky settings
  stickyStyle: StickyStyle;
  onSelectStickyStyle: (style: StickyStyle) => void;
  stickyColor: string;
  onSelectStickyColor: (color: string) => void;
  onCreateStickyQuick: () => void;
  // Shape settings
  shapeType: ShapeType;
  onSelectShapeType: (shape: ShapeType) => void;
  shapeFillColor: string;
  onSelectShapeFillColor: (color: string) => void;
  onCreateShapeQuick: () => void;
  // Modals
  onOpenStickerModal: () => void;
  onOpenGifModal: () => void;
  onUploadImage: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  currentTool,
  onSelectTool,
  penColor,
  onSelectPenColor,
  penWidth,
  onSelectPenWidth,
  penMode,
  onSelectPenMode,
  stickyStyle,
  onSelectStickyStyle,
  stickyColor,
  onSelectStickyColor,
  onCreateStickyQuick,
  shapeType,
  onSelectShapeType,
  shapeFillColor,
  onSelectShapeFillColor,
  onCreateShapeQuick,
  onOpenStickerModal,
  onOpenGifModal,
  onUploadImage,
}) => {
  const [activeFlyout, setActiveFlyout] = useState<
    'pen' | 'sticky' | 'add' | 'shape' | null
  >(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleFlyout = (flyout: 'pen' | 'sticky' | 'add' | 'shape') => {
    setActiveFlyout(activeFlyout === flyout ? null : flyout);
  };

  const handleToolClick = (tool: ToolType) => {
    soundManager.playPop();
    onSelectTool(tool);

    if (tool === 'pen' || tool === 'brush' || tool === 'marker') {
      toggleFlyout('pen');
    } else if (tool === 'sticky') {
      toggleFlyout('sticky');
    } else if (tool === 'shape') {
      toggleFlyout('shape');
    } else {
      setActiveFlyout(null);
    }
  };

  return (
    <div className="absolute left-4 top-24 z-20 flex flex-col items-center">
      {/* Hidden file input for image uploads */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => {
          onUploadImage(e);
          setActiveFlyout(null);
        }}
        className="hidden"
      />

      {/* Main vertical tool strip in Jamboard style */}
      <div className="bg-white/95 dark:bg-stone-900/95 backdrop-blur-md rounded-2xl p-2 border border-amber-200/80 dark:border-stone-800 shadow-xl flex flex-col items-center gap-1.5 transition-colors">
        {/* 1. SELECT / CURSOR */}
        <button
          onClick={() => handleToolClick('select')}
          title="Выбор и перемещение (V)"
          className={`relative p-2.5 rounded-xl transition-all group ${
            currentTool === 'select'
              ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 shadow-xs scale-105'
              : 'text-stone-600 dark:text-stone-400 hover:bg-amber-50/80 dark:hover:bg-stone-800'
          }`}
        >
          <MousePointer className="w-5 h-5 transition-transform group-hover:scale-110" />
          <span className="sr-only">Выбрать</span>
        </button>

        {/* 2. PEN & BRUSH */}
        <div className="relative">
          <button
            onClick={() => handleToolClick('pen')}
            title="Перо и кисть (P)"
            className={`relative p-2.5 rounded-xl transition-all group ${
              currentTool === 'pen' || currentTool === 'brush' || currentTool === 'marker'
                ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 shadow-xs scale-105'
                : 'text-stone-600 dark:text-stone-400 hover:bg-amber-50/80 dark:hover:bg-stone-800'
            }`}
          >
            <PenTool className="w-5 h-5 transition-transform group-hover:rotate-6" />
            <div
              className="absolute bottom-1 right-1 w-2.5 h-2.5 rounded-full border border-white dark:border-stone-900 shadow-xs"
              style={{ backgroundColor: penColor }}
            />
          </button>

          {/* Pen Submenu Flyout */}
          {activeFlyout === 'pen' && (
            <div className="absolute left-14 top-0 w-60 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-2xl shadow-2xl p-3 z-30 animate-in fade-in slide-in-from-left-2">
              <div className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider mb-2">
                Режим кисти
              </div>
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-stone-100 dark:bg-stone-800 rounded-xl mb-3">
                <button
                  onClick={() => onSelectPenMode('pen')}
                  className={`py-1 text-xs font-semibold rounded-lg transition-colors ${
                    penMode === 'pen'
                      ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-xs'
                      : 'text-stone-600 dark:text-stone-400'
                  }`}
                >
                  Перо
                </button>
                <button
                  onClick={() => onSelectPenMode('brush')}
                  className={`py-1 text-xs font-semibold rounded-lg transition-colors ${
                    penMode === 'brush'
                      ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-xs'
                      : 'text-stone-600 dark:text-stone-400'
                  }`}
                >
                  Кисть
                </button>
                <button
                  onClick={() => onSelectPenMode('marker')}
                  className={`py-1 text-xs font-semibold rounded-lg transition-colors ${
                    penMode === 'marker'
                      ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-xs'
                      : 'text-stone-600 dark:text-stone-400'
                  }`}
                >
                  Маркер
                </button>
              </div>

              {/* Thickness */}
              <div className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider mb-1.5">
                Толщина
              </div>
              <div className="flex items-center justify-between gap-1 mb-3 px-1">
                {[
                  { w: 3, label: 'Тонкая' },
                  { w: 7, label: 'Средняя' },
                  { w: 14, label: 'Жирная' },
                  { w: 24, label: 'Лапка' },
                ].map((size) => (
                  <button
                    key={size.w}
                    onClick={() => onSelectPenWidth(size.w)}
                    title={size.label}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                      penWidth === size.w
                        ? 'bg-amber-100 dark:bg-stone-800 border border-amber-400'
                        : 'hover:bg-stone-100 dark:hover:bg-stone-800'
                    }`}
                  >
                    <span
                      className="rounded-full bg-stone-800 dark:bg-stone-200"
                      style={{ width: `${Math.min(size.w, 18)}px`, height: `${Math.min(size.w, 18)}px` }}
                    />
                  </button>
                ))}
              </div>

              {/* Cat Palette */}
              <div className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider mb-1.5">
                Кошачья палитра
              </div>
              <div className="grid grid-cols-5 gap-2">
                {CAT_COLORS.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => onSelectPenColor(c.value)}
                    title={c.name}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-transform hover:scale-110 relative ${
                      c.borderClass || ''
                    }`}
                    style={{ backgroundColor: c.value }}
                  >
                    {penColor === c.value && (
                      <Check
                        className={`w-4 h-4 ${
                          c.value === '#FFFFFF' || c.value === '#EAB308'
                            ? 'text-stone-900'
                            : 'text-white'
                        }`}
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 3. ERASER */}
        <button
          onClick={() => handleToolClick('eraser')}
          title="Ластик (E)"
          className={`p-2.5 rounded-xl transition-all group ${
            currentTool === 'eraser'
              ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 shadow-xs scale-105'
              : 'text-stone-600 dark:text-stone-400 hover:bg-amber-50/80 dark:hover:bg-stone-800'
          }`}
        >
          <Eraser className="w-5 h-5 transition-transform group-hover:-rotate-12" />
        </button>

        {/* 4. STICKY NOTE */}
        <div className="relative">
          <button
            onClick={() => handleToolClick('sticky')}
            title="Кото-стикер (S)"
            className={`p-2.5 rounded-xl transition-all group ${
              currentTool === 'sticky'
                ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 shadow-xs scale-105'
                : 'text-stone-600 dark:text-stone-400 hover:bg-amber-50/80 dark:hover:bg-stone-800'
            }`}
          >
            <StickyNote className="w-5 h-5 transition-transform group-hover:scale-110" />
            <div
              className="absolute bottom-1 right-1 w-2.5 h-2.5 rounded-xs border border-stone-400 shadow-xs"
              style={{ backgroundColor: stickyColor }}
            />
          </button>

          {/* Sticky Submenu */}
          {activeFlyout === 'sticky' && (
            <div className="absolute left-14 top-0 w-64 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-2xl shadow-2xl p-3 z-30 animate-in fade-in slide-in-from-left-2">
              <div className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider mb-2">
                Форма стикера
              </div>
              <div className="grid grid-cols-3 gap-1.5 mb-3">
                <button
                  onClick={() => onSelectStickyStyle('cat-ears')}
                  className={`p-2 rounded-xl text-center flex flex-col items-center gap-1 border transition-all ${
                    stickyStyle === 'cat-ears'
                      ? 'border-amber-400 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200'
                      : 'border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800'
                  }`}
                >
                  <span className="text-lg">🐱</span>
                  <span className="text-[11px] font-medium">С ушками</span>
                </button>
                <button
                  onClick={() => onSelectStickyStyle('cat-face')}
                  className={`p-2 rounded-xl text-center flex flex-col items-center gap-1 border transition-all ${
                    stickyStyle === 'cat-face'
                      ? 'border-amber-400 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200'
                      : 'border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800'
                  }`}
                >
                  <span className="text-lg">😺</span>
                  <span className="text-[11px] font-medium">Мордочка</span>
                </button>
                <button
                  onClick={() => onSelectStickyStyle('classic')}
                  className={`p-2 rounded-xl text-center flex flex-col items-center gap-1 border transition-all ${
                    stickyStyle === 'classic'
                      ? 'border-amber-400 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200'
                      : 'border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800'
                  }`}
                >
                  <span className="text-lg">📄</span>
                  <span className="text-[11px] font-medium">Классик</span>
                </button>
              </div>

              {/* Pastel Colors */}
              <div className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider mb-2">
                Цвет стикера
              </div>
              <div className="grid grid-cols-6 gap-2 mb-3">
                {STICKY_PALETTE.map((p) => (
                  <button
                    key={p.bg}
                    onClick={() => onSelectStickyColor(p.bg)}
                    title={p.name}
                    className="w-8 h-8 rounded-lg flex items-center justify-center border border-stone-300 dark:border-stone-600 transition-transform hover:scale-110"
                    style={{ backgroundColor: p.bg }}
                  >
                    {stickyColor === p.bg && <Check className="w-4 h-4 text-stone-800" />}
                  </button>
                ))}
              </div>

              <button
                onClick={() => {
                  onCreateStickyQuick();
                  setActiveFlyout(null);
                }}
                className="w-full py-2 bg-amber-400 hover:bg-amber-300 text-stone-900 font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Наклеить стикер 🐾</span>
              </button>
            </div>
          )}
        </div>

        {/* 5. ADD CONTENT (IMAGE, GIF, STICKERS) */}
        <div className="relative">
          <button
            onClick={() => toggleFlyout('add')}
            title="Добавить изображение, стикер или GIF"
            className={`p-2.5 rounded-xl transition-all group ${
              activeFlyout === 'add'
                ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 shadow-xs scale-105'
                : 'text-stone-600 dark:text-stone-400 hover:bg-amber-50/80 dark:hover:bg-stone-800'
            }`}
          >
            <PlusCircle className="w-5 h-5 transition-transform group-hover:scale-110 text-amber-600 dark:text-amber-400" />
          </button>

          {/* Add Dropdown */}
          {activeFlyout === 'add' && (
            <div className="absolute left-14 top-0 w-60 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-2xl shadow-2xl p-2 z-30 animate-in fade-in slide-in-from-left-2">
              <div className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider px-2 py-1 mb-1">
                Добавить контент
              </div>
              <button
                onClick={() => {
                  fileInputRef.current?.click();
                }}
                className="w-full px-3 py-2 text-xs text-left rounded-xl hover:bg-amber-50 dark:hover:bg-stone-800 text-stone-800 dark:text-stone-200 flex items-center gap-2.5 transition-colors"
              >
                <Upload className="w-4 h-4 text-blue-500" />
                <span>Загрузить фото / картинку</span>
              </button>
              <button
                onClick={() => {
                  onOpenStickerModal();
                  setActiveFlyout(null);
                }}
                className="w-full px-3 py-2 text-xs text-left rounded-xl hover:bg-amber-50 dark:hover:bg-stone-800 text-stone-800 dark:text-stone-200 flex items-center gap-2.5 transition-colors"
              >
                <Smile className="w-4 h-4 text-amber-500" />
                <span>Кото-стикеры & Эмодзи 🐱</span>
              </button>
              <button
                onClick={() => {
                  onOpenGifModal();
                  setActiveFlyout(null);
                }}
                className="w-full px-3 py-2 text-xs text-left rounded-xl hover:bg-amber-50 dark:hover:bg-stone-800 text-stone-800 dark:text-stone-200 flex items-center gap-2.5 transition-colors"
              >
                <Film className="w-4 h-4 text-pink-500" />
                <span>Кошачьи GIF-анимации 🎬</span>
              </button>
            </div>
          )}
        </div>

        {/* 6. SHAPES */}
        <div className="relative">
          <button
            onClick={() => handleToolClick('shape')}
            title="Фигуры (Круг, Лапка, Сердечко и др.)"
            className={`p-2.5 rounded-xl transition-all group ${
              currentTool === 'shape'
                ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 shadow-xs scale-105'
                : 'text-stone-600 dark:text-stone-400 hover:bg-amber-50/80 dark:hover:bg-stone-800'
            }`}
          >
            <Shapes className="w-5 h-5 transition-transform group-hover:scale-110" />
          </button>

          {/* Shapes Flyout */}
          {activeFlyout === 'shape' && (
            <div className="absolute left-14 top-0 w-64 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-2xl shadow-2xl p-3 z-30 animate-in fade-in slide-in-from-left-2">
              <div className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider mb-2">
                Выбрать фигуру
              </div>
              <div className="grid grid-cols-3 gap-2 mb-3">
                {[
                  { id: 'paw', label: 'Лапка 🐾', icon: '🐾' },
                  { id: 'cat-head', label: 'Мордочка 🐱', icon: '🐱' },
                  { id: 'heart', label: 'Сердце ❤️', icon: '❤️' },
                  { id: 'fish', label: 'Рыбка 🐟', icon: '🐟' },
                  { id: 'yarn', label: 'Клубок 🧶', icon: '🧶' },
                  { id: 'star', label: 'Звезда ⭐', icon: '⭐' },
                  { id: 'circle', label: 'Круг ⚪', icon: '⚪' },
                  { id: 'rectangle', label: 'Квадрат ⬛', icon: '⬛' },
                  { id: 'arrow', label: 'Стрелка ➔', icon: '➔' },
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => onSelectShapeType(s.id as ShapeType)}
                    className={`p-2 rounded-xl text-center flex flex-col items-center gap-1 border transition-all ${
                      shapeType === s.id
                        ? 'border-amber-400 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200'
                        : 'border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800'
                    }`}
                  >
                    <span className="text-xl">{s.icon}</span>
                    <span className="text-[10px] font-medium truncate w-full">{s.label}</span>
                  </button>
                ))}
              </div>

              {/* Fill Color */}
              <div className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider mb-1.5">
                Цвет заливки
              </div>
              <div className="grid grid-cols-5 gap-2 mb-3">
                {CAT_COLORS.slice(0, 5).map((c) => (
                  <button
                    key={c.id}
                    onClick={() => onSelectShapeFillColor(c.value)}
                    className="w-7 h-7 rounded-full flex items-center justify-center transition-transform hover:scale-110"
                    style={{ backgroundColor: c.value }}
                  >
                    {shapeFillColor === c.value && <Check className="w-3.5 h-3.5 text-white" />}
                  </button>
                ))}
              </div>

              <button
                onClick={() => {
                  onCreateShapeQuick();
                  setActiveFlyout(null);
                }}
                className="w-full py-2 bg-amber-400 hover:bg-amber-300 text-stone-900 font-semibold text-xs rounded-xl shadow-xs transition-colors"
              >
                Добавить фигуру на доску
              </button>
            </div>
          )}
        </div>

        {/* 7. TEXT TOOL */}
        <button
          onClick={() => handleToolClick('text')}
          title="Текстовое поле (T)"
          className={`p-2.5 rounded-xl transition-all group ${
            currentTool === 'text'
              ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 shadow-xs scale-105'
              : 'text-stone-600 dark:text-stone-400 hover:bg-amber-50/80 dark:hover:bg-stone-800'
          }`}
        >
          <Type className="w-5 h-5 transition-transform group-hover:scale-110" />
        </button>

        {/* 8. LASER POINTER (CAT TOY) */}
        <button
          onClick={() => handleToolClick('laser')}
          title="Кошачья лазерная указка (L)"
          className={`p-2.5 rounded-xl transition-all group ${
            currentTool === 'laser'
              ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 shadow-xs scale-105'
              : 'text-stone-600 dark:text-stone-400 hover:bg-rose-50/80 dark:hover:bg-stone-800'
          }`}
        >
          <Flame className="w-5 h-5 text-rose-500 animate-pulse" />
        </button>
      </div>

      {/* Sleeping cat cozy icon below the toolbar */}
      <div
        className="mt-3 select-none flex flex-col items-center opacity-80 hover:opacity-100 transition-opacity cursor-pointer group"
        onClick={() => soundManager.playMeow()}
        title="Погладить котика"
      >
        <span className="text-2xl group-hover:animate-bounce">🐱</span>
        <span className="text-[10px] font-semibold text-amber-800/60 dark:text-amber-400/60 font-rounded">
          мурр...
        </span>
      </div>
    </div>
  );
};
