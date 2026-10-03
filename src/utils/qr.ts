/**
 * Lightweight SVG QR Code matrix renderer
 * Generates an SVG path for QR-like 2D data representations without external dependencies
 */

export function generateQrSvg(data: string, size = 160): string {
  // Deterministic hash-based 21x21 matrix simulation with valid finder patterns
  const dimension = 21;
  const matrix: boolean[][] = Array(dimension)
    .fill(false)
    .map(() => Array(dimension).fill(false));

  // Helper to draw standard 7x7 finder pattern
  const setFinder = (startX: number, startY: number) => {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        if (
          r === 0 ||
          r === 6 ||
          c === 0 ||
          c === 6 ||
          (r >= 2 && r <= 4 && c >= 2 && c <= 4)
        ) {
          matrix[startY + r][startX + c] = true;
        }
      }
    }
  };

  // Top-left, Top-right, Bottom-left finder patterns
  setFinder(0, 0);
  setFinder(dimension - 7, 0);
  setFinder(0, dimension - 7);

  // Timing patterns
  for (let i = 8; i < dimension - 8; i++) {
    matrix[6][i] = i % 2 === 0;
    matrix[i][6] = i % 2 === 0;
  }

  // Generate pseudo-random deterministic payload based on string hash
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    hash = (hash << 5) - hash + data.charCodeAt(i);
    hash |= 0;
  }

  let seed = Math.abs(hash);
  const nextBit = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return (seed >> 16) % 2 === 1;
  };

  for (let r = 0; r < dimension; r++) {
    for (let c = 0; c < dimension; c++) {
      // Don't overwrite finders or timing lines
      const inTopLeft = r < 8 && c < 8;
      const inTopRight = r < 8 && c >= dimension - 8;
      const inBottomLeft = r >= dimension - 8 && c < 8;
      const onTiming = r === 6 || c === 6;

      if (!inTopLeft && !inTopRight && !inBottomLeft && !onTiming) {
        matrix[r][c] = nextBit();
      }
    }
  }

  // Convert to SVG rectangles
  const cellSize = size / dimension;
  const rects: string[] = [];

  for (let r = 0; r < dimension; r++) {
    for (let c = 0; c < dimension; c++) {
      if (matrix[r][c]) {
        rects.push(
          `<rect x="${(c * cellSize).toFixed(1)}" y="${(r * cellSize).toFixed(1)}" width="${cellSize.toFixed(1)}" height="${cellSize.toFixed(1)}" fill="currentColor" />`
        );
      }
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" class="w-full h-full text-slate-100">${rects.join('')}</svg>`;
}
