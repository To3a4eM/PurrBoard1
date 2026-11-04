export type ToolType =
  | 'select'
  | 'pen'
  | 'brush'
  | 'marker'
  | 'eraser'
  | 'sticky'
  | 'shape'
  | 'text'
  | 'laser';

export type StickyStyle = 'classic' | 'cat-ears' | 'cat-face';

export type ShapeType =
  | 'rectangle'
  | 'circle'
  | 'heart'
  | 'paw'
  | 'cat-head'
  | 'arrow'
  | 'star'
  | 'fish'
  | 'yarn';

export type BackgroundPattern = 'paw' | 'dots' | 'grid' | 'blank';

export interface User {
  id: string;
  name: string;
  avatar: string; // Avatar key e.g. 'ginger', 'tuxedo', 'calico', 'siamese'
  color: string;
  cursor?: { x: number; y: number } | null;
  lastActive?: number;
}

export interface PathElement {
  id: string;
  type: 'path';
  points: number[]; // [x1, y1, x2, y2, ...]
  strokeColor: string;
  strokeWidth: number;
  toolType: 'pen' | 'brush' | 'marker';
  opacity: number;
  zIndex: number;
  authorId: string;
  authorName: string;
}

export interface StickyElement {
  id: string;
  type: 'sticky';
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  zIndex: number;
  authorId: string;
  authorName: string;
  style: StickyStyle;
  color: string;
  text: string;
  fontSize: number;
  fontFamily: string;
  textAlign: 'left' | 'center' | 'right';
}

export interface TextElement {
  id: string;
  type: 'text';
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  zIndex: number;
  authorId: string;
  authorName: string;
  text: string;
  fontSize: number;
  fontFamily: string;
  color: string;
  backgroundColor?: string;
  isBold?: boolean;
  textAlign: 'left' | 'center' | 'right';
}

export interface ShapeElement {
  id: string;
  type: 'shape';
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  zIndex: number;
  authorId: string;
  authorName: string;
  shapeType: ShapeType;
  fillColor: string;
  strokeColor: string;
  strokeWidth: number;
  opacity: number;
}

export interface ImageElement {
  id: string;
  type: 'image';
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  zIndex: number;
  authorId: string;
  authorName: string;
  src: string;
  aspectRatio: number;
  caption?: string;
}

export interface StickerElement {
  id: string;
  type: 'sticker';
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  zIndex: number;
  authorId: string;
  authorName: string;
  stickerId: string;
  name: string;
  customSvg?: string;
  emoji?: string;
}

export type BoardElement =
  | PathElement
  | StickyElement
  | TextElement
  | ShapeElement
  | ImageElement
  | StickerElement;

export interface BoardFrame {
  id: string;
  title: string;
  background: BackgroundPattern;
  backgroundColor: string;
  elements: BoardElement[];
}

export interface LaserPoint {
  userId: string;
  x: number;
  y: number;
  authorColor: string;
  timestamp: number;
}

export interface CanvasViewport {
  x: number;
  y: number;
  zoom: number;
}

export interface CatColor {
  id: string;
  name: string;
  value: string;
  borderClass?: string;
}

export const CAT_COLORS: CatColor[] = [
  { id: 'ginger', name: 'Рыжик (Ginger)', value: '#EA580C' },
  { id: 'peach', name: 'Персиковый (Peach)', value: '#F97316' },
  { id: 'cream', name: 'Кремовый (Cream)', value: '#EAB308' },
  { id: 'pink', name: 'Розовый носик (Pink)', value: '#EC4899' },
  { id: 'mint', name: 'Кошачья мята (Mint)', value: '#10B981' },
  { id: 'slate', name: 'Дымчатый серый (Slate)', value: '#64748B' },
  { id: 'midnight', name: 'Черный кот (Midnight)', value: '#1E293B' },
  { id: 'lavender', name: 'Лавандовый (Lavender)', value: '#8B5CF6' },
  { id: 'white', name: 'Белый пушок (White)', value: '#FFFFFF', borderClass: 'border border-stone-300' },
];

export const STICKY_PALETTE = [
  { name: 'Масляный кремовый', bg: '#FEF08A', text: '#713F12' },
  { name: 'Нежный розовый', bg: '#FBCFE8', text: '#831843' },
  { name: 'Мятный кошачий', bg: '#A7F3D0', text: '#064E3B' },
  { name: 'Персиковый мурр', bg: '#FED7AA', text: '#7C2D12' },
  { name: 'Лавандовый сон', bg: '#DDD6FE', text: '#4C1D95' },
  { name: 'Голубой дымчатый', bg: '#BAE6FD', text: '#0C4A6E' },
];
