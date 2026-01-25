import { colors, fonts } from '../constants/designTokens';

export const InfoBox = ({ children, color = 'primary' }) => {
  const bgColors = {
    primary: 'linear-gradient(135deg, #F0F7F4 0%, #E8F5E9 100%)',
    amber: 'linear-gradient(135deg, #FFF9E6 0%, #FFF3CD 100%)',
    blue: 'linear-gradient(135deg, #EBF5FF 0%, #DBEAFE 100%)',
  };
  const borderColors = {
    primary: colors.primaryLight,
    amber: '#FFE69C',
    blue: '#93C5FD',
  };
  const textColors = {
    primary: colors.primary,
    amber: '#92400E',
    blue: '#1E40AF',
  };
  return (
    <div
      style={{
        background: bgColors[color],
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
        border: `1px solid ${borderColors[color]}`,
      }}
    >
      <p style={{ fontFamily: fonts.body, fontSize: 13, color: textColors[color], margin: 0, lineHeight: 1.5 }}>
        {children}
      </p>
    </div>
  );
};
