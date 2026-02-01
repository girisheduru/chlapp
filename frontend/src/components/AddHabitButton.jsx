import React from 'react';
import { useNavigate } from 'react-router-dom';
import { colors, fonts } from '../constants/designTokens';

/**
 * "Add a new habit" card for Home screen - navigates to onboarding.
 */
export function AddHabitButton() {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      onClick={() => navigate('/onboarding')}
      style={{
        width: '100%',
        padding: 24,
        borderRadius: 20,
        border: `2px dashed ${colors.borderLight}`,
        background: 'transparent',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
      }}
    >
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: '50%',
          background: colors.background,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 24,
          color: colors.primaryLight,
        }}
      >
        +
      </div>
      <span style={{ fontFamily: fonts.body, fontSize: 14, fontWeight: 500, color: colors.textMuted }}>
        Add a new habit
      </span>
      <span style={{ fontFamily: fonts.body, fontSize: 12, color: colors.textLight }}>
        Start small, build identity
      </span>
    </button>
  );
}

export default AddHabitButton;
