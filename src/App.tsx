/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ToolType,
  StickyStyle,
  ShapeType,
  BackgroundPattern,
  BoardFrame,
  BoardElement,
  User,
  LaserPoint,
  CAT_COLORS,
  STICKY_PALETTE,
} from './types/board';
import { TopBar } from './components/TopBar';
import { Toolbar } from './components/Toolbar';
import { Canvas } from './components/Canvas';
import { FrameDrawer } from './components/Modals/FrameDrawer';
import { StickerPickerModal } from './components/Modals/StickerPickerModal';
import { GifPickerModal } from './components/Modals/GifPickerModal';
import { ShareModal } from './components/Modals/ShareModal';
import { CatProfileModal } from './components/Modals/CatProfileModal';
import { PresentationMode } from './components/PresentationMode';
import { usePurrBoardSocket } from './hooks/usePurrBoardSocket';
import { soundManager } from './utils/audio';
import { exportBoardAsPng, exportBoardAsSvg, exportBoardAsJson } from './utils/export';
import { CatStickerDef } from './utils/catStickers';

// Helper to generate IDs
const genId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

// Initial starter frames if offline or starting fresh
const initialDefaultFrames: BoardFrame[] = [
  {
    id: 'frame-1',
    title: 'Уютный кадр 1',
    background: 'paw',
    backgroundColor: '#faf7f2',
    elements: [
      {
        id: 'welcome-sticky-1',
        type: 'sticky',
        style: 'cat-ears',
        x: 220,
        y: 140,
        width: 220,
        height: 220,
        rotation: -2,
        zIndex: 1,
        authorId: 'system',
        authorName: 'КотоБорд',
        color: '#FEF08A',
        text: '🐾 Мяу! Добро пожаловать в PurrBoard!\n\nРисуй, клей стикеры с ушками и делись идеями с друзьями в реальном времени! 🐱✨',
        fontSize: 16,
        fontFamily: 'Quicksand',
        textAlign: 'center',
      },
      {
        id: 'welcome-sticker-1',
        type: 'sticker',
        x: 480,
        y: 130,
        width: 170,
        height: 170,
        rotation: 4,
        zIndex: 2,
        authorId: 'system',
        authorName: 'КотоБорд',
        stickerId: 'loaf-cat',
        name: 'Котик-батончик',
      },
      {
        id: 'welcome-sticky-2',
        type: 'sticky',
        style: 'cat-face',
        x: 680,
        y: 170,
        width: 230,
        height: 230,
        rotation: 3,
        zIndex: 3,
        authorId: 'system',
        authorName: 'КотоБорд',
        color: '#FBCFE8',
        text: '🧶 Попробуй инструменты слева:\n\n• Кисть и карандаш\n• Лазерная указка\n• Фигуры-лапки и сердечки\n• Загрузка картинок и GIF!',
        fontSize: 15,
        fontFamily: 'Quicksand',
        textAlign: 'center',
      },
    ],
  },
];

