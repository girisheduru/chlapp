import { colors, fonts } from '../constants/designTokens';

export const Button = ({ children, variant = 'primary', onClick, disabled, style = {}, size = 'normal' }) => {
  const baseStyle = {
    padding: size === 'large' ? '20px 40px' : size === 'small' ? '12px 20px' : '16px 32px',
    borderRadius: 12,
    fontSize: size === 'large' ? 18 : size === 'small' ? 14 : 16,
    fontFamily: fonts.body,
    fontWeight: variant === 'primary' || variant === 'success' || variant === 'celebration' ? 600 : 500,
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    border: 'none',
    opacity: disabled ? 0.5 : 1,
  };

  const variants = {
    primary: {
      background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryLight} 100%)`,
      color: colors.card,
      boxShadow: '0 4px 14px rgba(45, 90, 69, 0.25)',
    },
    secondary: {
      background: 'transparent',
      color: colors.textMuted,
      border: `2px solid ${colors.borderLight}`,
    },
    celebration: {
      background: `linear-gradient(135deg, ${colors.celebration} 0%, #FFCC33 100%)`,
      color: '#5C4B14',
      boxShadow: '0 4px 14px rgba(255, 179, 71, 0.35)',
    },
    ghost: {
      background: 'transparent',
      color: colors.textLight,
      padding: '12px 24px',
    },
    success: {
      background: `linear-gradient(135deg, ${colors.success} 0%, #3D6B4F 100%)`,
      color: colors.card,
      boxShadow: '0 4px 14px rgba(74, 124, 89, 0.25)',
    },
  };

  return (
    <button onClick={onClick} disabled={disabled} style={{ ...baseStyle, ...variants[variant], ...style }}>
      {children}
    </button>
  );
};
