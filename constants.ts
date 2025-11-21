
export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 600;

export const PHYSICS = {
  GRAVITY: 0.6,
  FRICTION: 0.8,
  MOVE_SPEED: 5,
  JUMP_FORCE: -14,
  MAX_FALL_SPEED: 15,
  ENEMY_SPEED: 2,
};

export const COLORS = {
  TEXT: '#FFFFFF',
  // Stage 1: Grassland
  STAGE1: {
    SKY: '#87CEEB',
    PLATFORM: '#B45F06', // Brown soil
    GROUND_TOP: '#4ade80' // Green grass
  },
  // Stage 2: Cave
  STAGE2: {
    SKY: '#2D3748', // Dark Grey
    PLATFORM: '#4A5568', // Grey Rock
    GROUND_TOP: '#718096' // Lighter Rock
  },
  // Stage 3: Sky
  STAGE3: {
    SKY: '#E0F2F1', // Very Light Blue/White
    PLATFORM: '#FFFFFF', // Clouds
    GROUND_TOP: '#B2DFDB' // Cloud Shadow
  },
  // Stage 4: Castle
  STAGE4: {
    SKY: '#1A202C', // Black/Dark Blue
    PLATFORM: '#742A2A', // Dark Red Bricks
    GROUND_TOP: '#9B2C2C' // Red Carpet/Top
  },
  ENEMY: '#ef4444',
  GOAL: '#fbbf24'
};

export const PLAYER_SIZE = {
  w: 40,
  h: 40
};

export const ASSETS = {
  // Assets are now generated or internal
};
