import React from 'react';
import { colors } from '../constants/designTokens';

/**
 * Tiny header jar icon (matches tile MiniStoneJar style).
 */
export function HeaderJarIcon() {
  return (
    <svg width="20" height="22" viewBox="0 0 48 52" fill="none">
      <path
        d="M8 18C6 18 4 20 4 24V44C4 48 8 50 12 50H36C40 50 44 48 44 44V24C44 20 42 18 40 18"
        stroke={colors.primaryLight}
        strokeWidth="3"
        fill="rgba(74, 124, 89, 0.1)"
      />
      <rect x="12" y="8" width="24" height="10" rx="2" stroke={colors.primaryLight} strokeWidth="3" fill="rgba(74, 124, 89, 0.1)" />
      <rect x="10" y="4" width="28" height="6" rx="3" fill={colors.primaryLight} opacity="0.4" />
      <circle cx="18" cy="40" r="4" fill={colors.primaryLight} opacity="0.7" />
      <circle cx="30" cy="42" r="3.5" fill={colors.primary} opacity="0.8" />
      <circle cx="24" cy="36" r="4" fill={colors.primaryLight} opacity="0.6" />
      <circle cx="20" cy="32" r="3" fill={colors.primary} opacity="0.7" />
      <circle cx="28" cy="34" r="3.5" fill={colors.primaryLight} opacity="0.8" />
    </svg>
  );
}

export default HeaderJarIcon;
