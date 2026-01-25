import { colors, fonts } from '../constants/designTokens';

export const SelectChip = ({ selected, onClick, emoji, label, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      padding: '10px 14px',
      borderRadius: 20,
      border: `2px solid ${selected ? colors.primaryLight : colors.border}`,
      background: selected ? 'rgba(74, 124, 89, 0.1)' : colors.card,
      cursor: disabled ? 'not-allowed' : 'pointer',
      transition: 'all 0.2s ease',
      opacity: disabled && !selected ? 0.5 : 1,
    }}
  >
    <span style={{ fontSize: 14 }}>{emoji}</span>
    <span style={{
      fontFamily: fonts.body,
      fontSize: 13,
      color: selected ? colors.primary : colors.textMuted,
      fontWeight: selected ? 500 : 400,
    }}>
      {label}
    </span>
  </button>
);
