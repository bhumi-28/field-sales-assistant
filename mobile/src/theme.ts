// Shared design tokens for the whole mobile app.
// Every screen imports { COLORS } from '../theme' so the look stays consistent.

export const COLORS = {
  bg: '#0B1220',        // app background (deep navy)
  surface: '#111A2E',   // cards
  card: '#111A2E',      // alias of surface
  surface2: '#182238',  // inputs, segmented controls
  border: '#24304A',
  text: '#E8EDF7',
  muted: '#8B9AB8',

  accent: '#3B82F6',    // primary actions and links
  accentSoft: 'rgba(59, 130, 246, 0.16)',
  onAccent: '#FFFFFF',  // text on top of accent

  success: '#34D399',
  successSoft: 'rgba(52, 211, 153, 0.15)',
  onSuccess: '#052E22',
  warning: '#F5A524',
  warningSoft: 'rgba(245, 165, 36, 0.14)',
  danger: '#F0616D',
  dangerSoft: 'rgba(240, 97, 109, 0.14)',
};

export const RADIUS = 12;
export const RADIUS_LG = 16;

// Soft elevation used on cards
export const SHADOW = {
  shadowColor: '#000',
  shadowOpacity: 0.25,
  shadowRadius: 10,
  shadowOffset: { width: 0, height: 4 },
  elevation: 4,
};

export const FONT = {
  display: { fontWeight: '700' as const, letterSpacing: -0.4 },
  heading: { fontWeight: '600' as const, letterSpacing: -0.2 },
  label: { fontWeight: '600' as const },
  body: { fontWeight: '400' as const },
};