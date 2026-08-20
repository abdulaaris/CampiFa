import { clientStorageService } from './clientStorageService';
import { detectScriptFont } from '../utils/fontDetector';

export async function clientGeneratePoster(data: {
  campaignId: string;
  fieldValues: Record<string, string>;
  photoFile?: File | null;
}): Promise<{ generationId: string; downloadUrl: string; outputUrl: string; filename: string }> {
  const { template, posterFile, campaign } = clientStorageService.getTemplate(data.campaignId);

  // 1. Create offline Canvas with full high resolution dimensions
  const width = template.width || 1080;
  const height = template.height || 1350;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context not available');

  // 2. Load Base Poster Artwork
  const bgImg = new Image();
  bgImg.crossOrigin = 'anonymous';
  const bgSrc = posterFile?.url || '';
  if (bgSrc) {
    await new Promise((resolve) => {
      bgImg.onload = resolve;
      bgImg.onerror = resolve;
      bgImg.src = bgSrc;
    });
    ctx.drawImage(bgImg, 0, 0, width, height);
  } else {
    ctx.fillStyle = '#1A1110';
    ctx.fillRect(0, 0, width, height);
  }

  // 3. Load User Photo if provided
  let userPhotoImg: HTMLImageElement | null = null;
  if (data.photoFile) {
    const photoDataUrl = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.readAsDataURL(data.photoFile!);
    });
    userPhotoImg = new Image();
    userPhotoImg.crossOrigin = 'anonymous';
    await new Promise((resolve) => {
      userPhotoImg!.onload = resolve;
      userPhotoImg!.onerror = resolve;
      userPhotoImg!.src = photoDataUrl;
    });
  }

  // 4. Ensure Fonts are ready
  if (document.fonts) {
    await Promise.all([
      document.fonts.load('600 48px "Anek Kannada"'),
      document.fonts.load('600 48px "Anek Malayalam"'),
      document.fonts.load('600 48px "Anek Telugu"'),
      document.fonts.load('600 48px "Anek Tamil"'),
      document.fonts.load('600 48px "Anek Devanagari"'),
      document.fonts.load('600 48px "Poppins"'),
      document.fonts.ready,
    ]).catch(() => {});
  }

  // 5. Draw interactive elements sorted by zIndex
  const sortedElements = [...(template.elements || [])].sort((a, b) => (a.zIndex || 1) - (b.zIndex || 1));

  for (const el of sortedElements) {
    if (!el.visible) continue;
    const styles: any = typeof el.stylesJson === 'string' ? JSON.parse(el.stylesJson || '{}') : el.styles || {};

    ctx.save();
    ctx.translate(el.x, el.y);
    if (el.rotation) {
      ctx.rotate((el.rotation * Math.PI) / 180);
    }
    ctx.translate(-el.width / 2, -el.height / 2);

    if (el.type === 'PHOTO') {
      const shape = styles.shape || 'circle';
      const borderWidth = styles.borderWidth || 0;
      const borderColor = styles.borderColor || '#ffffff';

      ctx.save();
      ctx.beginPath();
      if (shape === 'circle') {
        const r = Math.min(el.width, el.height) / 2;
        ctx.arc(el.width / 2, el.height / 2, r, 0, Math.PI * 2);
      } else if (shape === 'rounded') {
        const rx = Math.min(el.width, el.height) * 0.15;
        ctx.roundRect(0, 0, el.width, el.height, rx);
      } else {
        ctx.rect(0, 0, el.width, el.height);
      }
      ctx.clip();

      if (userPhotoImg) {
        const imgW = userPhotoImg.naturalWidth || userPhotoImg.width || 1;
        const imgH = userPhotoImg.naturalHeight || userPhotoImg.height || 1;
        const boxW = el.width;
        const boxH = el.height;
        const imgRatio = imgW / imgH;
        const boxRatio = boxW / boxH;

        let sx = 0, sy = 0, sWidth = imgW, sHeight = imgH;
        if (imgRatio > boxRatio) {
          sWidth = imgH * boxRatio;
          sx = (imgW - sWidth) / 2;
        } else {
          sHeight = imgW / boxRatio;
          sy = (imgH - sHeight) / 2;
        }
        ctx.drawImage(userPhotoImg, sx, sy, sWidth, sHeight, 0, 0, boxW, boxH);
      }
      ctx.restore();

      // Border & Shadow
      if (borderWidth > 0) {
        ctx.save();
        if (styles.shadow) {
          ctx.shadowColor = 'rgba(0,0,0,0.3)';
          ctx.shadowBlur = 10;
          ctx.shadowOffsetY = 4;
        }
        ctx.lineWidth = borderWidth;
        ctx.strokeStyle = borderColor;
        ctx.beginPath();
        if (shape === 'circle') {
          const r = Math.min(el.width, el.height) / 2;
          ctx.arc(el.width / 2, el.height / 2, r, 0, Math.PI * 2);
        } else if (shape === 'rounded') {
          const rx = Math.min(el.width, el.height) * 0.15;
          ctx.roundRect(0, 0, el.width, el.height, rx);
        } else {
          ctx.rect(0, 0, el.width, el.height);
        }
        ctx.stroke();
        ctx.restore();
      }
    } else if (el.type === 'TEXT') {
      const fieldId = el.fieldId || 'name';
      const text = data.fieldValues[fieldId] || data.fieldValues.name || '';
      if (text) {
        const fontSize = styles.fontSize || 48;
        const fontWeight = styles.fontWeight || '600';
        const rawFamily = styles.fontFamily || 'Anek Kannada';
        const resolvedFont = detectScriptFont(text, rawFamily);

        ctx.font = `${fontWeight} ${fontSize}px "${resolvedFont}", sans-serif`;
        ctx.fillStyle = styles.fill || '#FFFFFF';
        ctx.textAlign = (styles.textAlign as CanvasTextAlign) || 'center';
        ctx.textBaseline = 'middle';

        if (styles.shadow) {
          ctx.shadowColor = 'rgba(0,0,0,0.6)';
          ctx.shadowBlur = 8;
          ctx.shadowOffsetY = 2;
        }

        const textX =
          styles.textAlign === 'left' ? 0 : styles.textAlign === 'right' ? el.width : el.width / 2;
        const textY = el.height / 2;

        ctx.fillText(text, textX, textY);
      }
    }

    ctx.restore();
  }

  // 6. Export high-res PNG
  const blob = await new Promise<Blob>((resolve) => {
    canvas.toBlob((b) => resolve(b || new Blob()), 'image/png', 1.0);
  });
  const outputUrl = URL.createObjectURL(blob);
  const generationId = `gen_${Date.now()}`;
  const filename = `CampiFa-${campaign.slug}.png`;

  clientStorageService.recordAnalytics(data.campaignId, 'GENERATE');

  return {
    generationId,
    downloadUrl: outputUrl,
    outputUrl,
    filename,
  };
}
