
export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Vector {
  x: number;
  y: number;
  w: number;
  h: number;
}

export enum EntityType {
  PLAYER,
  PLATFORM,
  ENEMY,
  GOAL,
  PIT
}

export interface Entity extends Rect {
  id: string;
  type: EntityType;
  color?: string;
}

export interface Enemy extends Entity {
  vx: number;
  patrolStart: number;
  patrolEnd: number;
  isDead: boolean;
}

export interface Player extends Entity {
  vx: number;
  vy: number;
  isGrounded: boolean;
  facingRight: boolean;
}

export enum GameStatus {
  MENU,
  PLAYING,
  GAME_OVER,
  VICTORY,
  LEVEL_COMPLETE
}
