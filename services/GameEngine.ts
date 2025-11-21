
import { GameStatus, Player, Entity, Enemy, EntityType } from '../types';
import { PHYSICS, CANVAS_WIDTH, CANVAS_HEIGHT, PLAYER_SIZE, COLORS } from '../constants';
import { generateLevel } from './LevelGenerator';

export class GameEngine {
  ctx: CanvasRenderingContext2D;
  status: GameStatus = GameStatus.MENU;
  
  player: Player;
  platforms: Entity[] = [];
  enemies: Enemy[] = [];
  goal: Entity | null = null;
  
  keys: { [key: string]: boolean } = {};
  cameraX: number = 0;
  
  playerImage: HTMLImageElement;
  isImageLoaded: boolean = false;

  onGameOver: () => void;
  onVictory: () => void;
  onLevelComplete: () => void;
  onScoreUpdate: (score: number) => void;

  score: number = 0;
  scoreAtLevelStart: number = 0; // Snapshot for retrying levels
  currentLevel: number = 1;
  maxLevels: number = 4;
  
  currentTheme = COLORS.STAGE1;

  constructor(
    ctx: CanvasRenderingContext2D, 
    onGameOver: () => void, 
    onVictory: () => void,
    onLevelComplete: () => void,
    onScoreUpdate: (s: number) => void
  ) {
    this.ctx = ctx;
    this.onGameOver = onGameOver;
    this.onVictory = onVictory;
    this.onLevelComplete = onLevelComplete;
    this.onScoreUpdate = onScoreUpdate;

    // Generate Character Sprite
    this.playerImage = new Image();
    this.playerImage.src = this.generateCharacterSprite();
    this.isImageLoaded = true;

    this.player = this.createInitialPlayer();
  }

  // Creates a pixel art sprite based on the provided anime character
  // Brown hair, Green inner highlights, Beige cardigan
  generateCharacterSprite(): string {
    const canvas = document.createElement('canvas');
    const size = 32; // Internal sprite resolution
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return '';

    // Palette based on the image
    const P = {
      _: 'rgba(0,0,0,0)',       // Transparent
      H: '#5D4037',             // Hair (Brown)
      G: '#00E676',             // Green Highlights
      S: '#FFCCBC',             // Skin
      E: '#F57F17',             // Eyes (Amber)
      W: '#FFF9C4',             // Cardigan (Cream/Beige)
      I: '#FFFFFF',             // Shirt (White)
      B: '#3E2723'              // Backpack/Details
    };

    // 16x16 Pixel Art Grid (Doubled to 32x32 automatically by drawing 2x2 blocks)
    const spriteMap = [
      "________________",
      "____HHHHHH______",
      "___HHHHHHHH_____",
      "__HHHGGHHGGH____", // Green highlights peeking through
      "__HHHHHHHHHH____",
      "__HHSESSSESH____", // Face + Eyes
      "__HHSSSSSSSH____",
      "___HSSSSSSSH____",
      "___GGHSSSHGG____", // Green tips
      "____WWIIWW______", // Shoulders
      "____WWIIWW______",
      "___BWWWWWWB_____", // Backpack straps
      "___W_WWWW_W_____",
      "___W_WWWW_W_____",
      "_____WWWW_______",
      "________________"
    ];

    // Draw the sprite
    const pixelSize = 2;
    spriteMap.forEach((row, y) => {
      for (let x = 0; x < row.length; x++) {
        const char = row[x] as keyof typeof P;
        if (P[char] && P[char] !== P._) {
          ctx.fillStyle = P[char];
          ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
        }
      }
    });

    return canvas.toDataURL();
  }

  createInitialPlayer(): Player {
    return {
      id: 'player',
      type: EntityType.PLAYER,
      x: 100,
      y: 300,
      w: PLAYER_SIZE.w,
      h: PLAYER_SIZE.h,
      vx: 0,
      vy: 0,
      isGrounded: false,
      facingRight: true
    };
  }

  start(level: number = 1) {
    this.currentLevel = level;
    if (level === 1) {
        this.score = 0;
    }
    // Snapshot score at start of level so retries don't farm points
    this.scoreAtLevelStart = this.score;
    this.onScoreUpdate(this.score);

    const levelData = generateLevel(this.currentLevel);
    this.platforms = levelData.platforms;
    this.enemies = levelData.enemies;
    this.goal = levelData.goal;
    this.currentTheme = levelData.theme;

    this.player = this.createInitialPlayer();
    this.cameraX = 0;
    this.status = GameStatus.PLAYING;
  }

  nextLevel() {
    this.start(this.currentLevel + 1);
  }

  retryCurrentLevel() {
    // Revert score to what it was when level started
    this.score = this.scoreAtLevelStart;
    this.start(this.currentLevel);
  }

  handleInput(key: string, isPressed: boolean) {
    this.keys[key] = isPressed;
  }

