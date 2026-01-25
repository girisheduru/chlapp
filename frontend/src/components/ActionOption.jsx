import { colors, fonts } from '../constants/designTokens';

export const ActionOption = ({ selected, onClick, emoji, title, subtitle, variant = 'default' }) => {
  const isNotToday = variant === 'nottoday';
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        width: '100%',
        padding: '16px 18px',
        borderRadius: 14,
        border: `2px solid ${selected ? colors.primaryLight : colors.border}`,
        background: selected
          ? isNotToday ? '#FFF8E1' : 'rgba(74, 124, 89, 0.08)'
          : colors.card,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        textAlign: 'left',
      }}
    >
      <span style={{ fontSize: 22 }}>{emoji}</span>
      <div style={{ flex: 1 }}>
        <p style={{
          fontFamily: fonts.body,
          fontSize: 15,
          fontWeight: 500,
          color: colors.text,
          margin: 0,
        }}>
          {title}
        </p>
        {subtitle && (
          <p style={{
            fontFamily: fonts.body,
            fontSize: 13,
            color: colors.textLight,
            margin: '4px 0 0 0',
          }}>
            {subtitle}
          </p>
        )}
      </div>
      {selected && (
        <span style={{
          width: 24,
          height: 24,
          borderRadius: '50%',
          background: isNotToday ? '#FFB347' : colors.primaryLight,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: 12,
          flexShrink: 0,
        }}>
          ✓
        </span>
      )}
    </button>
  );
};
