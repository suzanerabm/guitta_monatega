// src/theme/keyframes.ts
export const keyframes = {
  fadeIn: {
    '0%': { opacity: 0, transform: 'translateY(10px)' },
    '100%': { opacity: 1, transform: 'translateY(0)' },
  },
  cardFloat: {
    '0%, 100%': { transform: 'translateY(0)' },
    '50%': { transform: 'translateY(-6px)' },
  },
  fluidBichittos: {
    '0%': { backgroundPosition: '0% 50%' },
    '50%': { backgroundPosition: '100% 50%' },
    '100%': { backgroundPosition: '0% 50%' },
  },
  fluidKammara: {
    '0%': { backgroundPosition: '0% 50%' },
    '50%': { backgroundPosition: '100% 50%' },
    '100%': { backgroundPosition: '0% 50%' },
  },
  glowShift: {
    '0%, 100%': { opacity: 0.5, transform: 'scale(1)' },
    '50%': { opacity: 1, transform: 'scale(1.1)' },
  },
  shapeFloat: {
    '0%, 100%': { transform: 'translateY(0) scale(1)' },
    '50%': { transform: 'translateY(-20px) scale(1.05)' },
  },
  starTwinkle: {
    '0%, 100%': { opacity: 0.3, transform: 'scale(0.8)' },
    '50%': { opacity: 1, transform: 'scale(1.2)' },
  },
  kammaraGlow: {
    '0%, 100%': { opacity: 0.15, transform: 'scale(1)' },
    '50%': { opacity: 0.3, transform: 'scale(1.2)' },
  },
  strokeDraw: {
    '0%': { opacity: 0, transform: 'scaleX(0)' },
    '50%': { opacity: 0.15 },
    '100%': { opacity: 0, transform: 'scaleX(1)' },
  },
  // Ninha (Zeco's pet) flying in from the left, arcing up, then settling
  // above the Bichittos banner title and gently floating on loop.
  ninhaFly: {
    '0%': {
      transform: 'translate(-350%, 50%) rotate(-8deg)',
      opacity: 0,
    },
    '15%': {
      opacity: 1,
    },
    '40%': {
      transform: 'translate(-180%, -120%) rotate(-4deg)',
      opacity: 1,
    },
    '70%': {
      transform: 'translate(-80%, -60%) rotate(6deg)',
      opacity: 1,
    },
    '90%': {
      transform: 'translate(-50%, -50%) rotate(0deg)',
      opacity: 1,
    },
    // Gentle float after landing (loops via iteration).
    '95%': {
      transform: 'translate(-50%, -58%) rotate(1deg)',
    },
    '100%': {
      transform: 'translate(-50%, -50%) rotate(0deg)',
    },
  },
};
