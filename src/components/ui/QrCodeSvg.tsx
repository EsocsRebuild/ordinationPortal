'use client';

import React from 'react';

interface QrCodeSvgProps {
  value: string;
  size?: number;
  className?: string;
}

export function QrCodeSvg({ value, size = 160, className = '' }: QrCodeSvgProps) {
  // Deterministic SVG QR generation pattern based on input hash
  const gridSize = 21;
  const cellSize = size / gridSize;

  // Generate deterministic binary matrix
  const matrix: boolean[][] = Array(gridSize)
    .fill(false)
    .map(() => Array(gridSize).fill(false));

  // 1. Finder patterns (top-left, top-right, bottom-left)
  const placeFinder = (startX: number, startY: number) => {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        if (
          r === 0 || r === 6 || c === 0 || c === 6 ||
          (r >= 2 && r <= 4 && c >= 2 && c <= 4)
        ) {
          matrix[startY + r][startX + c] = true;
        }
      }
    }
  };

  placeFinder(0, 0);
  placeFinder(gridSize - 7, 0);
  placeFinder(0, gridSize - 7);

  // 2. Timing patterns
  for (let i = 8; i < gridSize - 8; i++) {
    if (i % 2 === 0) {
      matrix[6][i] = true;
      matrix[i][6] = true;
    }
  }

  // 3. Data encoding pattern filled with deterministic value hash
  let seed = 0;
  for (let i = 0; i < value.length; i++) {
    seed = (seed * 31 + value.charCodeAt(i)) & 0xffffffff;
  }

  const lcg = () => {
    seed = (seed * 1664525 + 1013904223) & 0xffffffff;
    return (seed >>> 0) / 4294967296;
  };

  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      // Don't overwrite finders
      const inTL = r < 8 && c < 8;
      const inTR = r < 8 && c >= gridSize - 8;
      const inBL = r >= gridSize - 8 && c < 8;
      const inCenter = r >= 9 && r <= 11 && c >= 9 && c <= 11;

      if (!inTL && !inTR && !inBL && !inCenter) {
        matrix[r][c] = lcg() > 0.45;
      }
    }
  }

  return (
    <div className={`inline-flex items-center justify-center p-2 bg-white rounded-lg border border-slate-200 shadow-sm ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="shape-rendering-crisp"
      >
        <rect width={size} height={size} fill="#ffffff" />
        {matrix.map((row, r) =>
          row.map((filled, c) =>
            filled ? (
              <rect
                key={`${r}-${c}`}
                x={c * cellSize}
                y={r * cellSize}
                width={cellSize}
                height={cellSize}
                fill="#0F172A"
              />
            ) : null
          )
        )}
        {/* Center Holy Cross Crest */}
        <rect
          x={9 * cellSize - 1}
          y={9 * cellSize - 1}
          width={3 * cellSize + 2}
          height={3 * cellSize + 2}
          fill="#0B132B"
          rx={3}
        />
        {/* Gold Cross */}
        <rect
          x={10 * cellSize + cellSize * 0.35}
          y={9.3 * cellSize}
          width={cellSize * 0.3}
          height={cellSize * 2.4}
          fill="#F59E0B"
        />
        <rect
          x={9.4 * cellSize}
          y={10 * cellSize}
          width={cellSize * 2.2}
          height={cellSize * 0.3}
          fill="#F59E0B"
        />
      </svg>
    </div>
  );
}

