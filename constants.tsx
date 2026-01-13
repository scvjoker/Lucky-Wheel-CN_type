
import { Prize } from './types';

export const DEFAULT_PRIZES: Prize[] = [
  { id: '1', label: '黃金楓葉徽章', probability: 5, color: '#FFD700', enabled: true, icon: '🍁', isGrandPrize: true },
  { id: '2', label: '藍水靈娃娃', probability: 15, color: '#4FC3F7', enabled: true, icon: '💧' },
  { id: '3', label: '超級藥水 x99', probability: 20, color: '#FF8A65', enabled: true, icon: '🧪' },
  { id: '4', label: '菇菇寶貝椅子', probability: 10, color: '#AED581', enabled: true, icon: '🍄' },
  { id: '5', label: '殘念的皮卡啾', probability: 50, color: '#F06292', enabled: true, icon: '🐷' },
];

export const PRESET_COLORS = [
  '#FFD700', '#4FC3F7', '#FF8A65', '#AED581', '#F06292', 
  '#BA68C8', '#4DB6AC', '#FFF176', '#90A4AE', '#FFB74D'
];

export const COMMON_EMOJIS = ['🍁', '🎁', '💎', '🔥', '⭐', '🍀', '🍎', '💰', '⚔️', '🛡️', '👑', '🍦', '🎮'];
