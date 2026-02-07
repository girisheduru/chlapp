import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { colors, fonts } from '../constants/designTokens';
import { animations } from '../constants/animations';
import { obstacleOptions, helperOptions, defaultUserData } from '../data/checkinData';
import { Button, Card, ActionOption, SelectChip, StoneJar, TodaysStone, Confetti, StreakDisplay, UserMenu } from '../components';
import { streaksAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { getOrCreateUserAndHabitIds } from '../utils/userStorage';

const DailyCheckIn = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const [userId, setUserId] = useState(null);
  const [habitId, setHabitId] = useState(null);
  const [currentView, setCurrentView] = useState('checkin');
  const [showConfetti, setShowConfetti] = useState(false);
  const [streakCount, setStreakCount] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [totalStones, setTotalStones] = useState(0);
  const [newStoneAdded, setNewStoneAdded] = useState(false);
  const [showStoneAnimation, setShowStoneAnimation] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // userId and habitId: from habit tile state when present, else from auth/storage
  useEffect(() => {
    const firebaseUid = authUser?.uid ?? undefined;
    const { userId: storageUserId, habitId: storageHabitId } = getOrCreateUserAndHabitIds(firebaseUid);
    if (location.state?.fromHabitTile && location.state?.habitId) {
      setUserId(location.state.userId ?? storageUserId);
      setHabitId(location.state.habitId);
    } else {
      setUserId(storageUserId);
      setHabitId(storageHabitId);
    }
  }, [authUser?.uid, location.state?.fromHabitTile, location.state?.habitId, location.state?.userId]);

  // Identity for "Remember who you're becoming": from the habit tile clicked, else default
  const displayIdentity =
    location.state?.fromHabitTile && location.state?.identity
      ? location.state.identity
      : defaultUserData.identity;

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
  const userData = defaultUserData;

  // Load streak data on component mount
  useEffect(() => {
    const loadStreakData = async () => {
      if (!userId || !habitId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const streakData = await streaksAPI.getUserHabitStreakById(userId, habitId);
        setStreakCount(streakData.currentStreak || 0);
        setLongestStreak(streakData.longestStreak || 0);
        setTotalStones(streakData.totalStones ?? streakData.currentStreak ?? 0);
      } catch (error) {
        console.error('Error loading streak data:', error);
        setError('Failed to load streak data');
        // On error, keep default values (0) - graceful degradation
      } finally {
        setLoading(false);
      }
    };

    loadStreakData();
  }, [userId, habitId]);

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
  const handleSaveCheckin = async () => {
    if (selectedAction === 'nottoday') {
      setCurrentView('recovery');
      return;
    }

    try {
      const today = new Date();
      // Use LOCAL date (not UTC) so check-in is recorded for user's actual calendar day
      const checkInDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      const checkInDateTime = today.toISOString();

      // Update streak via API (include checkInDateTime so backend stores actual time)
      const updatedStreak = await streaksAPI.updateUserHabitStreakById({
        userId,
        habitId,
        checkInDate,
        checkInDateTime,
      });

      // Update local state with API response
      setStreakCount(updatedStreak.currentStreak);
      setLongestStreak(updatedStreak.longestStreak);
      setTotalStones(updatedStreak.totalStones ?? updatedStreak.currentStreak);

      // Add stone animation
      setShowStoneAnimation(true);
      setTimeout(() => {
        setNewStoneAdded(true);
      }, 800);
      setTimeout(() => {
        setCurrentView('completed');
        setShowConfetti(true);
      }, 1500);
      setTimeout(() => setShowConfetti(false), 4500);
    } catch (error) {
      console.error('Error updating streak:', error);
      // Still show success UI even if API call fails (graceful degradation)
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


  // =========================================
  // MAIN CHECK-IN VIEW
  // =========================================
  const greeting = (() => {
    const hour = new Date().getHours();
    if (hour < 12) return { text: 'Good morning', emoji: '☀️' };
    if (hour < 17) return { text: 'Good afternoon', emoji: '🌤️' };
    return { text: 'Good evening', emoji: '🌙' };
  })();

  const showReflectionSections = selectedAction !== null;
  const showHelpersSection = selectedAction && selectedAction !== 'nottoday';
  const canSave = selectedAction !== null && (selectedAction !== 'other' || somethingElseText.trim());

  const checkInView = (
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
            "{displayIdentity}"
          </p>
        </div>

        {/* Streak Display - Above Stone Visual */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '20px', color: colors.textMuted, fontFamily: fonts.body, fontSize: 14 }}>
            Loading streak data...
          </div>
        ) : (
          <StreakDisplay streak={streakCount} totalStones={totalStones} />
        )}
        {error && (
          <div style={{
            padding: '12px',
            background: colors.warning,
            borderRadius: 8,
            marginBottom: 16,
            textAlign: 'center',
            fontSize: 12,
            color: colors.warningText,
            fontFamily: fonts.body,
          }}>
            ⚠️ {error}
          </div>
        )}

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

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <ActionOption
              selected={selectedAction === 'baseline'}
              onClick={() => setSelectedAction('baseline')}
              emoji="🌱"
              title="Nucleus habit"
              subtitle={userData.baselineHabit}
            />
            <ActionOption
              selected={selectedAction === 'capacity'}
              onClick={() => setSelectedAction('capacity')}
              emoji="⚡"
              title="Supernova habit"
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

  // =========================================
  // COMPLETED VIEW (Stone Collected)
  // =========================================
  const celebrations = [
    { emoji: '🎉', message: 'Stone collected!' },
    { emoji: '💎', message: 'Another one for the jar!' },
    { emoji: '⭐', message: 'You showed up!' },
  ];
  const randomCelebration = celebrations[Math.floor(Math.random() * celebrations.length)];

  const completedView = (
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
            "{displayIdentity}"
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', gap: 12 }}>
            <Button variant="celebration" style={{ flex: 1 }} onClick={() => setCurrentView('progress')}>
              See my jar 🏺
            </Button>
            <Button variant="primary" style={{ flex: 1 }} onClick={() => {
              resetCheckin();
              setCurrentView('checkin');
            }}>
              Add another stone 💎
            </Button>
          </div>
          <Button variant="secondary" style={{ width: '100%' }} onClick={() => navigate('/')}>
            Done for today
          </Button>
        </div>
      </Card>
  );

  // =========================================
  // PROGRESS VIEW (Jar Collection)
  // =========================================
  const progressView = (
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
          "{displayIdentity}"
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
  const recoveryView = (
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
      case 'checkin': return checkInView;
      case 'completed': return completedView;
      case 'progress': return progressView;
      case 'recovery': return recoveryView;
      default: return checkInView;
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

      <style>{animations}</style>

      <div style={{ maxWidth: 420, margin: '0 auto' }}>
        {/* Header */}
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
          </Link>
          <UserMenu />
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

export default DailyCheckIn;
