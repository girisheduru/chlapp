import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { colors, fonts } from '../constants/designTokens';
import { HeaderJarIcon } from '../components/HeaderJarIcon';
import { HabitTile } from '../components/HabitTile';
import { AddHabitButton, UserMenu } from '../components';
import { useAuth } from '../contexts/AuthContext';
import { getOrCreateUserAndHabitIds, createNewHabitId } from '../utils/userStorage';
import { parseUtcDate } from '../utils/dateUtils';
import { habitsAPI, streaksAPI, reflectionsAPI } from '../services/api';

const HABIT_COLORS = ['#4A7C59', '#6B5D4D', '#5C6B8A'];

/**
 * Map API habit + streak to Home screen habit tile shape.
 */
function mapToHabitTile(habitFromApi, streakFromApi, habitId, index) {
  const p = habitFromApi?.preferences ?? {};
  const lastDate = streakFromApi?.lastCheckInDate;
  const lastDateParsed = parseUtcDate(lastDate); // UTC when API sends naive datetime (production)
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const lastDateStr = lastDateParsed == null ? null : `${lastDateParsed.getFullYear()}-${String(lastDateParsed.getMonth() + 1).padStart(2, '0')}-${String(lastDateParsed.getDate()).padStart(2, '0')}`;
  const isToday = lastDateStr === todayStr;
  const formatTime = (d) => {
    if (!d) return '';
    const dateObj = d instanceof Date ? d : parseUtcDate(d);
    return dateObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  const enjoymentStr = p.enjoyment ?? '';
  const funElements = enjoymentStr ? enjoymentStr.replace(/^With\s+/i, '').split(/\s*,\s*and\s*|\s*,\s*/).filter(Boolean) : [];
  const envStr = p.habit_environment ?? '';
  const environmentSetup = envStr ? envStr.split(/\s*,\s*/).filter(Boolean) : [];

  return {
    id: habitId,
    userId: habitFromApi?.userId,
    name: p.starting_idea ?? 'My habit',
    identity: p.identity ?? 'I am someone who shows up',
    baselineHabit: p.starter_habit ?? '—',
    capacityHabit: p.full_habit ?? '—',
    anchor: p.habit_stack ? { emoji: '🔗', label: p.habit_stack } : { emoji: '🔗', label: '—' },
    funElements,
    environmentSetup,
    totalStones: streakFromApi?.totalStones ?? streakFromApi?.longestStreak ?? 0,
    streakDays: streakFromApi?.currentStreak ?? 0,
    lastCheckInDate: lastDate,
    checkInHistory: streakFromApi?.checkInHistory ?? [],
    lastCheckIn: {
      done: !!isToday,
      time: isToday ? formatTime(lastDateParsed ?? lastDate) : null,
    },
    checkInTime: '8:00 AM',
    color: HABIT_COLORS[index % HABIT_COLORS.length],
  };
}

export default function Home() {
  const navigate = useNavigate();
  const { user: authUser, loading: authLoading, getIdToken } = useAuth();
  const [userId, setUserId] = useState(null);
  const [userHabits, setUserHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedTile, setExpandedTile] = useState(null);
  const [hoveredTile, setHoveredTile] = useState(null);

  useEffect(() => {
    const firebaseUid = authUser?.uid ?? undefined;
    const { userId: uid } = getOrCreateUserAndHabitIds(firebaseUid);
    setUserId(uid);
  }, [authUser?.uid]);

  const loadHabits = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const habitsRes = await habitsAPI.getAll();
      if (!habitsRes || habitsRes.length === 0) {
        setUserHabits([]);
        setLoading(false);
        return;
      }
      const streaks = await Promise.all(
        habitsRes.map((h) => streaksAPI.getUserHabitStreakById(h.userId, h.habitId))
      );
      const tiles = habitsRes.map((h, i) => mapToHabitTile(h, streaks[i], h.habitId, i));
      setUserHabits(tiles);
      
      // Prefetch reflection items in background (so Reflection page loads instantly)
      reflectionsAPI.prefetchReflections().catch((err) => {
        console.debug('Reflection prefetch failed (non-blocking):', err);
      });
    } catch (err) {
      console.error('Failed to load home data:', err);
      if (err?.status === 401 || err?.message?.includes('401')) {
        setUserHabits([]);
        setError(null);
      } else if (err?.status === 404 || err?.message?.includes('404')) {
        setUserHabits([]);
        setError(null);
      } else {
        setError('Could not load your habits.');
        setUserHabits([]);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Wait for token before fetching — avoids 401 on first load (Firebase restores session async)
  useEffect(() => {
    if (!authLoading && authUser?.uid) {
      let cancelled = false;
      getIdToken().then((token) => {
        if (!cancelled && token) loadHabits();
      });
      return () => { cancelled = true; };
    }
  }, [authLoading, authUser?.uid, loadHabits, getIdToken]);

  const currentHour = new Date().getHours();
  const getGreeting = () => {
    if (currentHour >= 5 && currentHour < 12) return { text: 'Good morning', emoji: '🌅' };
    if (currentHour >= 12 && currentHour < 17) return { text: 'Good afternoon', emoji: '☀️' };
    if (currentHour >= 17 && currentHour < 21) return { text: 'Good evening', emoji: '🌆' };
    return { text: 'Hey there', emoji: '🌙' };
  };
  const greeting = getGreeting();

  const getEncouragement = () => {
    const habitsCheckedToday = userHabits.filter((h) => h.lastCheckIn?.done).length;
    const longestStreakHabit = userHabits.reduce(
      (max, h) => (h.streakDays > max.streakDays ? h : max),
      userHabits[0] || { streakDays: 0, name: '' }
    );
    const allFunElements = [...new Set(userHabits.flatMap((h) => h.funElements || []))];
    const funMention =
      allFunElements.length > 0
        ? allFunElements[0].toLowerCase().replace('i ', 'you ').replace(' i ', ' you ')
        : null;

    if (userHabits.length === 0) {
      return { message: 'Add a habit to get started.', subtext: 'Start small, build identity.' };
    }
    if (habitsCheckedToday === userHabits.length) {
      return { message: "You've collected all your stones today! 🎉", subtext: "Rest well — you've earned it." };
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
        subtext: 'Small actions, real momentum.',
      };
    }
    if (habitsCheckedToday > 0) {
      const remaining = userHabits.length - habitsCheckedToday;
      return {
        message: 'Nice start to your day!',
        subtext: `${remaining} more stone${remaining > 1 ? 's' : ''} waiting to be collected.`,
      };
    }
    if (currentHour >= 5 && currentHour < 12) {
      return {
        message: 'A fresh day, a fresh start.',
        subtext: funMention ? `Remember: ${funMention} makes the journey better.` : 'Small steps lead to big changes.',
      };
    }
    return {
      message: 'Every moment is a chance to begin.',
      subtext: 'Pick one habit. Start small. Collect your stone.',
    };
  };
  const encouragement = getEncouragement();

  const totalStones = userHabits.reduce((sum, h) => sum + (h.totalStones ?? 0), 0);

  if (loading && userHabits.length === 0) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: `linear-gradient(180deg, ${colors.background} 0%, ${colors.backgroundDark} 50%, #E8E4DF 100%)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: fonts.body,
        }}
      >
        <p style={{ color: colors.textMuted }}>Loading...</p>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: `linear-gradient(180deg, ${colors.background} 0%, ${colors.backgroundDark} 50%, #E8E4DF 100%)`,
        padding: '32px 20px 40px',
        fontFamily: fonts.body,
      }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=DM+Sans:wght@400;500;600&family=Fraunces:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />
      <style>{`
        * { box-sizing: border-box; }
        button:hover:not(:disabled) { transform: translateY(-1px); opacity: 0.95; }
        button:active:not(:disabled) { transform: translateY(0); }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div style={{ maxWidth: 420, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
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
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                background: `linear-gradient(135deg, ${colors.primaryLight} 0%, ${colors.primary} 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 18,
                boxShadow: '0 4px 12px rgba(45, 90, 69, 0.2)',
              }}
            >
              🌱
            </div>
            <span style={{ fontFamily: fonts.heading, fontSize: 19, fontWeight: 600, color: colors.primary }}>
              Atomic
            </span>
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '6px 14px 6px 8px',
                background: colors.card,
                borderRadius: 20,
                border: `1px solid ${colors.border}`,
                boxShadow: '0 2px 8px rgba(92, 75, 58, 0.06)',
              }}
            >
              <HeaderJarIcon />
              <span style={{ fontFamily: fonts.mono, fontSize: 14, fontWeight: 600, color: colors.primary }}>
                {totalStones}
              </span>
            </div>
            <button
              type="button"
              onClick={() => navigate(`/onboarding?habitId=${encodeURIComponent(createNewHabitId())}`)}
              aria-label="Add habit"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 14px',
                borderRadius: 20,
                border: `2px solid ${colors.primaryLight}`,
                background: 'rgba(74, 124, 89, 0.08)',
                color: colors.primary,
                fontSize: 14,
                fontWeight: 600,
                fontFamily: fonts.body,
                lineHeight: 1,
                cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              <span style={{ fontSize: 18, lineHeight: 1 }}>+</span>
              Add habit
            </button>
            <UserMenu />
          </div>
        </div>

        <div
          style={{
            background: colors.card,
            borderRadius: 20,
            padding: 24,
            marginBottom: 24,
            boxShadow: '0 8px 32px rgba(92, 75, 58, 0.08)',
            border: `1px solid ${colors.border}`,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: -20,
              right: -20,
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${colors.successLight} 0%, transparent 70%)`,
              opacity: 0.6,
            }}
          />
          <div style={{ position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <span style={{ fontSize: 22 }}>{greeting.emoji}</span>
              <h1 style={{ fontFamily: fonts.heading, fontSize: 24, fontWeight: 600, color: colors.text, margin: 0 }}>
                {greeting.text}
              </h1>
            </div>
            <p style={{ fontFamily: fonts.body, fontSize: 15, fontWeight: 500, color: colors.text, margin: '0 0 6px 0', lineHeight: 1.5 }}>
              {encouragement.message}
            </p>
            <p style={{ fontFamily: fonts.body, fontSize: 13, color: colors.textMuted, margin: 0, lineHeight: 1.5 }}>
              {encouragement.subtext}
            </p>
          </div>
        </div>

        {error && (
          <p style={{ color: colors.textMuted, marginBottom: 16, fontSize: 14 }}>{error}</p>
        )}

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h2 style={{ fontFamily: fonts.heading, fontSize: 16, fontWeight: 600, color: colors.textMuted, margin: 0 }}>
            Your habits
          </h2>
          <span style={{ fontFamily: fonts.body, fontSize: 12, color: colors.textLight }}>
            {userHabits.filter((h) => h.lastCheckIn?.done).length}/{userHabits.length} checked in today
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 20 }}>
          {userHabits.map((habit, index) => (
            <div
              key={habit.id}
              style={{ animation: `fadeInUp 0.4s ease ${index * 0.1}s both` }}
            >
              <HabitTile
                habit={habit}
                isExpanded={expandedTile === habit.id}
                isHovered={hoveredTile === habit.id}
                onExpandToggle={setExpandedTile}
                onHover={setHoveredTile}
                onDelete={() => loadHabits()}
              />
            </div>
          ))}
        </div>

        <AddHabitButton />

        <div style={{ textAlign: 'center', marginTop: 32, padding: '0 20px' }}>
          <p style={{ fontFamily: fonts.heading, fontSize: 13, fontStyle: 'italic', color: colors.textLight, margin: 0, lineHeight: 1.6 }}>
            "Every action you take is a vote for the type of person you wish to become."
          </p>
          <p style={{ fontFamily: fonts.body, fontSize: 11, color: colors.textLight, margin: '8px 0 0 0', opacity: 0.7 }}>
            — James Clear
          </p>
        </div>
      </div>
    </div>
  );
}
