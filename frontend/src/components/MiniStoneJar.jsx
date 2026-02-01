import React, { useMemo } from 'react';
import { colors } from '../constants/designTokens';

/**
 * Mini stone jar for habit tiles - shows jar SVG with stone dots.
 */
export function MiniStoneJar({ stones = 0, color = colors.primaryLight }) {
  const stonePositions = useMemo(() => {
    const positions = [];
    const displayStones = Math.min(stones, 12);
    for (let i = 0; i < displayStones; i++) {
      const row = Math.floor(i / 4);
      const col = i % 4;
      positions.push({
        left: 4 + col * 10 + (row % 2 ? 5 : 0),
        bottom: 4 + row * 8,
        size: 6 + (i % 3),
      });
    }
    return positions;
  }, [stones]);

  return (
    <div style={{ width: 44, height: 48, position: 'relative' }}>
      <svg width="44" height="48" viewBox="0 0 48 52" fill="none">
        <path
          d="M8 18C6 18 4 20 4 24V44C4 48 8 50 12 50H36C40 50 44 48 44 44V24C44 20 42 18 40 18"
          stroke={colors.border}
          strokeWidth="2"
          fill="rgba(255,255,255,0.5)"
        />
        <rect x="12" y="8" width="24" height="10" rx="2" stroke={colors.border} strokeWidth="2" fill="rgba(255,255,255,0.5)" />
        <rect x="10" y="4" width="28" height="6" rx="3" fill={colors.borderLight} />
      </svg>
      <div
        style={{
          position: 'absolute',
          bottom: 6,
          left: 6,
          right: 6,
          top: 18,
          overflow: 'hidden',
        }}
      >
        {stonePositions.map((pos, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: pos.left,
              bottom: pos.bottom,
              width: pos.size,
              height: pos.size,
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${color} 0%, ${colors.primaryLight} 100%)`,
              opacity: 0.8 + (i % 3) * 0.07,
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default MiniStoneJar;
