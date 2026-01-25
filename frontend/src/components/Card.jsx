import { colors } from '../constants/designTokens';

export const Card = ({ children, style = {}, glow = false }) => (
  <div style={{
    background: colors.card,
    borderRadius: 24,
    padding: 32,
    boxShadow: glow
      ? `0 8px 32px rgba(74, 124, 89, 0.15), 0 0 0 2px rgba(74, 124, 89, 0.1)`
      : '0 8px 32px rgba(92, 75, 58, 0.08)',
    border: `1px solid ${glow ? colors.primaryLight : colors.borderLight}`,
    position: 'relative',
    overflow: 'hidden',
    ...style,
  }}>
    {children}
  </div>
);
