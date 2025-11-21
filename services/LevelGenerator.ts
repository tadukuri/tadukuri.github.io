
import { Entity, EntityType, Enemy } from '../types';
import { PHYSICS, COLORS, CANVAS_HEIGHT } from '../constants';

interface LevelData {
  platforms: Entity[];
  enemies: Enemy[];
  goal: Entity;
  pits: Entity[];
  theme: {
    SKY: string;
    PLATFORM: string;
    GROUND_TOP: string;
  };
}

export const generateLevel = (levelNum: number): LevelData => {
  const platforms: Entity[] = [];
  const enemies: Enemy[] = [];
  const pits: Entity[] = [];
  
  let theme = COLORS.STAGE1;

  // Helper to add platform
  const addPlat = (x: number, y: number, w: number, h: number) => {
    platforms.push({
      id: `plat-${Math.random()}`,
      type: EntityType.PLATFORM,
      x, y, w, h,
      color: theme.PLATFORM // Placeholder, engine will use theme
    });
  };

  // Helper to add enemy
  const addEnemy = (x: number, y: number, patrolDist: number) => {
    enemies.push({
      id: `enemy-${Math.random()}`,
      type: EntityType.ENEMY,
      x,
      y,
      w: 40,
      h: 40,
      vx: PHYSICS.ENEMY_SPEED,
      patrolStart: x,
      patrolEnd: x + patrolDist,
      isDead: false,
      color: COLORS.ENEMY
    });
  };

  switch (levelNum) {
    case 1: // Grassland
      theme = COLORS.STAGE1;
      // Ground
      addPlat(0, CANVAS_HEIGHT - 60, 800, 60);
      // Simple jumps
      addPlat(900, CANVAS_HEIGHT - 150, 200, 40);
      addPlat(1200, CANVAS_HEIGHT - 250, 200, 40);
      addEnemy(1250, CANVAS_HEIGHT - 290, 100);
      
      addPlat(1500, CANVAS_HEIGHT - 200, 600, 200);
      addEnemy(1600, CANVAS_HEIGHT - 240, 300);
      
      addPlat(2200, CANVAS_HEIGHT - 350, 100, 40);
      addPlat(2400, CANVAS_HEIGHT - 350, 100, 40);
      
      addPlat(2600, CANVAS_HEIGHT - 60, 800, 60); // Goal area
      break;

    case 2: // Cave (Uneven terrain, lower platforms)
      theme = COLORS.STAGE2;
      addPlat(0, CANVAS_HEIGHT - 60, 400, 60);
      
      // Steps down
      addPlat(450, CANVAS_HEIGHT - 150, 100, 40);
      addPlat(600, CANVAS_HEIGHT - 250, 100, 40);
      addPlat(750, CANVAS_HEIGHT - 150, 100, 40);
      
      // Long lower ground with enemies
      addPlat(900, CANVAS_HEIGHT - 60, 1000, 60);
      addEnemy(1000, CANVAS_HEIGHT - 100, 200);
      addEnemy(1400, CANVAS_HEIGHT - 100, 200);
      addEnemy(1700, CANVAS_HEIGHT - 100, 100);

      // Technical jumps
      addPlat(2000, CANVAS_HEIGHT - 200, 80, 20);
      addPlat(2150, CANVAS_HEIGHT - 300, 80, 20);
      addPlat(2300, CANVAS_HEIGHT - 200, 80, 20);
      
      addPlat(2500, CANVAS_HEIGHT - 60, 600, 60); // Goal area
      break;

    case 3: // Sky (Floating islands, fall risk high)
      theme = COLORS.STAGE3;
      addPlat(0, CANVAS_HEIGHT - 60, 300, 60); // Start platform
      
      // Cloud steps
      addPlat(400, CANVAS_HEIGHT - 150, 150, 30);
      addPlat(650, CANVAS_HEIGHT - 250, 150, 30);
      addEnemy(680, CANVAS_HEIGHT - 290, 80);

      addPlat(900, CANVAS_HEIGHT - 350, 150, 30);
      addPlat(1200, CANVAS_HEIGHT - 250, 150, 30);
      
      // High altitude long jump
      addPlat(1500, CANVAS_HEIGHT - 400, 400, 30);
      addEnemy(1600, CANVAS_HEIGHT - 440, 200);
      
      // Small stepping stones
      addPlat(2000, CANVAS_HEIGHT - 400, 60, 20);
      addPlat(2200, CANVAS_HEIGHT - 400, 60, 20);
      addPlat(2400, CANVAS_HEIGHT - 400, 60, 20);
      
      addPlat(2600, CANVAS_HEIGHT - 150, 600, 150); // Goal cloud
      break;

    case 4: // Castle (Hard, tricky jumps, more enemies)
      theme = COLORS.STAGE4;
      addPlat(0, CANVAS_HEIGHT - 60, 300, 60);
      
      // Moat
      addPlat(350, CANVAS_HEIGHT - 150, 50, 200); // Pillar
      addPlat(500, CANVAS_HEIGHT - 250, 50, 300); // Higher Pillar
      
      // Castle Wall
      addPlat(700, CANVAS_HEIGHT - 200, 800, 40);
      addEnemy(800, CANVAS_HEIGHT - 240, 100);
      addEnemy(1000, CANVAS_HEIGHT - 240, 100);
      addEnemy(1200, CANVAS_HEIGHT - 240, 100);

      // Upper platforms
      addPlat(1600, CANVAS_HEIGHT - 350, 100, 20);
      addPlat(1800, CANVAS_HEIGHT - 450, 100, 20);
      
      // The "Bridge"
      addPlat(2100, CANVAS_HEIGHT - 300, 800, 20);
      addEnemy(2200, CANVAS_HEIGHT - 340, 600); // Fast patrol?
      
      addPlat(3000, CANVAS_HEIGHT - 60, 500, 60); // Goal
      break;
      
    default:
      // Fallback to stage 1
      theme = COLORS.STAGE1;
      addPlat(0, CANVAS_HEIGHT - 60, 800, 60);
      addPlat(900, CANVAS_HEIGHT - 60, 200, 60);
      break;
  }

  // Find the last platform to place goal
  const lastPlat = platforms[platforms.length - 1];
  const goal: Entity = {
    id: 'goal',
    type: EntityType.GOAL,
    x: lastPlat.x + lastPlat.w - 100,
    y: lastPlat.y - 100, // 100px tall goal post
    w: 20,
    h: 100,
    color: COLORS.GOAL
  };

  return { platforms, enemies, goal, pits, theme };
};
