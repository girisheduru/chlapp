import React from 'react';
import { fonts } from '../constants/designTokens';

/**
 * Row with icon, label, and value for habit plan summary.
 */
export function SummaryRow({ icon, label, value, bg }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          background: bg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 14,
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            fontFamily: fonts.body,
            fontSize: 10,
            color: '#8B7355',
            margin: '0 0 2px 0',
            textTransform: 'uppercase',
            letterSpacing: 0.5,
          }}
        >
          {label}
        </p>
        <p
          style={{
            fontFamily: fonts.body,
            fontSize: 13,
            fontWeight: 500,
            color: '#3D3229',
            margin: 0,
            lineHeight: 1.4,
          }}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

export default SummaryRow;
