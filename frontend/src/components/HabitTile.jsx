import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { colors, fonts } from '../constants/designTokens';
import { MiniStoneJar } from './MiniStoneJar';
import { SummaryRow } from './SummaryRow';
import { Button } from './Button';
import { habitsAPI } from '../services/api';

/**
 * Habit tile for Home screen: identity, baseline, stats (stones, streak, done), Check in / Reflect, expandable plan.
 */
export function HabitTile({ habit, isExpanded, isHovered, onExpandToggle, onHover, onDelete }) {
  const navigate = useNavigate();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const isCheckedToday = habit.lastCheckIn?.done ?? false;

  const formatFunElements = () => {
    const els = habit.funElements ?? [];
    return els
      .map((f) => (typeof f === 'string' ? f.replace(/\bI\b/g, 'you').replace(/\bmy\b/gi, 'your') : f))
      .slice(0, 2)
      .join(', and ');
  };

  const handleCheckIn = () => {
    navigate('/checkin', {
      state: {
        fromHabitTile: true,
        habitId: habit.id,
        userId: habit.userId,
        identity: habit.identity,
      },
    });
  };

  const handleReflect = () => {
    navigate('/reflect', { state: { fromHabitTile: true, habitId: habit.id, userId: habit.userId, habit } });
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    setDeleteError(null);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    setDeleting(true);
    setDeleteError(null);
    try {
      await habitsAPI.delete(habit.id);
      setShowDeleteConfirm(false);
      onDelete?.(habit.id);
    } catch (err) {
      setDeleteError(err?.message || 'Could not delete habit. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
    setDeleteError(null);
  };

  const deleteConfirmModal = showDeleteConfirm && (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-habit-title"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        background: 'rgba(61, 50, 41, 0.5)',
        boxSizing: 'border-box',
      }}
      onClick={handleDeleteCancel}
    >
      <div
        style={{
          background: colors.card,
          borderRadius: 20,
          padding: 28,
          maxWidth: 360,
          width: '100%',
          boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
          border: `1px solid ${colors.border}`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3
          id="delete-habit-title"
          style={{
            fontFamily: fonts.heading,
            fontSize: 18,
            fontWeight: 600,
            color: colors.text,
            margin: '0 0 12px 0',
            lineHeight: 1.4,
          }}
        >
          Remove this habit?
        </h3>
        <p
          style={{
            fontFamily: fonts.body,
            fontSize: 14,
            color: colors.textMuted,
            margin: '0 0 24px 0',
            lineHeight: 1.5,
          }}
        >
          Your streak and reflection history for this habit will be deleted. This can't be undone.
        </p>
        {deleteError && (
          <p
            style={{
              fontFamily: fonts.body,
              fontSize: 13,
              color: '#c62828',
              margin: '0 0 16px 0',
            }}
          >
            {deleteError}
          </p>
        )}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <Button variant="secondary" onClick={handleDeleteCancel} disabled={deleting}>
            Cancel
          </Button>
          <button
            type="button"
            onClick={handleDeleteConfirm}
            disabled={deleting}
            style={{
              padding: '12px 24px',
              borderRadius: 12,
              border: 'none',
              fontFamily: fonts.body,
              fontSize: 14,
              fontWeight: 600,
              cursor: deleting ? 'not-allowed' : 'pointer',
              background: '#c62828',
              color: '#fff',
              opacity: deleting ? 0.7 : 1,
            }}
          >
            {deleting ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );

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
        <div style={{ marginBottom: 10 }}>
          <h3
            style={{
              fontFamily: fonts.heading,
              fontSize: 16,
              fontWeight: 600,
              color: colors.text,
              margin: 0,
              lineHeight: 1.4,
              minWidth: 0,
            }}
          >
            "{habit.identity}"
          </h3>
        </div>

        {typeof document !== 'undefined' && createPortal(deleteConfirmModal, document.body)}

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

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
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
          {onDelete && (
            <button
              type="button"
              onClick={handleDeleteClick}
              title="Delete habit"
              style={{
                flexShrink: 0,
                width: 40,
                height: 40,
                padding: 0,
                border: `2px solid ${colors.border}`,
                borderRadius: 10,
                background: 'transparent',
                color: colors.textMuted,
                fontSize: 16,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease',
              }}
            >
              🗑
            </button>
          )}
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
