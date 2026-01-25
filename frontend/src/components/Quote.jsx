import { colors, fonts } from '../constants/designTokens';

export const Quote = ({ children, author }) => (
  <div
    style={{
      background: colors.backgroundDark,
      borderRadius: 12,
      padding: 20,
      marginTop: 24,
      borderLeft: `4px solid ${colors.primaryLight}`,
    }}
  >
    <p style={{ fontFamily: fonts.heading, fontStyle: 'italic', fontSize: 14, color: colors.textMuted, margin: 0, lineHeight: 1.6 }}>
      "{children}"
    </p>
    {author && (
      <p style={{ fontFamily: fonts.body, fontSize: 11, color: colors.textLight, margin: '10px 0 0 0' }}>
        — {author}
      </p>
    )}
  </div>
);
