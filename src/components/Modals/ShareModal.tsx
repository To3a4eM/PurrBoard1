import React, { useState } from 'react';
import { X, Copy, Check, Users, ExternalLink, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundManager } from '../../utils/audio';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomId: string;
  boardName: string;
  onSwitchRoom: (newRoomId: string) => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  roomId,
  boardName,
  onSwitchRoom,
}) => {
  const [copied, setCopied] = useState(false);
  const [newRoomInput, setNewRoomInput] = useState('');

  if (!isOpen) return null;

  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}${window.location.pathname}?room=${roomId}`
    : `https://purrboard.app/?room=${roomId}`;

  const handleCopy = () => {
    soundManager.playPop();
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    confetti({
      particleCount: 35,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#F97316', '#F59E0B', '#EC4899', '#10B981'],
    });
    setTimeout(() => setCopied(false), 2500);
  };

  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (newRoomInput.trim()) {
      const cleanId = newRoomInput.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '-');
      onSwitchRoom(cleanId);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white dark:bg-stone-900 border border-amber-200 dark:border-stone-700 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🐾</span>
            <h3 className="font-bold text-stone-900 dark:text-stone-100 font-rounded text-base">
              Совместная кошачья доска
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col gap-5">
          <div className="flex items-start gap-3 bg-amber-50 dark:bg-amber-950/40 p-3.5 rounded-2xl border border-amber-200/80 dark:border-amber-900/50">
            <div className="text-2xl">🐱</div>
            <div className="text-xs text-stone-700 dark:text-stone-300">
              <span className="font-bold text-stone-900 dark:text-stone-100 block mb-0.5 font-rounded">
                {boardName}
              </span>
              Отправь ссылку друзьям или коллегам! Все рисунки, стикеры и курсоры синхронизируются в реальном времени.
            </div>
          </div>

          {/* Share Link Field */}
          <div>
            <label className="text-xs font-semibold text-stone-600 dark:text-stone-300 block mb-1.5">
              Прямая ссылка на эту доску:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="flex-1 px-3 py-2 text-xs rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-800 dark:text-stone-200 select-all outline-none"
              />
              <button
                onClick={handleCopy}
                className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-stone-900 text-xs font-semibold rounded-xl shadow-xs transition-all flex items-center gap-1.5 shrink-0"
              >
                {copied ? <Check className="w-4 h-4 text-stone-900" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Скопировано!' : 'Копировать'}</span>
              </button>
            </div>
          </div>

          {/* Room ID Badge */}
          <div className="text-xs text-stone-500 dark:text-stone-400 flex items-center justify-between border-t border-stone-100 dark:border-stone-800 pt-3">
            <span>Код комнаты: <strong className="font-mono text-stone-800 dark:text-stone-200">{roomId}</strong></span>
            <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> Доступ без регистрации
            </span>
          </div>

          {/* Join / Create Another Room */}
          <div className="border-t border-stone-100 dark:border-stone-800 pt-3">
            <label className="text-xs font-semibold text-stone-600 dark:text-stone-300 block mb-1.5">
              Создать или перейти в другую комнату:
            </label>
            <form onSubmit={handleCreateRoom} className="flex gap-2">
              <input
                type="text"
                value={newRoomInput}
                onChange={(e) => setNewRoomInput(e.target.value)}
                placeholder="например: ginger-cats-club"
                className="flex-1 px-3 py-2 text-xs rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-200 outline-none focus:border-amber-400"
              />
              <button
                type="submit"
                className="px-3 py-2 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 text-xs font-semibold rounded-xl transition-colors shrink-0"
              >
                Перейти
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
