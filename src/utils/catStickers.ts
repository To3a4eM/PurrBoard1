// Avatars generated and mapped
export const CAT_AVATARS = [
  {
    id: 'ginger',
    name: 'Рыжик (Fluffy Ginger)',
    src: '/src/assets/images/avatar_cat_ginger_1793782666773.jpg',
    color: '#F97316',
  },
  {
    id: 'tuxedo',
    name: 'Смокинг (Tuxedo)',
    src: '/src/assets/images/avatar_cat_tuxedo_1793782667074.jpg',
    color: '#3B82F6',
  },
  {
    id: 'calico',
    name: 'Калико (Sweet Calico)',
    src: '/src/assets/images/avatar_cat_calico_1793782668236.jpg',
    color: '#EC4899',
  },
  {
    id: 'siamese',
    name: 'Сиам (Blue-eyed Siamese)',
    src: '/src/assets/images/avatar_cat_siamese_1793782668185.jpg',
    color: '#8B5CF6',
  },
];

export interface CatStickerDef {
  id: string;
  name: string;
  category: 'loaf' | 'playful' | 'mood' | 'items';
  svg: string;
}

export const CAT_STICKERS: CatStickerDef[] = [
  {
    id: 'loaf-cat',
    name: 'Котик-батончик (Loaf)',
    category: 'loaf',
    svg: `<svg viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="80" cy="98" rx="60" ry="38" fill="#FDBA74"/>
      <ellipse cx="80" cy="100" rx="56" ry="34" fill="#FED7AA"/>
      <!-- Tail tucked -->
      <path d="M130 96C138 92 144 100 138 108C132 114 122 112 118 108" stroke="#EA580C" stroke-width="6" stroke-linecap="round"/>
      <!-- Head -->
      <circle cx="50" cy="74" r="30" fill="#FDBA74"/>
      <circle cx="50" cy="74" r="28" fill="#FED7AA"/>
      <!-- Ears -->
      <path d="M30 54L38 34L50 48Z" fill="#F97316"/>
      <path d="M34 50L40 38L48 48Z" fill="#FDA4AF"/>
      <path d="M52 48L64 34L72 54Z" fill="#F97316"/>
      <path d="M56 48L64 38L68 50Z" fill="#FDA4AF"/>
      <!-- Face -->
      <ellipse cx="40" cy="70" rx="3" ry="5" fill="#431407"/>
      <ellipse cx="60" cy="70" rx="3" ry="5" fill="#431407"/>
      <path d="M49 76L52 76L50.5 79Z" fill="#F43F5E"/>
      <path d="M45 81C48 83 50.5 83 50.5 80C50.5 83 53 83 56 81" stroke="#431407" stroke-width="2" stroke-linecap="round"/>
      <!-- Whiskers -->
      <line x1="24" y1="74" x2="36" y2="76" stroke="#C2410C" stroke-width="2" stroke-linecap="round"/>
      <line x1="22" y1="81" x2="35" y2="80" stroke="#C2410C" stroke-width="2" stroke-linecap="round"/>
      <line x1="64" y1="76" x2="76" y2="74" stroke="#C2410C" stroke-width="2" stroke-linecap="round"/>
      <line x1="65" y1="80" x2="78" y2="81" stroke="#C2410C" stroke-width="2" stroke-linecap="round"/>
      <!-- Sleeping Zzz -->
      <text x="100" y="55" font-family="Quicksand, sans-serif" font-weight="bold" font-size="20" fill="#EA580C">z</text>
      <text x="115" y="42" font-family="Quicksand, sans-serif" font-weight="bold" font-size="26" fill="#EA580C">Z</text>
    </svg>`,
  },
  {
    id: 'paw-high-five',
    name: 'Лапка Дай Пять (Paw)',
    category: 'playful',
    svg: `<svg viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="80" cy="95" rx="36" ry="30" fill="#FED7AA"/>
      <ellipse cx="80" cy="95" rx="26" ry="22" fill="#FB7185"/>
      <!-- Toe beans -->
      <circle cx="48" cy="62" r="14" fill="#FED7AA"/>
      <circle cx="48" cy="62" r="10" fill="#FB7185"/>
      <circle cx="70" cy="46" r="14" fill="#FED7AA"/>
      <circle cx="70" cy="46" r="10" fill="#FB7185"/>
      <circle cx="92" cy="46" r="14" fill="#FED7AA"/>
      <circle cx="92" cy="46" r="10" fill="#FB7185"/>
      <circle cx="114" cy="62" r="14" fill="#FED7AA"/>
      <circle cx="114" cy="62" r="10" fill="#FB7185"/>
      <!-- Arm -->
      <path d="M52 110L44 150L116 150L108 110" fill="#FED7AA"/>
      <!-- Sparkles -->
      <path d="M130 30L133 38L141 41L133 44L130 52L127 44L119 41L127 38Z" fill="#F59E0B"/>
      <path d="M26 36L28 42L34 44L28 46L26 52L24 46L18 44L24 42Z" fill="#F59E0B"/>
    </svg>`,
  },
  {
    id: 'cat-in-box',
    name: 'Котик в коробке (If It Fits)',
    category: 'playful',
    svg: `<svg viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- Box -->
      <rect x="25" y="80" width="110" height="65" rx="4" fill="#D97706"/>
      <rect x="29" y="84" width="102" height="57" rx="3" fill="#B45309"/>
      <!-- Flaps -->
      <path d="M20 78L29 84L29 110L14 96Z" fill="#D97706"/>
      <path d="M140 78L131 84L131 110L146 96Z" fill="#D97706"/>
      <!-- Cat inside -->
      <circle cx="80" cy="72" r="32" fill="#E2E8F0"/>
      <!-- Ears -->
      <path d="M56 50L64 26L78 44Z" fill="#94A3B8"/>
      <path d="M60 46L66 32L74 44Z" fill="#FBCFE8"/>
      <path d="M82 44L96 26L104 50Z" fill="#94A3B8"/>
      <path d="M86 44L94 32L100 46Z" fill="#FBCFE8"/>
      <!-- Big curious eyes -->
      <circle cx="68" cy="68" r="9" fill="#0F172A"/>
      <circle cx="70" cy="66" r="3.5" fill="#FFFFFF"/>
      <circle cx="92" cy="68" r="9" fill="#0F172A"/>
      <circle cx="94" cy="66" r="3.5" fill="#FFFFFF"/>
      <!-- Nose & Mouth -->
      <path d="M78 77L82 77L80 80Z" fill="#F43F5E"/>
      <path d="M75 82C77 84 79 84 80 81C81 84 83 84 85 82" stroke="#334155" stroke-width="2" stroke-linecap="round"/>
      <!-- Paws on box rim -->
      <ellipse cx="56" cy="85" rx="10" ry="7" fill="#E2E8F0"/>
      <ellipse cx="104" cy="85" rx="10" ry="7" fill="#E2E8F0"/>
      <text x="52" y="120" font-family="Quicksand, sans-serif" font-weight="bold" font-size="12" fill="#FEF3C7">FRAGILE 📦</text>
    </svg>`,
  },
  {
    id: 'yarn-play',
    name: 'Клубок пряжи (Yarn)',
    category: 'items',
    svg: `<svg viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="75" cy="75" r="45" fill="#EC4899"/>
      <!-- Yarn stripes -->
      <path d="M45 50C60 65 90 65 105 50" stroke="#F472B6" stroke-width="4" stroke-linecap="round"/>
      <path d="M40 75C60 90 90 90 110 75" stroke="#F472B6" stroke-width="4" stroke-linecap="round"/>
      <path d="M50 100C65 110 85 110 100 100" stroke="#F472B6" stroke-width="4" stroke-linecap="round"/>
      <path d="M55 40C70 60 70 90 55 110" stroke="#DB2777" stroke-width="4" stroke-linecap="round"/>
      <path d="M75 32C90 60 90 90 75 118" stroke="#DB2777" stroke-width="4" stroke-linecap="round"/>
      <path d="M95 40C80 60 80 90 95 110" stroke="#DB2777" stroke-width="4" stroke-linecap="round"/>
      <!-- Loose thread winding out -->
      <path d="M115 85C130 90 145 70 135 110C128 135 90 135 105 145C115 152 140 148 150 135" stroke="#EC4899" stroke-width="5" stroke-linecap="round"/>
    </svg>`,
  },
  {
    id: 'fish-bone',
    name: 'Рыбка-лакомство (Fish)',
    category: 'items',
    svg: `<svg viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- Head -->
      <path d="M40 80C30 65 55 55 65 80C55 105 30 95 40 80Z" fill="#38BDF8"/>
      <circle cx="50" cy="75" r="3.5" fill="#0C4A6E"/>
      <!-- Spine -->
      <line x1="65" y1="80" x2="115" y2="80" stroke="#0284C7" stroke-width="4" stroke-linecap="round"/>
      <!-- Ribs -->
      <line x1="75" y1="65" x2="75" y2="95" stroke="#0284C7" stroke-width="3" stroke-linecap="round"/>
      <line x1="88" y1="62" x2="88" y2="98" stroke="#0284C7" stroke-width="3" stroke-linecap="round"/>
      <line x1="101" y1="67" x2="101" y2="93" stroke="#0284C7" stroke-width="3" stroke-linecap="round"/>
      <!-- Tail -->
      <path d="M115 80L135 60L130 80L135 100Z" fill="#38BDF8"/>
      <!-- Sparkle -->
      <path d="M60 45L62 50L67 52L62 54L60 59L58 54L53 52L58 50Z" fill="#F59E0B"/>
    </svg>`,
  },
  {
    id: 'heart-eyes-cat',
    name: 'Влюбленный котик (Heart Eyes)',
    category: 'mood',
    svg: `<svg viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="80" cy="82" r="46" fill="#FDE047"/>
      <!-- Ears -->
      <path d="M46 50L56 18L76 42Z" fill="#EAB308"/>
      <path d="M52 46L60 26L72 42Z" fill="#F472B6"/>
      <path d="M84 42L104 18L114 50Z" fill="#EAB308"/>
      <path d="M88 42L100 26L108 46Z" fill="#F472B6"/>
      <!-- Heart eyes -->
      <path d="M62 70C57 62 48 68 53 77L63 87L73 77C78 68 69 62 64 70Z" fill="#E11D48"/>
      <path d="M98 70C93 62 84 68 89 77L99 87L109 77C114 68 105 62 100 70Z" fill="#E11D48"/>
      <!-- Nose & happy open smile -->
      <path d="M78 90L82 90L80 93Z" fill="#BE123C"/>
      <path d="M70 96C75 106 85 106 90 96Z" fill="#9F1239"/>
      <path d="M76 99C78 103 82 103 84 99Z" fill="#FB7185"/>
      <!-- Cheeks -->
      <circle cx="48" cy="88" r="7" fill="#F472B6" fill-opacity="0.6"/>
      <circle cx="112" cy="88" r="7" fill="#F472B6" fill-opacity="0.6"/>
    </svg>`,
  },
  {
    id: 'sleepy-loaf',
    name: 'Спящий котик (Sleeping)',
    category: 'mood',
    svg: `<svg viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="80" cy="95" rx="55" ry="32" fill="#CBD5E1"/>
      <circle cx="50" cy="80" r="28" fill="#94A3B8"/>
      <!-- Curved sleeping eyes -->
      <path d="M38 78C42 84 48 84 52 78" stroke="#1E293B" stroke-width="3" stroke-linecap="round"/>
      <path d="M58 78C62 84 68 84 72 78" stroke="#1E293B" stroke-width="3" stroke-linecap="round"/>
      <!-- Nose & mouth -->
      <path d="M53 84L57 84L55 87Z" fill="#F43F5E"/>
      <path d="M51 89C53 91 55 91 55 88C55 91 57 91 59 89" stroke="#1E293B" stroke-width="2" stroke-linecap="round"/>
      <!-- Cute ear twitch -->
      <path d="M35 58L42 38L54 52Z" fill="#64748B"/>
      <path d="M38 55L44 42L50 52Z" fill="#FDA4AF"/>
      <path d="M58 52L70 38L75 58Z" fill="#64748B"/>
      <path d="M62 52L68 42L72 55Z" fill="#FDA4AF"/>
      <!-- Tiny paws tucked -->
      <ellipse cx="44" cy="115" rx="8" ry="5" fill="#E2E8F0"/>
      <ellipse cx="62" cy="115" rx="8" ry="5" fill="#E2E8F0"/>
    </svg>`,
  },
];

