import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { config } from '../config/env';

export interface StorageSaveResult {
  storageKey: string;
  url: string;
  size: number;
  mimeType: string;
  originalName: string;
}

export class StorageService {
  private baseDir: string;

  constructor() {
    this.baseDir = config.uploadDir;
    this.ensureDirectories();
  }

  private ensureDirectories() {
    const subdirs = ['posters', 'photos', 'thumbnails', 'logos', 'generated', 'temp'];
    for (const dir of subdirs) {
      const fullPath = path.join(this.baseDir, dir);
      if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
      }
    }
  }

  public async saveBuffer(
    buffer: Buffer,
    folder: 'posters' | 'photos' | 'thumbnails' | 'logos' | 'generated' | 'temp',
    filename: string,
    mimeType: string
  ): Promise<StorageSaveResult> {
    this.ensureDirectories();
    const ext = path.extname(filename) || '.png';
    const uniqueName = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`;
    const storageKey = path.join(folder, uniqueName).replace(/\\/g, '/');
    const localFilePath = path.join(this.baseDir, storageKey);

    await fs.promises.writeFile(localFilePath, buffer);

    const url = `/uploads/${storageKey}`;
    return {
      storageKey,
      url,
      size: buffer.length,
      mimeType,
      originalName: filename,
    };
  }

  public async saveFile(
    file: Express.Multer.File,
    folder: 'posters' | 'photos' | 'thumbnails' | 'logos' | 'generated' | 'temp'
  ): Promise<StorageSaveResult> {
    return this.saveBuffer(file.buffer, folder, file.originalname, file.mimetype);
  }

  public getFilePath(storageKey: string): string {
    return path.join(this.baseDir, storageKey);
  }

  public async deleteFile(storageKey: string): Promise<boolean> {
    try {
      const fullPath = this.getFilePath(storageKey);
      if (fs.existsSync(fullPath)) {
        await fs.promises.unlink(fullPath);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting file:', storageKey, error);
      return false;
    }
  }

  public async fileExists(storageKey: string): Promise<boolean> {
    return fs.existsSync(this.getFilePath(storageKey));
  }
}

export const storageService = new StorageService();
