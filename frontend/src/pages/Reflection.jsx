import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { colors, fonts } from '../constants/designTokens';
import { reflectionsAPI } from '../services/api';
import { UserMenu } from '../components';
import { parseUtcDate } from '../utils/dateUtils';

/**
 * Build userData and weekData from habit (from Home tile) for reflection flow.
 */
function buildReflectionData(habit) {
  const anchor = habit?.anchor;
  const anchorLabel = typeof anchor === 'string' ? anchor : anchor?.label ?? '—';
  const envSetup = Array.isArray(habit?.environmentSetup) ? habit.environmentSetup : [];
  const funElements = Array.isArray(habit?.funElements) ? habit.funElements : [];

  const userData = {
    identity: habit?.identity ?? 'I am someone who shows up',
    baselineHabit: habit?.baselineHabit ?? '—',
    expandedHabit: habit?.capacityHabit ?? '—',
    anchor: { emoji: '🔗', label: anchorLabel },
    environmentSetup: envSetup.length ? envSetup : ['—'],
    funElements: funElements.length ? funElements : ['—'],
    totalStones: habit?.totalStones ?? 0,
  };

  // Build week view from checkInHistory (actual check-in dates)
  const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const startOfWeek = new Date(today);
  const daysSinceMonday = (today.getDay() + 6) % 7; // 0=Mon, 6=Sun
  startOfWeek.setDate(today.getDate() - daysSinceMonday);
  const weekRange = `${formatShortDate(startOfWeek)} – ${formatShortDate(new Date(startOfWeek.getTime() + 6 * 24 * 60 * 60 * 1000))}`;

  // Use checkInHistory if available, otherwise fall back to calculating from streak
  const checkInHistory = habit?.checkInHistory ?? [];
  let checkInDates = new Set(checkInHistory);
  
  // Fallback: if checkInHistory is empty but we have streak data, calculate from currentStreak + lastCheckInDate
  if (checkInDates.size === 0 && habit?.lastCheckInDate && habit?.streakDays > 0) {
    const lastDateObj = parseUtcDate(habit.lastCheckInDate);
    if (lastDateObj) {
      const last = new Date(lastDateObj);
      last.setHours(0, 0, 0, 0);
      for (let i = 0; i < habit.streakDays; i++) {
        const d = new Date(last);
        d.setDate(last.getDate() - i);
        checkInDates.add(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`);
      }
    }
  }

  const msPerDay = 24 * 60 * 60 * 1000;
  const weekData = {
    weekRange,
    days: dayLabels.map((day, i) => {
      const dayDate = new Date(startOfWeek.getTime() + i * msPerDay);
      const dateStr = `${dayDate.getFullYear()}-${String(dayDate.getMonth() + 1).padStart(2, '0')}-${String(dayDate.getDate()).padStart(2, '0')}`;
      const type = checkInDates.has(dateStr) ? 'baseline' : 'skip';
      return {
        day,
        type,
        obstacle: null,
        helpers: [],
      };
    }),
  };

  return { userData, weekData };
}

function formatShortDate(d) {
  const month = d.toLocaleString('en-US', { month: 'short' });
  const date = d.getDate();
  return `${month} ${date}`;
}

// ----- Reusable components -----
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

function WeekTracker({ weekData, stats }) {
  const getDayColor = (type) => {
    switch (type) {
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
      <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginBottom: 14, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: colors.baseline, border: '1px solid rgba(74, 124, 89, 0.3)' }} />
          <span style={{ fontFamily: fonts.body, fontSize: 11, color: colors.textMuted }}>Nucleus</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: colors.expanded, border: '1px solid rgba(74, 124, 89, 0.4)' }} />
          <span style={{ fontFamily: fonts.body, fontSize: 11, color: colors.textMuted }}>Supernova</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: colors.skipped, border: '2px dashed #D4CFC7', boxSizing: 'border-box' }} />
          <span style={{ fontFamily: fonts.body, fontSize: 11, color: colors.textMuted }}>Rest day</span>
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 4px' }}>
        {weekData.days.map((day, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <div style={{
              width: 34,
              height: 34,
              borderRadius: '50%',
              background: getDayColor(day.type),
              border: day.type === 'skip' ? '2px dashed #D4CFC7' : '1px solid rgba(74, 124, 89, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxSizing: 'border-box',
            }}>
              {['baseline', 'expanded', 'other'].includes(day.type) && (
                <span style={{ color: colors.primary, fontSize: 13, fontWeight: 600 }}>✓</span>
              )}
            </div>
            <span style={{ fontFamily: fonts.body, fontSize: 10, color: colors.textLight, fontWeight: 500 }}>{day.day}</span>
          </div>
        ))}
      </div>
      <div style={{ textAlign: 'center', marginTop: 14, paddingTop: 12, borderTop: `1px solid ${colors.border}` }}>
        <span style={{ fontFamily: fonts.body, fontSize: 14, color: colors.text, fontWeight: 500 }}>{stats.daysShowedUp} of 7 days</span>
        <span style={{ fontFamily: fonts.body, fontSize: 14, color: colors.textMuted }}> — you showed up</span>
      </div>
    </div>
  );
}

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
    <span style={{ fontSize: 18, flexShrink: 0, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', background: colors.card, borderRadius: 8, border: `1px solid ${colors.border}` }}>
      {emoji}
    </span>
    <div>
      <p style={{ fontFamily: fonts.body, fontSize: 14, color: colors.text, margin: 0, lineHeight: 1.55 }}>{text}</p>
      {highlight && (
        <p style={{ fontSize: 13, color: colors.primaryLight, fontWeight: 500, margin: '6px 0 0 0', fontStyle: 'italic' }}>{highlight}</p>
      )}
    </div>
  </div>
);

const SmallStoneJar = ({ stones }) => {
  const jarHeight = 56;
  const jarWidth = 40;
  const stoneSize = 5;
  const stoneColors = ['#8B7355', '#A0826D', '#B8956C', '#7C9A82', '#6B8E7B', '#9CAF88'];
  const offsets = [
    { x: 0.3, y: 0.2, r: 3 }, { x: -0.5, y: 0.1, r: -4 }, { x: 0.7, y: -0.3, r: 5 },
    { x: -0.2, y: 0.4, r: -2 }, { x: 0.4, y: -0.1, r: 6 }, { x: -0.6, y: 0.3, r: -5 },
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

const StoneJar = ({ stones }) => {
  const jarHeight = 100;
  const jarWidth = 70;
  const stoneSize = 10;
  const stoneColors = ['#8B7355', '#A0826D', '#B8956C', '#C4A77D', '#7C9A82', '#6B8E7B', '#9CAF88', '#D4A574'];
  const offsets = [
    { x: 1.2, y: 0.8, r: 8 }, { x: -1.5, y: 0.3, r: -12 }, { x: 2.1, y: -0.9, r: 15 },
    { x: -0.6, y: 1.2, r: -6 }, { x: 1.4, y: -0.3, r: 18 }, { x: -1.8, y: 0.9, r: -15 },
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
    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
      <span style={{ fontFamily: fonts.body, fontSize: 11, color: colors.textLight }}>Not very aligned</span>
      <span style={{ fontFamily: fonts.body, fontSize: 11, color: colors.textLight }}>Very aligned</span>
    </div>
  </div>
);

const ReflectionQuestionInput = React.memo(({ question, value, onChange, placeholder }) => (
  <div style={{ marginBottom: 16 }}>
    <p style={{ fontFamily: fonts.body, fontSize: 13, fontWeight: 500, color: colors.text, margin: '0 0 8px 0' }}>
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
));

// ----- Main Reflection Page -----
export default function Reflection() {
  const location = useLocation();
  const navigate = useNavigate();
  const habit = location.state?.habit ?? null;

  const { userData, weekData } = useMemo(() => {
    if (!habit) return { userData: null, weekData: null };
    return buildReflectionData(habit);
  }, [habit]);

  const [currentScreen, setCurrentScreen] = useState(1);
  const [identityReflection, setIdentityReflection] = useState('');
  const [alignmentValue, setAlignmentValue] = useState(50);
  const [reflectionQ1, setReflectionQ1] = useState('');
  const [reflectionQ2, setReflectionQ2] = useState('');
  const [selectedExperiment, setSelectedExperiment] = useState(null);
  const [experimentTexts, setExperimentTexts] = useState({});
  const [suggestion, setSuggestion] = useState(null);
  const [suggestionLoading, setSuggestionLoading] = useState(false);
  const [suggestionError, setSuggestionError] = useState(null);
  const [reflectionItemsLoading, setReflectionItemsLoading] = useState(false);
  const [reflectionItemsError, setReflectionItemsError] = useState(null);
  const [apiReflectionData, setApiReflectionData] = useState(null);

  const habitId = habit?.id ?? null;

  // Load LLM-generated reflection items and previously saved answers in parallel
  useEffect(() => {
    if (!habitId) return;
    let cancelled = false;
    setReflectionItemsLoading(true);
    setReflectionItemsError(null);

    // Fetch LLM reflection items
    const fetchItems = reflectionsAPI
      .getReflectionItems(habitId)
      .then((data) => {
        if (!cancelled && data) setApiReflectionData(data);
      })
      .catch((err) => {
        if (!cancelled) {
          setReflectionItemsError(err?.message || 'Could not load reflection');
          setApiReflectionData(null);
        }
      })
      .finally(() => {
        if (!cancelled) setReflectionItemsLoading(false);
      });

    // Fetch previously saved reflection answers (if from current week)
    const fetchSaved = reflectionsAPI
      .getLatestReflectionAnswers(habitId)
      .then((saved) => {
        if (!cancelled && saved) {
          // Only restore if the saved reflection is from the current week
          const isCurrentWeek = saved.weekRange && weekData?.weekRange && saved.weekRange === weekData.weekRange;
          if (isCurrentWeek) {
            // Do not restore reflection Q1, Q2, or identity reflection — user starts fresh each time
            if (saved.identityAlignmentValue != null) setAlignmentValue(saved.identityAlignmentValue);
            if (saved.selectedExperiment) {
              const ex = saved.selectedExperiment;
              const valid = ['maintain', 'identity', 'starter_habit', 'full_habit', 'habit_stack', 'enjoyment', 'habit_environment'];
              setSelectedExperiment(valid.includes(ex) ? ex : 'maintain');
            }
            // Restore all experiment texts (not just the selected one)
            if (saved.experimentTexts && typeof saved.experimentTexts === 'object') {
              setExperimentTexts((prev) => ({ ...prev, ...saved.experimentTexts }));
            } else if (saved.experimentText && saved.selectedExperiment && saved.selectedExperiment !== 'maintain') {
              // Legacy fallback: only had single experimentText
              setExperimentTexts((prev) => ({ ...prev, [saved.selectedExperiment]: saved.experimentText }));
            }
          }
        }
      });

    return () => { cancelled = true; };
  }, [habitId]);

  // When entering Screen 2, fetch one LLM suggestion based on Screen 1 reflection.
  // Do NOT include suggestionLoading in deps: when we set it true, React re-ran this effect,
  // ran cleanup (cancelled=true), so the response was ignored. Only re-run when screen/habit/answers change.
  useEffect(() => {
    if (currentScreen !== 2 || !habitId) return;
    if (suggestion != null) return;
    let cancelled = false;
    console.log('[Reflection Screen 2] Starting getReflectionSuggestion', { habitId });
    setSuggestionLoading(true);
    setSuggestionError(null);
    reflectionsAPI
      .getReflectionSuggestion({
        habitId,
        reflectionQ1: reflectionQ1 || null,
        reflectionQ2: reflectionQ2 || null,
        identityReflection: identityReflection || null,
        identityAlignmentValue: alignmentValue,
      })
      .then((data) => {
        console.log('[Reflection Screen 2] getReflectionSuggestion success', data);
        if (!cancelled && data) setSuggestion(data);
      })
      .catch((err) => {
        console.error('[Reflection Screen 2] getReflectionSuggestion error', err);
        if (!cancelled) {
          setSuggestionError(err?.message || 'Could not load suggestion');
          setSuggestion(null);
        }
      })
      .finally(() => {
        console.log('[Reflection Screen 2] getReflectionSuggestion finally (cancelled=', cancelled, ')');
        if (!cancelled) setSuggestionLoading(false);
      });
    return () => { cancelled = true; };
  }, [currentScreen, habitId, suggestion, reflectionQ1, reflectionQ2, identityReflection, alignmentValue]);

  // Reset suggestion when going back to Screen 1 so next time we get a fresh suggestion
  useEffect(() => {
    if (currentScreen === 1) setSuggestion(null);
  }, [currentScreen]);

  const stats = useMemo(() => {
    if (!weekData || !weekData.days) {
      return { daysShowedUp: 0, skipObstacles: [], showedUpDespiteLowEnergy: 0 };
    }
    return {
      daysShowedUp: weekData.days.filter(d => ['baseline', 'expanded', 'other'].includes(d.type)).length,
      skipObstacles: weekData.days.filter(d => d.type === 'skip').map(d => d.obstacle),
      showedUpDespiteLowEnergy: weekData.days.filter(d =>
        ['baseline', 'expanded', 'other'].includes(d.type) && d.obstacle === 'energy'
      ).length,
    };
  }, [weekData]);

  const insights = useMemo(() => {
    const apiInsights = Array.isArray(apiReflectionData?.insights) ? apiReflectionData.insights : [];
    if (apiInsights.length > 0) {
      return apiInsights.map((item, i) => ({
        id: `api-${i}`,
        emoji: item.emoji ?? '💪',
        text: item.text ?? '',
        highlight: item.highlight ?? null,
      }));
    }
    const list = [];
    if (stats.showedUpDespiteLowEnergy > 0) {
      list.push({
        id: 'resilience',
        emoji: '💪',
        text: `On ${stats.showedUpDespiteLowEnergy === 1 ? 'one day' : `${stats.showedUpDespiteLowEnergy} days`}, you tagged "low energy" but still showed up anyway.`,
        highlight: "That's identity in action — showing up even when it's hard.",
      });
    }
    // Only show obstacle insight if we have actual obstacle data (not null)
    const validObstacles = (stats.skipObstacles || []).filter(o => o != null && o !== '');
    if (validObstacles.length >= 2) {
      const obstacleLabels = { energy: 'low energy', mental: 'mental load', time: 'time/schedule' };
      const obstacleList = validObstacles.map(o => obstacleLabels[o] || o);
      list.push({
        id: 'obstacles',
        emoji: '🔍',
        text: `Both rest days had something in common: "${obstacleList.join('" and "')}" came up.`,
        highlight: 'Worth noticing — is there a pattern to explore?',
      });
    }
    return list.slice(0, 2);
  }, [apiReflectionData?.insights, stats.showedUpDespiteLowEnergy, stats.skipObstacles]);

  const reflectionQuestion1 = apiReflectionData?.reflectionQuestions?.question1 ?? 'What helped you show up — even a little? (optional)';
  const reflectionQuestion2 = apiReflectionData?.reflectionQuestions?.question2 ?? 'On days it didn\'t happen, what made starting feel harder? (optional)';

  // No habit = redirect to home
  if (!habit || !userData) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <p style={{ fontFamily: fonts.body, color: colors.textMuted, marginBottom: 16 }}>No habit selected. Start from a habit tile on Home.</p>
        <Button onClick={() => navigate('/', { replace: true })}>Go to Home</Button>
      </div>
    );
  }

  const onReflectionQ1Change = useCallback((val) => setReflectionQ1(val), []);
  const onReflectionQ2Change = useCallback((val) => setReflectionQ2(val), []);
  const onIdentityReflectionChange = useCallback((e) => setIdentityReflection(e.target.value), []);

  const suggestionTypeLabels = {
    identity: 'Identity',
    starter_habit: 'Nucleus habit',
    full_habit: 'Supernova habit',
    habit_stack: 'Cue',
    enjoyment: 'Enjoyment',
    habit_environment: 'Environment support',
  };
  // Clear "which part" labels for the suggestion card (cue, short habit, long habit, identity, etc.)
  const suggestionPartLabel = {
    identity: 'Identity',
    starter_habit: 'Nucleus habit',
    full_habit: 'Supernova habit',
    habit_stack: 'Cue',
    enjoyment: 'Enjoyment',
    habit_environment: 'Environment support',
  };

  // ----- Screen 1: What we noticed -----
  const screen1 = (
    <Card>
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
        }}>🔮</div>
        <h1 style={{ fontFamily: fonts.heading, fontSize: 22, fontWeight: 600, color: colors.text, margin: '0 0 4px 0' }}>What we noticed</h1>
        <p style={{ fontFamily: fonts.body, fontSize: 14, color: colors.textMuted, margin: 0 }}>Week of {weekData.weekRange}</p>
      </div>
      <WeekTracker weekData={weekData} stats={stats} />
      {reflectionItemsLoading ? (
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          gap: 12, 
          padding: 24, 
          marginBottom: 20,
          background: colors.background,
          borderRadius: 12,
          border: `1px solid ${colors.border}`,
        }}>
          <div style={{
            width: 20,
            height: 20,
            border: `2px solid ${colors.border}`,
            borderTopColor: colors.primary,
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }} />
          <span style={{ fontFamily: fonts.body, fontSize: 14, color: colors.textMuted }}>
            Generating personalized insights...
          </span>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : insights.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
          {insights.map((insight) => (
            <InsightCard key={insight.id} emoji={insight.emoji} text={insight.text} highlight={insight.highlight} />
          ))}
        </div>
      ) : null}
      <div style={{ background: colors.background, borderRadius: 12, padding: 16, marginBottom: 20 }}>
        <p style={{ fontFamily: fonts.body, fontSize: 12, fontWeight: 600, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, margin: '0 0 14px 0' }}>Reflect on this week</p>
        <ReflectionQuestionInput
          question={reflectionQuestion1}
          value={reflectionQ1}
          onChange={onReflectionQ1Change}
          placeholder="Maybe it was the music, a friend, or just starting small..."
        />
        <ReflectionQuestionInput
          question={reflectionQuestion2}
          value={reflectionQ2}
          onChange={onReflectionQ2Change}
          placeholder="Was it energy, time, mental load, or something else..."
        />
      </div>
      <div style={{ height: 1, background: colors.border, margin: '0 -32px 20px' }} />
      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
          <SmallStoneJar stones={userData.totalStones} />
          <span style={{ fontFamily: fonts.mono, fontSize: 10, color: colors.textMuted, marginTop: 4 }}>{userData.totalStones} stones</span>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{
            background: `linear-gradient(135deg, ${colors.successLight} 0%, ${colors.successMedium} 100%)`,
            borderRadius: 10,
            padding: '12px 14px',
            marginBottom: 12,
            border: '1px solid rgba(74, 124, 89, 0.2)',
          }}>
            <p style={{ fontFamily: fonts.heading, fontSize: 14, fontWeight: 500, color: colors.primary, margin: 0, fontStyle: 'italic', lineHeight: 1.4 }}>{userData.identity}</p>
          </div>
          <p style={{ fontFamily: fonts.body, fontSize: 13, color: colors.text, margin: '0 0 4px 0' }}>This week, acting in line with this identity felt...</p>
          <AlignmentSlider value={alignmentValue} onChange={setAlignmentValue} />
        </div>
      </div>
      <div style={{ marginTop: 20 }}>
        <p style={{ fontFamily: fonts.body, fontSize: 13, fontWeight: 500, color: colors.text, margin: '0 0 8px 0' }}>
          I'm noticing that...
          <span style={{ color: colors.textLight, fontWeight: 400 }}> (optional)</span>
        </p>
        <textarea
          value={identityReflection}
          onChange={onIdentityReflectionChange}
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
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
        <Button variant="ghost" onClick={() => setCurrentScreen(3)}>Skip</Button>
        <Button onClick={() => setCurrentScreen(2)}>Continue →</Button>
      </div>
    </Card>
  );

  // ----- Screen 2: One LLM suggestion based on Screen 1 reflection -----
  const screen2 = (
    <Card>
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
        }}>💡</div>
        <h1 style={{ fontFamily: fonts.heading, fontSize: 22, fontWeight: 600, color: colors.text, margin: '0 0 8px 0' }}>Based on your reflection</h1>
        <p style={{ fontFamily: fonts.body, fontSize: 14, color: colors.textMuted, margin: 0, lineHeight: 1.55, maxWidth: 340, marginLeft: 'auto', marginRight: 'auto' }}>
          Here's one change that could help. Save it to update your habit, or keep your current plan.
        </p>
      </div>
      {suggestionLoading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, padding: 32, background: colors.background, borderRadius: 12, marginBottom: 24 }}>
          <div style={{ width: 24, height: 24, border: `2px solid ${colors.border}`, borderTopColor: colors.primary, borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          <span style={{ fontFamily: fonts.body, fontSize: 14, color: colors.textMuted }}>Thinking of a suggestion...</span>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : suggestionError ? (
        <div style={{ background: colors.warning || '#FFF8E1', borderRadius: 12, padding: 16, marginBottom: 24, border: `1px solid ${colors.border}` }}>
          <p style={{ fontFamily: fonts.body, fontSize: 14, color: colors.textMuted, margin: 0 }}>{suggestionError}</p>
          <Button variant="secondary" onClick={() => { setSuggestionError(null); setSuggestionLoading(false); setSuggestion(null); }} style={{ marginTop: 12 }}>Try again</Button>
        </div>
      ) : suggestion ? (
        <div style={{
          background: colors.backgroundDark,
          borderRadius: 16,
          padding: 20,
          marginBottom: 24,
          border: `1px solid ${colors.border}`,
        }}>
          <p style={{ fontFamily: fonts.body, fontSize: 10, fontWeight: 600, color: colors.primary, textTransform: 'uppercase', letterSpacing: 0.5, margin: '0 0 10px 0' }}>
            This updates your: {suggestionPartLabel[suggestion.type] ?? suggestion.type}
          </p>
          <p style={{ fontFamily: fonts.body, fontSize: 11, fontWeight: 600, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, margin: '0 0 6px 0' }}>{suggestion.title}</p>
          <p style={{ fontFamily: fonts.body, fontSize: 15, color: colors.text, margin: '0 0 12px 0', lineHeight: 1.5 }}>{suggestion.suggestedText}</p>
          <p style={{ fontFamily: fonts.body, fontSize: 13, color: colors.textLight, margin: 0, fontStyle: 'italic', lineHeight: 1.4 }}>💡 {suggestion.why}</p>
        </div>
      ) : null}
      {suggestion && !suggestionLoading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
          <Button
            onClick={() => { setSelectedExperiment(suggestion.type); setCurrentScreen(3); }}
            style={{ width: '100%' }}
          >
            Save this change →
          </Button>
          <Button
            variant="secondary"
            onClick={() => { setSelectedExperiment('maintain'); setCurrentScreen(3); }}
            style={{ width: '100%' }}
          >
            Keep my plan
          </Button>
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: suggestion ? 0 : 24 }}>
        <Button variant="ghost" onClick={() => setCurrentScreen(1)}>← Back</Button>
        {!suggestion && !suggestionLoading && !suggestionError && (
          <Button onClick={() => { setSelectedExperiment('maintain'); setCurrentScreen(3); }}>Skip →</Button>
        )}
      </div>
    </Card>
  );

  // ----- Save reflection answers -----
  const [saving, setSaving] = useState(false);

  const handleStartMyWeek = async () => {
    setSaving(true);
    try {
      const experimentText =
        suggestion && selectedExperiment === suggestion.type
          ? suggestion.suggestedText
          : (experimentTexts[selectedExperiment] ?? null);
      await reflectionsAPI.saveReflectionAnswers({
        habitId: habitId,
        reflectionQ1: reflectionQ1 || null,
        reflectionQ2: reflectionQ2 || null,
        identityAlignmentValue: alignmentValue,
        identityReflection: identityReflection || null,
        selectedExperiment: selectedExperiment ?? 'maintain',
        experimentText: experimentText || null,
        experimentTexts: null,
        weekRange: weekData.weekRange || null,
      });
    } catch (err) {
      console.error('Failed to save reflection answers:', err);
    } finally {
      setSaving(false);
      navigate('/', { replace: true });
    }
  };

  // ----- Screen 3: Your week ahead -----
  const getSelectedExperimentText = () => {
    if (selectedExperiment === 'maintain') return 'Continue with your current setup and observe what happens.';
    if (suggestion && selectedExperiment === suggestion.type) return suggestion.suggestedText;
    return experimentTexts[selectedExperiment] ?? 'Your updated preference';
  };
  const getSelectedExperimentTitle = () => {
    if (selectedExperiment === 'maintain') return 'Keep everything the same';
    if (suggestion && selectedExperiment === suggestion.type) return suggestion.title;
    return suggestionTypeLabels[selectedExperiment] ?? 'Your experiment';
  };
  const getSelectedExperimentEmoji = () => {
    if (selectedExperiment === 'maintain') return '🔄';
    return '💡';
  };

  const screen3 = (
    <Card>
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
        }}>✨</div>
        <h1 style={{ fontFamily: fonts.heading, fontSize: 22, fontWeight: 600, color: colors.text, margin: '0 0 4px 0' }}>Your week ahead</h1>
        <p style={{ fontFamily: fonts.body, fontSize: 14, color: colors.textMuted, margin: 0 }}>Every action is a vote for who you're becoming.</p>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 24, background: colors.backgroundDark, borderRadius: 16, padding: 20, marginBottom: 20 }}>
        <StoneJar stones={userData.totalStones} />
        <div>
          <p style={{ fontFamily: fonts.mono, fontSize: 28, fontWeight: 600, color: colors.primary, margin: '0 0 4px 0' }}>{userData.totalStones}</p>
          <p style={{ fontFamily: fonts.body, fontSize: 13, color: colors.textMuted, margin: 0 }}>stones collected</p>
        </div>
      </div>
      <div style={{ background: colors.accent, borderRadius: 14, padding: 18, marginBottom: 16, border: '1px solid #F5E6D3' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <span style={{ fontSize: 18 }}>{getSelectedExperimentEmoji()}</span>
          <span style={{ fontFamily: fonts.body, fontSize: 11, fontWeight: 600, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 }}>This week's experiment</span>
        </div>
        <p style={{ fontFamily: fonts.body, fontSize: 14, fontWeight: 600, color: colors.text, margin: '0 0 6px 0' }}>{getSelectedExperimentTitle()}</p>
        <p style={{ fontFamily: fonts.body, fontSize: 13, color: colors.textMuted, margin: 0, lineHeight: 1.55 }}>{getSelectedExperimentText()}</p>
      </div>
      <div style={{
        background: `linear-gradient(135deg, ${colors.successLight} 0%, ${colors.successMedium} 100%)`,
        borderRadius: 12,
        padding: 14,
        marginBottom: 24,
        border: '1px solid rgba(74, 124, 89, 0.2)',
        textAlign: 'center',
      }}>
        <p style={{ fontFamily: fonts.body, fontSize: 10, color: '#5C7A6B', textTransform: 'uppercase', letterSpacing: 0.5, margin: '0 0 4px 0' }}>Remember who you're becoming</p>
        <p style={{ fontFamily: fonts.heading, fontSize: 14, fontWeight: 500, color: colors.primary, margin: 0, fontStyle: 'italic' }}>{userData.identity}</p>
      </div>
      <div style={{ textAlign: 'center', padding: '8px 0 16px' }}>
        <p style={{ fontFamily: fonts.body, fontSize: 14, color: colors.textMuted, margin: 0, lineHeight: 1.6 }}>
          Small experiments. Real learning.<br />
          <span style={{ color: colors.primary, fontWeight: 500 }}>See you tomorrow 🌱</span>
        </p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <Button style={{ width: '100%' }} onClick={handleStartMyWeek} disabled={saving}>
          {saving ? 'Saving...' : 'Start my week →'}
        </Button>
        <Button variant="ghost" onClick={() => setCurrentScreen(2)} style={{ width: '100%' }} disabled={saving}>← Change experiment</Button>
      </div>
    </Card>
  );

  const renderScreen = () => {
    switch (currentScreen) {
      case 1: return screen1;
      case 2: return screen2;
      case 3: return screen3;
      default: return screen1;
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
        {reflectionItemsError && (
          <div style={{
            background: colors.warning || '#FFF8E1',
            border: `1px solid ${colors.warningBorder || '#FFE082'}`,
            borderRadius: 12,
            padding: '10px 14px',
            marginBottom: 16,
            fontFamily: fonts.body,
            fontSize: 13,
            color: colors.warningText || '#5C4B14',
          }}>
            Using default reflection content. You can still reflect and choose an experiment.
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <Link
            to="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              textDecoration: 'none',
              color: 'inherit',
              cursor: 'pointer',
            }}
          >
            <div style={{
              width: 34,
              height: 34,
              borderRadius: 8,
              background: `linear-gradient(135deg, ${colors.primaryLight} 0%, ${colors.primary} 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 16,
            }}>🌱</div>
            <span style={{ fontFamily: fonts.heading, fontSize: 17, fontWeight: 600, color: colors.primary }}>Habit Lab</span>
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
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
            <UserMenu />
          </div>
        </div>
        {renderScreen()}
      </div>
    </div>
  );
}
