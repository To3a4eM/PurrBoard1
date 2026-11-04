import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import { User, CAT_COLORS } from '../../types/board';
import { CAT_AVATARS } from '../../utils/catStickers';
import { soundManager } from '../../utils/audio';

interface CatProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onUpdateUser: (updatedUser: Partial<User>) => void;
}

export const CatProfileModal: React.FC<CatProfileModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUpdateUser,
}) => {
  const [name, setName] = useState(currentUser.name);
  const [selectedAvatar, setSelectedAvatar] = useState(currentUser.avatar);
  const [selectedColor, setSelectedColor] = useState(currentUser.color);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    soundManager.playMeow();
    onUpdateUser({
      name: name.trim() || 'Милый Котик',
      avatar: selectedAvatar,
      color: selectedColor,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white dark:bg-stone-900 border border-amber-200 dark:border-stone-700 rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🐱</span>
            <h3 className="font-bold text-stone-900 dark:text-stone-100 font-rounded text-base">
              Мой кошачий профиль
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          {/* Nickname */}
          <div>
            <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 block mb-1.5">
              Кошачья кличка (Имя):
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Рыжик, Барсик, Мурка..."
              maxLength={20}
              className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 outline-none focus:border-amber-400 font-semibold"
            />
          </div>

          {/* Avatar Selection */}
          <div>
            <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 block mb-2">
              Выбери свою породу котика:
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              {CAT_AVATARS.map((av) => (
                <button
                  key={av.id}
                  type="button"
                  onClick={() => {
                    soundManager.playPop();
                    setSelectedAvatar(av.id);
                  }}
                  className={`p-2.5 rounded-2xl border text-left flex items-center gap-2.5 transition-all ${
                    selectedAvatar === av.id
                      ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 ring-2 ring-amber-300'
                      : 'border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800'
                  }`}
                >
                  <img
                    src={av.src}
                    alt={av.name}
                    className="w-10 h-10 rounded-full object-cover shrink-0 shadow-xs"
                  />
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-stone-800 dark:text-stone-200 truncate">
                      {av.name.split(' ')[0]}
                    </div>
                    <div className="text-[10px] text-stone-500 truncate">
                      {av.name.split(' ')[1] || ''}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Cursor Color */}
          <div>
            <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 block mb-1.5">
              Цвет твоего курсора-лапки:
            </label>
            <div className="grid grid-cols-6 gap-2">
              {CAT_COLORS.slice(0, 6).map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedColor(c.value)}
                  className="w-8 h-8 rounded-full flex items-center justify-center transition-transform hover:scale-110"
                  style={{ backgroundColor: c.value }}
                >
                  {selectedColor === c.value && <Check className="w-4 h-4 text-white" />}
                </button>
              ))}
            </div>
          </div>

          {/* Save Button */}
          <button
            type="submit"
            className="w-full mt-2 py-2.5 bg-amber-400 hover:bg-amber-300 text-stone-900 font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
          >
            <span>Сохранить профиль 🐾</span>
          </button>
        </form>
      </div>
    </div>
  );
};