export default function App() {
  // 1. Room ID from URL
  const [roomId, setRoomId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('room') || 'purr-lounge';
    }
    return 'purr-lounge';
  });

  // 2. Current User Profile
  const [currentUser, setCurrentUser] = useState<User>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('purrboard_user');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // ignore
        }
      }
    }
    const catNames = ['Рыжик', 'Барсик', 'Мурка', 'Зефирка', 'Пушок', 'Персик', 'Бусинка'];
    const randomName = catNames[Math.floor(Math.random() * catNames.length)];
    return {
      id: genId('user'),
      name: randomName,
      avatar: 'ginger',
      color: '#EA580C',
    };
  });

  useEffect(() => {
    localStorage.setItem('purrboard_user', JSON.stringify(currentUser));
  }, [currentUser]);

  // 3. Dark Mode
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('purrboard_dark') === 'true';
    }
    return false;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('purrboard_dark', String(isDarkMode));
  }, [isDarkMode]);

  // 4. Whiteboard State
  const [boardName, setBoardName] = useState('Мурчащая доска');
  const [frames, setFrames] = useState<BoardFrame[]>(initialDefaultFrames);
  const [activeFrameId, setActiveFrameId] = useState<string>(initialDefaultFrames[0].id);

  // Active Frame & Elements
  const activeFrame = frames.find((f) => f.id === activeFrameId) || frames[0] || initialDefaultFrames[0];
  const elements = activeFrame.elements || [];

  // Undo / Redo history
  const [history, setHistory] = useState<BoardElement[][]>([elements]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const pushHistory = useCallback((newElements: BoardElement[]) => {
    setHistory((prev) => {
      const trimmed = prev.slice(0, historyIndex + 1);
      if (trimmed.length > 25) trimmed.shift();
      return [...trimmed, newElements];
    });
    setHistoryIndex((prev) => Math.min(prev + 1, 25));
  }, [historyIndex]);

  // Active collaborators
  const [remoteUsers, setRemoteUsers] = useState<User[]>([]);
  const [remoteLaserPoints, setRemoteLaserPoints] = useState<LaserPoint[]>([]);

  // 5. Tools State
  const [currentTool, setCurrentTool] = useState<ToolType>('select');
  const [penColor, setPenColor] = useState(CAT_COLORS[0].value);
  const [penWidth, setPenWidth] = useState(6);
  const [penMode, setPenMode] = useState<'pen' | 'brush' | 'marker'>('pen');
  const [stickyStyle, setStickyStyle] = useState<StickyStyle>('cat-ears');
  const [stickyColor, setStickyColor] = useState(STICKY_PALETTE[0].bg);
  const [shapeType, setShapeType] = useState<ShapeType>('paw');
  const [shapeFillColor, setShapeFillColor] = useState(CAT_COLORS[0].value);

  // 6. Modals
  const [isFrameDrawerOpen, setIsFrameDrawerOpen] = useState(false);
  const [isStickerModalOpen, setIsStickerModalOpen] = useState(false);
  const [isGifModalOpen, setIsGifModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isPresentationOpen, setIsPresentationOpen] = useState(false);

  // 7. WebSocket Integration
  const {
    isConnected,
    sendCursor,
    sendLaser,
    sendCreateElement,
    sendUpdateElement,
    sendDeleteElement,
    sendCreateFrame,
    sendSwitchFrame,
    sendUpdateFrameBg,
    sendDeleteFrame,
    sendClearFrame,
    sendRenameBoard,
  } = usePurrBoardSocket({
    roomId,
    currentUser,
    onInitState: (state) => {
      if (state.name) setBoardName(state.name);
      if (state.frames && state.frames.length > 0) {
        setFrames(state.frames);
        setActiveFrameId(state.activeFrameId || state.frames[0].id);
        const cur = state.frames.find((f) => f.id === state.activeFrameId) || state.frames[0];
        setHistory([cur.elements || []]);
        setHistoryIndex(0);
      }
      if (state.users) {
        setRemoteUsers(state.users.filter((u) => u.id !== currentUser.id));
      }
    },
    onUserJoined: (user, users) => {
      soundManager.playBell();
      setRemoteUsers(users.filter((u) => u.id !== currentUser.id));
    },
    onUserLeft: (userId, users) => {
      setRemoteUsers(users.filter((u) => u.id !== currentUser.id));
    },
    onRemoteCursor: (userId, cursor) => {
      setRemoteUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, cursor } : u))
      );
    },
    onRemoteLaser: (userId, point, authorColor) => {
      setRemoteLaserPoints((prev) => [
        ...prev.slice(-30),
        { userId, x: point.x, y: point.y, authorColor, timestamp: Date.now() },
      ]);
    },
    onRemoteElementCreated: (frameId, element) => {
      setFrames((prev) =>
        prev.map((f) => {
          if (f.id === frameId) {
            const exists = f.elements.some((e) => e.id === element.id);
            return exists ? f : { ...f, elements: [...f.elements, element] };
          }
          return f;
        })
      );
    },
    onRemoteElementUpdated: (frameId, elementId, updates) => {
      setFrames((prev) =>
        prev.map((f) => {
          if (f.id === frameId) {
            return {
              ...f,
              elements: f.elements.map((e) =>
                e.id === elementId ? ({ ...e, ...updates } as BoardElement) : e
              ),
            };
          }
          return f;
        })
      );
    },
    onRemoteElementDeleted: (frameId, elementId) => {
      setFrames((prev) =>
        prev.map((f) => {
          if (f.id === frameId) {
            return {
              ...f,
              elements: f.elements.filter((e) => e.id !== elementId),
            };
          }
          return f;
        })
      );
    },
    onRemoteFrameCreated: (newFrame, newActiveId) => {
      setFrames((prev) => [...prev, newFrame]);
      setActiveFrameId(newActiveId);
    },
    onRemoteFrameSwitched: (newActiveId) => {
      setActiveFrameId(newActiveId);
    },
    onRemoteFrameBgUpdated: (frameId, background, bgCol) => {
      setFrames((prev) =>
        prev.map((f) => (f.id === frameId ? { ...f, background, backgroundColor: bgCol } : f))
      );
    },
    onRemoteFrameDeleted: (deletedId, remainingFrames, newActiveId) => {
      setFrames(remainingFrames);
      setActiveFrameId(newActiveId);
    },
    onRemoteFrameCleared: (frameId) => {
      setFrames((prev) =>
        prev.map((f) => (f.id === frameId ? { ...f, elements: [] } : f))
      );
    },
    onRemoteBoardRenamed: (newName) => {
      setBoardName(newName);
    },
  });

  // Handle local element mutations
  const handleElementCreate = useCallback(
    (newElement: BoardElement) => {
      const updated = [...elements, newElement];
      setFrames((prev) =>
        prev.map((f) => (f.id === activeFrameId ? { ...f, elements: updated } : f))
      );
      pushHistory(updated);
      sendCreateElement(activeFrameId, newElement);
    },
    [activeFrameId, elements, pushHistory, sendCreateElement]
  );

  const handleElementUpdate = useCallback(
    (elementId: string, updates: Partial<BoardElement>) => {
      const updated = elements.map((e) =>
        e.id === elementId ? ({ ...e, ...updates } as BoardElement) : e
      );
      setFrames((prev) =>
        prev.map((f) => (f.id === activeFrameId ? { ...f, elements: updated } : f))
      );
      sendUpdateElement(activeFrameId, elementId, updates);
    },
    [activeFrameId, elements, sendUpdateElement]
  );

  const handleElementDelete = useCallback(
    (elementId: string) => {
      const updated = elements.filter((e) => e.id !== elementId);
      setFrames((prev) =>
        prev.map((f) => (f.id === activeFrameId ? { ...f, elements: updated } : f))
      );
      pushHistory(updated);
      sendDeleteElement(activeFrameId, elementId);
    },
    [activeFrameId, elements, pushHistory, sendDeleteElement]
  );

  // Undo / Redo
  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  const handleUndo = () => {
    if (!canUndo) return;
    const newIdx = historyIndex - 1;
    const prevElements = history[newIdx];
    setHistoryIndex(newIdx);
    setFrames((prev) =>
      prev.map((f) => (f.id === activeFrameId ? { ...f, elements: prevElements } : f))
    );
  };

  const handleRedo = () => {
    if (!canRedo) return;
    const newIdx = historyIndex + 1;
    const nextElements = history[newIdx];
    setHistoryIndex(newIdx);
    setFrames((prev) =>
      prev.map((f) => (f.id === activeFrameId ? { ...f, elements: nextElements } : f))
    );
  };

  // Keyboard Shortcuts (V: select, P: pen, E: eraser, S: sticky, T: text, L: laser, Ctrl+Z: undo, Ctrl+Y: redo)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        handleRedo();
      } else if (e.key === 'v' || e.key === 'V') {
        setCurrentTool('select');
      } else if (e.key === 'p' || e.key === 'P') {
        setCurrentTool('pen');
      } else if (e.key === 'e' || e.key === 'E') {
        setCurrentTool('eraser');
      } else if (e.key === 's' || e.key === 'S') {
        setCurrentTool('sticky');
      } else if (e.key === 't' || e.key === 'T') {
        setCurrentTool('text');
      } else if (e.key === 'l' || e.key === 'L') {
        setCurrentTool('laser');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  // Frame operations
  const handleCreateFrame = () => {
    const newFrameNumber = frames.length + 1;
    const newFrame: BoardFrame = {
      id: genId('frame'),
      title: `Уютный кадр ${newFrameNumber}`,
      background: activeFrame.background || 'paw',
      backgroundColor: activeFrame.backgroundColor || '#faf7f2',
      elements: [],
    };
    setFrames((prev) => [...prev, newFrame]);
    setActiveFrameId(newFrame.id);
    setHistory([[]]);
    setHistoryIndex(0);
    sendCreateFrame(newFrame);
  };

  const handleDuplicateFrame = (sourceId: string) => {
    const source = frames.find((f) => f.id === sourceId);
    if (!source) return;
    const newFrame: BoardFrame = {
      id: genId('frame'),
      title: `${source.title} (копия)`,
      background: source.background,
      backgroundColor: source.backgroundColor,
      elements: source.elements.map((el) => ({
        ...el,
        id: `${el.type}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      })),
    };
    setFrames((prev) => [...prev, newFrame]);
    setActiveFrameId(newFrame.id);
    setHistory([newFrame.elements]);
    setHistoryIndex(0);
    sendCreateFrame(newFrame);
  };

  const handleDeleteFrame = (frameId: string) => {
    if (frames.length <= 1) return;
    const remaining = frames.filter((f) => f.id !== frameId);
    setFrames(remaining);
    const nextActive = remaining[0].id;
    setActiveFrameId(nextActive);
    setHistory([remaining[0].elements || []]);
    setHistoryIndex(0);
    sendDeleteFrame(frameId);
  };

  const handleSwitchFrame = (frameId: string) => {
    setActiveFrameId(frameId);
    const frame = frames.find((f) => f.id === frameId);
    if (frame) {
      setHistory([frame.elements || []]);
      setHistoryIndex(0);
    }
    sendSwitchFrame(frameId);
  };

  const handleClearFrame = () => {
    setFrames((prev) =>
      prev.map((f) => (f.id === activeFrameId ? { ...f, elements: [] } : f))
    );
    pushHistory([]);
    sendClearFrame(activeFrameId);
  };

  const handleChangePattern = (pattern: BackgroundPattern) => {
    setFrames((prev) =>
      prev.map((f) => (f.id === activeFrameId ? { ...f, background: pattern } : f))
    );
    sendUpdateFrameBg(activeFrameId, pattern, activeFrame.backgroundColor);
  };

  // Quick Content Add Helpers
  const handleQuickAddSticky = () => {
    soundManager.playPop();
    const newSticky: BoardElement = {
      id: genId('sticky'),
      type: 'sticky',
      x: 350,
      y: 220,
      width: 220,
      height: 220,
      rotation: Math.floor(Math.random() * 8) - 4,
      zIndex: elements.length + 1,
      authorId: currentUser.id,
      authorName: currentUser.name,
      style: stickyStyle,
      color: stickyColor,
      text: '',
      fontSize: 16,
      fontFamily: 'Quicksand',
      textAlign: 'center',
    };
    handleElementCreate(newSticky);
  };

  const handleQuickAddShape = () => {
    soundManager.playPop();
    const newShape: BoardElement = {
      id: genId('shape'),
      type: 'shape',
      x: 360,
      y: 230,
      width: 140,
      height: 140,
      rotation: 0,
      zIndex: elements.length + 1,
      authorId: currentUser.id,
      authorName: currentUser.name,
      shapeType,
      fillColor: shapeFillColor,
      strokeColor: '#334155',
      strokeWidth: 2,
      opacity: 1,
    };
    handleElementCreate(newShape);
  };

  const handleSelectSticker = (sticker: CatStickerDef) => {
    const newSticker: BoardElement = {
      id: genId('sticker'),
      type: 'sticker',
      x: 340,
      y: 200,
      width: 180,
      height: 180,
      rotation: Math.floor(Math.random() * 6) - 3,
      zIndex: elements.length + 1,
      authorId: currentUser.id,
      authorName: currentUser.name,
      stickerId: sticker.id,
      name: sticker.name,
      customSvg: sticker.svg,
    };
    handleElementCreate(newSticker);
  };

  const handleSelectEmoji = (emoji: string) => {
    const newSticker: BoardElement = {
      id: genId('emoji'),
      type: 'sticker',
      x: 380,
      y: 230,
      width: 130,
      height: 130,
      rotation: 0,
      zIndex: elements.length + 1,
      authorId: currentUser.id,
      authorName: currentUser.name,
      stickerId: 'emoji',
      name: emoji,
      emoji,
    };
    handleElementCreate(newSticker);
  };

  const handleSelectGif = (url: string, title?: string) => {
    const newImage: BoardElement = {
      id: genId('gif'),
      type: 'image',
      x: 320,
      y: 190,
      width: 260,
      height: 260,
      rotation: 0,
      zIndex: elements.length + 1,
      authorId: currentUser.id,
      authorName: currentUser.name,
      src: url,
      aspectRatio: 1,
      caption: title,
    };
    handleElementCreate(newImage);
  };

  // Image Upload File Handler
  const handleUploadImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    soundManager.playPop();
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        const newImg: BoardElement = {
          id: genId('img'),
          type: 'image',
          x: 320,
          y: 190,
          width: 320,
          height: 240,
          rotation: 0,
          zIndex: elements.length + 1,
          authorId: currentUser.id,
          authorName: currentUser.name,
          src: dataUrl,
          aspectRatio: 4 / 3,
          caption: file.name,
        };
        handleElementCreate(newImg);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Export handlers
  const handleExport = (format: 'png' | 'svg' | 'json') => {
    soundManager.playPurr();
    if (format === 'png') {
      exportBoardAsPng(boardName, activeFrame);
    } else if (format === 'svg') {
      exportBoardAsSvg(boardName, activeFrame);
    } else if (format === 'json') {
      exportBoardAsJson(boardName, frames);
    }
  };

  // Rename board
  const handleRenameBoard = (newName: string) => {
    setBoardName(newName);
    sendRenameBoard(newName);
  };

  // Switch room
  const handleSwitchRoom = (newRoom: string) => {
    setRoomId(newRoom);
    const newUrl = `${window.location.pathname}?room=${newRoom}`;
    window.history.pushState(null, '', newUrl);
  };

  return (
    <div className="flex flex-col w-screen h-screen overflow-hidden bg-amber-50/40 dark:bg-stone-950 font-rounded text-stone-800 dark:text-stone-100 transition-colors">
      {/* 1. TOP BAR */}
      <TopBar
        boardName={boardName}
        onRenameBoard={handleRenameBoard}
        frames={frames}
        activeFrameId={activeFrameId}
        onSwitchFrame={handleSwitchFrame}
        onCreateFrame={handleCreateFrame}
        onClearFrame={handleClearFrame}
        onOpenFrameDrawer={() => setIsFrameDrawerOpen(!isFrameDrawerOpen)}
        isFrameDrawerOpen={isFrameDrawerOpen}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={handleUndo}
        onRedo={handleRedo}
        users={[currentUser, ...remoteUsers]}
        currentUser={currentUser}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        onOpenShare={() => setIsShareModalOpen(true)}
        onTogglePresentation={() => setIsPresentationOpen(true)}
        onExport={handleExport}
        isDarkMode={isDarkMode}
        onToggleTheme={() => setIsDarkMode(!isDarkMode)}
        currentPattern={activeFrame.background || 'paw'}
        onChangePattern={handleChangePattern}
        isConnected={isConnected}
        roomId={roomId}
      />

      {/* 2. JAMBOARD FRAME DRAWER (SLIDE CARDS ORGANIZER) */}
      <FrameDrawer
        isOpen={isFrameDrawerOpen}
        onClose={() => setIsFrameDrawerOpen(false)}
        frames={frames}
        activeFrameId={activeFrameId}
        onSelectFrame={handleSwitchFrame}
        onCreateFrame={handleCreateFrame}
        onDuplicateFrame={handleDuplicateFrame}
        onDeleteFrame={handleDeleteFrame}
      />

      {/* 3. WORKSPACE CANVAS & FLOATING TOOLBAR */}
      <div className="relative flex-1 w-full h-[calc(100vh-4rem)] overflow-hidden">
        {/* Floating Toolbar on Left */}
        <Toolbar
          currentTool={currentTool}
          onSelectTool={(tool) => setCurrentTool(tool)}
          penColor={penColor}
          onSelectPenColor={(c) => setPenColor(c)}
          penWidth={penWidth}
          onSelectPenWidth={(w) => setPenWidth(w)}
          penMode={penMode}
          onSelectPenMode={(m) => setPenMode(m)}
          stickyStyle={stickyStyle}
          onSelectStickyStyle={(s) => setStickyStyle(s)}
          stickyColor={stickyColor}
          onSelectStickyColor={(c) => setStickyColor(c)}
          onCreateStickyQuick={handleQuickAddSticky}
          shapeType={shapeType}
          onSelectShapeType={(sh) => setShapeType(sh)}
          shapeFillColor={shapeFillColor}
          onSelectShapeFillColor={(c) => setShapeFillColor(c)}
          onCreateShapeQuick={handleQuickAddShape}
          onOpenStickerModal={() => setIsStickerModalOpen(true)}
          onOpenGifModal={() => setIsGifModalOpen(true)}
          onUploadImage={handleUploadImage}
        />

        {/* Main Canvas with pan & zoom and real-time cursors */}
        <Canvas
          currentTool={currentTool}
          elements={elements}
          onElementsChange={(newElems) => {
            setFrames((prev) =>
              prev.map((f) => (f.id === activeFrameId ? { ...f, elements: newElems } : f))
            );
          }}
          onElementCreate={handleElementCreate}
          onElementUpdate={handleElementUpdate}
          onElementDelete={handleElementDelete}
          penColor={penColor}
          penWidth={penWidth}
          penMode={penMode}
          onLaserEmit={(point) => sendLaser(point, currentUser.color)}
          remoteLaserPoints={remoteLaserPoints}
          currentUser={currentUser}
          remoteUsers={remoteUsers}
          onCursorMove={(cursor) => sendCursor(cursor)}
          backgroundPattern={activeFrame.background || 'paw'}
          backgroundColor={activeFrame.backgroundColor || '#faf7f2'}
          isDarkMode={isDarkMode}
          onQuickAddSticky={handleQuickAddSticky}
        />
      </div>

      {/* 4. MODALS */}
      <StickerPickerModal
        isOpen={isStickerModalOpen}
        onClose={() => setIsStickerModalOpen(false)}
        onSelectSticker={handleSelectSticker}
        onSelectEmoji={handleSelectEmoji}
      />

      <GifPickerModal
        isOpen={isGifModalOpen}
        onClose={() => setIsGifModalOpen(false)}
        onSelectGif={handleSelectGif}
      />

      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        roomId={roomId}
        boardName={boardName}
        onSwitchRoom={handleSwitchRoom}
      />

      <CatProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        currentUser={currentUser}
        onUpdateUser={(updated) => setCurrentUser((prev) => ({ ...prev, ...updated }))}
      />

      <PresentationMode
        isOpen={isPresentationOpen}
        onClose={() => setIsPresentationOpen(false)}
        frames={frames}
        activeFrameId={activeFrameId}
        onSwitchFrame={handleSwitchFrame}
        onLaserEmit={(point) => sendLaser(point, currentUser.color)}
        isDarkMode={isDarkMode}
      />
    </div>
  );
}
