import { BoardFrame } from '../types/board';

export function exportBoardAsJson(boardName: string, frames: BoardFrame[]) {
  const data = JSON.stringify({ name: boardName, frames, exportedAt: new Date().toISOString() }, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  downloadBlob(blob, `${slugify(boardName)}-board.json`);
}

export function exportBoardAsSvg(boardName: string, frame: BoardFrame) {
  let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="1920" height="1080">\n`;
  svgContent += `  <rect width="1920" height="1080" fill="${frame.backgroundColor || '#faf7f2'}" />\n`;

  // Draw paths
  frame.elements.forEach((el) => {
    if (el.type === 'path') {
      const pts = el.points;
      if (pts.length >= 4) {
        let d = `M ${pts[0]} ${pts[1]}`;
        for (let i = 2; i < pts.length - 2; i += 2) {
          const xc = (pts[i] + pts[i + 2]) / 2;
          const yc = (pts[i + 1] + pts[i + 3]) / 2;
          d += ` Q ${pts[i]} ${pts[i + 1]}, ${xc} ${yc}`;
        }
        d += ` L ${pts[pts.length - 2]} ${pts[pts.length - 1]}`;
        svgContent += `  <path d="${d}" stroke="${el.strokeColor}" stroke-width="${el.strokeWidth}" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="${el.opacity || 1}" />\n`;
      }
    } else if (el.type === 'sticky') {
      svgContent += `  <g transform="translate(${el.x}, ${el.y}) rotate(${el.rotation || 0})">\n`;
      svgContent += `    <rect width="${el.width}" height="${el.height}" rx="16" fill="${el.color}" />\n`;
      svgContent += `    <text x="${el.width / 2}" y="${el.height / 2}" text-anchor="middle" dominant-baseline="middle" font-family="sans-serif" font-size="${el.fontSize || 16}" fill="#1c1917">${escapeXml(el.text)}</text>\n`;
      svgContent += `  </g>\n`;
    } else if (el.type === 'text') {
      svgContent += `  <text x="${el.x}" y="${el.y + 20}" font-family="sans-serif" font-size="${el.fontSize || 22}" fill="${el.color}">${escapeXml(el.text)}</text>\n`;
    }
  });

  svgContent += `</svg>`;
  const blob = new Blob([svgContent], { type: 'image/svg+xml' });
  downloadBlob(blob, `${slugify(boardName)}-frame.svg`);
}

export async function exportBoardAsPng(boardName: string, frame: BoardFrame) {
  // Offscreen canvas render
  const canvas = document.createElement('canvas');
  canvas.width = 1920;
  canvas.height = 1080;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Background
  ctx.fillStyle = frame.backgroundColor || '#faf7f2';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Render elements
  for (const el of frame.elements) {
    if (el.type === 'path') {
      const pts = el.points;
      if (pts.length >= 4) {
        ctx.save();
        ctx.beginPath();
        ctx.strokeStyle = el.strokeColor;
        ctx.lineWidth = el.strokeWidth;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.globalAlpha = el.opacity || 1;

        ctx.moveTo(pts[0], pts[1]);
        for (let i = 2; i < pts.length - 2; i += 2) {
          const xc = (pts[i] + pts[i + 2]) / 2;
          const yc = (pts[i + 1] + pts[i + 3]) / 2;
          ctx.quadraticCurveTo(pts[i], pts[i + 1], xc, yc);
        }
        ctx.lineTo(pts[pts.length - 2], pts[pts.length - 1]);
        ctx.stroke();
        ctx.restore();
      }
    } else if (el.type === 'sticky') {
      ctx.save();
      ctx.translate(el.x, el.y);
      ctx.rotate(((el.rotation || 0) * Math.PI) / 180);
      ctx.fillStyle = el.color;
      roundRect(ctx, 0, 0, el.width, el.height, 16);
      ctx.fill();

      ctx.fillStyle = '#1c1917';
      ctx.font = `600 ${el.fontSize || 16}px Quicksand, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      // Multi-line wrap
      const lines = el.text.split('\n');
      const lineHeight = (el.fontSize || 16) * 1.3;
      const startY = el.height / 2 - ((lines.length - 1) * lineHeight) / 2;
      lines.forEach((line, idx) => {
        ctx.fillText(line, el.width / 2, startY + idx * lineHeight);
      });
      ctx.restore();
    } else if (el.type === 'text') {
      ctx.save();
      ctx.fillStyle = el.color || '#1c1917';
      ctx.font = `bold ${el.fontSize || 22}px Quicksand, sans-serif`;
      ctx.fillText(el.text, el.x, el.y + 24);
      ctx.restore();
    } else if (el.type === 'image') {
      try {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = el.src;
        await new Promise((resolve) => {
          img.onload = resolve;
          img.onerror = resolve;
        });
        ctx.save();
        ctx.translate(el.x, el.y);
        ctx.rotate(((el.rotation || 0) * Math.PI) / 180);
        ctx.drawImage(img, 0, 0, el.width, el.height);
        ctx.restore();
      } catch {
        // Continue
      }
    }
  }

  canvas.toBlob((blob) => {
    if (blob) {
      downloadBlob(blob, `${slugify(boardName)}-frame.png`);
    }
  });
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9а-яё]/gi, '-').replace(/-+/g, '-');
}

function escapeXml(unsafe: string) {
  return unsafe.replace(/[<>&'"]/g, (c) => {
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
