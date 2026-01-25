import { colors } from '../constants/designTokens';

export const StoneJar = ({ stones, showNewStone = false, size = 'normal' }) => {
  const jarHeight = size === 'large' ? 200 : 120;
  const jarWidth = size === 'large' ? 140 : 90;
  const stoneSize = size === 'large' ? 18 : 12;

  const stoneColors = [
    '#8B7355', '#A0826D', '#B8956C', '#C4A77D',
    '#7C9A82', '#6B8E7B', '#9CAF88', '#D4A574',
    '#E8C4A0', '#C9B896', '#A67B5B', '#8E7B6B'
  ];

  const displayStones = Math.min(stones, 35);
  const stonesPerRow = Math.floor(jarWidth / (stoneSize + 4));
  const stonePositions = [...Array(displayStones)].map((_, i) => {
    const row = Math.floor(i / stonesPerRow);
    const col = i % stonesPerRow;
    const xOffset = (col * (stoneSize + 3)) + (row % 2 === 1 ? stoneSize / 2 : 0) + 15;
    const yOffset = jarHeight - 30 - (row * (stoneSize - 2));
    return {
      x: xOffset + (Math.random() * 4 - 2),
      y: Math.max(35, yOffset + (Math.random() * 3 - 1.5)),
      color: stoneColors[i % stoneColors.length],
      rotation: Math.random() * 30 - 15,
    };
  });

  return (
    <div style={{ position: 'relative', width: jarWidth + 40, height: jarHeight + 20 }}>
      <svg width={jarWidth + 40} height={jarHeight + 20} style={{ position: 'absolute', top: 0, left: 0 }}>
        <path
          d={`M 10 30 Q 5 30 5 40 L 5 ${jarHeight} Q 5 ${jarHeight + 15} 20 ${jarHeight + 15} L ${jarWidth + 10} ${jarHeight + 15} Q ${jarWidth + 25} ${jarHeight + 15} ${jarWidth + 25} ${jarHeight} L ${jarWidth + 25} 40 Q ${jarWidth + 25} 30 ${jarWidth + 20} 30 Z`}
          fill="rgba(255, 255, 255, 0.3)"
          stroke="#C9B896"
          strokeWidth="2"
        />
        <rect x="8" y="20" width={jarWidth + 14} height="12" rx="3" fill="#E8E4DF" stroke="#C9B896" strokeWidth="1.5" />
      </svg>

      {stonePositions.map((pos, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: pos.x,
            top: pos.y,
            width: stoneSize,
            height: stoneSize * 0.75,
            background: `linear-gradient(135deg, ${pos.color} 0%, ${pos.color}dd 100%)`,
            borderRadius: '50%',
            transform: `rotate(${pos.rotation}deg)`,
            boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
          }}
        />
      ))}

      {showNewStone && (
        <div
          style={{
            position: 'absolute',
            left: jarWidth / 2,
            top: -20,
            width: stoneSize + 4,
            height: (stoneSize + 4) * 0.75,
            background: `linear-gradient(135deg, ${colors.primaryLight} 0%, ${colors.primary} 100%)`,
            borderRadius: '50%',
            boxShadow: '0 4px 12px rgba(74, 124, 89, 0.4)',
            animation: 'stoneDrop 0.8s ease-in forwards',
          }}
        />
      )}
    </div>
  );
};
