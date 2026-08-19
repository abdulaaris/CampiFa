import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { storageService } from './storageService';

export interface ImageMetadata {
  width: number;
  height: number;
  format: string;
  size: number;
}

export interface DynamicElement {
  type: 'PHOTO' | 'TEXT' | 'SHAPE';
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  zIndex?: number;
  styles?: {
    shape?: 'rectangle' | 'circle' | 'rounded';
    borderRadius?: number;
    borderWidth?: number;
    borderColor?: string;
    shadow?: boolean;
    fontFamily?: string;
    fontSize?: number;
    fontWeight?: string | number;
    color?: string;
    textAlign?: 'left' | 'center' | 'right';
    letterSpacing?: number;
    lineHeight?: number;
    backgroundColor?: string;
  };
  value?: string; // For text: text content; for photo: buffer or storage key
  photoBuffer?: Buffer;
}

export class ImageService {
  /**
   * Get image metadata (width, height, format)
   */
  public async getImageMetadata(buffer: Buffer): Promise<ImageMetadata> {
    const meta = await sharp(buffer).metadata();
    return {
      width: meta.width || 1080,
      height: meta.height || 1350,
      format: meta.format || 'png',
      size: buffer.length,
    };
  }

  /**
   * Generate an optimized thumbnail for fast loading in campaign lists
   */
  public async generateThumbnail(buffer: Buffer, maxWidth = 400): Promise<Buffer> {
    return sharp(buffer)
      .resize({ width: maxWidth, withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer();
  }

  /**
   * Prepare a user photo: crop/resize to designated box, apply circle/rounded clip and optional border
   */
  public async processPhotoElement(
    photoBuffer: Buffer,
    targetWidth: number,
    targetHeight: number,
    shape: 'rectangle' | 'circle' | 'rounded' = 'rectangle',
    borderWidth = 0,
    borderColor = '#ffffff'
  ): Promise<Buffer> {
    const w = Math.round(targetWidth);
    const h = Math.round(targetHeight);

    // Resize/cover photo to match the target box
    let photo = sharp(photoBuffer).resize(w, h, {
      fit: 'cover',
      position: 'center',
    });

    if (shape === 'circle') {
      const radius = Math.min(w, h) / 2;
      const circleSvg = `
        <svg width="${w}" height="${h}">
          <circle cx="${w / 2}" cy="${h / 2}" r="${radius - borderWidth / 2}" fill="#fff" />
          ${borderWidth > 0 ? `<circle cx="${w / 2}" cy="${h / 2}" r="${radius - borderWidth / 2}" fill="none" stroke="${borderColor}" stroke-width="${borderWidth}" />` : ''}
        </svg>
      `;
      const maskBuffer = Buffer.from(circleSvg);
      photo = photo.composite([{ input: maskBuffer, blend: 'dest-in' }]);
    } else if (shape === 'rounded') {
      const rx = Math.min(w, h) * 0.1;
      const roundedSvg = `
        <svg width="${w}" height="${h}">
          <rect x="0" y="0" width="${w}" height="${h}" rx="${rx}" ry="${rx}" fill="#fff" />
          ${borderWidth > 0 ? `<rect x="${borderWidth / 2}" y="${borderWidth / 2}" width="${w - borderWidth}" height="${h - borderWidth}" rx="${rx}" ry="${rx}" fill="none" stroke="${borderColor}" stroke-width="${borderWidth}" />` : ''}
        </svg>
      `;
      const maskBuffer = Buffer.from(roundedSvg);
      photo = photo.composite([{ input: maskBuffer, blend: 'dest-in' }]);
    } else if (borderWidth > 0) {
      const borderSvg = `
        <svg width="${w}" height="${h}">
          <rect x="${borderWidth / 2}" y="${borderWidth / 2}" width="${w - borderWidth}" height="${h - borderWidth}" fill="none" stroke="${borderColor}" stroke-width="${borderWidth}" />
        </svg>
      `;
      photo = photo.composite([{ input: Buffer.from(borderSvg), blend: 'over' }]);
    }

    return photo.png().toBuffer();
  }

  /**
   * Escape XML/SVG text safely
   */
  private escapeXml(unsafe: string): string {
    return (unsafe || '').replace(/[<>&'"]/g, (c) => {
      switch (c) {
        case '<': return '&lt;';
        case '>': return '&gt;';
        case '&': return '&amp;';
        case '\'': return '&apos;';
        case '"': return '&quot;';
        default: return c;
      }
    });
  }

  /**
   * Multi-language font detector for high-res export (Anek Kannada, Anek Malayalam, etc.)
   */
  public detectScriptFont(
    text: string,
    fallbackFamily?: string,
    fallbackWeight?: string | number
  ): { fontFamily: string; fontWeight: string } {
    if (!text) return { fontFamily: fallbackFamily || "'Poppins', 'Inter', sans-serif", fontWeight: '600' };

    // Kannada
    if (/[\u0C80-\u0CFF]/.test(text)) {
      return { fontFamily: "'Anek Kannada', 'Noto Sans Kannada', 'Tunga', sans-serif", fontWeight: '600' };
    }
    // Malayalam
    if (/[\u0D00-\u0D7F]/.test(text)) {
      return { fontFamily: "'Anek Malayalam', 'Noto Sans Malayalam', 'Kartika', sans-serif", fontWeight: '600' };
    }
    // Telugu
    if (/[\u0C00-\u0C7F]/.test(text)) {
      return { fontFamily: "'Anek Telugu', 'Noto Sans Telugu', 'Gautami', sans-serif", fontWeight: '600' };
    }
    // Tamil
    if (/[\u0B80-\u0BFF]/.test(text)) {
      return { fontFamily: "'Anek Tamil', 'Noto Sans Tamil', 'Latha', sans-serif", fontWeight: '600' };
    }
    // Devanagari / Hindi / Marathi
    if (/[\u0900-\u097F]/.test(text)) {
      return { fontFamily: "'Anek Devanagari', 'Noto Sans Devanagari', 'Mangal', sans-serif", fontWeight: '600' };
    }
    // Bangla
    if (/[\u0980-\u09FF]/.test(text)) {
      return { fontFamily: "'Anek Bangla', 'Noto Sans Bengali', 'Vrinda', sans-serif", fontWeight: '600' };
    }
    // Gujarati
    if (/[\u0A80-\u0AFF]/.test(text)) {
      return { fontFamily: "'Anek Gujarati', 'Noto Sans Gujarati', 'Shruti', sans-serif", fontWeight: '600' };
    }
    // Odia
    if (/[\u0B00-\u0B7F]/.test(text)) {
      return { fontFamily: "'Anek Odia', 'Noto Sans Oriya', 'Kalinga', sans-serif", fontWeight: '600' };
    }
    // Gurmukhi
    if (/[\u0A00-\u0A7F]/.test(text)) {
      return { fontFamily: "'Anek Gurmukhi', 'Noto Sans Gurmukhi', 'Raavi', sans-serif", fontWeight: '600' };
    }
    // Arabic / Urdu
    if (/[\u0600-\u06FF\u0750-\u077F]/.test(text)) {
      return { fontFamily: "'Noto Naskh Arabic', 'Segoe UI', sans-serif", fontWeight: '600' };
    }

    return { fontFamily: fallbackFamily || "'Poppins', 'Inter', sans-serif", fontWeight: (fallbackWeight || '600').toString() };
  }

  /**
   * Create SVG layer for text rendering with auto script font detection
   */
  public createTextSvg(
    text: string,
    width: number,
    height: number,
    styles?: DynamicElement['styles']
  ): Buffer {
    const detected = this.detectScriptFont(text, styles?.fontFamily, styles?.fontWeight);
    const fontSize = styles?.fontSize || 32;
    const fontFamily = detected.fontFamily;
    const fontWeight = detected.fontWeight || '600';
    const color = styles?.color || '#242424';
    const align = styles?.textAlign || 'left';
    const letterSpacing = styles?.letterSpacing || 0;
    const lineHeight = styles?.lineHeight || 1.2;

    const safeText = this.escapeXml(text);

    let textAnchor = 'start';
    let textX = 0;
    if (align === 'center') {
      textAnchor = 'middle';
      textX = width / 2;
    } else if (align === 'right') {
      textAnchor = 'end';
      textX = width;
    }

    // Split lines if multiline or overflow
    const lines = safeText.split('\n');
    const startY = fontSize * 0.9;
    const lineSpacing = fontSize * lineHeight;

    const tspanElements = lines
      .map((line, idx) => {
        const y = startY + idx * lineSpacing;
        return `<tspan x="${textX}" y="${y}">${line}</tspan>`;
      })
      .join('');

    const svg = `
      <svg width="${Math.round(width)}" height="${Math.round(height)}" xmlns="http://www.w3.org/2000/svg">
        <style>
          .txt {
            font-family: ${fontFamily};
            font-size: ${fontSize}px;
            font-weight: ${fontWeight};
            fill: ${color};
            letter-spacing: ${letterSpacing}px;
          }
        </style>
        <text class="txt" text-anchor="${textAnchor}">${tspanElements}</text>
      </svg>
    `;

    return Buffer.from(svg);
  }

  /**
   * Composite final high-resolution poster
   * 1. Base Layer: Original ready-made poster (unchanged)
   * 2. User photo (clipped & styled)
   * 3. Dynamic text overlays
   */
  public async renderPersonalizedPoster(
    posterBuffer: Buffer,
    elements: DynamicElement[]
  ): Promise<Buffer> {
    const baseMeta = await sharp(posterBuffer).metadata();
    const posterWidth = baseMeta.width || 1080;
    const posterHeight = baseMeta.height || 1350;

    // Sort elements by zIndex
    const sortedElements = [...elements].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));

    const compositeInputs: sharp.OverlayOptions[] = [];

    for (const elem of sortedElements) {
      if (elem.type === 'PHOTO' && elem.photoBuffer) {
        const processedPhoto = await this.processPhotoElement(
          elem.photoBuffer,
          elem.width,
          elem.height,
          elem.styles?.shape || 'rectangle',
          elem.styles?.borderWidth || 0,
          elem.styles?.borderColor || '#ffffff'
        );

        compositeInputs.push({
          input: processedPhoto,
          left: Math.round(elem.x),
          top: Math.round(elem.y),
          blend: 'over',
        });
      } else if (elem.type === 'TEXT' && elem.value) {
        const textSvg = this.createTextSvg(
          elem.value,
          elem.width,
          elem.height,
          elem.styles
        );

        compositeInputs.push({
          input: textSvg,
          left: Math.round(elem.x),
          top: Math.round(elem.y),
          blend: 'over',
        });
      } else if (elem.type === 'SHAPE') {
        const shapeSvg = `
          <svg width="${Math.round(elem.width)}" height="${Math.round(elem.height)}">
            <rect width="${Math.round(elem.width)}" height="${Math.round(elem.height)}" fill="${elem.styles?.backgroundColor || 'rgba(0,0,0,0.5)'}" rx="${elem.styles?.borderRadius || 0}" />
          </svg>
        `;
        compositeInputs.push({
          input: Buffer.from(shapeSvg),
          left: Math.round(elem.x),
          top: Math.round(elem.y),
          blend: 'over',
        });
      }
    }

    // Apply all layers on top of original poster
    let pipeline = sharp(posterBuffer);
    if (compositeInputs.length > 0) {
      pipeline = pipeline.composite(compositeInputs);
    }

    return pipeline.png({ quality: 100, compressionLevel: 6 }).toBuffer();
  }
}

export const imageService = new ImageService();
