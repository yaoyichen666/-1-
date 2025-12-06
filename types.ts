export interface TreeConfig {
  rotationSpeed: number;
  bloomIntensity: number;
  lightColor: string;
  sparkleSpeed: number;
}

export interface WishResponse {
  message: string;
  mood: 'elegant' | 'whimsical' | 'grand';
}

export enum LuxuryLevel {
  Standard = 'Standard',
  Premium = 'Premium',
  Signature = 'Signature' // Maximum Gold/Bloom
}