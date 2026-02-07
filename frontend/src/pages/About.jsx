import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { colors, fonts } from '../constants/designTokens';
import { useAuth } from '../contexts/AuthContext';

const sectionCardStyle = {
  background: colors.card,
  borderRadius: 20,
  padding: 24,
  marginBottom: 20,
  boxShadow: '0 8px 32px rgba(92, 75, 58, 0.08)',
  border: `1px solid ${colors.border}`,
};

const infographicRowStyle = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: 12,
  marginBottom: 16,
};

const iconCircleStyle = (bg) => ({
  width: 44,
  height: 44,
  borderRadius: 12,
  background: bg || `linear-gradient(135deg, ${colors.successLight} 0%, ${colors.successMedium} 100%)`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 22,
  flexShrink: 0,
});

/**
 * About page: ideology and design behind Clear Habit Lab. Inspired by James Clear's public work (speeches, blogs, podcasts).
 */
export default function About() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const backTo = user ? '/' : '/';
  const backLabel = user ? 'Home' : 'Back to sign in';
  const ctaLabel = user ? 'Go to Home' : 'Sign in to get started';
  const ctaAction = user ? () => navigate('/', { replace: true }) : null;

  return (
    <div
      style={{
        minHeight: '100vh',
        background: `linear-gradient(180deg, ${colors.background} 0%, ${colors.backgroundDark} 100%)`,
        fontFamily: fonts.body,
        padding: '24px 20px 32px',
        maxWidth: 480,
        margin: '0 auto',
      }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Fraunces:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />

      <Link
        to={backTo}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          color: colors.primary,
          fontSize: 14,
          fontWeight: 500,
          textDecoration: 'none',
          marginBottom: 24,
        }}
      >
        ← {backLabel}
      </Link>

      {/* Hero */}
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: 20,
            background: `linear-gradient(135deg, ${colors.primaryLight} 0%, ${colors.primary} 100%)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 36,
            margin: '0 auto 20px',
          }}
        >
          🌱
        </div>
        <h1
          style={{
            fontFamily: fonts.heading,
            fontSize: 28,
            fontWeight: 600,
            color: colors.text,
            margin: '0 0 10px 0',
          }}
        >
          Clear Habit Lab
        </h1>
        <p
          style={{
            fontFamily: fonts.body,
            fontSize: 16,
            color: colors.textMuted,
            margin: '0 0 12px 0',
            lineHeight: 1.5,
          }}
        >
          Design, build, and track habits using the science of small steps. This side project was inspired by ideas shared in James Clear’s speeches, blogs, and podcasts — not built for monetary purpose.
        </p>
        <p
          style={{
            fontFamily: fonts.heading,
            fontSize: 14,
            fontStyle: 'italic',
            color: colors.textLight,
            margin: 0,
            lineHeight: 1.5,
          }}
        >
          "Every action you take is a vote for the type of person you wish to become."
        </p>
        <p style={{ fontFamily: fonts.body, fontSize: 12, color: colors.textLight, margin: '4px 0 0 0' }}>
          — James Clear
        </p>
      </div>

      {/* Framework: Inspiration */}
      <div style={sectionCardStyle}>
        <h2
          style={{
            fontFamily: fonts.heading,
            fontSize: 18,
            fontWeight: 600,
            color: colors.primary,
            margin: '0 0 16px 0',
          }}
        >
          📖 Inspired by his work
        </h2>
        <p style={{ fontFamily: fonts.body, fontSize: 14, color: colors.textMuted, margin: '0 0 16px 0', lineHeight: 1.5 }}>
          Clear Habit Lab draws on ideas from James Clear’s speeches, blogs, and podcasts. We help you apply identity-based habits, tiny steps, cues, and reflection — so small changes add up to lasting results. This is a personal side project, not for commercial use.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ ...iconCircleStyle(colors.successLight), margin: '0 auto' }}>🧭</span>
          <span style={{ fontSize: 13, color: colors.textMuted }}>Identity</span>
          <span style={{ color: colors.border }}>→</span>
          <span style={{ ...iconCircleStyle(colors.accent), margin: 0 }}>⚡</span>
          <span style={{ fontSize: 13, color: colors.textMuted }}>Small habits</span>
          <span style={{ color: colors.border }}>→</span>
          <span style={{ ...iconCircleStyle(colors.baseline), margin: 0 }}>🔗</span>
          <span style={{ fontSize: 13, color: colors.textMuted }}>Cues</span>
          <span style={{ color: colors.border }}>→</span>
          <span style={{ ...iconCircleStyle(colors.expanded), margin: 0 }}>💡</span>
          <span style={{ fontSize: 13, color: colors.textMuted }}>Reflection</span>
        </div>
      </div>

      {/* Design: Onboarding */}
      <div style={sectionCardStyle}>
        <h2
          style={{
            fontFamily: fonts.heading,
            fontSize: 18,
            fontWeight: 600,
            color: colors.text,
            margin: '0 0 12px 0',
          }}
        >
          ✏️ Design your habit
        </h2>
        <p style={{ fontFamily: fonts.body, fontSize: 14, color: colors.textMuted, margin: '0 0 16px 0', lineHeight: 1.5 }}>
          In onboarding, you define who you want to become and how the habit shows up — from a tiny nucleus to a full supernova.
        </p>
        <div style={infographicRowStyle}>
          <div style={iconCircleStyle(colors.successLight)}>🎯</div>
          <div>
            <strong style={{ fontSize: 14, color: colors.text }}>Identity</strong>
            <p style={{ fontFamily: fonts.body, fontSize: 13, color: colors.textMuted, margin: '2px 0 0 0', lineHeight: 1.4 }}>"I am someone who…" — your habit is a vote for that person.</p>
          </div>
        </div>
        <div style={infographicRowStyle}>
          <div style={iconCircleStyle(colors.accent)}>⚛️</div>
          <div>
            <strong style={{ fontSize: 14, color: colors.text }}>Nucleus habit</strong>
            <p style={{ fontFamily: fonts.body, fontSize: 13, color: colors.textMuted, margin: '2px 0 0 0', lineHeight: 1.4 }}>A tiny "show up" step you can do every day — start small.</p>
          </div>
        </div>
        <div style={infographicRowStyle}>
          <div style={iconCircleStyle(colors.baseline)}>🌟</div>
          <div>
            <strong style={{ fontSize: 14, color: colors.text }}>Supernova habit</strong>
            <p style={{ fontFamily: fonts.body, fontSize: 13, color: colors.textMuted, margin: '2px 0 0 0', lineHeight: 1.4 }}>When you have more energy, the full expression of the habit.</p>
          </div>
        </div>
        <div style={infographicRowStyle}>
          <div style={iconCircleStyle(colors.border)}>🔗</div>
          <div>
            <strong style={{ fontSize: 14, color: colors.text }}>Anchor & environment</strong>
            <p style={{ fontFamily: fonts.body, fontSize: 13, color: colors.textMuted, margin: '2px 0 0 0', lineHeight: 1.4 }}>Cues and setup so the habit is obvious and easy to start.</p>
          </div>
        </div>
      </div>

      {/* Build: Check-in */}
      <div style={sectionCardStyle}>
        <h2
          style={{
            fontFamily: fonts.heading,
            fontSize: 18,
            fontWeight: 600,
            color: colors.text,
            margin: '0 0 12px 0',
          }}
        >
          🪨 Build the habit daily
        </h2>
        <p style={{ fontFamily: fonts.body, fontSize: 14, color: colors.textMuted, margin: '0 0 16px 0', lineHeight: 1.5 }}>
          Check in each day: add a stone to your jar, keep your streak, and celebrate showing up — even for two minutes.
        </p>
        <div style={infographicRowStyle}>
          <div style={iconCircleStyle(colors.accent)}>🫙</div>
          <div>
            <strong style={{ fontSize: 14, color: colors.text }}>Stone jar</strong>
            <p style={{ fontFamily: fonts.body, fontSize: 13, color: colors.textMuted, margin: '2px 0 0 0', lineHeight: 1.4 }}>Each check-in adds a stone; the jar grows with your consistency.</p>
          </div>
        </div>
        <div style={infographicRowStyle}>
          <div style={iconCircleStyle(colors.primaryLight)}>🔥</div>
          <div>
            <strong style={{ fontSize: 14, color: colors.text }}>Streaks</strong>
            <p style={{ fontFamily: fonts.body, fontSize: 13, color: colors.textMuted, margin: '2px 0 0 0', lineHeight: 1.4 }}>Track consecutive days to stay motivated and see progress.</p>
          </div>
        </div>
      </div>

      {/* Track: Reflection */}
      <div style={sectionCardStyle}>
        <h2
          style={{
            fontFamily: fonts.heading,
            fontSize: 18,
            fontWeight: 600,
            color: colors.text,
            margin: '0 0 12px 0',
          }}
        >
          💡 Track and reflect
        </h2>
        <p style={{ fontFamily: fonts.body, fontSize: 14, color: colors.textMuted, margin: '0 0 16px 0', lineHeight: 1.5 }}>
          Weekly reflection brings insights and small experiments — tweak your cue, environment, or enjoyment so the habit sticks.
        </p>
        <div style={infographicRowStyle}>
          <div style={iconCircleStyle(colors.expanded)}>🧪</div>
          <div>
            <strong style={{ fontSize: 14, color: colors.text }}>Experiments</strong>
            <p style={{ fontFamily: fonts.body, fontSize: 13, color: colors.textMuted, margin: '2px 0 0 0', lineHeight: 1.4 }}>Try one small change (anchor, environment, or fun) and see what works.</p>
          </div>
        </div>
      </div>

      {/* Closing */}
      <div style={{ textAlign: 'center', marginTop: 28, marginBottom: 24 }}>
        <p
          style={{
            fontFamily: fonts.heading,
            fontSize: 15,
            fontWeight: 500,
            color: colors.text,
            margin: '0 0 20px 0',
            lineHeight: 1.5,
          }}
        >
          Small steps, lasting change.
        </p>
        {ctaAction ? (
          <button
            type="button"
            onClick={ctaAction}
            style={{
              padding: '14px 28px',
              borderRadius: 12,
              border: 'none',
              background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryLight} 100%)`,
              color: colors.card,
              fontFamily: fonts.body,
              fontSize: 15,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {ctaLabel}
          </button>
        ) : (
          <Link
            to="/"
            style={{
              display: 'inline-block',
              padding: '14px 28px',
              borderRadius: 12,
              background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryLight} 100%)`,
              color: colors.card,
              fontFamily: fonts.body,
              fontSize: 15,
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            {ctaLabel}
          </Link>
        )}
      </div>
    </div>
  );
}
