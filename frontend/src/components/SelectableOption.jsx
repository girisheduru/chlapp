import { colors, fonts } from '../constants/designTokens';

export const SelectableOption = ({ selected, onClick, children, emoji, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: emoji ? 12 : 14,
      width: '100%',
      padding: '14px 16px',
      borderRadius: 10,
      border: `2px solid ${selected ? colors.primaryLight : colors.border}`,
      background: selected ? 'rgba(74, 124, 89, 0.08)' : colors.card,
      cursor: disabled ? 'not-allowed' : 'pointer',
      transition: 'all 0.2s ease',
      textAlign: 'left',
      opacity: disabled ? 0.5 : 1,
    }}
  >
    {emoji && <span style={{ fontSize: 18 }}>{emoji}</span>}
    <span style={{ fontFamily: fonts.body, fontSize: 14, color: colors.text, flex: 1 }}>{children}</span>
    {selected && (
      <span
        style={{
          width: 20,
          height: 20,
          borderRadius: '50%',
          background: colors.primaryLight,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: 11,
        }}
      >
        ✓
      </span>
    )}
  </button>
);
