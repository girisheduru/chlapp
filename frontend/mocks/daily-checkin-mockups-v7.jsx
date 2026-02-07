import React, { useState } from 'react';

// James Clear Habit App - Daily Check-In UI Mockups V5
// UPDATED with:
// - Single check-in screen with expandable reflection sections
// - Removed shrink/micro/bite-sized functionality
// - Two habit versions: low-energy (baseline) and higher-energy (capacity)
// - "What got in the way?" and "What helped?" as inline toggles
// - Stone collected screen with identity under jar
// - Aligned with onboarding examples (body care theme)

const DailyCheckInMockupsV5 = () => {
  const [currentView, setCurrentView] = useState('checkin');
  const [showConfetti, setShowConfetti] = useState(false);
  const [streakCount, setStreakCount] = useState(7);
  const [totalStones, setTotalStones] = useState(23);
  const [newStoneAdded, setNewStoneAdded] = useState(false);
  const [showStoneAnimation, setShowStoneAnimation] = useState(false);

  // Check-in state
  const [selectedAction, setSelectedAction] = useState(null); // 'baseline', 'capacity', 'other', 'nottoday'
  const [somethingElseText, setSomethingElseText] = useState('');
  const [selectedObstacles, setSelectedObstacles] = useState([]);
  const [selectedHelpers, setSelectedHelpers] = useState([]);
  const [obstacleTellMore, setObstacleTellMore] = useState('');
  const [helperTellMore, setHelperTellMore] = useState('');
  const [customObstacle, setCustomObstacle] = useState('');
  const [customHelper, setCustomHelper] = useState('');

  // User's data (from onboarding)
  const userData = {
    identity: "I am someone who takes care of my body",
    baselineHabit: "Do one supportive action (stretch, hydrate, rest)",
    capacityHabit: "Staying longer and pushing a bit",
    anchor: { emoji: '☕', label: 'After my morning coffee' },
    funElements: ['Music I love', 'Movement that feels right'],
  };

  // Options for multi-select
  const obstacleOptions = [
    { id: 'time', label: 'Time / schedule', emoji: '🕰️' },
    { id: 'mental', label: 'Mental load', emoji: '🧠' },
    { id: 'energy', label: 'Low energy', emoji: '😴' },
    { id: 'distraction', label: 'Distractions', emoji: '🌪️' },
    { id: 'setup', label: 'Setup wasn\'t ready', emoji: '🏠' },
    { id: 'other', label: 'Something else', emoji: '➕' },
  ];

  const helperOptions = [
    { id: 'music', label: 'Music / vibe', emoji: '🎶' },
    { id: 'environment', label: 'Environment', emoji: '👁️' },
    { id: 'cue', label: 'My cue', emoji: '🔗' },
    { id: 'someone', label: 'Someone else', emoji: '🤝' },
    { id: 'flow', label: 'It just flowed', emoji: '✨' },
    { id: 'other', label: 'Something else', emoji: '➕' },
  ];

  // Toggle multi-select (max 3)
  const toggleObstacle = (id) => {
    if (selectedObstacles.includes(id)) {
      setSelectedObstacles(selectedObstacles.filter(o => o !== id));
      if (id === 'other') setCustomObstacle('');
    } else if (selectedObstacles.length < 3) {
      setSelectedObstacles([...selectedObstacles, id]);
    }
  };

  const toggleHelper = (id) => {
    if (selectedHelpers.includes(id)) {
      setSelectedHelpers(selectedHelpers.filter(h => h !== id));
      if (id === 'other') setCustomHelper('');
    } else if (selectedHelpers.length < 3) {
      setSelectedHelpers([...selectedHelpers, id]);
    }
  };

  // Handle save check-in
  const handleSaveCheckin = () => {
    if (selectedAction === 'nottoday') {
      setCurrentView('recovery');
    } else {
      // Add stone animation
      setShowStoneAnimation(true);
      setTimeout(() => {
        setNewStoneAdded(true);
        setTotalStones(prev => prev + 1);
        setStreakCount(prev => prev + 1);
      }, 800);
      setTimeout(() => {
        setCurrentView('completed');
        setShowConfetti(true);
      }, 1500);
      setTimeout(() => setShowConfetti(false), 4500);
    }
  };

  // Reset check-in state
  const resetCheckin = () => {
    setSelectedAction(null);
    setSomethingElseText('');
    setSelectedObstacles([]);
    setSelectedHelpers([]);
    setObstacleTellMore('');
    setHelperTellMore('');
    setCustomObstacle('');
    setCustomHelper('');
    setNewStoneAdded(false);
    setShowStoneAnimation(false);
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
    warning: '#FFF8E1',
    warningBorder: '#FFE082',
    warningText: '#5C4B14',
    celebration: '#FFB347',
    fire: '#E65100',
  };

  const fonts = {
    heading: "'Fraunces', Georgia, serif",
    body: "'DM Sans', system-ui, sans-serif",
    mono: "'DM Mono', monospace",
  };

  // =========================================
  // REUSABLE COMPONENTS
  // =========================================

  const Card = ({ children, style = {}, glow = false }) => (
    <div style={{
      background: colors.card,
      borderRadius: 24,
      padding: 32,
      boxShadow: glow
        ? `0 8px 32px rgba(74, 124, 89, 0.15), 0 0 0 2px rgba(74, 124, 89, 0.1)`
        : '0 8px 32px rgba(92, 75, 58, 0.08)',
      border: `1px solid ${colors.borderLight}`,
      position: 'relative',
      overflow: 'hidden',
      ...style,
    }}>
      {children}
    </div>
  );

  const Button = ({ children, variant = 'primary', onClick, disabled, style = {}, size = 'normal' }) => {
    const baseStyle = {
      padding: size === 'large' ? '20px 40px' : size === 'small' ? '12px 20px' : '16px 32px',
      borderRadius: 12,
      fontSize: size === 'large' ? 18 : size === 'small' ? 14 : 16,
      fontFamily: fonts.body,
      fontWeight: 500,
      cursor: disabled ? 'not-allowed' : 'pointer',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
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
        border: `2px solid ${colors.borderLight}`,
      },
      celebration: {
        background: `linear-gradient(135deg, ${colors.celebration} 0%, #FFCC33 100%)`,
        color: '#5C4B14',
        boxShadow: '0 4px 14px rgba(255, 179, 71, 0.35)',
      },
      ghost: {
        background: 'transparent',
        color: colors.textLight,
        padding: '12px 24px',
      },
    };

    return (
      <button onClick={onClick} disabled={disabled} style={{ ...baseStyle, ...variants[variant], ...style }}>
        {children}
      </button>
    );
  };

  // Selectable action option
  const ActionOption = ({ selected, onClick, emoji, title, subtitle, variant = 'default' }) => {
    const isNotToday = variant === 'nottoday';
    return (
      <button
        onClick={onClick}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          width: '100%',
          padding: '16px 18px',
          borderRadius: 14,
          border: `2px solid ${selected ? colors.primaryLight : colors.border}`,
          background: selected
            ? isNotToday ? '#FFF8E1' : 'rgba(74, 124, 89, 0.08)'
            : colors.card,
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          textAlign: 'left',
        }}
      >
        <span style={{ fontSize: 22 }}>{emoji}</span>
        <div style={{ flex: 1 }}>
          <p style={{
            fontFamily: fonts.body,
            fontSize: 15,
            fontWeight: 500,
            color: colors.text,
            margin: 0,
          }}>
            {title}
          </p>
          {subtitle && (
            <p style={{
              fontFamily: fonts.body,
              fontSize: 13,
              color: colors.textLight,
              margin: '4px 0 0 0',
            }}>
              {subtitle}
            </p>
          )}
        </div>
        {selected && (
          <span style={{
            width: 24,
            height: 24,
            borderRadius: '50%',
            background: isNotToday ? '#FFB347' : colors.primaryLight,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: 12,
            flexShrink: 0,
          }}>
            ✓
          </span>
        )}
      </button>
    );
  };

  // Multi-select chip
  const SelectChip = ({ selected, onClick, emoji, label, disabled }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '10px 14px',
        borderRadius: 20,
        border: `2px solid ${selected ? colors.primaryLight : colors.border}`,
        background: selected ? 'rgba(74, 124, 89, 0.1)' : colors.card,
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all 0.2s ease',
        opacity: disabled && !selected ? 0.5 : 1,
      }}
    >
      <span style={{ fontSize: 14 }}>{emoji}</span>
      <span style={{
        fontFamily: fonts.body,
        fontSize: 13,
        color: selected ? colors.primary : colors.textMuted,
        fontWeight: selected ? 500 : 400,
      }}>
        {label}
      </span>
    </button>
  );

  // Stone Jar Component
  const StoneJar = ({ stones, showNewStone = false, size = 'normal' }) => {
    const jarHeight = size === 'large' ? 200 : 120;
    const jarWidth = size === 'large' ? 140 : 90;
    const stoneSize = size === 'large' ? 18 : 12;

    const stoneColors = [
      '#8B7355', '#A0826D', '#B8956C', '#C4A77D',
      '#7C9A82', '#6B8E7B', '#9CAF88', '#D4A574',
      '#E8C4A0', '#C9B896', '#A67B5B', '#8E7B6B'
    ];

    const displayStones = Math.min(stones, 35);
    const stonesPerRow = Math.floor(jarWidth / (stoneSize + 4));
    const stonePositions = [...Array(displayStones)].map((_, i) => {
      const row = Math.floor(i / stonesPerRow);
      const col = i % stonesPerRow;
      const xOffset = (col * (stoneSize + 3)) + (row % 2 === 1 ? stoneSize / 2 : 0) + 15;
      const yOffset = jarHeight - 30 - (row * (stoneSize - 2));
      return {
        x: xOffset + (Math.random() * 4 - 2),
        y: Math.max(35, yOffset + (Math.random() * 3 - 1.5)),
        color: stoneColors[i % stoneColors.length],
        rotation: Math.random() * 30 - 15,
      };
    });

    return (
      <div style={{ position: 'relative', width: jarWidth + 40, height: jarHeight + 20 }}>
        <svg width={jarWidth + 40} height={jarHeight + 20} style={{ position: 'absolute', top: 0, left: 0 }}>
          <path
            d={`M 10 30 Q 5 30 5 40 L 5 ${jarHeight} Q 5 ${jarHeight + 15} 20 ${jarHeight + 15} L ${jarWidth + 10} ${jarHeight + 15} Q ${jarWidth + 25} ${jarHeight + 15} ${jarWidth + 25} ${jarHeight} L ${jarWidth + 25} 40 Q ${jarWidth + 25} 30 ${jarWidth + 20} 30 Z`}
            fill="rgba(255, 255, 255, 0.3)"
            stroke="#C9B896"
            strokeWidth="2"
          />
          <rect x="8" y="20" width={jarWidth + 14} height="12" rx="3" fill="#E8E4DF" stroke="#C9B896" strokeWidth="1.5" />
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
              boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
            }}
          />
        ))}

        {showNewStone && (
          <div
            style={{
              position: 'absolute',
              left: jarWidth / 2,
              top: -20,
              width: stoneSize + 4,
              height: (stoneSize + 4) * 0.75,
              background: `linear-gradient(135deg, ${colors.primaryLight} 0%, ${colors.primary} 100%)`,
              borderRadius: '50%',
              boxShadow: '0 4px 12px rgba(74, 124, 89, 0.4)',
              animation: 'stoneDrop 0.8s ease-in forwards',
            }}
          />
        )}
      </div>
    );
  };

  // Today's Stone Component
  const TodaysStone = ({ collected }) => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <div style={{
        width: 48,
        height: 36,
        background: collected
          ? `linear-gradient(135deg, ${colors.border} 0%, ${colors.borderLight} 100%)`
          : `linear-gradient(135deg, ${colors.primaryLight} 0%, ${colors.primary} 100%)`,
        borderRadius: '50%',
        boxShadow: collected ? 'none' : '0 4px 16px rgba(74, 124, 89, 0.4), 0 0 20px rgba(74, 124, 89, 0.2)',
        animation: collected ? 'none' : 'stoneGlow 2s ease-in-out infinite',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        {collected && <span style={{ color: colors.textLight, fontSize: 16 }}>✓</span>}
      </div>
      <span style={{
        fontFamily: fonts.body,
        fontSize: 11,
        color: collected ? colors.textLight : colors.primary,
        fontWeight: 500,
      }}>
        {collected ? 'Collected!' : "Today's stone"}
      </span>
    </div>
  );

  // Confetti Component
  const Confetti = () => (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      pointerEvents: 'none',
      overflow: 'hidden',
      zIndex: 10,
    }}>
      {[...Array(30)].map((_, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            width: 10,
            height: 10,
            background: ['#4A7C59', '#FFB347', '#7CB9E8', '#F4A460', '#DDA0DD', '#98D8C8'][i % 6],
            borderRadius: i % 2 === 0 ? '50%' : 2,
            left: `${Math.random() * 100}%`,
            top: -20,
            animation: `confettiFall ${2 + Math.random()}s ease-out forwards`,
            animationDelay: `${Math.random() * 0.5}s`,
            transform: `rotate(${Math.random() * 360}deg)`,
          }}
        />
      ))}
    </div>
  );

  // Streak Display
  const StreakDisplay = ({ streak, totalStones }) => {
    if (totalStones === 0) {
      return (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          marginBottom: 20,
          padding: '12px 16px',
          background: `linear-gradient(135deg, ${colors.successLight} 0%, ${colors.successMedium} 100%)`,
          borderRadius: 12,
          border: '1px solid rgba(74, 124, 89, 0.2)',
        }}>
          <span style={{ fontSize: 20 }}>🌱</span>
          <span style={{ fontFamily: fonts.body, fontSize: 14, fontWeight: 500, color: colors.primary }}>
            Your first stone awaits!
          </span>
        </div>
      );
    }

    if (streak === 0 && totalStones > 0) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 8,
          marginBottom: 20,
          padding: 16,
          background: `linear-gradient(135deg, ${colors.warning} 0%, #FFECB3 100%)`,
          borderRadius: 12,
          border: `1px solid ${colors.warningBorder}`,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 18 }}>🌤️</span>
            <span style={{ fontFamily: fonts.body, fontSize: 14, fontWeight: 500, color: colors.warningText }}>
              Fresh start today
            </span>
          </div>
          <span style={{ fontFamily: fonts.body, fontSize: 12, color: colors.textLight }}>
            Your jar still has <strong>{totalStones} stones</strong>. Let's add another!
          </span>
        </div>
      );
    }

    if (streak >= 2) {
      return (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          marginBottom: 20,
          padding: 12,
          background: 'linear-gradient(135deg, #FFF3E0 0%, #FFE0B2 100%)',
          borderRadius: 12,
        }}>
          <span style={{ fontSize: 20, animation: 'fireGlow 1s ease-in-out infinite' }}>🔥</span>
          <span style={{ fontFamily: fonts.mono, fontSize: 15, fontWeight: 600, color: colors.fire }}>
            {streak} day streak
          </span>
        </div>
      );
    }

    return null;
  };

  // =========================================
  // MAIN CHECK-IN VIEW
  // =========================================
  const CheckInView = () => {
    const timeGreeting = () => {
      const hour = new Date().getHours();
      if (hour < 12) return { text: 'Good morning', emoji: '☀️' };
      if (hour < 17) return { text: 'Good afternoon', emoji: '🌤️' };
      return { text: 'Good evening', emoji: '🌙' };
    };
    const greeting = timeGreeting();

    const showReflectionSections = selectedAction !== null;
    const showHelpersSection = selectedAction && selectedAction !== 'nottoday';
    const canSave = selectedAction !== null && (selectedAction !== 'other' || somethingElseText.trim());

    return (
      <Card>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: 36, marginBottom: 8, animation: 'gentleWave 2s ease-in-out infinite' }}>
            {greeting.emoji}
          </div>
          <h1 style={{
            fontFamily: fonts.heading,
            fontSize: 24,
            fontWeight: 600,
            color: colors.text,
            margin: '0 0 4px 0',
          }}>
            {greeting.text}!
          </h1>
        </div>

        {/* Identity Reminder */}
        <div style={{
          background: `linear-gradient(135deg, ${colors.successLight} 0%, ${colors.successMedium} 100%)`,
          borderRadius: 16,
          padding: '16px 20px',
          marginBottom: 24,
          textAlign: 'center',
          border: '1px solid rgba(74, 124, 89, 0.2)',
        }}>
          <p style={{
            fontFamily: fonts.body,
            fontSize: 11,
            color: '#5C7A6B',
            textTransform: 'uppercase',
            letterSpacing: 0.5,
            margin: '0 0 8px 0',
          }}>
            Remember who you're becoming
          </p>
          <p style={{
            fontFamily: fonts.heading,
            fontSize: 18,
            fontWeight: 600,
            color: colors.primary,
            margin: 0,
            lineHeight: 1.4,
          }}>
            "{userData.identity}"
          </p>
        </div>

        {/* Streak Display - Above Stone Visual */}
        <StreakDisplay streak={streakCount} totalStones={totalStones} />

        {/* Stone Collection Visual */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: colors.background,
          borderRadius: 20,
          padding: 24,
          marginBottom: 24,
        }}>
          <TodaysStone collected={newStoneAdded} />

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: 0.6 }}>
            <span style={{ fontSize: 24 }}>→</span>
            <span style={{ fontFamily: fonts.body, fontSize: 10, color: colors.textLight }}>complete</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <StoneJar stones={totalStones} showNewStone={showStoneAnimation} />
            <span style={{ fontFamily: fonts.mono, fontSize: 12, color: colors.textMuted, fontWeight: 500 }}>
              {totalStones} stones
            </span>
          </div>
        </div>

        {/* What did you do today? */}
        <div style={{ marginBottom: 24 }}>
          <p style={{
            fontFamily: fonts.body,
            fontSize: 15,
            fontWeight: 600,
            color: colors.text,
            margin: '0 0 4px 0',
          }}>
            What did you do today?
          </p>
          <p style={{
            fontFamily: fonts.body,
            fontSize: 12,
            color: colors.textLight,
            margin: '0 0 16px 0',
          }}>
            Single select — customized from onboarding
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <ActionOption
              selected={selectedAction === 'baseline'}
              onClick={() => setSelectedAction('baseline')}
              emoji="🌱"
              title="Baseline habit"
              subtitle={userData.baselineHabit}
            />
            <ActionOption
              selected={selectedAction === 'capacity'}
              onClick={() => setSelectedAction('capacity')}
              emoji="⚡"
              title="My expanded version"
              subtitle={userData.capacityHabit}
            />
            <ActionOption
              selected={selectedAction === 'other'}
              onClick={() => setSelectedAction('other')}
              emoji="✨"
              title="Something else"
            />
            {selectedAction === 'other' && (
              <div style={{ marginLeft: 36, marginTop: 4 }}>
                <input
                  type="text"
                  value={somethingElseText}
                  onChange={(e) => setSomethingElseText(e.target.value)}
                  placeholder="What did you do?"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: 10,
                    border: `2px solid ${colors.border}`,
                    fontSize: 14,
                    fontFamily: fonts.body,
                    color: colors.text,
                    background: colors.card,
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            )}
            <ActionOption
              selected={selectedAction === 'nottoday'}
              onClick={() => setSelectedAction('nottoday')}
              emoji="🌧️"
              title="Not today"
              variant="nottoday"
            />
          </div>
        </div>

        {/* Expandable Reflection Sections */}
        {showReflectionSections && (
          <div style={{
            borderTop: `1px solid ${colors.border}`,
            paddingTop: 24,
            animation: 'fadeIn 0.3s ease',
          }}>
            {/* What got in the way? - Only for "Not today" */}
            {selectedAction === 'nottoday' && (
              <div style={{ marginBottom: 24 }}>
                <p style={{
                  fontFamily: fonts.body,
                  fontSize: 14,
                  fontWeight: 600,
                  color: colors.text,
                  margin: '0 0 4px 0',
                }}>
                  What got in the way?
                </p>
                <p style={{
                  fontFamily: fonts.body,
                  fontSize: 12,
                  color: colors.textLight,
                  margin: '0 0 12px 0',
                }}>
                  Optional — select up to 3
                </p>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {obstacleOptions.map((option) => (
                    <SelectChip
                      key={option.id}
                      selected={selectedObstacles.includes(option.id)}
                      onClick={() => toggleObstacle(option.id)}
                      emoji={option.emoji}
                      label={option.label}
                      disabled={selectedObstacles.length >= 3 && !selectedObstacles.includes(option.id)}
                    />
                  ))}
                </div>

                {selectedObstacles.includes('other') && (
                  <input
                    type="text"
                    value={customObstacle}
                    onChange={(e) => setCustomObstacle(e.target.value)}
                    placeholder="What else got in the way?"
                    maxLength={100}
                    style={{
                      width: '100%',
                      marginTop: 12,
                      padding: '12px 16px',
                      borderRadius: 10,
                      border: `2px solid ${colors.border}`,
                      fontSize: 14,
                      fontFamily: fonts.body,
                      color: colors.text,
                      background: colors.card,
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                )}

                {/* Tell me more - for obstacles */}
                <div style={{ marginTop: 16 }}>
                  <p style={{
                    fontFamily: fonts.body,
                    fontSize: 13,
                    color: colors.textMuted,
                    margin: '0 0 8px 0',
                  }}>
                    Tell me more <span style={{ color: colors.textLight }}>(optional)</span>
                  </p>
                  <div style={{ position: 'relative' }}>
                    <textarea
                      value={obstacleTellMore}
                      onChange={(e) => setObstacleTellMore(e.target.value.slice(0, 200))}
                      placeholder="Any context that might help you adjust..."
                      maxLength={200}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        paddingBottom: 28,
                        borderRadius: 10,
                        border: `2px solid ${colors.border}`,
                        fontSize: 14,
                        fontFamily: fonts.body,
                        color: colors.text,
                        background: colors.card,
                        outline: 'none',
                        boxSizing: 'border-box',
                        resize: 'none',
                        minHeight: 80,
                      }}
                    />
                    <span style={{
                      position: 'absolute',
                      bottom: 8,
                      right: 12,
                      fontFamily: fonts.mono,
                      fontSize: 11,
                      color: obstacleTellMore.length >= 180 ? colors.fire : colors.textLight,
                    }}>
                      {obstacleTellMore.length}/200
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* What helped? - Only for completed habits (not "Not today") */}
            {showHelpersSection && (
              <div style={{ marginBottom: 24 }}>
                <p style={{
                  fontFamily: fonts.body,
                  fontSize: 14,
                  fontWeight: 600,
                  color: colors.text,
                  margin: '0 0 4px 0',
                }}>
                  Anything you noticed that helped?
                </p>
                <p style={{
                  fontFamily: fonts.body,
                  fontSize: 12,
                  color: colors.textLight,
                  margin: '0 0 12px 0',
                }}>
                  Optional — select up to 3
                </p>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {helperOptions.map((option) => (
                    <SelectChip
                      key={option.id}
                      selected={selectedHelpers.includes(option.id)}
                      onClick={() => toggleHelper(option.id)}
                      emoji={option.emoji}
                      label={option.label}
                      disabled={selectedHelpers.length >= 3 && !selectedHelpers.includes(option.id)}
                    />
                  ))}
                </div>

                {selectedHelpers.includes('other') && (
                  <input
                    type="text"
                    value={customHelper}
                    onChange={(e) => setCustomHelper(e.target.value)}
                    placeholder="What else helped?"
                    maxLength={100}
                    style={{
                      width: '100%',
                      marginTop: 12,
                      padding: '12px 16px',
                      borderRadius: 10,
                      border: `2px solid ${colors.border}`,
                      fontSize: 14,
                      fontFamily: fonts.body,
                      color: colors.text,
                      background: colors.card,
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                )}

                {/* Tell me more - for helpers */}
                <div style={{ marginTop: 16 }}>
                  <p style={{
                    fontFamily: fonts.body,
                    fontSize: 13,
                    color: colors.textMuted,
                    margin: '0 0 8px 0',
                  }}>
                    Tell me more <span style={{ color: colors.textLight }}>(optional)</span>
                  </p>
                  <div style={{ position: 'relative' }}>
                    <textarea
                      value={helperTellMore}
                      onChange={(e) => setHelperTellMore(e.target.value.slice(0, 200))}
                      placeholder="What made it work today..."
                      maxLength={200}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        paddingBottom: 28,
                        borderRadius: 10,
                        border: `2px solid ${colors.border}`,
                        fontSize: 14,
                        fontFamily: fonts.body,
                        color: colors.text,
                        background: colors.card,
                        outline: 'none',
                        boxSizing: 'border-box',
                        resize: 'none',
                        minHeight: 80,
                      }}
                    />
                    <span style={{
                      position: 'absolute',
                      bottom: 8,
                      right: 12,
                      fontFamily: fonts.mono,
                      fontSize: 11,
                      color: helperTellMore.length >= 180 ? colors.fire : colors.textLight,
                    }}>
                      {helperTellMore.length}/200
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: 12 }}>
          <Button
            variant="primary"
            size="large"
            onClick={handleSaveCheckin}
            disabled={!canSave}
            style={{ flex: 1 }}
          >
            {selectedAction === 'nottoday' ? 'Save check-in' : '✓ Save & add my stone'}
          </Button>
        </div>
      </Card>
    );
  };

  // =========================================
  // COMPLETED VIEW (Stone Collected)
  // =========================================
  const CompletedView = () => {
    const celebrations = [
      { emoji: '🎉', message: 'Stone collected!' },
      { emoji: '💎', message: 'Another one for the jar!' },
      { emoji: '⭐', message: 'You showed up!' },
    ];
    const randomCelebration = celebrations[Math.floor(Math.random() * celebrations.length)];

    return (
      <Card glow={true}>
        {showConfetti && <Confetti />}

        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{
            width: 90,
            height: 90,
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${colors.successLight} 0%, ${colors.successMedium} 100%)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            fontSize: 44,
            animation: 'celebrateBounce 0.6s ease-out',
          }}>
            {randomCelebration.emoji}
          </div>
          <h1 style={{
            fontFamily: fonts.heading,
            fontSize: 28,
            fontWeight: 700,
            color: colors.primary,
            margin: 0,
          }}>
            {randomCelebration.message}
          </h1>
        </div>

        {/* Jar with identity underneath */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          background: colors.background,
          borderRadius: 20,
          padding: 24,
          marginBottom: 24,
        }}>
          <StoneJar stones={totalStones} size="large" />
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 16 }}>
            {streakCount >= 2 && <span style={{ fontSize: 24, animation: 'fireGlow 1s ease-in-out infinite' }}>🔥</span>}
            <span style={{
              fontFamily: fonts.heading,
              fontSize: 32,
              fontWeight: 700,
              color: streakCount >= 2 ? colors.fire : colors.primary,
            }}>
              {totalStones}
            </span>
            <span style={{ fontFamily: fonts.body, fontSize: 16, color: colors.textMuted }}>
              stones
            </span>
          </div>

          {/* Identity under the jar */}
          <p style={{
            fontFamily: fonts.heading,
            fontSize: 15,
            fontWeight: 500,
            color: colors.primary,
            margin: '16px 0 0 0',
            textAlign: 'center',
            fontStyle: 'italic',
          }}>
            "{userData.identity}"
          </p>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <Button variant="celebration" style={{ flex: 1 }} onClick={() => setCurrentView('progress')}>
            See my jar 🏺
          </Button>
          <Button variant="secondary" style={{ flex: 1 }} onClick={() => {
            resetCheckin();
            setCurrentView('checkin');
          }}>
            Done for today
          </Button>
        </div>
      </Card>
    );
  };

  // =========================================
  // PROGRESS VIEW (Jar Collection)
  // =========================================
  const ProgressView = () => (
    <Card>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <h1 style={{
          fontFamily: fonts.heading,
          fontSize: 24,
          fontWeight: 600,
          color: colors.text,
          margin: '0 0 8px 0',
        }}>
          Your Stone Collection
        </h1>
      </div>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        background: `linear-gradient(180deg, ${colors.background} 0%, ${colors.backgroundDark} 100%)`,
        borderRadius: 24,
        padding: 32,
        marginBottom: 24,
      }}>
        <StoneJar stones={totalStones} size="large" />
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 20 }}>
          <span style={{ fontFamily: fonts.heading, fontSize: 48, fontWeight: 700, color: colors.primary }}>
            {totalStones}
          </span>
          <span style={{ fontFamily: fonts.body, fontSize: 18, color: '#5C7A6B' }}>
            stones collected
          </span>
        </div>

        {/* Identity under the jar */}
        <p style={{
          fontFamily: fonts.heading,
          fontSize: 15,
          fontWeight: 500,
          color: colors.primary,
          margin: '16px 0 0 0',
          textAlign: 'center',
          fontStyle: 'italic',
        }}>
          "{userData.identity}"
        </p>
      </div>

      <Button variant="secondary" onClick={() => {
        resetCheckin();
        setCurrentView('checkin');
      }} style={{ width: '100%' }}>
        ← Back to today
      </Button>
    </Card>
  );

  // =========================================
  // RECOVERY VIEW (Not Today)
  // =========================================
  const RecoveryView = () => (
    <Card>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <div style={{
          width: 72,
          height: 72,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #FFF3E0 0%, #FFE0B2 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px',
          fontSize: 36,
        }}>
          🌤️
        </div>
        <h1 style={{
          fontFamily: fonts.heading,
          fontSize: 22,
          fontWeight: 600,
          color: colors.text,
          margin: '0 0 8px 0',
        }}>
          See you tomorrow
        </h1>
        <p style={{
          fontFamily: fonts.body,
          fontSize: 14,
          color: colors.textMuted,
          margin: 0,
        }}>
          Rest is part of the process too.
        </p>
      </div>

      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 20,
        background: colors.background,
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
      }}>
        <StoneJar stones={totalStones} />
        <div>
          <p style={{ fontFamily: fonts.body, fontSize: 14, color: colors.textMuted, margin: '0 0 4px 0' }}>
            Your jar has
          </p>
          <p style={{ fontFamily: fonts.heading, fontSize: 28, fontWeight: 600, color: colors.primary, margin: 0 }}>
            {totalStones} stones
          </p>
        </div>
      </div>

      <div style={{
        background: `linear-gradient(135deg, ${colors.successLight} 0%, ${colors.successMedium} 100%)`,
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
        border: '1px solid rgba(74, 124, 89, 0.2)',
      }}>
        <p style={{
          fontFamily: fonts.body,
          fontSize: 14,
          color: colors.primary,
          margin: 0,
          textAlign: 'center',
          lineHeight: 1.5,
        }}>
          💚 Nothing is lost today. You're still building—stone by stone.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <Button variant="primary" onClick={() => {
          resetCheckin();
          setCurrentView('checkin');
        }} style={{ width: '100%' }}>
          I'll collect my stone tomorrow 💪
        </Button>
        <Button variant="ghost" onClick={() => {
          setSelectedAction(null);
          setCurrentView('checkin');
        }} style={{ width: '100%' }}>
          Actually, let me try now
        </Button>
      </div>
    </Card>
  );

  // =========================================
  // MAIN RENDER
  // =========================================
  const renderView = () => {
    switch (currentView) {
      case 'checkin': return <CheckInView />;
      case 'completed': return <CompletedView />;
      case 'progress': return <ProgressView />;
      case 'recovery': return <RecoveryView />;
      default: return <CheckInView />;
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: `linear-gradient(180deg, ${colors.background} 0%, ${colors.backgroundDark} 50%, #E8E4DF 100%)`,
      padding: '40px 20px',
      fontFamily: fonts.body,
    }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=DM+Sans:wght@400;500;600&family=Fraunces:wght@400;500;600;700&display=swap" rel="stylesheet" />

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes celebrateBounce {
          0% { transform: scale(0); }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); }
        }
        @keyframes confettiFall {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(500px) rotate(720deg); opacity: 0; }
        }
        @keyframes fireGlow {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        @keyframes stoneGlow {
          0%, 100% { box-shadow: 0 4px 16px rgba(74, 124, 89, 0.4), 0 0 20px rgba(74, 124, 89, 0.2); }
          50% { box-shadow: 0 4px 24px rgba(74, 124, 89, 0.6), 0 0 30px rgba(74, 124, 89, 0.3); }
        }
        @keyframes stoneDrop {
          0% { transform: translateY(0); opacity: 1; }
          60% { transform: translateY(100px); opacity: 1; }
          80% { transform: translateY(90px); opacity: 1; }
          100% { transform: translateY(100px); opacity: 0; }
        }
        @keyframes gentleWave {
          0%, 100% { transform: rotate(-5deg); }
          50% { transform: rotate(5deg); }
        }
        * { box-sizing: border-box; }
        button:hover:not(:disabled) { transform: translateY(-1px); }
        button:active:not(:disabled) { transform: translateY(0); }
        input:focus, textarea:focus {
          border-color: #4A7C59 !important;
          outline: none;
        }
      `}</style>

      <div style={{ maxWidth: 420, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: `linear-gradient(135deg, ${colors.primaryLight} 0%, ${colors.primary} 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 18,
            }}>
              🌱
            </div>
            <span style={{ fontFamily: fonts.heading, fontSize: 18, fontWeight: 600, color: colors.primary }}>
              Habit Lab
            </span>
          </div>
        </div>

        {/* Demo Controls */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
          {[
            { id: 'checkin', label: '☀️ Check-in' },
            { id: 'completed', label: '🎉 Done' },
            { id: 'progress', label: '🏺 Progress' },
            { id: 'recovery', label: '🌤️ Recovery' },
          ].map((view) => (
            <button
              key={view.id}
              onClick={() => {
                resetCheckin();
                setCurrentView(view.id);
                if (view.id === 'completed') {
                  setNewStoneAdded(true);
                  setShowConfetti(true);
                  setTimeout(() => setShowConfetti(false), 3000);
                }
              }}
              style={{
                padding: '6px 12px',
                borderRadius: 16,
                border: currentView === view.id ? `2px solid ${colors.primaryLight}` : `1px solid ${colors.borderLight}`,
                background: currentView === view.id ? 'rgba(74, 124, 89, 0.1)' : 'transparent',
                fontFamily: fonts.body,
                fontSize: 12,
                color: currentView === view.id ? colors.primary : colors.textLight,
                cursor: 'pointer',
              }}
            >
              {view.label}
            </button>
          ))}
        </div>

        <div style={{ animation: 'fadeIn 0.4s ease' }}>
          {renderView()}
        </div>
      </div>
    </div>
  );
};

export default DailyCheckInMockupsV5;
