import { colors, fonts } from '../constants/designTokens';

export const TodaysStone = ({ collected }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
    <div style={{
      width: 48,
      height: 36,
      background: collected
        ? `linear-gradient(135deg, ${colors.border} 0%, ${colors.borderLight} 100%)`
        : `linear-gradient(135deg, ${colors.primaryLight} 0%, ${colors.primary} 100%)`,
      borderRadius: '50%',
      boxShadow: collected ? 'none' : '0 4px 16px rgba(74, 124, 89, 0.4), 0 0 20px rgba(74, 124, 89, 0.2)',
      animation: collected ? 'none' : 'stoneGlow 2s ease-in-out infinite',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      {collected && <span style={{ color: colors.textLight, fontSize: 16 }}>✓</span>}
    </div>
    <span style={{
      fontFamily: fonts.body,
      fontSize: 11,
      color: collected ? colors.textLight : colors.primary,
      fontWeight: 500,
    }}>
      {collected ? 'Collected!' : "Today's stone"}
    </span>
  </div>
);
