import React, { useRef, useEffect, useState, useCallback } from 'react';
import { TemplateElement, CampaignField } from '../types';
import { detectScriptFont } from '../utils/fontDetector';

interface InteractiveCanvasProps {
  posterUrl: string;
  elements: TemplateElement[];
  fields: CampaignField[];
  selectedElementId: string | null;
  onSelectElement: (id: string | null) => void;
  onUpdateElement: (id: string, updates: Partial<TemplateElement>) => void;
  zoom: number;
  showGrid: boolean;
  snapToGrid: boolean;
  sampleValues?: Record<string, string>;
  userPhotoUrl?: string | null;
  onPhotoAreaClick?: () => void;
  onTextElementClick?: (fieldName: string) => void;
}

type HandleType = 'nw' | 'ne' | 'se' | 'sw' | 'n' | 's' | 'e' | 'w' | 'move' | 'none';

export const InteractiveCanvas: React.FC<InteractiveCanvasProps> = ({
  posterUrl,
  elements,
  fields,
  selectedElementId,
  onSelectElement,
  onUpdateElement,
  zoom,
  showGrid,
  snapToGrid,
  sampleValues = {},
  userPhotoUrl,
  onPhotoAreaClick,
  onTextElementClick,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const bgImageRef = useRef<HTMLImageElement | null>(null);
  const userPhotoImgRef = useRef<HTMLImageElement | null>(null);

  const [imgLoaded, setImgLoaded] = useState<boolean>(false);
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({
    width: 1080,
    height: 1350,
  });

  // Dragging & Scaling state (Photoshop style)
  const isDraggingRef = useRef<boolean>(false);
  const dragHandleRef = useRef<HandleType>('none');
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const fontSizeStartRef = useRef<number>(36);
  const lastActionTimeRef = useRef<number>(0);
  const lastTouchTimeRef = useRef<number>(0);
  const elementStartRef = useRef<{ x: number; y: number; width: number; height: number }>({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });

  // Render Canvas Function
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = Math.max(720, dimensions.width || 1080);
    const height = Math.max(900, dimensions.height || 1350);
    canvas.width = width;
    canvas.height = height;

    // Clear
    ctx.clearRect(0, 0, width, height);

    if (bgImageRef.current) {
      ctx.drawImage(bgImageRef.current, 0, 0, width, height);
    } else {
      // Sleek placeholder artwork canvas
      ctx.fillStyle = '#1e1a19';
      ctx.fillRect(0, 0, width, height);

      // Soft ambient background grid
      ctx.strokeStyle = 'rgba(255, 244, 229, 0.05)';
      ctx.lineWidth = 1;
      const gs = 40;
      for (let x = 0; x < width; x += gs) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gs) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      if (posterUrl) {
        ctx.fillStyle = '#FFF4E5';
        ctx.font = '600 24px Poppins, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Loading base poster artwork...', width / 2, height / 2);
      } else {
        ctx.fillStyle = '#FFF4E5';
        ctx.font = 'bold 28px Poppins, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Campaign Poster Canvas', width / 2, height / 2 - 20);
        ctx.fillStyle = '#BA6A4C';
        ctx.font = '600 16px Inter, sans-serif';
        ctx.fillText('Click "Change Poster" in the toolbar to upload artwork', width / 2, height / 2 + 20);
      }
    }

    // 2. Draw Optional Grid
    if (showGrid) {
      const gridSize = 40;
      ctx.strokeStyle = 'rgba(123, 37, 37, 0.15)';
      ctx.lineWidth = 1;

      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
    }

    // 3. Render Elements sorted by zIndex
    const sorted = [...elements].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));

    sorted.forEach((el) => {
      if (!el.visible) return;

      const styles: any = typeof el.stylesJson === 'string' ? JSON.parse(el.stylesJson || '{}') : el.styles || {};
      const isSelected = el.id === selectedElementId;

      ctx.save();
      ctx.translate(el.x + el.width / 2, el.y + el.height / 2);
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

        // If user photo exists, draw it with perfect object-fit: cover (proportional center crop)
        if (userPhotoImgRef.current) {
          const pImg = userPhotoImgRef.current;
          const imgW = pImg.naturalWidth || pImg.width || 1;
          const imgH = pImg.naturalHeight || pImg.height || 1;
          const boxW = el.width;
          const boxH = el.height;

          const imgRatio = imgW / imgH;
          const boxRatio = boxW / boxH;

          let sx = 0;
          let sy = 0;
          let sWidth = imgW;
          let sHeight = imgH;

          if (imgRatio > boxRatio) {
            // Image is wider: crop sides and center horizontally
            sWidth = imgH * boxRatio;
            sx = (imgW - sWidth) / 2;
          } else {
            // Image is taller: crop top/bottom and center vertically
            sHeight = imgW / boxRatio;
            sy = (imgH - sHeight) / 2;
          }

          ctx.drawImage(pImg, sx, sy, sWidth, sHeight, 0, 0, boxW, boxH);
        } else {
          // 1. Sleek Gradient Fill with soft ambient depth
          const grad = ctx.createRadialGradient(
            el.width / 2,
            el.height / 2 - 10,
            10,
            el.width / 2,
            el.height / 2,
            Math.max(el.width, el.height) / 1.4
          );
          grad.addColorStop(0, '#FFFDFB');
          grad.addColorStop(0.55, '#F5EDE4');
          grad.addColorStop(1, '#E6D9CB');
          ctx.fillStyle = grad;
          ctx.fill();

          // 2. Subtle interior dashed accent ring
          ctx.save();
          ctx.strokeStyle = 'rgba(123, 37, 37, 0.22)';
          ctx.lineWidth = 2.5;
          ctx.setLineDash([8, 6]);
          if (shape === 'circle') {
            const innerR = Math.min(el.width, el.height) / 2 - 12;
            if (innerR > 0) {
              ctx.beginPath();
              ctx.arc(el.width / 2, el.height / 2, innerR, 0, Math.PI * 2);
              ctx.stroke();
            }
          } else {
            ctx.strokeRect(10, 10, el.width - 20, el.height - 20);
          }
          ctx.restore();

          const cx = el.width / 2;
          const cy = el.height / 2;
          const scaleRatio = Math.min(el.width, el.height) / 320;
          const badgeRadius = Math.max(22, Math.round(36 * scaleRatio));

          // 3. Central Modern Glowing Icon Badge
          ctx.save();
          ctx.shadowColor = 'rgba(123, 37, 37, 0.12)';
          ctx.shadowBlur = 12;
          ctx.shadowOffsetY = 4;
          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          ctx.arc(cx, cy - Math.round(18 * scaleRatio), badgeRadius, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#EFE6DB';
          ctx.lineWidth = 2;
          ctx.stroke();
          ctx.restore();

          // 4. Stylish Vector Camera Glyph inside badge
          const camY = cy - Math.round(18 * scaleRatio);
          const iconSize = Math.max(13, Math.round(20 * scaleRatio));
          ctx.fillStyle = '#7B2525';

          // Camera body rounded rect
          ctx.beginPath();
          const camW = iconSize * 1.5;
          const camH = iconSize * 1.1;
          ctx.roundRect(cx - camW / 2, camY - camH / 2 + 2, camW, camH, 4);
          ctx.fill();

          // Camera top notch
          ctx.beginPath();
          ctx.roundRect(cx - camW * 0.25, camY - camH / 2 - 2, camW * 0.5, 4, 2);
          ctx.fill();

          // Camera Lens Circle (White)
          ctx.beginPath();
          ctx.arc(cx, camY + 2, iconSize * 0.38, 0, Math.PI * 2);
          ctx.fillStyle = '#FFFFFF';
          ctx.fill();

          // Camera Lens Inner Pupil
          ctx.beginPath();
          ctx.arc(cx, camY + 2, iconSize * 0.22, 0, Math.PI * 2);
          ctx.fillStyle = '#7B2525';
          ctx.fill();

          // Tiny Lens Reflection Highlight
          ctx.beginPath();
          ctx.arc(cx - iconSize * 0.08, camY + 2 - iconSize * 0.08, iconSize * 0.07, 0, Math.PI * 2);
          ctx.fillStyle = '#FFFFFF';
          ctx.fill();

          // 5. Typography: Modern Crisp Pill Label
          const titleSize = Math.max(14, Math.round(18 * scaleRatio));
          ctx.fillStyle = '#7B2525';
          ctx.font = `bold ${titleSize}px Poppins, sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(onPhotoAreaClick ? '+ Add Photo' : '{{ PHOTO }}', cx, cy + Math.round(28 * scaleRatio));

          // Subtitle
          const subSize = Math.max(10, Math.round(11 * scaleRatio));
          ctx.fillStyle = '#947264';
          ctx.font = `600 ${subSize}px Inter, sans-serif`;
          ctx.fillText(onPhotoAreaClick ? 'Tap to Upload' : 'Dynamic Photo Frame', cx, cy + Math.round(46 * scaleRatio));
        }
        ctx.restore();

        // Draw Border
        if (borderWidth > 0) {
          ctx.beginPath();
          if (shape === 'circle') {
            const r = Math.min(el.width, el.height) / 2 - borderWidth / 2;
            ctx.arc(el.width / 2, el.height / 2, r, 0, Math.PI * 2);
          } else if (shape === 'rounded') {
            const rx = Math.min(el.width, el.height) * 0.15;
            ctx.roundRect(borderWidth / 2, borderWidth / 2, el.width - borderWidth, el.height - borderWidth, rx);
          } else {
            ctx.rect(borderWidth / 2, borderWidth / 2, el.width - borderWidth, el.height - borderWidth);
          }
          ctx.strokeStyle = borderColor;
          ctx.lineWidth = borderWidth;
          ctx.stroke();
        }
      } else if (el.type === 'TEXT') {
        const fieldName = el.fieldId || 'name';
        let sampleText = sampleValues[fieldName];
        let isPlaceholder = false;

        if (!sampleText || !sampleText.trim()) {
          const f = fields.find((item) => item.name === fieldName);
          sampleText = f?.placeholder || (fieldName === 'name' ? 'Enter Name' : fieldName === 'designation' ? 'Enter Designation' : `Enter ${f?.label || fieldName}`);
          isPlaceholder = true;
        }

        const detected = detectScriptFont(sampleText, styles.fontFamily, styles.fontWeight);
        const fontSize = styles.fontSize || 36;
        const fontFamily = detected.fontFamily;
        const fontWeight = detected.fontWeight || '600';
        const color = styles.color || '#242424';
        const textAlign = styles.textAlign || 'center';

        ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
        ctx.fillStyle = isPlaceholder && onTextElementClick ? '#BA6A4C' : color;
        ctx.textAlign = textAlign;
        ctx.textBaseline = 'middle';

        let textX = el.width / 2;
        if (textAlign === 'left') textX = 0;
        else if (textAlign === 'right') textX = el.width;

        ctx.fillText(sampleText, textX, el.height / 2, el.width);
      } else if (el.type === 'SHAPE') {
        ctx.fillStyle = styles.backgroundColor || 'rgba(0,0,0,0.5)';
        if (styles.borderRadius) {
          ctx.roundRect(0, 0, el.width, el.height, styles.borderRadius);
          ctx.fill();
        } else {
          ctx.fillRect(0, 0, el.width, el.height);
        }
      }

      // 4. Draw Photoshop-style Tight Selection Bounding Box & 8 Transform Anchors (Only in editor mode)
      if (isSelected && !onPhotoAreaClick && !onTextElementClick) {
        ctx.strokeStyle = '#0084FF';
        ctx.lineWidth = 2.5;
        ctx.setLineDash([]);
        ctx.strokeRect(0, 0, el.width, el.height);

        const handleHalf = 8;
        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle = '#0084FF';
        ctx.lineWidth = 2.5;

        const handles = [
          { x: 0, y: 0 }, // nw
          { x: el.width / 2, y: 0 }, // n
          { x: el.width, y: 0 }, // ne
          { x: el.width, y: el.height / 2 }, // e
          { x: el.width, y: el.height }, // se
          { x: el.width / 2, y: el.height }, // s
          { x: 0, y: el.height }, // sw
          { x: 0, y: el.height / 2 }, // w
        ];

        handles.forEach((h) => {
          ctx.fillRect(h.x - handleHalf, h.y - handleHalf, handleHalf * 2, handleHalf * 2);
          ctx.strokeRect(h.x - handleHalf, h.y - handleHalf, handleHalf * 2, handleHalf * 2);
        });

        // Field label & font-size badge above element
        ctx.fillStyle = '#0084FF';
        ctx.font = 'bold 14px Inter, sans-serif';
        const fontSizeDisplay = el.type === 'TEXT' ? ` • ${styles.fontSize || 36}px` : '';
        const labelText = `${el.type}: ${el.fieldId || 'unmapped'}${fontSizeDisplay}`;
        const labelWidth = ctx.measureText(labelText).width + 16;
        ctx.fillRect(0, -32, labelWidth, 24);
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(labelText, 8, -20);
      }

      ctx.restore();
    });
  }, [dimensions, elements, selectedElementId, showGrid, sampleValues, onPhotoAreaClick, onTextElementClick, fields]);

  useEffect(() => {
    renderCanvas();
  }, [renderCanvas, zoom, imgLoaded]);

  // Eagerly ensure Indic web fonts are loaded and trigger re-render
  useEffect(() => {
    if ('fonts' in document) {
      Promise.all([
        document.fonts.load('600 36px "Anek Kannada"'),
        document.fonts.load('600 36px "Anek Malayalam"'),
        document.fonts.load('600 36px "Anek Telugu"'),
        document.fonts.load('600 36px "Anek Tamil"'),
        document.fonts.load('600 36px "Anek Devanagari"'),
        document.fonts.load('600 36px "Poppins"'),
        document.fonts.ready,
      ]).then(() => {
        renderCanvas();
      });
    }
  }, [renderCanvas, sampleValues]);

  // Load sample user photo if available and trigger renderCanvas
  useEffect(() => {
    if (userPhotoUrl) {
      const p = new Image();
      if (!userPhotoUrl.startsWith('data:')) {
        p.crossOrigin = 'anonymous';
      }
      p.src = userPhotoUrl;
      p.onload = () => {
        userPhotoImgRef.current = p;
        renderCanvas();
      };
      p.onerror = () => {
        if (p.crossOrigin) {
          const retry = new Image();
          retry.src = userPhotoUrl;
          retry.onload = () => {
            userPhotoImgRef.current = retry;
            renderCanvas();
          };
        }
      };
    } else {
      userPhotoImgRef.current = null;
      renderCanvas();
    }
  }, [userPhotoUrl, renderCanvas]);

  // Load base poster artwork with CORS fallback and instant canvas render
  useEffect(() => {
    if (!posterUrl) {
      bgImageRef.current = null;
      renderCanvas();
      return;
    }

    const img = new Image();
    if (!posterUrl.startsWith('data:')) {
      img.crossOrigin = 'anonymous';
    }
    img.src = posterUrl;
    img.onload = () => {
      bgImageRef.current = img;
      const w = img.naturalWidth || 1080;
      const h = img.naturalHeight || 1350;
      setDimensions({ width: w, height: h });
      setImgLoaded(true);
      renderCanvas();
    };
    img.onerror = () => {
      if (img.crossOrigin) {
        const retryImg = new Image();
        retryImg.src = posterUrl;
        retryImg.onload = () => {
          bgImageRef.current = retryImg;
          setDimensions({ width: retryImg.naturalWidth || 1080, height: retryImg.naturalHeight || 1350 });
          setImgLoaded(true);
          renderCanvas();
        };
      }
    };
  }, [posterUrl, renderCanvas]);

  // Re-render when elements or dimensions change
  useEffect(() => {
    renderCanvas();
  }, [renderCanvas, elements, dimensions, showGrid, selectedElementId]);

  // Coordinate conversion
  const getCanvasCoords = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  // Check which handle or element is clicked/touched with touch-adapted radius
  const hitTest = (x: number, y: number): { element: TemplateElement | null; handle: HandleType } => {
    const canvas = canvasRef.current;
    const rect = canvas ? canvas.getBoundingClientRect() : { width: 360 };
    const scaleFactor = canvas ? canvas.width / rect.width : 3.0;

    const handleTouchRadius = Math.max(70, 36 * scaleFactor);
    const reversed = [...elements].reverse();

    for (const el of reversed) {
      if (!el.visible || el.locked) continue;

      const isSelected = el.id === selectedElementId;

      if (isSelected && !onPhotoAreaClick && !onTextElementClick) {
        const cx = el.x + el.width / 2;
        const cy = el.y + el.height / 2;
        const right = el.x + el.width;
        const bottom = el.y + el.height;

        // 1. Corners
        if (Math.hypot(x - el.x, y - el.y) < handleTouchRadius) return { element: el, handle: 'nw' };
        if (Math.hypot(x - right, y - el.y) < handleTouchRadius) return { element: el, handle: 'ne' };
        if (Math.hypot(x - right, y - bottom) < handleTouchRadius) return { element: el, handle: 'se' };
        if (Math.hypot(x - el.x, y - bottom) < handleTouchRadius) return { element: el, handle: 'sw' };

        // 2. Midpoint Edges
        if (Math.hypot(x - cx, y - el.y) < handleTouchRadius) return { element: el, handle: 'n' };
        if (Math.hypot(x - right, y - cy) < handleTouchRadius) return { element: el, handle: 'e' };
        if (Math.hypot(x - cx, y - bottom) < handleTouchRadius) return { element: el, handle: 's' };
        if (Math.hypot(x - el.x, y - cy) < handleTouchRadius) return { element: el, handle: 'w' };
      }

      // 3. Element Body (Click/Tap)
      if (x >= el.x && x <= el.x + el.width && y >= el.y && y <= el.y + el.height) {
        return { element: el, handle: 'move' };
      }
    }

    return { element: null, handle: 'none' };
  };

  const startDrag = (clientX: number, clientY: number) => {
    const coords = getCanvasCoords(clientX, clientY);
    const { element, handle } = hitTest(coords.x, coords.y);

    if (element) {
      const now = Date.now();

      // In preview/public mode: click on photo triggers photo upload (debounced)
      if (onPhotoAreaClick && element.type === 'PHOTO') {
        if (now - lastActionTimeRef.current > 800) {
          lastActionTimeRef.current = now;
          onPhotoAreaClick();
        }
        return;
      }

      // In preview/public mode: click on text triggers input focus (debounced)
      if (onTextElementClick && element.type === 'TEXT') {
        if (now - lastActionTimeRef.current > 800) {
          lastActionTimeRef.current = now;
          onTextElementClick(element.fieldId || 'name');
        }
        return;
      }

      const styles: any = typeof element.stylesJson === 'string' ? JSON.parse(element.stylesJson || '{}') : element.styles || {};
      fontSizeStartRef.current = styles.fontSize || 36;

      onSelectElement(element.id);
      isDraggingRef.current = true;
      dragHandleRef.current = handle;
      dragStartRef.current = coords;
      elementStartRef.current = {
        x: element.x,
        y: element.y,
        width: element.width,
        height: element.height,
      };
    } else {
      onSelectElement(null);
    }
  };

  const moveDrag = (clientX: number, clientY: number) => {
    if (!isDraggingRef.current || !selectedElementId || onPhotoAreaClick || onTextElementClick) return;

    const coords = getCanvasCoords(clientX, clientY);
    const dx = coords.x - dragStartRef.current.x;
    const dy = coords.y - dragStartRef.current.y;

    const start = elementStartRef.current;
    const handle = dragHandleRef.current;
    const targetElement = elements.find((el) => el.id === selectedElementId);
    if (!targetElement) return;

    const isPhoto = targetElement.type === 'PHOTO';
    const isText = targetElement.type === 'TEXT';
    const existingStyles: any = typeof targetElement.stylesJson === 'string' ? JSON.parse(targetElement.stylesJson || '{}') : targetElement.styles || {};

    let newX = start.x;
    let newY = start.y;
    let newWidth = start.width;
    let newHeight = start.height;
    let newFontSize = existingStyles.fontSize || fontSizeStartRef.current;

    const grid = snapToGrid ? 10 : 1;

    if (handle === 'move') {
      newX = Math.round((start.x + dx) / grid) * grid;
      newY = Math.round((start.y + dy) / grid) * grid;
    } else if (handle === 'se') {
      if (isPhoto) {
        const delta = Math.max(dx, dy);
        const size = Math.max(50, Math.round((start.width + delta) / grid) * grid);
        newWidth = size;
        newHeight = size;
      } else {
        newWidth = Math.max(50, Math.round((start.width + dx) / grid) * grid);
        newHeight = Math.max(24, Math.round((start.height + dy) / grid) * grid);
        if (isText) {
          const scale = newHeight / start.height;
          newFontSize = Math.max(12, Math.min(180, Math.round(fontSizeStartRef.current * scale)));
        }
      }
    } else if (handle === 'sw') {
      if (isPhoto) {
        const delta = Math.max(-dx, dy);
        const size = Math.max(50, Math.round((start.width + delta) / grid) * grid);
        newX = start.x + (start.width - size);
        newWidth = size;
        newHeight = size;
      } else {
        const targetW = Math.max(50, Math.round((start.width - dx) / grid) * grid);
        newX = start.x + (start.width - targetW);
        newWidth = targetW;
        newHeight = Math.max(24, Math.round((start.height + dy) / grid) * grid);
        if (isText) {
          const scale = newHeight / start.height;
          newFontSize = Math.max(12, Math.min(180, Math.round(fontSizeStartRef.current * scale)));
        }
      }
    } else if (handle === 'ne') {
      if (isPhoto) {
        const delta = Math.max(dx, -dy);
        const size = Math.max(50, Math.round((start.width + delta) / grid) * grid);
        newY = start.y + (start.height - size);
        newWidth = size;
        newHeight = size;
      } else {
        const targetH = Math.max(24, Math.round((start.height - dy) / grid) * grid);
        newY = start.y + (start.height - targetH);
        newWidth = Math.max(50, Math.round((start.width + dx) / grid) * grid);
        newHeight = targetH;
        if (isText) {
          const scale = newHeight / start.height;
          newFontSize = Math.max(12, Math.min(180, Math.round(fontSizeStartRef.current * scale)));
        }
      }
    } else if (handle === 'nw') {
      if (isPhoto) {
        const delta = Math.max(-dx, -dy);
        const size = Math.max(50, Math.round((start.width + delta) / grid) * grid);
        newX = start.x + (start.width - size);
        newY = start.y + (start.height - size);
        newWidth = size;
        newHeight = size;
      } else {
        const targetW = Math.max(50, Math.round((start.width - dx) / grid) * grid);
        const targetH = Math.max(24, Math.round((start.height - dy) / grid) * grid);
        newX = start.x + (start.width - targetW);
        newY = start.y + (start.height - targetH);
        newWidth = targetW;
        newHeight = targetH;
        if (isText) {
          const scale = newHeight / start.height;
          newFontSize = Math.max(12, Math.min(180, Math.round(fontSizeStartRef.current * scale)));
        }
      }
    } else if (handle === 'e') {
      newWidth = Math.max(50, Math.round((start.width + dx) / grid) * grid);
    } else if (handle === 'w') {
      const targetW = Math.max(50, Math.round((start.width - dx) / grid) * grid);
      newX = start.x + (start.width - targetW);
      newWidth = targetW;
    } else if (handle === 's') {
      newHeight = Math.max(24, Math.round((start.height + dy) / grid) * grid);
      if (isText) {
        const scale = newHeight / start.height;
        newFontSize = Math.max(12, Math.min(180, Math.round(fontSizeStartRef.current * scale)));
      }
    } else if (handle === 'n') {
      const targetH = Math.max(24, Math.round((start.height - dy) / grid) * grid);
      newY = start.y + (start.height - targetH);
      newHeight = targetH;
      if (isText) {
        const scale = newHeight / start.height;
        newFontSize = Math.max(12, Math.min(180, Math.round(fontSizeStartRef.current * scale)));
      }
    }

    const updatedStyles = {
      ...existingStyles,
      fontSize: newFontSize,
    };

    onUpdateElement(selectedElementId, {
      x: newX,
      y: newY,
      width: newWidth,
      height: newHeight,
      stylesJson: JSON.stringify(updatedStyles),
    });
  };

  const endDrag = () => {
    isDraggingRef.current = false;
    dragHandleRef.current = 'none';
  };

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-hidden p-1 sm:p-4 flex items-center justify-center min-h-[300px] touch-none w-full h-full"
    >
      <div className="shadow-2xl rounded-2xl overflow-hidden border border-brand-border/80 bg-white flex items-center justify-center max-h-full max-w-full">
        <canvas
          ref={canvasRef}
          onMouseDown={(e) => {
            if (Date.now() - lastTouchTimeRef.current < 600) return;
            startDrag(e.clientX, e.clientY);
          }}
          onMouseMove={(e) => moveDrag(e.clientX, e.clientY)}
          onMouseUp={endDrag}
          onMouseLeave={endDrag}
          onTouchStart={(e) => {
            lastTouchTimeRef.current = Date.now();
            if (e.touches.length === 1) {
              startDrag(e.touches[0].clientX, e.touches[0].clientY);
            }
          }}
          onTouchMove={(e) => {
            if (e.touches.length === 1) {
              e.preventDefault();
              moveDrag(e.touches[0].clientX, e.touches[0].clientY);
            }
          }}
          onTouchEnd={endDrag}
          className={`block touch-none max-h-[82dvh] sm:max-h-[74vh] max-w-[96vw] sm:max-w-md md:max-w-lg lg:max-w-xl w-auto h-auto object-contain select-none ${
            onPhotoAreaClick || onTextElementClick ? 'cursor-pointer' : 'cursor-crosshair'
          }`}
          style={{
            aspectRatio: `${dimensions.width} / ${dimensions.height}`,
          }}
        />
      </div>

      {/* Hidden DOM font preloader for Anek Indic Google Web Fonts */}
      <div
        aria-hidden="true"
        className="opacity-0 pointer-events-none absolute -top-96 left-0 select-none overflow-hidden h-0 w-0"
      >
        <span style={{ fontFamily: '"Anek Kannada"', fontWeight: 600 }}>ಅಬ್ದುಲ್ ಆರಿಸ್ ಕನ್ನಡ</span>
        <span style={{ fontFamily: '"Anek Malayalam"', fontWeight: 600 }}>അബ്ദുൾ ആരിസ് മലയാളം</span>
        <span style={{ fontFamily: '"Anek Telugu"', fontWeight: 600 }}>తెలుగు</span>
        <span style={{ fontFamily: '"Anek Tamil"', fontWeight: 600 }}>தமிழ்</span>
        <span style={{ fontFamily: '"Anek Devanagari"', fontWeight: 600 }}>हिन्दी</span>
        <span style={{ fontFamily: '"Poppins"', fontWeight: 600 }}>CampiFa</span>
      </div>
    </div>
  );
};
