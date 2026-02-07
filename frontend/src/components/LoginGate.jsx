import React from 'react';
import { Link } from 'react-router-dom';
import { colors, fonts } from '../constants/designTokens';

/**
 * Full-page gate shown when Firebase is configured and user is not signed in.
 * Users must sign in before they can access Home, Onboarding, or Daily Check-In.
 */
export function LoginGate({ onSignIn }) {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: `linear-gradient(180deg, ${colors.background} 0%, ${colors.backgroundDark} 100%)`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        fontFamily: fonts.body,
      }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Fraunces:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />
      <div
        style={{
          maxWidth: 360,
          textAlign: 'center',
          background: colors.card,
          borderRadius: 24,
          padding: 40,
          boxShadow: '0 8px 32px rgba(92, 75, 58, 0.12)',
          border: `1px solid ${colors.border}`,
        }}
      >
        <Link
          to="/"
          style={{
            display: 'inline-block',
            textDecoration: 'none',
            color: 'inherit',
            cursor: 'pointer',
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 16,
              background: `linear-gradient(135deg, ${colors.primaryLight} 0%, ${colors.primary} 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 32,
              margin: '0 auto 24px',
            }}
          >
            🌱
          </div>
          <h1
            style={{
              fontFamily: fonts.heading,
              fontSize: 24,
              fontWeight: 600,
              color: colors.text,
              margin: '0 0 8px 0',
            }}
          >
            Atomic
          </h1>
        </Link>
        <p
          style={{
            fontFamily: fonts.body,
            fontSize: 15,
            color: colors.textMuted,
            margin: '0 0 28px 0',
            lineHeight: 1.5,
          }}
        >
          Sign in to view your habits, add new ones, and check in.
        </p>
        <button
          type="button"
          onClick={onSignIn}
          style={{
            width: '100%',
            padding: '14px 24px',
            borderRadius: 12,
            border: 'none',
            background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryLight} 100%)`,
            color: colors.card,
            fontFamily: fonts.body,
            fontSize: 15,
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
          }}
        >
          <span style={{ fontSize: 20 }}>G</span>
          Sign in with Google
        </button>
      </div>
    </div>
  );
}

export default LoginGate;
