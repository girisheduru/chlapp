
import React, { useState, useMemo } from 'react';

// Atomic Habits - Home Screen V8
// Updates:
// - Mini stone jar icon in header (matches tile jars)

const HomeScreenV8 = () => {
  const [expandedTile, setExpandedTile] = useState(null);
  const [hoveredTile, setHoveredTile] = useState(null);

  const currentHour = new Date().getHours();
  
  const getGreeting = () => {
    if (currentHour >= 5 && currentHour < 12) return { text: 'Good morning', emoji: '🌅' };
    if (currentHour >= 12 && currentHour < 17) return { text: 'Good afternoon', emoji: '☀️' };
    if (currentHour >= 17 && currentHour < 21) return { text: 'Good evening', emoji: '🌆' };
    return { text: 'Hey there', emoji: '🌙' };
  };

  const greeting = getGreeting();

  const userHabits = [
    {
      id: 1,
      name: 'Exercise',
      identity: "I am someone who takes care of my body",
      baselineHabit: "Do one supportive action (stretch, hydrate, rest)",
      capacityHabit: "45-minute gym session",
      anchor: { emoji: '☕', label: 'After my morning coffee' },
      funElements: ['Music I love', 'Movement that feels right'],
      environmentSetup: ['Gym bag packed', 'Shoes visible'],
      totalStones: 27,
      streakDays: 8,
      lastCheckIn: { done: true, time: '8:42 AM' },
      checkInTime: '8:00 AM',
      color: '#4A7C59',
    },
    {
      id: 2,
      name: 'Reading',
      identity: "I am someone who feeds my mind daily",
      baselineHabit: "Read one page",
      capacityHabit: "Read for 30 minutes",
      anchor: { emoji: '🍵', label: 'With my evening tea' },
      funElements: ['My cozy setup', 'A look or vibe I like'],
      environmentSetup: ['Book on nightstand', 'Reading light ready'],
      totalStones: 14,
      streakDays: 3,
      lastCheckIn: { done: false, time: null },
      checkInTime: '9:00 PM',
      color: '#6B5D4D',
    },
    {
      id: 3,
      name: 'Meditation',
      identity: "I am someone who cultivates inner calm",
      baselineHabit: "Three slow breaths, hand on heart",
      capacityHabit: "10-minute guided meditation",
      anchor: { emoji: '🌅', label: 'Right after waking up' },
      funElements: ['Movement that feels right', 'My cozy setup'],
      environmentSetup: ['Cushion in place', 'App ready'],
      totalStones: 42,
      streakDays: 14,
      lastCheckIn: { done: true, time: '6:15 AM' },
      checkInTime: '6:00 AM',
      color: '#5C6B8A',
    },
  ];

  const getEncouragement = () => {
    const habitsCheckedToday = userHabits.filter(h => h.lastCheckIn.done).length;
    const longestStreakHabit = userHabits.reduce((max, h) => 
      h.streakDays > max.streakDays ? h : max, userHabits[0]);
    
    const allFunElements = [...new Set(userHabits.flatMap(h => h.funElements))];
    const funMention = allFunElements.length > 0 
      ? allFunElements[0].toLowerCase().replace('i ', 'you ').replace(' i ', ' you ')
      : null;

    if (habitsCheckedToday === userHabits.length) {
      return {
        message: "You've collected all your stones today! 🎉",
        subtext: "Rest well — you've earned it.",
      };
    }
    
    if (longestStreakHabit.streakDays >= 14) {
      return {
        message: `Wow! ${longestStreakHabit.streakDays} days with ${longestStreakHabit.name.toLowerCase()}!`,
        subtext: "That's quiet consistency doing its thing.",
      };
    }
    
    if (longestStreakHabit.streakDays >= 7) {
      return {
        message: `A week strong with ${longestStreakHabit.name.toLowerCase()} — nice!`,
        subtext: "Small actions, real momentum.",
      };
    }

    if (habitsCheckedToday > 0) {
      const remaining = userHabits.length - habitsCheckedToday;
      return {
        message: "Nice start to your day!",
        subtext: `${remaining} more stone${remaining > 1 ? 's' : ''} waiting to be collected.`,
      };
    }

    if (currentHour >= 5 && currentHour < 12) {
      return {
        message: "A fresh day, a fresh start.",
        subtext: funMention 
          ? `Remember: ${funMention} makes the journey better.` 
          : "Small steps lead to big changes.",
      };
    }

    return {
      message: "Every moment is a chance to begin.",
      subtext: "Pick one habit. Start small. Collect your stone.",
    };
  };

  const encouragement = getEncouragement();

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
  };

  const fonts = {
    heading: "'Fraunces', Georgia, serif",
    body: "'DM Sans', system-ui, sans-serif",
    mono: "'DM Mono', monospace",
  };

  // Tiny Header Jar Icon
  const HeaderJarIcon = () => (
    <svg width="20" height="22" viewBox="0 0 48 52" fill="none">
      <path 
        d="M8 18C6 18 4 20 4 24V44C4 48 8 50 12 50H36C40 50 44 48 44 44V24C44 20 42 18 40 18"
        stroke={colors.primaryLight}
        strokeWidth="3"
        fill="rgba(74, 124, 89, 0.1)"
      />
      <rect x="12" y="8" width="24" height="10" rx="2" stroke={colors.primaryLight} strokeWidth="3" fill="rgba(74, 124, 89, 0.1)" />
      <rect x="10" y="4" width="28" height="6" rx="3" fill={colors.primaryLight} opacity="0.4" />
      {/* A few stones inside */}
      <circle cx="18" cy="40" r="4" fill={colors.primaryLight} opacity="0.7" />
      <circle cx="30" cy="42" r="3.5" fill={colors.primary} opacity="0.8" />
      <circle cx="24" cy="36" r="4" fill={colors.primaryLight} opacity="0.6" />
      <circle cx="20" cy="32" r="3" fill={colors.primary} opacity="0.7" />
      <circle cx="28" cy="34" r="3.5" fill={colors.primaryLight} opacity="0.8" />
    </svg>
  );

  // Mini Stone Jar for tiles
  const MiniStoneJar = ({ stones, color }) => {
    const stonePositions = useMemo(() => {
      const positions = [];
      const displayStones = Math.min(stones, 12);
      for (let i = 0; i < displayStones; i++) {
        const row = Math.floor(i / 4);
        const col = i % 4;
        positions.push({
          left: 4 + col * 10 + (row % 2 ? 5 : 0),
          bottom: 4 + row * 8,
          size: 6 + (i % 3),
        });
      }
      return positions;
    }, [stones]);

    return (
      <div style={{ width: 44, height: 48, position: 'relative' }}>
        <svg width="44" height="48" viewBox="0 0 48 52" fill="none">
          <path 
            d="M8 18C6 18 4 20 4 24V44C4 48 8 50 12 50H36C40 50 44 48 44 44V24C44 20 42 18 40 18"
            stroke={colors.border}
            strokeWidth="2"
            fill="rgba(255,255,255,0.5)"
          />
          <rect x="12" y="8" width="24" height="10" rx="2" stroke={colors.border} strokeWidth="2" fill="rgba(255,255,255,0.5)" />
          <rect x="10" y="4" width="28" height="6" rx="3" fill={colors.borderLight} />
        </svg>
        <div style={{
          position: 'absolute',
          bottom: 6,
          left: 6,
          right: 6,
          top: 18,
          overflow: 'hidden',
        }}>
          {stonePositions.map((pos, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: pos.left,
                bottom: pos.bottom,
                width: pos.size,
                height: pos.size,
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${color} 0%, ${colors.primaryLight} 100%)`,
                opacity: 0.8 + (i % 3) * 0.07,
              }}
            />
          ))}
        </div>
      </div>
    );
  };

  // Summary Row for expanded plan
  const SummaryRow = ({ icon, label, value, bg }) => (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
      <div style={{
        width: 32,
        height: 32,
        borderRadius: 8,
        background: bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 14,
        flexShrink: 0,
      }}>
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ 
          fontFamily: fonts.body, 
          fontSize: 10, 
          color: colors.textLight, 
          margin: '0 0 2px 0', 
          textTransform: 'uppercase', 
          letterSpacing: 0.5 
        }}>
          {label}
        </p>
        <p style={{ 
          fontFamily: fonts.body, 
          fontSize: 13, 
          fontWeight: 500, 
          color: colors.text, 
          margin: 0,
          lineHeight: 1.4,
        }}>
          {value}
        </p>
      </div>
    </div>
  );

  // Habit Tile Component
  const HabitTile = ({ habit }) => {
    const isExpanded = expandedTile === habit.id;
    const isCheckedToday = habit.lastCheckIn.done;
    const isHovered = hoveredTile === habit.id;

    const formatFunElements = () => {
      return habit.funElements
        .map(f => f.replace(/\bI\b/g, 'you').replace(/\bmy\b/gi, 'your'))
        .slice(0, 2)
        .join(', and ');
    };

    return (
      <div
        onMouseEnter={() => setHoveredTile(habit.id)}
        onMouseLeave={() => setHoveredTile(null)}
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
        {/* Main Tile Content */}
        <div style={{ padding: 20 }}>
          {/* Identity as title - full width */}
          <h3 style={{
            fontFamily: fonts.heading,
            fontSize: 16,
            fontWeight: 600,
            color: colors.text,
            margin: '0 0 10px 0',
            lineHeight: 1.4,
          }}>
            "{habit.identity}"
          </h3>

          {/* Baseline habit */}
          <p style={{
            fontFamily: fonts.body,
            fontSize: 13,
            color: colors.textMuted,
            margin: '0 0 14px 0',
            lineHeight: 1.4,
          }}>
            🎯 {habit.baselineHabit}
          </p>

          {/* Stats row: Three columns - Stones | Streak | Done */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            padding: '14px 16px',
            background: colors.background,
            borderRadius: 12,
            marginBottom: 14,
          }}>
            {/* Left: Jar + Stones (stacked) */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 10,
              flex: 1,
            }}>
              <MiniStoneJar stones={habit.totalStones} color={habit.color} />
              
              {/* Stones stacked: number on top, label below */}
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column',
                alignItems: 'center',
              }}>
                <span style={{
                  fontFamily: fonts.mono,
                  fontSize: 22,
                  fontWeight: 600,
                  color: habit.color,
                  lineHeight: 1,
                }}>
                  {habit.totalStones}
                </span>
                <span style={{
                  fontFamily: fonts.body,
                  fontSize: 11,
                  color: colors.textMuted,
                  marginTop: 2,
                }}>
                  stones
                </span>
              </div>
            </div>

            {/* Center: Streak stacked (fire on top, days below) */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              flex: 1,
              justifyContent: 'center',
            }}>
              <span style={{ 
                fontSize: 20,
                lineHeight: 1,
              }}>
                🔥
              </span>
              <span style={{
                fontFamily: fonts.mono,
                fontSize: 13,
                color: habit.streakDays >= 7 ? '#E65100' : colors.textMuted,
                fontWeight: habit.streakDays >= 7 ? 600 : 500,
                marginTop: 2,
              }}>
                {habit.streakDays} days
              </span>
            </div>

            {/* Right: Done badge with time underneath */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              flex: 1,
              justifyContent: 'center',
            }}>
              {isCheckedToday ? (
                <>
                  <div style={{
                    background: colors.successLight,
                    borderRadius: 8,
                    padding: '6px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                    border: `1px solid ${colors.successMedium}`,
                  }}>
                    <span style={{ fontSize: 12, color: colors.success }}>✓</span>
                    <span style={{
                      fontFamily: fonts.body,
                      fontSize: 12,
                      color: colors.success,
                      fontWeight: 600,
                    }}>Done</span>
                  </div>
                  <span style={{
                    fontFamily: fonts.mono,
                    fontSize: 11,
                    color: colors.textLight,
                    marginTop: 4,
                  }}>
                    {habit.lastCheckIn.time}
                  </span>
                </>
              ) : (
                // Empty state - maintains space
                <div style={{ height: 44 }} />
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 8 }}>
            <button
              onClick={() => console.log('Navigate to Daily Check-in for', habit.name)}
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
              onClick={() => console.log('Navigate to Reflection for', habit.name)}
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

          {/* Expand/Collapse button */}
          <button
            onClick={() => setExpandedTile(isExpanded ? null : habit.id)}
            style={{
              width: '100%',
              padding: '8px',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
            }}
          >
            <span style={{
              fontFamily: fonts.body,
              fontSize: 12,
              color: colors.textLight,
            }}>
              {isExpanded ? 'Hide plan' : 'View full plan'}
            </span>
            <span style={{
              fontSize: 10,
              color: colors.textLight,
              transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s ease',
            }}>
              ▼
            </span>
          </button>
        </div>

        {/* Expanded Plan Section */}
        {isExpanded && (
          <div style={{
            borderTop: `1px solid ${colors.border}`,
            padding: 20,
            background: colors.background,
            animation: 'slideDown 0.3s ease',
          }}>
            <p style={{
              fontFamily: fonts.body,
              fontSize: 11,
              fontWeight: 600,
              color: colors.textMuted,
              textTransform: 'uppercase',
              letterSpacing: 0.5,
              margin: '0 0 14px 0',
            }}>
              Your Habit Plan
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <SummaryRow
                icon="🪪"
                label="Identity"
                value={`"${habit.identity}"`}
                bg="#E8F5E9"
              />
              
              <div style={{ height: 1, background: colors.border }} />
              
              <SummaryRow
                icon="🎯"
                label="Baseline habit"
                value={habit.baselineHabit}
                bg="#FFF3CD"
              />
              
              <div style={{ height: 1, background: colors.border }} />
              
              <SummaryRow
                icon="⚡"
                label="When energy allows"
                value={habit.capacityHabit}
                bg="#E3F2FD"
              />
              
              <div style={{ height: 1, background: colors.border }} />
              
              <SummaryRow
                icon="🔗"
                label="Cue"
                value={habit.anchor.label}
                bg="#FCE4EC"
              />
              
              <div style={{ height: 1, background: colors.border }} />
              
              <SummaryRow
                icon="🎵"
                label="Enjoyment"
                value={`With ${formatFunElements()}`}
                bg="#FFF9E6"
              />
              
              <div style={{ height: 1, background: colors.border }} />
              
              <SummaryRow
                icon="👁️"
                label="Environment support"
                value={habit.environmentSetup.join(', ')}
                bg="#F3E5F5"
              />
              
              <div style={{ height: 1, background: colors.border }} />
              
              <SummaryRow
                icon="⏰"
                label="Check-in time"
                value={habit.checkInTime}
                bg="#E0F7FA"
              />
            </div>
          </div>
        )}
      </div>
    );
  };

  // Add New Habit Button
  const AddHabitButton = () => (
    <button
      onClick={() => console.log('Navigate to Onboarding')}
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
      <div style={{
        width: 48,
        height: 48,
        borderRadius: '50%',
        background: colors.background,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 24,
        color: colors.primaryLight,
      }}>
        +
      </div>
      <span style={{
        fontFamily: fonts.body,
        fontSize: 14,
        fontWeight: 500,
        color: colors.textMuted,
      }}>
        Add a new habit
      </span>
      <span style={{
        fontFamily: fonts.body,
        fontSize: 12,
        color: colors.textLight,
      }}>
        Start small, build identity
      </span>
    </button>
  );

  return (
    <div style={{
      minHeight: '100vh',
      background: `linear-gradient(180deg, ${colors.background} 0%, ${colors.backgroundDark} 50%, #E8E4DF 100%)`,
      padding: '32px 20px 40px',
      fontFamily: fonts.body,
    }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=DM+Sans:wght@400;500;600&family=Fraunces:wght@400;500;600;700&display=swap" rel="stylesheet" />

      <style>{`
        * { box-sizing: border-box; }
        button:hover:not(:disabled) { 
          transform: translateY(-1px); 
          opacity: 0.95;
        }
        button:active:not(:disabled) { transform: translateY(0); }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div style={{ maxWidth: 420, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          marginBottom: 28,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: `linear-gradient(135deg, ${colors.primaryLight} 0%, ${colors.primary} 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 18,
              boxShadow: '0 4px 12px rgba(45, 90, 69, 0.2)',
            }}>
              🌱
            </div>
            <span style={{ 
              fontFamily: fonts.heading, 
              fontSize: 19, 
              fontWeight: 600, 
              color: colors.primary 
            }}>
              Atomic
            </span>
          </div>

          {/* Total stones - with matching jar icon */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 14px 6px 8px',
            background: colors.card,
            borderRadius: 20,
            border: `1px solid ${colors.border}`,
            boxShadow: '0 2px 8px rgba(92, 75, 58, 0.06)',
          }}>
            <HeaderJarIcon />
            <span style={{
              fontFamily: fonts.mono,
              fontSize: 14,
              fontWeight: 600,
              color: colors.primary,
            }}>
              {userHabits.reduce((sum, h) => sum + h.totalStones, 0)}
            </span>
          </div>
        </div>

        {/* Greeting Card */}
        <div style={{
          background: colors.card,
          borderRadius: 20,
          padding: 24,
          marginBottom: 24,
          boxShadow: '0 8px 32px rgba(92, 75, 58, 0.08)',
          border: `1px solid ${colors.border}`,
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute',
            top: -20,
            right: -20,
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${colors.successLight} 0%, transparent 70%)`,
            opacity: 0.6,
          }} />

          <div style={{ position: 'relative' }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 8, 
              marginBottom: 8,
            }}>
              <span style={{ fontSize: 22 }}>{greeting.emoji}</span>
              <h1 style={{
                fontFamily: fonts.heading,
                fontSize: 24,
                fontWeight: 600,
                color: colors.text,
                margin: 0,
              }}>
                {greeting.text}
              </h1>
            </div>

            <p style={{
              fontFamily: fonts.body,
              fontSize: 15,
              fontWeight: 500,
              color: colors.text,
              margin: '0 0 6px 0',
              lineHeight: 1.5,
            }}>
              {encouragement.message}
            </p>
            <p style={{
              fontFamily: fonts.body,
              fontSize: 13,
              color: colors.textMuted,
              margin: 0,
              lineHeight: 1.5,
            }}>
              {encouragement.subtext}
            </p>
          </div>
        </div>

        {/* Section Label */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 16,
        }}>
          <h2 style={{
            fontFamily: fonts.heading,
            fontSize: 16,
            fontWeight: 600,
            color: colors.textMuted,
            margin: 0,
          }}>
            Your habits
          </h2>
          <span style={{
            fontFamily: fonts.body,
            fontSize: 12,
            color: colors.textLight,
          }}>
            {userHabits.filter(h => h.lastCheckIn.done).length}/{userHabits.length} checked in today
          </span>
        </div>

        {/* Habit Tiles */}
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: 16,
          marginBottom: 20,
        }}>
          {userHabits.map((habit, index) => (
            <div
              key={habit.id}
              style={{
                animation: `fadeInUp 0.4s ease ${index * 0.1}s both`,
              }}
            >
              <HabitTile habit={habit} />
            </div>
          ))}
        </div>

        {/* Add New Habit */}
        <AddHabitButton />

        {/* Bottom quote */}
        <div style={{
          textAlign: 'center',
          marginTop: 32,
          padding: '0 20px',
        }}>
          <p style={{
            fontFamily: fonts.heading,
            fontSize: 13,
            fontStyle: 'italic',
            color: colors.textLight,
            margin: 0,
            lineHeight: 1.6,
          }}>
            "Every action you take is a vote for the type of person you wish to become."
          </p>
          <p style={{
            fontFamily: fonts.body,
            fontSize: 11,
            color: colors.textLight,
            margin: '8px 0 0 0',
            opacity: 0.7,
          }}>
            — James Clear
          </p>
        </div>
      </div>
    </div>
  );
};

export default HomeScreenV8;
