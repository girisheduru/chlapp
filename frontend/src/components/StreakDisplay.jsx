import { colors, fonts } from '../constants/designTokens';

export const StreakDisplay = ({ streak, totalStones }) => {
  if (totalStones === 0) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginBottom: 20,
        padding: '12px 16px',
        background: `linear-gradient(135deg, ${colors.successLight} 0%, ${colors.successMedium} 100%)`,
        borderRadius: 12,
        border: '1px solid rgba(74, 124, 89, 0.2)',
      }}>
        <span style={{ fontSize: 20 }}>🌱</span>
        <span style={{ fontFamily: fonts.body, fontSize: 14, fontWeight: 500, color: colors.primary }}>
          Your first stone awaits!
        </span>
      </div>
    );
  }

  if (streak === 0 && totalStones > 0) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
        marginBottom: 20,
        padding: 16,
        background: `linear-gradient(135deg, ${colors.warning} 0%, #FFECB3 100%)`,
        borderRadius: 12,
        border: `1px solid ${colors.warningBorder}`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 18 }}>🌤️</span>
          <span style={{ fontFamily: fonts.body, fontSize: 14, fontWeight: 500, color: colors.warningText }}>
            Fresh start today
          </span>
        </div>
        <span style={{ fontFamily: fonts.body, fontSize: 12, color: colors.textLight }}>
          Your jar still has <strong>{totalStones} stones</strong>. Let's add another!
        </span>
      </div>
    );
  }

  if (streak >= 2) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginBottom: 20,
        padding: 12,
        background: 'linear-gradient(135deg, #FFF3E0 0%, #FFE0B2 100%)',
        borderRadius: 12,
      }}>
        <span style={{ fontSize: 20, animation: 'fireGlow 1s ease-in-out infinite' }}>🔥</span>
        <span style={{ fontFamily: fonts.mono, fontSize: 15, fontWeight: 600, color: colors.fire }}>
          {streak} day streak
        </span>
      </div>
    );
  }

  return null;
};
