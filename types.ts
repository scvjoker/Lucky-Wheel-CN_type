
export interface Prize {
  id: string;
  label: string;
  probability: number;
  color: string;
  enabled: boolean;
  image?: string;
  icon?: string;
  isGrandPrize?: boolean; // 特別大獎標記
}

export interface Participant {
  id: string;
  name: string;
  entries: number;
}

export interface SpinRecord {
  id: string;
  timestamp: number;
  person: string;
  prizeLabel: string;
  prizeImage?: string;
}

export interface WheelConfig {
  duration: number;
  rotations: number;
  direction: 'cw' | 'ccw';
  bounceIntensity: number;
  title: string;
  subtitle: string;
  showProbabilityOnWheel: boolean;
  winnerEffect?: string;
  customFallingImage?: string; // 客製化灑落圖案 (如取代楓葉)
}
