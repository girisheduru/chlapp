import React from 'react';
import { useNavigate } from 'react-router-dom';
import { colors, fonts } from '../constants/designTokens';
import { MiniStoneJar } from './MiniStoneJar';
import { SummaryRow } from './SummaryRow';

/**
 * Habit tile for Home screen: identity, baseline, stats (stones, streak, done), Check in / Reflect, expandable plan.
 */
export function HabitTile({ habit, isExpanded, isHovered, onExpandToggle, onHover }) {
  const navigate = useNavigate();
  const isCheckedToday = habit.lastCheckIn?.done ?? false;

  const formatFunElements = () => {
    const els = habit.funElements ?? [];
    return els
      .map((f) => (typeof f === 'string' ? f.replace(/\bI\b/g, 'you').replace(/\bmy\b/gi, 'your') : f))
      .slice(0, 2)
      .join(', and ');
  };

  const handleCheckIn = () => {
    navigate('/checkin', { state: { fromHabitTile: true, habitId: habit.id, userId: habit.userId } });
  };

  const handleReflect = () => {
    navigate('/reflect', { state: { fromHabitTile: true, habitId: habit.id, userId: habit.userId, habit } });
  };

  return (
    <div
      onMouseEnter={() => onHover?.(habit.id)}
      onMouseLeave={() => onHover?.(null)}
      style={{
        background: colors.card,
        borderRadius: 20,
        overflow: 'hidden',
        boxShadow: isHovered
          ? '0 12px 40px rgba(92, 75, 58, 0.12)'
          : '0 4px 20px rgba(92, 75, 58, 0.06)',
        border: `1px solid ${colors.border}`,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      <div style={{ padding: 20 }}>
        <h3
          style={{
            fontFamily: fonts.heading,
            fontSize: 16,
            fontWeight: 600,
            color: colors.text,
            margin: '0 0 10px 0',
            lineHeight: 1.4,
          }}
        >
          "{habit.identity}"
        </h3>

        <p
          style={{
            fontFamily: fonts.body,
            fontSize: 13,
            color: colors.textMuted,
            margin: '0 0 14px 0',
            lineHeight: 1.4,
          }}
        >
          🎯 {habit.baselineHabit}
        </p>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '14px 16px',
            background: colors.background,
            borderRadius: 12,
            marginBottom: 14,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
            <MiniStoneJar stones={habit.totalStones} color={habit.color} />
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span
                style={{
                  fontFamily: fonts.mono,
                  fontSize: 22,
                  fontWeight: 600,
                  color: habit.color,
                  lineHeight: 1,
                }}
              >
                {habit.totalStones}
              </span>
              <span style={{ fontFamily: fonts.body, fontSize: 11, color: colors.textMuted, marginTop: 2 }}>stones</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, justifyContent: 'center' }}>
            <span style={{ fontSize: 20, lineHeight: 1 }}>🔥</span>
            <span
              style={{
                fontFamily: fonts.mono,
                fontSize: 13,
                color: habit.streakDays >= 7 ? colors.fire : colors.textMuted,
                fontWeight: habit.streakDays >= 7 ? 600 : 500,
                marginTop: 2,
              }}
            >
              {habit.streakDays} days
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, justifyContent: 'center' }}>
            {isCheckedToday ? (
              <>
                <div
                  style={{
                    background: colors.successLight,
                    borderRadius: 8,
                    padding: '6px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                    border: `1px solid ${colors.successMedium}`,
                  }}
                >
                  <span style={{ fontSize: 12, color: colors.success }}>✓</span>
                  <span style={{ fontFamily: fonts.body, fontSize: 12, color: colors.success, fontWeight: 600 }}>Done</span>
                </div>
                <span style={{ fontFamily: fonts.mono, fontSize: 11, color: colors.textLight, marginTop: 4 }}>
                  {habit.lastCheckIn?.time ?? ''}
                </span>
              </>
            ) : (
              <div style={{ height: 44 }} />
            )}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, marginBottom: 8 }}>
          <button
            type="button"
            onClick={handleCheckIn}
            style={{
              flex: 1,
              padding: '12px 16px',
              borderRadius: 10,
              border: 'none',
              background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryLight} 100%)`,
              color: colors.card,
              fontFamily: fonts.body,
              fontSize: 13,
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
            }}
          >
            <span>☀️</span>
            Check in
          </button>
          <button
            type="button"
            onClick={handleReflect}
            style={{
              padding: '12px 16px',
              borderRadius: 10,
              border: `2px solid ${colors.border}`,
              background: 'transparent',
              color: colors.textMuted,
              fontFamily: fonts.body,
              fontSize: 13,
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
            }}
          >
            <span>🔮</span>
            Reflect
          </button>
        </div>

        <button
          type="button"
          onClick={() => onExpandToggle?.(isExpanded ? null : habit.id)}
          style={{
            width: '100%',
            padding: 8,
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
          }}
        >
          <span style={{ fontFamily: fonts.body, fontSize: 12, color: colors.textLight }}>
            {isExpanded ? 'Hide plan' : 'View full plan'}
          </span>
          <span
            style={{
              fontSize: 10,
              color: colors.textLight,
              transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s ease',
            }}
          >
            ▼
          </span>
        </button>
      </div>

      {isExpanded && (
        <div
          style={{
            borderTop: `1px solid ${colors.border}`,
            padding: 20,
            background: colors.background,
          }}
        >
          <p
            style={{
              fontFamily: fonts.body,
              fontSize: 11,
              fontWeight: 600,
              color: colors.textMuted,
              textTransform: 'uppercase',
              letterSpacing: 0.5,
              margin: '0 0 14px 0',
            }}
          >
            Your Habit Plan
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <SummaryRow icon="🪪" label="Identity" value={`"${habit.identity}"`} bg="#E8F5E9" />
            <div style={{ height: 1, background: colors.border }} />
            <SummaryRow icon="🎯" label="Baseline habit" value={habit.baselineHabit} bg="#FFF3CD" />
            <div style={{ height: 1, background: colors.border }} />
            <SummaryRow icon="⚡" label="When energy allows" value={habit.capacityHabit} bg="#E3F2FD" />
            <div style={{ height: 1, background: colors.border }} />
            <SummaryRow icon="🔗" label="Cue" value={habit.anchor?.label ?? habit.anchor ?? '—'} bg="#FCE4EC" />
            <div style={{ height: 1, background: colors.border }} />
            <SummaryRow icon="🎵" label="Enjoyment" value={`With ${formatFunElements() || 'elements you enjoy'}`} bg="#FFF9E6" />
            <div style={{ height: 1, background: colors.border }} />
            <SummaryRow
              icon="👁️"
              label="Environment support"
              value={Array.isArray(habit.environmentSetup) ? habit.environmentSetup.join(', ') : habit.environmentSetup ?? '—'}
              bg="#F3E5F5"
            />
            <div style={{ height: 1, background: colors.border }} />
            <SummaryRow icon="⏰" label="Check-in time" value={habit.checkInTime ?? '—'} bg="#E0F7FA" />
          </div>
        </div>
      )}
    </div>
  );
}

export default HabitTile;
