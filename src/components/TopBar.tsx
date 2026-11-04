import React, { useState, useRef, useEffect } from 'react';
import {
  Undo2,
  Redo2,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Share2,
  Download,
  Volume2,
  VolumeX,
  Sun,
  Moon,
  Maximize2,
  Image as ImageIcon,
  Grid,
  Sparkles,
  User as UserIcon,
  Check,
} from 'lucide-react';
import { User, BoardFrame, BackgroundPattern } from '../types/board';
import { soundManager } from '../utils/audio';
import { CAT_AVATARS } from '../utils/catStickers';

interface TopBarProps {
  boardName: string;
  onRenameBoard: (newName: string) => void;
  frames: BoardFrame[];
  activeFrameId: string;
  onSwitchFrame: (frameId: string) => void;
  onCreateFrame: () => void;
  onClearFrame: () => void;
  onOpenFrameDrawer: () => void;
  isFrameDrawerOpen: boolean;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  users: User[];
  currentUser: User;
  onOpenProfile: () => void;
  onOpenShare: () => void;
  onTogglePresentation: () => void;
  onExport: (format: 'png' | 'svg' | 'json') => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  currentPattern: BackgroundPattern;
  onChangePattern: (pattern: BackgroundPattern) => void;
  isConnected: boolean;
  roomId: string;
}