  update() {
    if (this.status !== GameStatus.PLAYING) return;

    // --- Player Movement ---
    if (this.keys['ArrowLeft']) {
      this.player.vx = -PHYSICS.MOVE_SPEED;
      this.player.facingRight = false;
    } else if (this.keys['ArrowRight']) {
      this.player.vx = PHYSICS.MOVE_SPEED;
      this.player.facingRight = true;
    } else {
      this.player.vx = 0;
    }

    // Jumping
    if (this.keys['ArrowUp'] && this.player.isGrounded) {
      this.player.vy = PHYSICS.JUMP_FORCE;
      this.player.isGrounded = false;
    }

    // Apply Gravity
    this.player.vy += PHYSICS.GRAVITY;
    this.player.vy = Math.min(this.player.vy, PHYSICS.MAX_FALL_SPEED);

    // --- Physics X Axis ---
    this.player.x += this.player.vx;
    this.checkCollisionsX();

    // --- Physics Y Axis ---
    this.player.y += this.player.vy;
    this.player.isGrounded = false; // Assume in air until collision proves otherwise
    this.checkCollisionsY();

    // --- Entity Updates ---
    this.updateEnemies();

    // --- Game Rules ---
    // Check Goal
    if (this.goal && this.checkAABB(this.player, this.goal)) {
      this.completeLevel();
    }

    // Check Death (Pit)
    if (this.player.y > CANVAS_HEIGHT) {
      this.die();
    }

    // --- Camera ---
    // Camera follows player, but doesn't show past start
    this.cameraX = Math.max(0, this.player.x - CANVAS_WIDTH / 2 + this.player.w / 2);
  }

  completeLevel() {
      if (this.currentLevel < this.maxLevels) {
          // Intermediate Level Complete
          this.status = GameStatus.LEVEL_COMPLETE;
          this.onLevelComplete();
      } else {
          // Victory
          this.status = GameStatus.VICTORY;
          this.onVictory();
      }
  }

  checkCollisionsX() {
    for (const plat of this.platforms) {
      if (this.checkAABB(this.player, plat)) {
        if (this.player.vx > 0) {
          this.player.x = plat.x - this.player.w;
        } else if (this.player.vx < 0) {
          this.player.x = plat.x + plat.w;
        }
        this.player.vx = 0;
      }
    }
  }

  checkCollisionsY() {
    for (const plat of this.platforms) {
      if (this.checkAABB(this.player, plat)) {
        if (this.player.vy > 0) {
          // Falling down onto platform
          this.player.y = plat.y - this.player.h;
          this.player.isGrounded = true;
          this.player.vy = 0;
        } else if (this.player.vy < 0) {
          // Hitting head
          this.player.y = plat.y + plat.h;
          this.player.vy = 0;
        }
      }
    }
  }

  updateEnemies() {
    for (const enemy of this.enemies) {
      if (enemy.isDead) continue;

      // Patrol Logic
      enemy.x += enemy.vx;
      if (enemy.x > enemy.patrolEnd || enemy.x < enemy.patrolStart) {
        enemy.vx *= -1;
      }

      // Collision with Player
      if (this.checkAABB(this.player, enemy)) {
        // Mario logic: if player falls onto enemy, enemy dies. Otherwise player dies.
        const hitFromAbove = this.player.vy > 0 && (this.player.y + this.player.h - enemy.y) < 25; // Tolerance

        if (hitFromAbove) {
          enemy.isDead = true;
          this.player.vy = PHYSICS.JUMP_FORCE * 0.5; // Bounce
          this.score += 100;
          this.onScoreUpdate(this.score);
        } else {
          this.die();
        }
      }
    }
  }

  checkAABB(r1: Entity | Player, r2: Entity): boolean {
    return (
      r1.x < r2.x + r2.w &&
      r1.x + r1.w > r2.x &&
      r1.y < r2.y + r2.h &&
      r1.y + r1.h > r2.y
    );
  }

  die() {
    this.status = GameStatus.GAME_OVER;
    this.onGameOver();
  }

  draw() {
    // Clear Background
    this.ctx.fillStyle = this.currentTheme.SKY;
    this.ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    this.ctx.save();
    this.ctx.translate(-this.cameraX, 0);

    // Draw Platforms
    for (const plat of this.platforms) {
        this.ctx.fillStyle = this.currentTheme.PLATFORM;
        this.ctx.fillRect(plat.x, plat.y, plat.w, plat.h);
        
        // Add a little "grass/top" 
        this.ctx.fillStyle = this.currentTheme.GROUND_TOP;
        this.ctx.fillRect(plat.x, plat.y, plat.w, 10);
    }

    // Draw Enemies
    for (const enemy of this.enemies) {
      if (enemy.isDead) continue;
      this.ctx.fillStyle = COLORS.ENEMY;
      this.ctx.fillRect(enemy.x, enemy.y, enemy.w, enemy.h);
      
      // Enemy Eyes (Simple visual)
      this.ctx.fillStyle = 'white';
      const eyeOffset = enemy.vx > 0 ? 25 : 5;
      this.ctx.fillRect(enemy.x + eyeOffset, enemy.y + 10, 10, 10);
    }

    // Draw Goal
    if (this.goal) {
      this.ctx.fillStyle = COLORS.GOAL;
      this.ctx.fillRect(this.goal.x, this.goal.y, this.goal.w, this.goal.h);
      
      // Flag
      this.ctx.beginPath();
      this.ctx.moveTo(this.goal.x + 20, this.goal.y);
      this.ctx.lineTo(this.goal.x + 60, this.goal.y + 20);
      this.ctx.lineTo(this.goal.x + 20, this.goal.y + 40);
      this.ctx.fillStyle = 'red';
      this.ctx.fill();
    }

    // Draw Player
    if (this.isImageLoaded) {
      this.ctx.save();
      // Handle flipping sprite
      if (!this.player.facingRight) {
        this.ctx.translate(this.player.x + this.player.w, this.player.y);
        this.ctx.scale(-1, 1);
        this.ctx.drawImage(this.playerImage, 0, 0, this.player.w, this.player.h);
      } else {
        this.ctx.drawImage(this.playerImage, this.player.x, this.player.y, this.player.w, this.player.h);
      }
      this.ctx.restore();
    } else {
      this.ctx.fillStyle = 'red';
      this.ctx.fillRect(this.player.x, this.player.y, this.player.w, this.player.h);
    }

    this.ctx.restore();
  }
}
