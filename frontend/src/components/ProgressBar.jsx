import { colors, fonts } from '../constants/designTokens';

export const ProgressBar = ({ currentStep, totalSteps }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 32 }}>
    {[...Array(totalSteps)].map((_, i) => (
      <div
        key={i}
        style={{
          height: 4,
          flex: 1,
          borderRadius: 2,
          background: i + 1 <= currentStep ? colors.primaryLight : colors.border,
          transition: 'all 0.4s ease',
        }}
      />
    ))}
    <span style={{ fontFamily: fonts.mono, fontSize: 12, color: colors.textLight, marginLeft: 8 }}>
      {currentStep}/{totalSteps}
    </span>
  </div>
);