export const TopBar: React.FC<TopBarProps> = ({
  boardName,
  onRenameBoard,
  frames,
  activeFrameId,
  onSwitchFrame,
  onCreateFrame,
  onClearFrame,
  onOpenFrameDrawer,
  isFrameDrawerOpen,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  users,
  currentUser,
  onOpenProfile,
  onOpenShare,
  onTogglePresentation,
  onExport,
  isDarkMode,
  onToggleTheme,
  currentPattern,
  onChangePattern,
  isConnected,
  roomId,
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState(boardName);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showBgMenu, setShowBgMenu] = useState(false);
  const [isMuted, setIsMuted] = useState(soundManager.getMuted());
  const titleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTempTitle(boardName);
  }, [boardName]);

  useEffect(() => {
    if (isEditingTitle) {
      titleInputRef.current?.focus();
      titleInputRef.current?.select();
    }
  }, [isEditingTitle]);

  const activeIndex = frames.findIndex((f) => f.id === activeFrameId);
  const currentFrameNumber = activeIndex !== -1 ? activeIndex + 1 : 1;

  const handlePrevFrame = () => {
    if (activeIndex > 0) {
      soundManager.playBell();
      onSwitchFrame(frames[activeIndex - 1].id);
    }
  };

  const handleNextFrame = () => {
    if (activeIndex < frames.length - 1) {
      soundManager.playBell();
      onSwitchFrame(frames[activeIndex + 1].id);
    } else {
      soundManager.playPop();
      onCreateFrame();
    }
  };

  const handleTitleSubmit = () => {
    setIsEditingTitle(false);
    if (tempTitle.trim() && tempTitle !== boardName) {
      onRenameBoard(tempTitle.trim());
    } else {
      setTempTitle(boardName);
    }
  };

  const handleToggleMute = () => {
    const muted = soundManager.toggleMute();
    setIsMuted(muted);
    if (!muted) {
      soundManager.playMeow();
    }
  };

  const getAvatarSrc = (avatarKey: string) => {
    const found = CAT_AVATARS.find((a) => a.id === avatarKey);
    return found ? found.src : CAT_AVATARS[0].src;
  };

  return (
    <header className="h-16 px-4 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border-b border-amber-200/60 dark:border-stone-800 flex items-center justify-between gap-4 z-30 select-none shadow-sm transition-colors">
      {/* ZONE 1: BRAND & BOARD INFO */}
      <div className="flex items-center gap-3 min-w-0 shrink-0">
        <div className="flex items-center gap-2 group cursor-pointer" onClick={onOpenProfile}>
          <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950/70 border border-amber-300 dark:border-amber-800 flex items-center justify-center text-xl shadow-xs group-hover:scale-105 group-hover:rotate-3 transition-transform">
            🐾
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-bold text-base tracking-tight text-stone-900 dark:text-amber-100">
                PurrBoard
              </span>
              <span className="text-[11px] font-medium text-amber-700 dark:text-amber-400 bg-amber-100/80 dark:bg-amber-900/40 px-1.5 py-0.5 rounded-md">
                КотоБорд
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400">
              {isEditingTitle ? (
                <input
                  ref={titleInputRef}
                  type="text"
                  value={tempTitle}
                  onChange={(e) => setTempTitle(e.target.value)}
                  onBlur={handleTitleSubmit}
                  onKeyDown={(e) => e.key === 'Enter' && handleTitleSubmit()}
                  className="px-1.5 py-0.5 text-xs font-medium rounded border border-amber-400 bg-amber-50 dark:bg-stone-800 text-stone-800 dark:text-stone-200 outline-none w-44"
                />
              ) : (
                <span
                  onClick={() => setIsEditingTitle(true)}
                  className="hover:underline cursor-pointer truncate max-w-[160px] text-stone-600 dark:text-stone-300 font-medium"
                  title="Нажмите, чтобы переименовать"
                >
                  {boardName}
                </span>
              )}
              <span aria-hidden="true" className="text-stone-300 dark:text-stone-600">·</span>
              <span className="flex items-center gap-1">
                <span
                  className={`w-2 h-2 rounded-full ${
                    isConnected ? 'bg-emerald-500' : 'bg-amber-500'
                  }`}
                />
                <span className="text-[11px]">
                  {isConnected ? 'В сети' : 'Офлайн'}
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ZONE 2: GOOGLE JAMBOARD FRAME CONTROLS (CENTER) */}
      <div className="flex items-center gap-2 bg-stone-100/90 dark:bg-stone-800/80 p-1 rounded-2xl border border-stone-200/80 dark:border-stone-700/80 shadow-xs">
        {/* Undo & Redo */}
        <div className="flex items-center pr-1 border-r border-stone-200 dark:border-stone-700">
          <button
            onClick={() => {
              if (canUndo) {
                soundManager.playPop();
                onUndo();
              }
            }}
            disabled={!canUndo}
            title="Отменить (Ctrl+Z)"
            className="p-1.5 rounded-xl text-stone-600 dark:text-stone-300 hover:bg-stone-200/70 dark:hover:bg-stone-700 disabled:opacity-35 disabled:hover:bg-transparent transition-colors"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              if (canRedo) {
                soundManager.playPop();
                onRedo();
              }
            }}
            disabled={!canRedo}
            title="Повторить (Ctrl+Y)"
            className="p-1.5 rounded-xl text-stone-600 dark:text-stone-300 hover:bg-stone-200/70 dark:hover:bg-stone-700 disabled:opacity-35 disabled:hover:bg-transparent transition-colors"
          >
            <Redo2 className="w-4 h-4" />
          </button>
        </div>

        {/* Frame Navigator: < Frame X / Y > */}
        <div className="flex items-center gap-1 px-1">
          <button
            onClick={handlePrevFrame}
            disabled={activeIndex === 0}
            title="Предыдущий кадр"
            className="p-1.5 rounded-xl text-stone-700 dark:text-stone-300 hover:bg-stone-200/70 dark:hover:bg-stone-700 disabled:opacity-35 disabled:hover:bg-transparent transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenFrameDrawer}
            title="Открыть обзор всех кадров"
            className={`px-3 py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              isFrameDrawerOpen
                ? 'bg-amber-400 text-stone-900 shadow-xs'
                : 'bg-white dark:bg-stone-900 text-stone-800 dark:text-stone-200 hover:bg-amber-50 dark:hover:bg-stone-800 border border-stone-200 dark:border-stone-700'
            }`}
          >
            <span>🐱 Кадр {currentFrameNumber} / {frames.length}</span>
          </button>

          <button
            onClick={handleNextFrame}
            title={activeIndex === frames.length - 1 ? 'Создать следующий кадр' : 'Следующий кадр'}
            className="p-1.5 rounded-xl text-stone-700 dark:text-stone-300 hover:bg-stone-200/70 dark:hover:bg-stone-700 transition-colors"
          >
            {activeIndex === frames.length - 1 ? (
              <Plus className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Clear Frame Button */}
        <div className="pl-1 border-l border-stone-200 dark:border-stone-700">
          <button
            onClick={() => {
              if (window.confirm('Очистить этот кадр от всех рисунков и объектов?')) {
                soundManager.playPurr();
                onClearFrame();
              }
            }}
            title="Очистить кадр"
            className="px-2.5 py-1 text-xs font-medium text-stone-600 dark:text-stone-300 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors flex items-center gap-1"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Очистить</span>
          </button>
        </div>
      </div>

      {/* ZONE 3: ACTIONS & COLLABORATORS */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Background Pattern Selector */}
        <div className="relative">
          <button
            onClick={() => setShowBgMenu(!showBgMenu)}
            title="Фон и паттерн доски"
            className="p-2 rounded-xl text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors flex items-center gap-1 text-xs font-medium border border-transparent hover:border-stone-200 dark:hover:border-stone-700"
          >
            <Grid className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span className="hidden lg:inline">Фон</span>
          </button>

          {showBgMenu && (
            <div
              className="absolute right-0 mt-2 w-44 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in zoom-in-95"
              onMouseLeave={() => setShowBgMenu(false)}
            >
              <div className="px-3 py-1 text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
                Узор холста
              </div>
              <button
                onClick={() => {
                  onChangePattern('paw');
                  setShowBgMenu(false);
                }}
                className={`w-full px-3 py-1.5 text-xs text-left flex items-center justify-between hover:bg-amber-50 dark:hover:bg-stone-800 ${
                  currentPattern === 'paw' ? 'text-amber-700 dark:text-amber-400 font-semibold' : 'text-stone-700 dark:text-stone-300'
                }`}
              >
                <span>🐾 Кошачьи лапки</span>
                {currentPattern === 'paw' && <Check className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => {
                  onChangePattern('dots');
                  setShowBgMenu(false);
                }}
                className={`w-full px-3 py-1.5 text-xs text-left flex items-center justify-between hover:bg-amber-50 dark:hover:bg-stone-800 ${
                  currentPattern === 'dots' ? 'text-amber-700 dark:text-amber-400 font-semibold' : 'text-stone-700 dark:text-stone-300'
                }`}
              >
                <span>⚪ Мягкие точки</span>
                {currentPattern === 'dots' && <Check className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => {
                  onChangePattern('grid');
                  setShowBgMenu(false);
                }}
                className={`w-full px-3 py-1.5 text-xs text-left flex items-center justify-between hover:bg-amber-50 dark:hover:bg-stone-800 ${
                  currentPattern === 'grid' ? 'text-amber-700 dark:text-amber-400 font-semibold' : 'text-stone-700 dark:text-stone-300'
                }`}
              >
                <span>📐 Тетрадь в клетку</span>
                {currentPattern === 'grid' && <Check className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => {
                  onChangePattern('blank');
                  setShowBgMenu(false);
                }}
                className={`w-full px-3 py-1.5 text-xs text-left flex items-center justify-between hover:bg-amber-50 dark:hover:bg-stone-800 ${
                  currentPattern === 'blank' ? 'text-amber-700 dark:text-amber-400 font-semibold' : 'text-stone-700 dark:text-stone-300'
                }`}
              >
                <span>☁️ Чистый лист</span>
                {currentPattern === 'blank' && <Check className="w-3.5 h-3.5" />}
              </button>
            </div>
          )}
        </div>

        {/* Audio Mute/Unmute */}
        <button
          onClick={handleToggleMute}
          title={isMuted ? 'Включить мяуканье и звуки' : 'Выключить звуки'}
          className="p-2 rounded-xl text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-stone-400" /> : <Volume2 className="w-4 h-4 text-amber-600 dark:text-amber-400" />}
        </button>

        {/* Theme Toggle (Day / Night Cat) */}
        <button
          onClick={onToggleTheme}
          title={isDarkMode ? 'Светлый режим' : 'Ночной котик (Тёмная тема)'}
          className="p-2 rounded-xl text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
        >
          {isDarkMode ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-stone-600" />}
        </button>

        {/* Fullscreen Presentation Mode */}
        <button
          onClick={onTogglePresentation}
          title="Режим презентации"
          className="p-2 rounded-xl text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors hidden sm:flex"
        >
          <Maximize2 className="w-4 h-4" />
        </button>

        {/* Export Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowExportMenu(!showExportMenu)}
            title="Экспортировать доску"
            className="p-2 rounded-xl text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            <Download className="w-4 h-4" />
          </button>

          {showExportMenu && (
            <div
              className="absolute right-0 mt-2 w-48 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in zoom-in-95"
              onMouseLeave={() => setShowExportMenu(false)}
            >
              <div className="px-3 py-1 text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
                Сохранить как
              </div>
              <button
                onClick={() => {
                  onExport('png');
                  setShowExportMenu(false);
                }}
                className="w-full px-3 py-2 text-xs text-left text-stone-700 dark:text-stone-300 hover:bg-amber-50 dark:hover:bg-stone-800 flex items-center gap-2"
              >
                <ImageIcon className="w-4 h-4 text-amber-500" />
                <span>Изображение PNG</span>
              </button>
              <button
                onClick={() => {
                  onExport('svg');
                  setShowExportMenu(false);
                }}
                className="w-full px-3 py-2 text-xs text-left text-stone-700 dark:text-stone-300 hover:bg-amber-50 dark:hover:bg-stone-800 flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-violet-500" />
                <span>Векторный SVG</span>
              </button>
              <button
                onClick={() => {
                  onExport('json');
                  setShowExportMenu(false);
                }}
                className="w-full px-3 py-2 text-xs text-left text-stone-700 dark:text-stone-300 hover:bg-amber-50 dark:hover:bg-stone-800 flex items-center gap-2"
              >
                <span className="font-mono text-xs text-blue-500">{'{ }'}</span>
                <span>Файл доски (JSON)</span>
              </button>
            </div>
          )}
        </div>

        {/* Collaborators Avatars */}
        <div
          className="flex items-center -space-x-2 cursor-pointer pl-1 group"
          onClick={onOpenProfile}
          title="Мой кошачий профиль (нажмите для смены)"
        >
          {users.slice(0, 4).map((u) => (
            <div
              key={u.id}
              className="relative w-8 h-8 rounded-full ring-2 ring-white dark:ring-stone-900 overflow-hidden bg-amber-100 shadow-xs hover:scale-110 hover:z-10 transition-transform"
              title={`${u.name} ${u.id === currentUser.id ? '(Вы)' : ''}`}
            >
              <img
                src={getAvatarSrc(u.avatar)}
                alt={u.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              {u.id === currentUser.id && (
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border border-white rounded-full" />
              )}
            </div>
          ))}
          {users.length > 4 && (
            <div className="w-8 h-8 rounded-full bg-amber-200 text-stone-700 text-xs font-bold flex items-center justify-center ring-2 ring-white dark:ring-stone-900">
              +{users.length - 4}
            </div>
          )}
        </div>

        {/* Primary Share Action */}
        <button
          onClick={onOpenShare}
          className="px-3.5 py-1.5 text-xs font-semibold text-stone-900 bg-amber-400 hover:bg-amber-300 active:scale-95 rounded-xl shadow-xs transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Поделиться</span>
        </button>
      </div>
    </header>
  );
};