export const CAT_EMOJIS = [
  '🐱', '😸', '😹', '😻', '😼', '😽', '🙀', '😿', '😾', '🐾',
  '🧶', '🐟', '🥛', '📦', '🐁', '🐈', '🐈‍⬛', '💖', '⭐', '✨',
  '🌸', '🎀', '🧁', '💤', '🎉', '🌿', '🔔', '👑', '🌈', '🛋️',
];

export interface CatGifDef {
  id: string;
  title: string;
  url: string;
  preview: string;
}

export const CURATED_CAT_GIFS: CatGifDef[] = [
  {
    id: 'typing-cat',
    title: 'Котик усердно печатает (Bongo Cat)',
    url: 'https://media.giphy.com/media/unQ3IJU2RG7DO/giphy.gif',
    preview: 'https://media.giphy.com/media/unQ3IJU2RG7DO/200w.gif',
  },
  {
    id: 'vibing-cat',
    title: 'Котик кивает под бит (Vibing Cat)',
    url: 'https://media.giphy.com/media/jpbnoe3UIa8TU8LM13/giphy.gif',
    preview: 'https://media.giphy.com/media/jpbnoe3UIa8TU8LM13/200w.gif',
  },
  {
    id: 'sleepy-kitty',
    title: 'Сладкий кошачий сон (Sleepy Loaf)',
    url: 'https://media.giphy.com/media/mlvseq9yvZhba/giphy.gif',
    preview: 'https://media.giphy.com/media/mlvseq9yvZhba/200w.gif',
  },
  {
    id: 'curious-peek',
    title: 'Любопытная мордочка (Peek-a-boo)',
    url: 'https://media.giphy.com/media/ule4akeEDWA0g/giphy.gif',
    preview: 'https://media.giphy.com/media/ule4akeEDWA0g/200w.gif',
  },
  {
    id: 'paw-play',
    title: 'Игра лапкой (Paw Swat)',
    url: 'https://media.giphy.com/media/MDJ9IbxxvDUQM/giphy.gif',
    preview: 'https://media.giphy.com/media/MDJ9IbxxvDUQM/200w.gif',
  },
  {
    id: 'pop-cat',
    title: 'Поп-Кот (Pop Cat Open Mouth)',
    url: 'https://media.giphy.com/media/S604D5NhkhPgSPpwGx/giphy.gif',
    preview: 'https://media.giphy.com/media/S604D5NhkhPgSPpwGx/200w.gif',
  },
];
