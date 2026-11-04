import React, { useState, useEffect, useCallback } from 'react';
import { X, Search, Film, Loader2 } from 'lucide-react';
import { soundManager } from '../../utils/audio';

interface GifResult {
  id: string;
  title: string;
  url: string;
  preview: string;
}

interface GifPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectGif: (url: string, title?: string) => void;
}

export const GifPickerModal: React.FC<GifPickerModalProps> = ({
  isOpen,
  onClose,
  onSelectGif,
}) => {
  const [search, setSearch] = useState('cat');
  const [gifs, setGifs] = useState<GifResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_KEY = import.meta.env.VITE_GIPHY_API_KEY;

  const searchGifs = useCallback(async (query: string) => {
    if (!API_KEY) {
      setError('Добавь VITE_GIPHY_API_KEY в файл .env.local');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `https://tenor.googleapis.com/v2/search?q=${encodeURIComponent(
          query || 'cat'
        )}&key=${API_KEY}&limit=30&media_filter=gif&contentfilter=medium`
      );

      if (!response.ok) throw new Error('Ошибка загрузки гифок');

      const data = await response.json();

      const results: GifResult[] = (data.results || []).map((item: any) => ({
        id: item.id,
        title: item.title || item.content_description || 'GIF',
        url: item.media_formats?.gif?.url || item.media_formats?.mediumgif?.url,
        preview:
          item.media_formats?.tinygif?.url ||
          item.media_formats?.nanogif?.url ||
          item.media_formats?.gif?.url,
      }));

      setGifs(results.filter((g) => g.url));
    } catch (err) {
      console.error(err);
      setError('Не удалось загрузить гифки. Проверь API-ключ.');
    } finally {
      setLoading(false);
    }
  }, [API_KEY]);

  // Загружаем гифки при открытии и при изменении поиска
  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(() => {
      searchGifs(search);
    }, 400); // небольшая задержка, чтобы не спамить API

    return () => clearTimeout(timer);
  }, [search, isOpen, searchGifs]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white dark:bg-stone-900 border border-amber-200 dark:border-stone-700 rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Film className="w-5 h-5 text-pink-500" />
            <h3 className="font-bold text-stone-900 dark:text-stone-100 font-rounded text-base">
              Гифки (GIPHY)
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-stone-100 dark:border-stone-800">
          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Поиск гифок... (cat, funny cat, dancing cat...)"
              className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 outline-none focus:border-amber-400"
              autoFocus
            />
          </div>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto flex-1">
          {loading && (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-stone-500">
              <Loader2 className="w-8 h-8 animate-spin" />
              <span className="text-sm">Ищем милые гифки...</span>
            </div>
          )}

          {error && !loading && (
            <div className="text-center py-12 text-red-500 text-sm">
              {error}
            </div>
          )}

          {!loading && !error && gifs.length === 0 && (
            <div className="text-center py-12 text-stone-500 text-sm">
              Ничего не найдено
            </div>
          )}

          {!loading && gifs.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {gifs.map((gif) => (
                <button
                  key={gif.id}
                  onClick={() => {
                    soundManager.playMeow();
                    onSelectGif(gif.url, gif.title);
                    onClose();
                  }}
                  className="group relative rounded-2xl overflow-hidden border border-amber-200/80 dark:border-stone-700 aspect-square bg-stone-100 dark:bg-stone-800 hover:scale-105 transition-transform"
                >
                  <img
                    src={gif.preview}
                    alt={gif.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                    <span className="text-[11px] font-medium text-white line-clamp-2">
                      {gif.title}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};