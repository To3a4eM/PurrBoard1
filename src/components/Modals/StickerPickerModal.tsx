import React, { useState } from 'react';
import { X, Search } from 'lucide-react';
import { CAT_STICKERS, CAT_EMOJIS, CatStickerDef } from '../../utils/catStickers';
import { soundManager } from '../../utils/audio';

interface StickerPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSticker: (sticker: CatStickerDef) => void;
  onSelectEmoji: (emoji: string) => void;
}

export const StickerPickerModal: React.FC<StickerPickerModalProps> = ({
  isOpen,
  onClose,
  onSelectSticker,
  onSelectEmoji,
}) => {
  const [activeTab, setActiveTab] = useState<'stickers' | 'emojis'>('stickers');
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  const filteredStickers = CAT_STICKERS.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white dark:bg-stone-900 border border-amber-200 dark:border-stone-700 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🐱</span>
            <h3 className="font-bold text-stone-900 dark:text-stone-100 font-rounded text-base">
              Кото-стикеры & Эмодзи
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Bar & Search */}
        <div className="p-4 border-b border-stone-100 dark:border-stone-800 flex flex-col gap-3">
          <div className="flex items-center gap-1 p-1 bg-stone-100 dark:bg-stone-800 rounded-xl">
            <button
              onClick={() => setActiveTab('stickers')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                activeTab === 'stickers'
                  ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-xs'
                  : 'text-stone-600 dark:text-stone-400'
              }`}
            >
              🐾 Авторские стикеры ({CAT_STICKERS.length})
            </button>
            <button
              onClick={() => setActiveTab('emojis')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                activeTab === 'emojis'
                  ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-xs'
                  : 'text-stone-600 dark:text-stone-400'
              }`}
            >
              😸 Кошачьи эмодзи ({CAT_EMOJIS.length})
            </button>
          </div>

          {activeTab === 'stickers' && (
            <div className="relative">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Поиск стикера..."
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 outline-none focus:border-amber-400"
              />
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="p-4 overflow-y-auto flex-1">
          {activeTab === 'stickers' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {filteredStickers.map((sticker) => (
                <button
                  key={sticker.id}
                  onClick={() => {
                    soundManager.playMeow();
                    onSelectSticker(sticker);
                    onClose();
                  }}
                  className="p-3 rounded-2xl border border-amber-100 dark:border-stone-800 bg-amber-50/40 dark:bg-stone-800/40 hover:bg-amber-100/60 dark:hover:bg-stone-800 hover:border-amber-300 transition-all flex flex-col items-center gap-2 group hover:scale-105"
                >
                  <div
                    className="w-24 h-24 flex items-center justify-center"
                    dangerouslySetInnerHTML={{ __html: sticker.svg }}
                  />
                  <span className="text-xs font-semibold text-stone-800 dark:text-stone-200 truncate w-full text-center">
                    {sticker.name}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-6 gap-2">
              {CAT_EMOJIS.map((emoji, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    soundManager.playPop();
                    onSelectEmoji(emoji);
                    onClose();
                  }}
                  className="w-14 h-14 rounded-2xl bg-stone-50 dark:bg-stone-800 hover:bg-amber-100 dark:hover:bg-stone-700 flex items-center justify-center text-3xl transition-transform hover:scale-115"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
