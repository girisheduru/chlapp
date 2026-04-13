import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { colors, fonts } from '../constants/designTokens';
import { useAuth } from '../contexts/AuthContext';

/**
 * Full-page gate shown when Firebase is configured and user is not signed in.
 */
export function LoginGate() {
  const { signInWithGoogle, signInError, clearSignInError } = useAuth();
  const [signingIn, setSigningIn] = useState(false);

  const handleSignIn = () => {
    clearSignInError();
    setSigningIn(true);
    void signInWithGoogle().finally(() => {
      setSigningIn(false);
    });
  };

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
          <img
            src={`${import.meta.env.BASE_URL}flywheel-icon.svg`}
            alt=""
            width={48}
            height={48}
            style={{ display: 'block', margin: '0 auto 24px', objectFit: 'contain' }}
          />
          <h1
            style={{
              fontFamily: fonts.heading,
              fontSize: 24,
              fontWeight: 600,
              color: colors.text,
              margin: '0 0 8px 0',
            }}
          >
            Habit Flywheel
          </h1>
        </Link>
        <p
          style={{
            fontFamily: fonts.body,
            fontSize: 15,
            color: colors.textMuted,
            margin: '0 0 20px 0',
            lineHeight: 1.5,
          }}
        >
          Sign in to view your habits, add new ones, and check in.
        </p>
        <Link
          to="/about"
          style={{
            display: 'block',
            fontFamily: fonts.body,
            fontSize: 14,
            color: colors.primary,
            marginBottom: 28,
            textDecoration: 'none',
            fontWeight: 500,
          }}
        >
          Learn how it works →
        </Link>
        {signInError ? (
          <p
            role="alert"
            style={{
              color: '#b42318',
              fontSize: 14,
              margin: '0 0 16px 0',
              lineHeight: 1.45,
              textAlign: 'left',
            }}
          >
            {signInError}
          </p>
        ) : null}
        <button
          type="button"
          disabled={signingIn}
          onClick={handleSignIn}
          style={{
            width: '100%',
            padding: '14px 24px',
            borderRadius: 12,
            border: 'none',
            background: signingIn
              ? `linear-gradient(135deg, ${colors.primary}aa 0%, ${colors.primaryLight}aa 100%)`
              : `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryLight} 100%)`,
            color: colors.card,
            fontFamily: fonts.body,
            fontSize: 15,
            fontWeight: 600,
            cursor: signingIn ? 'wait' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
          }}
        >
          <span style={{ fontSize: 20 }}>G</span>
          {signingIn ? 'Opening Google…' : 'Sign in with Google'}
        </button>
      </div>
    </div>
  );
}

export default LoginGate;
