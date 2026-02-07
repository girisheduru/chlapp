import React, { useState, useMemo } from 'react';

// Weekly Reflection Flow - V4 Mockups (Fixed)
// Fixed: Removed Math.random() from render - now uses useMemo for stable positions

const WeeklyReflectionMockupsV4 = () => {
  const [currentScreen, setCurrentScreen] = useState(1);
  const [identityReflection, setIdentityReflection] = useState('');
  const [alignmentValue, setAlignmentValue] = useState(50);
  const [reflectionQ1, setReflectionQ1] = useState('');
  const [reflectionQ2, setReflectionQ2] = useState('');
  const [selectedExperiment, setSelectedExperiment] = useState(null);
  const [experimentTexts, setExperimentTexts] = useState({});

  // User data (from onboarding)
  const userData = {
    identity: "I am someone who takes care of my body",
    baselineHabit: "Do one supportive action (stretch, hydrate, rest)",
    expandedHabit: "45-minute gym session",
    anchor: { emoji: '💼', label: 'After work' },
    environmentSetup: ['Gym bag packed', 'Clothes laid out'],
    funElements: ['My hype gym playlist', 'Movement that feels right'],
    totalStones: 27,
  };

  // Week's check-in data
  const weekData = {
    weekRange: "Dec 15 – 21",
    days: [
      { day: 'Mon', type: 'baseline', obstacle: null, helpers: ['cue', 'music'] },
      { day: 'Tue', type: 'baseline', obstacle: null, helpers: ['environment', 'music'] },
      { day: 'Wed', type: 'expanded', obstacle: null, helpers: ['music', 'flow'] },
      { day: 'Thu', type: 'skip', obstacle: 'energy', helpers: [] },
      { day: 'Fri', type: 'baseline', obstacle: 'energy', helpers: ['cue'] },
      { day: 'Sat', type: 'baseline', obstacle: null, helpers: ['environment', 'someone'] },
      { day: 'Sun', type: 'skip', obstacle: 'mental', helpers: [] },
    ],
  };

  // Computed stats
  const stats = {
    daysShowedUp: weekData.days.filter(d => ['baseline', 'expanded', 'other'].includes(d.type)).length,
    baselineDays: weekData.days.filter(d => d.type === 'baseline').length,
    expandedDays: weekData.days.filter(d => d.type === 'expanded').length,
    skipDays: weekData.days.filter(d => d.type === 'skip').length,
    showedUpDespiteLowEnergy: weekData.days.filter(d => 
      ['baseline', 'expanded', 'other'].includes(d.type) && d.obstacle === 'energy'
    ).length,
    skipObstacles: weekData.days.filter(d => d.type === 'skip').map(d => d.obstacle),
    daysWithEnvironmentHelper: weekData.days.filter(d => d.helpers.includes('environment')),
  };

  // Design tokens
  const colors = {
    primary: '#2D5A45',
    primaryLight: '#4A7C59',
    background: '#F5F2ED',
    backgroundDark: '#EDE8E0',
    card: '#FEFDFB',
    text: '#3D3229',
    textMuted: '#6B5D4D',
    textLight: '#8B7355',
    border: '#E8E4DF',
    borderLight: '#D4CFC7',
    success: '#4A7C59',
    successLight: '#E8F5E9',
    successMedium: '#C8E6C9',
    accent: '#FFF9E6',
    baseline: '#C8E6C9',
    expanded: '#A5D6A7',
    skipped: '#E8E4DF',
  };

  const fonts = {
    heading: "'Fraunces', Georgia, serif",
    body: "'DM Sans', system-ui, sans-serif",
    mono: "'DM Mono', monospace",
  };

  // =========================================
  // REUSABLE COMPONENTS
  // =========================================

  const Card = ({ children, style = {} }) => (
    <div style={{
      background: colors.card,
      borderRadius: 24,
      padding: 32,
      boxShadow: '0 8px 32px rgba(92, 75, 58, 0.08)',
      border: `1px solid ${colors.border}`,
      position: 'relative',
      overflow: 'hidden',
      ...style,
    }}>
      {children}
    </div>
  );

  const Button = ({ children, variant = 'primary', onClick, disabled, style = {} }) => {
    const baseStyle = {
      padding: '14px 28px',
      borderRadius: 12,
      fontSize: 15,
      fontFamily: fonts.body,
      fontWeight: 600,
      cursor: disabled ? 'not-allowed' : 'pointer',
      transition: 'all 0.2s ease',
      border: 'none',
      opacity: disabled ? 0.5 : 1,
    };

    const variants = {
      primary: {
        background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryLight} 100%)`,
        color: colors.card,
        boxShadow: '0 4px 14px rgba(45, 90, 69, 0.25)',
      },
      secondary: {
        background: 'transparent',
        color: colors.textMuted,
        border: `2px solid ${colors.border}`,
      },
      ghost: {
        background: 'transparent',
        color: colors.textLight,
        padding: '12px 20px',
      },
    };

    return (
      <button onClick={onClick} disabled={disabled} style={{ ...baseStyle, ...variants[variant], ...style }}>
        {children}
      </button>
    );
  };

  // 7-Day Visual Tracker
  const WeekTracker = () => {
    const getDayColor = (type) => {
      switch(type) {
        case 'baseline': return colors.baseline;
        case 'expanded': return colors.expanded;
        case 'other': return colors.baseline;
        case 'skip': return colors.skipped;
        default: return colors.background;
      }
    };

    return (
      <div style={{
        background: colors.backgroundDark,
        borderRadius: 16,
        padding: '18px 16px',
        marginBottom: 24,
      }}>
        {/* Legend */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: 16, 
          marginBottom: 14,
          flexWrap: 'wrap',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ 
              width: 10, 
              height: 10, 
              borderRadius: '50%', 
              background: colors.baseline,
              border: '1px solid rgba(74, 124, 89, 0.3)',
            }} />
            <span style={{ fontFamily: fonts.body, fontSize: 11, color: colors.textMuted }}>
              Nucleus
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ 
              width: 10, 
              height: 10, 
              borderRadius: '50%', 
              background: colors.expanded,
              border: '1px solid rgba(74, 124, 89, 0.4)',
            }} />
            <span style={{ fontFamily: fonts.body, fontSize: 11, color: colors.textMuted }}>
              Supernova
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ 
              width: 10, 
              height: 10, 
              borderRadius: '50%', 
              background: colors.skipped,
              border: '1px dashed #D4CFC7',
              boxSizing: 'border-box',
            }} />
            <span style={{ fontFamily: fonts.body, fontSize: 11, color: colors.textMuted }}>
              Rest day
            </span>
          </div>
        </div>

        {/* Day circles */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0 4px',
        }}>
          {weekData.days.map((day, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <div style={{
                width: 34,
                height: 34,
                borderRadius: '50%',
                background: getDayColor(day.type),
                border: day.type === 'skip' 
                  ? '2px dashed #D4CFC7' 
                  : '1px solid rgba(74, 124, 89, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxSizing: 'border-box',
              }}>
                {['baseline', 'expanded', 'other'].includes(day.type) && (
                  <span style={{ color: colors.primary, fontSize: 13, fontWeight: 600 }}>✓</span>
                )}
              </div>
              <span style={{ 
                fontFamily: fonts.body, 
                fontSize: 10, 
                color: colors.textLight,
                fontWeight: 500,
              }}>
                {day.day}
              </span>
            </div>
          ))}
        </div>

        {/* Summary line */}
        <div style={{ 
          textAlign: 'center', 
          marginTop: 14,
          paddingTop: 12,
          borderTop: `1px solid ${colors.border}`,
        }}>
          <span style={{ 
            fontFamily: fonts.body, 
            fontSize: 14, 
            color: colors.text,
            fontWeight: 500,
          }}>
            {stats.daysShowedUp} of 7 days
          </span>
          <span style={{ 
            fontFamily: fonts.body, 
            fontSize: 14, 
            color: colors.textMuted,
          }}>
            {' '}— you showed up
          </span>
        </div>
      </div>
    );
  };

  // Insight Card
  const InsightCard = ({ emoji, text, highlight }) => (
    <div style={{
      background: colors.background,
      borderRadius: 12,
      padding: '14px 16px',
      display: 'flex',
      gap: 12,
      alignItems: 'flex-start',
      border: `1px solid ${colors.border}`,
    }}>
      <span style={{ 
        fontSize: 18, 
        flexShrink: 0,
        width: 32,
        height: 32,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: colors.card,
        borderRadius: 8,
        border: `1px solid ${colors.border}`,
      }}>
        {emoji}
      </span>
      <div>
        <p style={{
          fontFamily: fonts.body,
          fontSize: 14,
          color: colors.text,
          margin: 0,
          lineHeight: 1.55,
        }}>
          {text}
        </p>
        {highlight && (
          <p style={{ 
            fontSize: 13,
            color: colors.primaryLight,
            fontWeight: 500,
            margin: '6px 0 0 0',
            fontStyle: 'italic',
          }}>
            {highlight}
          </p>
        )}
      </div>
    </div>
  );

  // Small Stone Jar - with stable positions
  const SmallStoneJar = ({ stones }) => {
    const jarHeight = 56;
    const jarWidth = 40;
    const stoneSize = 5;

    const stoneColors = [
      '#8B7355', '#A0826D', '#B8956C', '#7C9A82', '#6B8E7B', '#9CAF88',
    ];

    // Pre-computed offsets for deterministic rendering
    const offsets = [
      { x: 0.3, y: 0.2, r: 3 }, { x: -0.5, y: 0.1, r: -4 }, { x: 0.7, y: -0.3, r: 5 },
      { x: -0.2, y: 0.4, r: -2 }, { x: 0.4, y: -0.1, r: 6 }, { x: -0.6, y: 0.3, r: -5 },
      { x: 0.1, y: -0.4, r: 4 }, { x: -0.3, y: 0.2, r: -3 }, { x: 0.5, y: 0.1, r: 2 },
      { x: -0.4, y: -0.2, r: -6 }, { x: 0.2, y: 0.3, r: 5 }, { x: -0.1, y: -0.1, r: -4 },
      { x: 0.6, y: 0.4, r: 3 }, { x: -0.5, y: -0.3, r: -2 },
    ];

    const displayStones = Math.min(stones, 14);
    const stonesPerRow = Math.floor(jarWidth / (stoneSize + 2));
    const stonePositions = [...Array(displayStones)].map((_, i) => {
      const row = Math.floor(i / stonesPerRow);
      const col = i % stonesPerRow;
      const xOffset = (col * (stoneSize + 1.5)) + (row % 2 === 1 ? stoneSize / 2 : 0) + 7;
      const yOffset = jarHeight - 14 - (row * (stoneSize - 1));
      const offset = offsets[i % offsets.length];
      return {
        x: xOffset + offset.x,
        y: Math.max(18, yOffset + offset.y),
        color: stoneColors[i % stoneColors.length],
        rotation: offset.r,
      };
    });

    return (
      <div style={{ position: 'relative', width: jarWidth + 14, height: jarHeight + 8 }}>
        <svg width={jarWidth + 14} height={jarHeight + 8} style={{ position: 'absolute', top: 0, left: 0 }}>
          <path
            d={`M 4 14 Q 2 14 2 19 L 2 ${jarHeight} Q 2 ${jarHeight + 5} 8 ${jarHeight + 5} L ${jarWidth + 4} ${jarHeight + 5} Q ${jarWidth + 10} ${jarHeight + 5} ${jarWidth + 10} ${jarHeight} L ${jarWidth + 10} 19 Q ${jarWidth + 10} 14 ${jarWidth + 8} 14 Z`}
            fill="rgba(255, 255, 255, 0.4)"
            stroke="#C9B896"
            strokeWidth="1.5"
          />
          <rect x="3" y="9" width={jarWidth + 6} height="6" rx="2" fill="#E8E4DF" stroke="#C9B896" strokeWidth="1" />
        </svg>

        {stonePositions.map((pos, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: pos.x,
              top: pos.y,
              width: stoneSize,
              height: stoneSize * 0.7,
              background: pos.color,
              borderRadius: '50%',
              transform: `rotate(${pos.rotation}deg)`,
            }}
          />
        ))}
      </div>
    );
  };

  // Larger Stone Jar - with stable positions
  const StoneJar = ({ stones }) => {
    const jarHeight = 100;
    const jarWidth = 70;
    const stoneSize = 10;

    const stoneColors = [
      '#8B7355', '#A0826D', '#B8956C', '#C4A77D',
      '#7C9A82', '#6B8E7B', '#9CAF88', '#D4A574',
    ];

    // Pre-computed offsets
    const offsets = [
      { x: 1.2, y: 0.8, r: 8 }, { x: -1.5, y: 0.3, r: -12 }, { x: 2.1, y: -0.9, r: 15 },
      { x: -0.6, y: 1.2, r: -6 }, { x: 1.4, y: -0.3, r: 18 }, { x: -1.8, y: 0.9, r: -15 },
      { x: 0.3, y: -1.2, r: 12 }, { x: -0.9, y: 0.6, r: -9 }, { x: 1.5, y: 0.3, r: 6 },
      { x: -1.2, y: -0.6, r: -18 }, { x: 0.6, y: 0.9, r: 15 }, { x: -0.3, y: -0.3, r: -12 },
      { x: 1.8, y: 1.2, r: 9 }, { x: -1.5, y: -0.9, r: -6 }, { x: 0.9, y: 0.6, r: 3 },
      { x: -0.6, y: -1.2, r: -3 }, { x: 1.2, y: -0.6, r: 12 }, { x: -2.1, y: 0.3, r: -9 },
      { x: 0.3, y: 1.5, r: 6 }, { x: -0.9, y: -0.9, r: -15 }, { x: 1.5, y: 0.9, r: 18 },
      { x: -1.2, y: 0.6, r: -12 }, { x: 0.6, y: -0.3, r: 9 }, { x: -0.3, y: 1.2, r: -6 },
      { x: 1.8, y: -0.6, r: 3 },
    ];

    const displayStones = Math.min(stones, 25);
    const stonesPerRow = Math.floor(jarWidth / (stoneSize + 3));
    const stonePositions = [...Array(displayStones)].map((_, i) => {
      const row = Math.floor(i / stonesPerRow);
      const col = i % stonesPerRow;
      const xOffset = (col * (stoneSize + 2)) + (row % 2 === 1 ? stoneSize / 2 : 0) + 12;
      const yOffset = jarHeight - 25 - (row * (stoneSize - 2));
      const offset = offsets[i % offsets.length];
      return {
        x: xOffset + offset.x,
        y: Math.max(30, yOffset + offset.y),
        color: stoneColors[i % stoneColors.length],
        rotation: offset.r,
      };
    });

    return (
      <div style={{ position: 'relative', width: jarWidth + 30, height: jarHeight + 15 }}>
        <svg width={jarWidth + 30} height={jarHeight + 15} style={{ position: 'absolute', top: 0, left: 0 }}>
          <path
            d={`M 8 25 Q 4 25 4 33 L 4 ${jarHeight} Q 4 ${jarHeight + 10} 15 ${jarHeight + 10} L ${jarWidth + 8} ${jarHeight + 10} Q ${jarWidth + 19} ${jarHeight + 10} ${jarWidth + 19} ${jarHeight} L ${jarWidth + 19} 33 Q ${jarWidth + 19} 25 ${jarWidth + 15} 25 Z`}
            fill="rgba(255, 255, 255, 0.35)"
            stroke="#C9B896"
            strokeWidth="1.5"
          />
          <rect x="6" y="17" width={jarWidth + 11} height="10" rx="2" fill="#E8E4DF" stroke="#C9B896" strokeWidth="1" />
        </svg>

        {stonePositions.map((pos, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: pos.x,
              top: pos.y,
              width: stoneSize,
              height: stoneSize * 0.75,
              background: `linear-gradient(135deg, ${pos.color} 0%, ${pos.color}dd 100%)`,
              borderRadius: '50%',
              transform: `rotate(${pos.rotation}deg)`,
              boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
            }}
          />
        ))}
      </div>
    );
  };

  // Alignment Slider
  const AlignmentSlider = ({ value, onChange }) => (
    <div style={{ marginTop: 12 }}>
      <input
        type="range"
        min="0"
        max="100"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        style={{
          width: '100%',
          height: 8,
          borderRadius: 4,
          background: `linear-gradient(to right, ${colors.border} 0%, ${colors.primaryLight} 100%)`,
          outline: 'none',
          cursor: 'pointer',
        }}
      />
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        marginTop: 8,
      }}>
        <span style={{ 
          fontFamily: fonts.body, 
          fontSize: 11, 
          color: colors.textLight,
        }}>
          Not very aligned
        </span>
        <span style={{ 
          fontFamily: fonts.body, 
          fontSize: 11, 
          color: colors.textLight,
        }}>
          Very aligned
        </span>
      </div>
    </div>
  );

  // Optional Reflection Question
  const ReflectionQuestion = ({ question, value, onChange, placeholder }) => (
    <div style={{ marginBottom: 16 }}>
      <p style={{
        fontFamily: fonts.body,
        fontSize: 13,
        fontWeight: 500,
        color: colors.text,
        margin: '0 0 8px 0',
      }}>
        {question}
        <span style={{ color: colors.textLight, fontWeight: 400 }}> (optional)</span>
      </p>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={200}
        style={{
          width: '100%',
          padding: '10px 12px',
          borderRadius: 10,
          border: `1px solid ${colors.border}`,
          fontSize: 13,
          fontFamily: fonts.body,
          color: colors.text,
          background: colors.card,
          resize: 'none',
          minHeight: 50,
          lineHeight: 1.5,
          outline: 'none',
          boxSizing: 'border-box',
        }}
      />
    </div>
  );

  // Experiment Option Component
  const ExperimentOption = ({ 
    selected, 
    onClick, 
    emoji,
    title, 
    currentLabel,
    currentValue,
    suggestionLabel,
    text, 
    onTextChange,
    why,
  }) => (
    <div
      onClick={onClick}
      style={{
        display: 'block',
        width: '100%',
        padding: '18px 20px',
        borderRadius: 16,
        border: `2px solid ${selected ? colors.primaryLight : colors.border}`,
        background: selected ? 'rgba(74, 124, 89, 0.05)' : colors.card,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        textAlign: 'left',
      }}
    >
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: selected ? 14 : 0 }}>
        <div style={{
          width: 24,
          height: 24,
          borderRadius: '50%',
          border: `2px solid ${selected ? colors.primaryLight : colors.border}`,
          background: selected ? colors.primaryLight : 'transparent',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          transition: 'all 0.2s ease',
        }}>
          {selected && (
            <span style={{ color: 'white', fontSize: 12 }}>✓</span>
          )}
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 18 }}>{emoji}</span>
          <span style={{
            fontFamily: fonts.body,
            fontSize: 15,
            fontWeight: 600,
            color: colors.text,
          }}>
            {title}
          </span>
        </div>
      </div>

      {/* Preview when not selected */}
      {!selected && (
        <div style={{ marginLeft: 36, marginTop: 8 }}>
          <p style={{
            fontFamily: fonts.body,
            fontSize: 12,
            color: colors.textLight,
            margin: 0,
          }}>
            <span style={{ color: colors.textMuted }}>Current:</span> {currentValue}
          </p>
        </div>
      )}
      
      {/* Expanded content when selected */}
      {selected && (
        <div style={{ marginLeft: 36 }} onClick={(e) => e.stopPropagation()}>
          {/* Current setup */}
          <div style={{
            background: colors.backgroundDark,
            borderRadius: 10,
            padding: '12px 14px',
            marginBottom: 14,
          }}>
            <p style={{
              fontFamily: fonts.body,
              fontSize: 11,
              fontWeight: 600,
              color: colors.textLight,
              textTransform: 'uppercase',
              letterSpacing: 0.5,
              margin: '0 0 4px 0',
            }}>
              {currentLabel}
            </p>
            <p style={{
              fontFamily: fonts.body,
              fontSize: 14,
              color: colors.text,
              margin: 0,
            }}>
              {currentValue}
            </p>
          </div>
          
          {/* Editable suggestion */}
          <div>
            <p style={{
              fontFamily: fonts.body,
              fontSize: 11,
              fontWeight: 600,
              color: colors.textLight,
              textTransform: 'uppercase',
              letterSpacing: 0.5,
              margin: '0 0 8px 0',
            }}>
              {suggestionLabel}
            </p>
            <textarea
              value={text}
              onChange={(e) => onTextChange(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: 10,
                border: `1px solid ${colors.border}`,
                fontSize: 14,
                fontFamily: fonts.body,
                color: colors.text,
                background: colors.card,
                resize: 'none',
                minHeight: 64,
                lineHeight: 1.5,
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>
          
          {/* Why this might help */}
          {why && (
            <p style={{
              fontFamily: fonts.body,
              fontSize: 12,
              color: colors.textLight,
              margin: '12px 0 0 0',
              lineHeight: 1.5,
            }}>
              💡 <em>{why}</em>
            </p>
          )}
          
          <p style={{
            fontFamily: fonts.body,
            fontSize: 11,
            color: colors.textLight,
            margin: '10px 0 0 0',
          }}>
            ✎ Edit this to fit your week
          </p>
        </div>
      )}
    </div>
  );

  // Keep Same Option
  const KeepSameOption = ({ selected, onClick }) => (
    <div
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        width: '100%',
        padding: '16px 20px',
        borderRadius: 16,
        border: `2px solid ${selected ? colors.primaryLight : colors.border}`,
        background: selected ? 'rgba(74, 124, 89, 0.05)' : colors.card,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        textAlign: 'left',
      }}
    >
      <div style={{
        width: 24,
        height: 24,
        borderRadius: '50%',
        border: `2px solid ${selected ? colors.primaryLight : colors.border}`,
        background: selected ? colors.primaryLight : 'transparent',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        transition: 'all 0.2s ease',
      }}>
        {selected && (
          <span style={{ color: 'white', fontSize: 12 }}>✓</span>
        )}
      </div>
      
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 18 }}>🔄</span>
          <span style={{
            fontFamily: fonts.body,
            fontSize: 15,
            fontWeight: 600,
            color: colors.text,
          }}>
            Keep everything the same
          </span>
        </div>
        <p style={{
          fontFamily: fonts.body,
          fontSize: 12,
          color: colors.textLight,
          margin: '6px 0 0 36px',
        }}>
          This week had a rhythm. Continue and observe what happens.
        </p>
      </div>
    </div>
  );

  // Generate AI insights
  const generateInsights = () => {
    const insights = [];

    if (stats.showedUpDespiteLowEnergy > 0) {
      insights.push({
        id: 'resilience',
        emoji: '💪',
        text: `On ${stats.showedUpDespiteLowEnergy === 1 ? 'one day' : `${stats.showedUpDespiteLowEnergy} days`}, you tagged "low energy" but still showed up anyway.`,
        highlight: `That's identity in action — showing up even when it's hard.`,
      });
    }

    if (stats.skipObstacles.length >= 2) {
      const obstacleLabels = { energy: 'low energy', mental: 'mental load', time: 'time/schedule' };
      const obstacleList = stats.skipObstacles.map(o => obstacleLabels[o] || o);
      insights.push({
        id: 'obstacles',
        emoji: '🔍',
        text: `Both rest days had something in common: "${obstacleList.join('" and "')}" came up.`,
        highlight: `Worth noticing — is there a pattern to explore?`,
      });
    }

    return insights.slice(0, 2);
  };

  const insights = generateInsights();

  // Experiment options
  const experimentOptions = [
    {
      id: 'anchor',
      emoji: '🔗',
      title: 'Strengthen your anchor',
      currentLabel: 'Current anchor',
      currentValue: userData.anchor.label,
      suggestionLabel: 'Try this instead',
      defaultText: 'At 5:30pm when I close my laptop',
      why: 'A specific time creates a sharper trigger than a vague "after work" — your brain knows exactly when to switch modes.',
    },
    {
      id: 'environment',
      emoji: '👁️',
      title: 'Prep your environment',
      currentLabel: 'Current setup',
      currentValue: userData.environmentSetup.join(', '),
      suggestionLabel: 'Try this instead',
      defaultText: 'Gym bag packed with clothes + water + shoes inside, on the front seat of my car',
      why: 'When everything is ready and visible, there\'s nothing left to decide — you just go.',
    },
    {
      id: 'enjoyment',
      emoji: '🎵',
      title: 'Make it more enjoyable',
      currentLabel: 'What you enjoy',
      currentValue: userData.funElements.join(', '),
      suggestionLabel: 'Try this',
      defaultText: 'Play my hype gym playlist the moment I get in the car',
      why: 'Pairing something you love with the habit makes starting feel like a reward, not a chore.',
    },
  ];

  // =========================================
  // SCREEN 1: WHAT WE NOTICED
  // =========================================
  const Screen1_Insights = () => (
    <Card>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <div style={{
          width: 52,
          height: 52,
          borderRadius: '50%',
          background: `linear-gradient(135deg, ${colors.successLight} 0%, ${colors.successMedium} 100%)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 12px',
          fontSize: 24,
        }}>
          🔮
        </div>
        <h1 style={{
          fontFamily: fonts.heading,
          fontSize: 22,
          fontWeight: 600,
          color: colors.text,
          margin: '0 0 4px 0',
        }}>
          What we noticed
        </h1>
        <p style={{
          fontFamily: fonts.body,
          fontSize: 14,
          color: colors.textMuted,
          margin: 0,
        }}>
          Week of {weekData.weekRange}
        </p>
      </div>

      {/* 7-Day Visual Tracker */}
      <WeekTracker />

      {/* AI Insight Cards */}
      {insights.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
          {insights.map((insight) => (
            <InsightCard 
              key={insight.id} 
              emoji={insight.emoji} 
              text={insight.text}
              highlight={insight.highlight}
            />
          ))}
        </div>
      )}

      {/* Optional Reflection Questions */}
      <div style={{ 
        background: colors.background, 
        borderRadius: 12, 
        padding: 16,
        marginBottom: 20,
      }}>
        <p style={{
          fontFamily: fonts.body,
          fontSize: 12,
          fontWeight: 600,
          color: colors.textMuted,
          textTransform: 'uppercase',
          letterSpacing: 0.5,
          margin: '0 0 14px 0',
        }}>
          Reflect on this week
        </p>
        
        <ReflectionQuestion
          question="What helped you show up — even a little?"
          value={reflectionQ1}
          onChange={setReflectionQ1}
          placeholder="Maybe it was the music, a friend, or just starting small..."
        />
        
        <ReflectionQuestion
          question="On days it didn't happen, what made starting feel harder?"
          value={reflectionQ2}
          onChange={setReflectionQ2}
          placeholder="Was it energy, time, mental load, or something else..."
        />
      </div>

      {/* Divider */}
      <div style={{ 
        height: 1, 
        background: colors.border, 
        margin: '0 -32px 20px',
      }} />

      {/* Identity Alignment Section + Stone Jar */}
      <div style={{ 
        display: 'flex', 
        gap: 16,
        alignItems: 'flex-start',
      }}>
        {/* Stone jar */}
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          flexShrink: 0,
        }}>
          <SmallStoneJar stones={userData.totalStones} />
          <span style={{ 
            fontFamily: fonts.mono, 
            fontSize: 10, 
            color: colors.textMuted,
            marginTop: 4,
          }}>
            {userData.totalStones} stones
          </span>
        </div>
        
        {/* Identity + Slider */}
        <div style={{ flex: 1 }}>
          {/* Identity statement */}
          <div style={{
            background: `linear-gradient(135deg, ${colors.successLight} 0%, ${colors.successMedium} 100%)`,
            borderRadius: 10,
            padding: '12px 14px',
            marginBottom: 12,
            border: '1px solid rgba(74, 124, 89, 0.2)',
          }}>
            <p style={{
              fontFamily: fonts.heading,
              fontSize: 14,
              fontWeight: 500,
              color: colors.primary,
              margin: 0,
              fontStyle: 'italic',
              lineHeight: 1.4,
            }}>
              "{userData.identity}"
            </p>
          </div>
          
          {/* Alignment prompt + slider */}
          <p style={{
            fontFamily: fonts.body,
            fontSize: 13,
            color: colors.text,
            margin: '0 0 4px 0',
          }}>
            This week, acting in line with this identity felt...
          </p>
          
          <AlignmentSlider value={alignmentValue} onChange={setAlignmentValue} />
        </div>
      </div>

      {/* Optional free text */}
      <div style={{ marginTop: 20 }}>
        <p style={{
          fontFamily: fonts.body,
          fontSize: 13,
          fontWeight: 500,
          color: colors.text,
          margin: '0 0 8px 0',
        }}>
          I'm noticing that...
          <span style={{ color: colors.textLight, fontWeight: 400 }}> (optional)</span>
        </p>
        <textarea
          value={identityReflection}
          onChange={(e) => setIdentityReflection(e.target.value)}
          placeholder="Any other reflections on this week..."
          maxLength={280}
          style={{
            width: '100%',
            padding: '10px 12px',
            borderRadius: 10,
            border: `1px solid ${colors.border}`,
            fontSize: 13,
            fontFamily: fonts.body,
            color: colors.text,
            background: colors.card,
            resize: 'none',
            minHeight: 56,
            lineHeight: 1.5,
            outline: 'none',
            boxSizing: 'border-box',
          }}
        />
      </div>

      {/* Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
        <Button variant="ghost" onClick={() => setCurrentScreen(3)}>
          Skip
        </Button>
        <Button onClick={() => setCurrentScreen(2)}>
          Continue →
        </Button>
      </div>
    </Card>
  );

  // =========================================
  // SCREEN 2: YOUR PERSONAL HABIT LAB
  // =========================================
  const Screen2_Experiment = () => {
    const getExperimentText = (id) => {
      if (experimentTexts[id] !== undefined) {
        return experimentTexts[id];
      }
      const option = experimentOptions.find(o => o.id === id);
      return option ? option.defaultText : '';
    };

    const handleTextChange = (id, text) => {
      setExperimentTexts(prev => ({ ...prev, [id]: text }));
    };

    const handleSelect = (id) => {
      setSelectedExperiment(id);
      if (experimentTexts[id] === undefined && id !== 'maintain') {
        const option = experimentOptions.find(o => o.id === id);
        if (option) {
          setExperimentTexts(prev => ({ ...prev, [id]: option.defaultText }));
        }
      }
    };

    const canContinue = selectedExperiment !== null;

    return (
      <Card>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{
            width: 52,
            height: 52,
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${colors.accent} 0%, #FFE69C 100%)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 12px',
            fontSize: 24,
          }}>
            🧪
          </div>
          <h1 style={{
            fontFamily: fonts.heading,
            fontSize: 22,
            fontWeight: 600,
            color: colors.text,
            margin: '0 0 8px 0',
          }}>
            Your personal habit lab
          </h1>
          <p style={{
            fontFamily: fonts.body,
            fontSize: 14,
            color: colors.textMuted,
            margin: 0,
            lineHeight: 1.55,
            maxWidth: 340,
            marginLeft: 'auto',
            marginRight: 'auto',
          }}>
            Small experiments help you learn what actually works for you. Based on how this habit showed up for you this week, here's one small thing we can test together.
          </p>
        </div>

        {/* Experiment Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
          {experimentOptions.map((option) => (
            <ExperimentOption
              key={option.id}
              selected={selectedExperiment === option.id}
              onClick={() => handleSelect(option.id)}
              emoji={option.emoji}
              title={option.title}
              currentLabel={option.currentLabel}
              currentValue={option.currentValue}
              suggestionLabel={option.suggestionLabel}
              text={getExperimentText(option.id)}
              onTextChange={(text) => handleTextChange(option.id, text)}
              why={option.why}
            />
          ))}
          
          {/* Keep the same option */}
          <KeepSameOption 
            selected={selectedExperiment === 'maintain'} 
            onClick={() => handleSelect('maintain')} 
          />
        </div>

        {/* Navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button variant="secondary" onClick={() => setCurrentScreen(1)}>
            ← Back
          </Button>
          <Button onClick={() => setCurrentScreen(3)} disabled={!canContinue}>
            Set experiment →
          </Button>
        </div>
      </Card>
    );
  };

  // =========================================
  // SCREEN 3: WEEK AHEAD
  // =========================================
  const Screen3_WeekAhead = () => {
    const getSelectedExperimentText = () => {
      if (selectedExperiment === 'maintain') {
        return 'Continue with your current setup and observe what happens.';
      }
      if (experimentTexts[selectedExperiment]) {
        return experimentTexts[selectedExperiment];
      }
      const option = experimentOptions.find(o => o.id === selectedExperiment);
      return option ? option.defaultText : 'Continue with your current approach';
    };

    const getSelectedExperimentTitle = () => {
      if (selectedExperiment === 'maintain') {
        return 'Keep everything the same';
      }
      const option = experimentOptions.find(o => o.id === selectedExperiment);
      return option ? option.title : 'Your experiment';
    };

    const getSelectedExperimentEmoji = () => {
      if (selectedExperiment === 'maintain') return '🔄';
      const option = experimentOptions.find(o => o.id === selectedExperiment);
      return option ? option.emoji : '🧪';
    };

    return (
      <Card>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{
            width: 52,
            height: 52,
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${colors.primaryLight} 0%, ${colors.primary} 100%)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 12px',
            fontSize: 24,
            boxShadow: '0 6px 20px rgba(45, 90, 69, 0.25)',
          }}>
            ✨
          </div>
          <h1 style={{
            fontFamily: fonts.heading,
            fontSize: 22,
            fontWeight: 600,
            color: colors.text,
            margin: '0 0 4px 0',
          }}>
            Your week ahead
          </h1>
          <p style={{
            fontFamily: fonts.body,
            fontSize: 14,
            color: colors.textMuted,
            margin: 0,
          }}>
            Every action is a vote for who you're becoming.
          </p>
        </div>

        {/* Stone Jar + Stats */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 24,
          background: colors.backgroundDark,
          borderRadius: 16,
          padding: 20,
          marginBottom: 20,
        }}>
          <StoneJar stones={userData.totalStones} />
          <div>
            <p style={{ 
              fontFamily: fonts.mono, 
              fontSize: 28, 
              fontWeight: 600, 
              color: colors.primary, 
              margin: '0 0 4px 0' 
            }}>
              {userData.totalStones}
            </p>
            <p style={{ 
              fontFamily: fonts.body, 
              fontSize: 13, 
              color: colors.textMuted, 
              margin: 0 
            }}>
              stones collected
            </p>
          </div>
        </div>

        {/* This Week's Experiment */}
        <div style={{
          background: colors.accent,
          borderRadius: 14,
          padding: 18,
          marginBottom: 16,
          border: '1px solid #F5E6D3',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <span style={{ fontSize: 18 }}>{getSelectedExperimentEmoji()}</span>
            <span style={{
              fontFamily: fonts.body,
              fontSize: 11,
              fontWeight: 600,
              color: colors.textMuted,
              textTransform: 'uppercase',
              letterSpacing: 0.5,
            }}>
              This week's experiment
            </span>
          </div>
          <p style={{
            fontFamily: fonts.body,
            fontSize: 14,
            fontWeight: 600,
            color: colors.text,
            margin: '0 0 6px 0',
          }}>
            {getSelectedExperimentTitle()}
          </p>
          <p style={{
            fontFamily: fonts.body,
            fontSize: 13,
            color: colors.textMuted,
            margin: 0,
            lineHeight: 1.55,
          }}>
            {getSelectedExperimentText()}
          </p>
        </div>

        {/* Identity Reminder */}
        <div style={{
          background: `linear-gradient(135deg, ${colors.successLight} 0%, ${colors.successMedium} 100%)`,
          borderRadius: 12,
          padding: 14,
          marginBottom: 24,
          border: '1px solid rgba(74, 124, 89, 0.2)',
          textAlign: 'center',
        }}>
          <p style={{
            fontFamily: fonts.body,
            fontSize: 10,
            color: '#5C7A6B',
            textTransform: 'uppercase',
            letterSpacing: 0.5,
            margin: '0 0 4px 0',
          }}>
            Remember who you're becoming
          </p>
          <p style={{
            fontFamily: fonts.heading,
            fontSize: 14,
            fontWeight: 500,
            color: colors.primary,
            margin: 0,
            fontStyle: 'italic',
          }}>
            "{userData.identity}"
          </p>
        </div>

        {/* Closing Message */}
        <div style={{
          textAlign: 'center',
          padding: '8px 0 16px',
        }}>
          <p style={{
            fontFamily: fonts.body,
            fontSize: 14,
            color: colors.textMuted,
            margin: 0,
            lineHeight: 1.6,
          }}>
            Small experiments. Real learning.<br />
            <span style={{ color: colors.primary, fontWeight: 500 }}>See you tomorrow 🌱</span>
          </p>
        </div>

        {/* Navigation */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Button style={{ width: '100%' }}>
            Start my week →
          </Button>
          <Button variant="ghost" onClick={() => setCurrentScreen(2)} style={{ width: '100%' }}>
            ← Change experiment
          </Button>
        </div>
      </Card>
    );
  };

  // =========================================
  // MAIN RENDER
  // =========================================
  const renderScreen = () => {
    switch (currentScreen) {
      case 1: return <Screen1_Insights />;
      case 2: return <Screen2_Experiment />;
      case 3: return <Screen3_WeekAhead />;
      default: return <Screen1_Insights />;
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: `linear-gradient(180deg, ${colors.background} 0%, ${colors.backgroundDark} 100%)`,
      padding: '40px 20px',
      fontFamily: fonts.body,
    }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=DM+Sans:wght@400;500;600&family=Fraunces:wght@400;500;600;700&display=swap" rel="stylesheet" />

      <style>{`
        * { box-sizing: border-box; }
        button:hover:not(:disabled) { transform: translateY(-1px); }
        button:active:not(:disabled) { transform: translateY(0); }
      `}</style>

      <div style={{ maxWidth: 420, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 34,
              height: 34,
              borderRadius: 8,
              background: `linear-gradient(135deg, ${colors.primaryLight} 0%, ${colors.primary} 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 16,
            }}>
              🌱
            </div>
            <span style={{ fontFamily: fonts.heading, fontSize: 17, fontWeight: 600, color: colors.primary }}>
              Habit Lab
            </span>
          </div>
          
          {/* Progress indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {[1, 2, 3].map((step) => (
              <div
                key={step}
                style={{
                  width: step === currentScreen ? 20 : 8,
                  height: 8,
                  borderRadius: 4,
                  background: step <= currentScreen ? colors.primaryLight : colors.border,
                  transition: 'all 0.3s ease',
                }}
              />
            ))}
          </div>
        </div>

        {/* Demo Controls */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
          {[
            { id: 1, label: '🔮 Insights' },
            { id: 2, label: '🧪 Experiment' },
            { id: 3, label: '✨ Week Ahead' },
          ].map((screen) => (
            <button
              key={screen.id}
              onClick={() => setCurrentScreen(screen.id)}
              style={{
                padding: '6px 12px',
                borderRadius: 16,
                border: currentScreen === screen.id ? `2px solid ${colors.primaryLight}` : `1px solid ${colors.border}`,
                background: currentScreen === screen.id ? 'rgba(74, 124, 89, 0.08)' : 'transparent',
                fontFamily: fonts.body,
                fontSize: 12,
                color: currentScreen === screen.id ? colors.primary : colors.textLight,
                cursor: 'pointer',
              }}
            >
              {screen.label}
            </button>
          ))}
        </div>

        {renderScreen()}
      </div>
    </div>
  );
};

export default WeeklyReflectionMockupsV4;
