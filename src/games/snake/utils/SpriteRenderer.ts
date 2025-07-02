/**
 * Sprite Renderer for Snake Game
 * Handles loading and rendering sprites from sprite sheets
 */

export interface SpriteConfig {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface SnakeSprites {
  head: {
    up: SpriteConfig;
    down: SpriteConfig;
    left: SpriteConfig;
    right: SpriteConfig;
  };
  body: {
    horizontal: SpriteConfig;
    vertical: SpriteConfig;
    cornerTopLeft: SpriteConfig;
    cornerTopRight: SpriteConfig;
    cornerBottomLeft: SpriteConfig;
    cornerBottomRight: SpriteConfig;
  };
  tail: {
    up: SpriteConfig;
    down: SpriteConfig;
    left: SpriteConfig;
    right: SpriteConfig;
  };
}

export class SpriteRenderer {
  private spriteSheet: HTMLImageElement | null = null;
  private loaded = false;
  private onLoadCallbacks: (() => void)[] = [];

  constructor(private spriteSheetPath: string) {
    this.loadSpriteSheet();
  }

  private async loadSpriteSheet(): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        this.spriteSheet = img;
        this.loaded = true;
        this.onLoadCallbacks.forEach(callback => callback());
        this.onLoadCallbacks = [];
        resolve();
      };
      img.onerror = () => {
        reject(new Error(`Failed to load sprite sheet: ${this.spriteSheetPath}`));
      };
      img.src = this.spriteSheetPath;
    });
  }

  public isLoaded(): boolean {
    return this.loaded;
  }

  public onLoad(callback: () => void): void {
    if (this.loaded) {
      callback();
    } else {
      this.onLoadCallbacks.push(callback);
    }
  }

  public drawSprite(
    ctx: CanvasRenderingContext2D,
    sprite: SpriteConfig,
    dx: number,
    dy: number,
    dw: number,
    dh: number
  ): void {
    if (!this.spriteSheet || !this.loaded) {
      // Fallback to colored rectangle if sprite not loaded
      ctx.fillStyle = '#2ed573';
      ctx.fillRect(dx, dy, dw, dh);
      return;
    }

    try {
      ctx.drawImage(
        this.spriteSheet,
        sprite.x, sprite.y, sprite.width, sprite.height, // Source
        dx, dy, dw, dh // Destination
      );
    } catch (error) {
      console.warn('Failed to draw sprite:', error);
      // Fallback to colored rectangle
      ctx.fillStyle = '#2ed573';
      ctx.fillRect(dx, dy, dw, dh);
    }
  }
}

// Default sprite configurations for a typical snake sprite sheet
// These values assume a 64x64 sprite sheet with 8x8 grid (8px per sprite)
// You may need to adjust these based on your actual sprite sheet layout
export const DEFAULT_SNAKE_SPRITES: SnakeSprites = {
  head: {
    up: { x: 0, y: 0, width: 64, height: 64 },
    down: { x: 64, y: 0, width: 64, height: 64 },
    left: { x: 128, y: 0, width: 64, height: 64 },
    right: { x: 192, y: 0, width: 64, height: 64 },
  },
  body: {
    horizontal: { x: 0, y: 64, width: 64, height: 64 },
    vertical: { x: 64, y: 64, width: 64, height: 64 },
    cornerTopLeft: { x: 128, y: 64, width: 64, height: 64 },
    cornerTopRight: { x: 192, y: 64, width: 64, height: 64 },
    cornerBottomLeft: { x: 0, y: 128, width: 64, height: 64 },
    cornerBottomRight: { x: 64, y: 128, width: 64, height: 64 },
  },
  tail: {
    up: { x: 128, y: 128, width: 64, height: 64 },
    down: { x: 192, y: 128, width: 64, height: 64 },
    left: { x: 0, y: 192, width: 64, height: 64 },
    right: { x: 64, y: 192, width: 64, height: 64 },
  },
};
