import React from 'react';
import { Link } from 'react-router-dom';
import { colors, fonts } from '../constants/designTokens';

/**
 * Minimal footer shown when user is authenticated. Includes About link.
 */
export function AppFooter() {
  return (
    <footer
      style={{
        padding: '20px 24px',
        marginTop: 'auto',
        borderTop: `1px solid ${colors.border}`,
        background: colors.background,
        fontFamily: fonts.body,
        fontSize: 13,
        color: colors.textMuted,
      }}
    >
      <div
        style={{
          maxWidth: 480,
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 16,
        }}
      >
        <Link
          to="/about"
          style={{
            color: colors.primary,
            textDecoration: 'none',
            fontWeight: 500,
          }}
        >
          About Habit Lab
        </Link>
      </div>
    </footer>
  );
}

export default AppFooter;
