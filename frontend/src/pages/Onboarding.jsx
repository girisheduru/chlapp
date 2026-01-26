import React, { useState } from 'react';
import { colors, fonts } from '../constants/designTokens';
import { 
  identityOptions, 
  funOptions, 
  baselineHabitOptions, 
  capacityExpressionOptions, 
  anchorOptions, 
  environmentOptions,
  checkInTimeOptions 
} from '../data/onboardingData';
import { Button, Card, SelectableOption, InfoBox, Quote, ProgressBar } from '../components';

const Onboarding = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [goalInput, setGoalInput] = useState('');
  const [selectedIdentity, setSelectedIdentity] = useState('');
  const [selectedFunOptions, setSelectedFunOptions] = useState([]);
  const [customFun, setCustomFun] = useState('');
  const [baselineHabit, setBaselineHabit] = useState('');
  const [customBaselineHabit, setCustomBaselineHabit] = useState('');
  const [capacityExpression, setCapacityExpression] = useState('');
  const [customCapacityExpression, setCustomCapacityExpression] = useState('');
  const [selectedAnchor, setSelectedAnchor] = useState('');
  const [customAnchor, setCustomAnchor] = useState('');
  const [selectedEnvironment, setSelectedEnvironment] = useState([]);
  const [customEnvironment, setCustomEnvironment] = useState('');
  const [checkInTime, setCheckInTime] = useState('8:00 AM');

  const totalSteps = 8;

  const StepHeader = ({ step, title, subtitle }) => (
    <div style={{ marginBottom: 28 }}>
      <p style={{ fontFamily: fonts.body, fontSize: 12, color: colors.textLight, textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 6px 0' }}>
        Step {step} of {totalSteps}
      </p>
      <h2 style={{ fontFamily: fonts.heading, fontSize: 26, fontWeight: 600, color: colors.primary, margin: '0 0 8px 0' }}>{title}</h2>
      <p style={{ fontFamily: fonts.body, fontSize: 15, color: colors.textMuted, margin: 0 }}>{subtitle}</p>
    </div>
  );

  // Step 1: Welcome
  const Step1 = () => {
    const exampleGoals = ['Eat healthier', 'Reduce stress', 'Get more sleep'];
    
    return (
      <Card>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              fontSize: 32,
            }}
          >
            🌱
          </div>
          <h1 style={{ fontFamily: fonts.heading, fontSize: 28, fontWeight: 600, color: colors.primary, margin: '0 0 10px 0' }}>Welcome</h1>
          <p style={{ fontFamily: fonts.body, fontSize: 15, color: colors.textMuted, margin: 0 }}>Let's build something that lasts.</p>
        </div>

        <div style={{ marginBottom: 28 }}>
          <label style={{ display: 'block', fontFamily: fonts.body, fontSize: 16, fontWeight: 600, color: colors.text, marginBottom: 12 }}>
            What's something you'd like to work on right now?
          </label>
          <input
            type="text"
            value={goalInput}
            onChange={(e) => setGoalInput(e.target.value)}
            placeholder="Type your goal here..."
            style={{
              width: '100%',
              padding: '16px 18px',
              borderRadius: 10,
              border: `2px solid ${colors.border}`,
              fontSize: 15,
              fontFamily: fonts.body,
              color: colors.text,
              background: colors.card,
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
          
          {/* Example suggestions */}
          <div style={{ marginTop: 16 }}>
            <p style={{ fontFamily: fonts.body, fontSize: 12, color: colors.textLight, marginBottom: 10 }}>
              Some ideas to get you started:
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {exampleGoals.map((goal) => (
                <button
                  key={goal}
                  onClick={() => setGoalInput(goal)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: 20,
                    border: `1px solid ${colors.border}`,
                    background: goalInput === goal ? 'rgba(74, 124, 89, 0.08)' : colors.backgroundDark,
                    fontFamily: fonts.body,
                    fontSize: 13,
                    color: colors.textMuted,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {goal}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button onClick={() => setCurrentStep(2)} disabled={!goalInput.trim()}>
            Continue →
          </Button>
        </div>
      </Card>
    );
  };

  // Step 2: Identity Framing
  const Step2 = () => (
    <Card>
      <StepHeader step={2} title="As you work on this, who do you want to become?" subtitle="Real change starts with identity. Choose the statement that resonates most." />

      <InfoBox color="primary">
        This helps us shape habits that fit you, not just the goal.
      </InfoBox>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
        {identityOptions.map((option) => (
          <button
            key={option.id}
            onClick={() => setSelectedIdentity(option.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              width: '100%',
              padding: '18px 20px',
              borderRadius: 12,
              border: `2px solid ${selectedIdentity === option.id ? colors.primaryLight : colors.border}`,
              background: selectedIdentity === option.id ? 'rgba(74, 124, 89, 0.08)' : colors.card,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              textAlign: 'left',
            }}
          >
            <span style={{ fontSize: 24 }}>{option.emoji}</span>
            <span style={{ fontFamily: fonts.heading, fontSize: 16, color: colors.text, flex: 1, lineHeight: 1.4 }}>
              "{option.statement}"
            </span>
            {selectedIdentity === option.id && (
              <span
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  background: colors.primaryLight,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: 12,
                  flexShrink: 0,
                }}
              >
                ✓
              </span>
            )}
          </button>
        ))}
      </div>

      <Quote>Every action you take is a vote for the type of person you wish to become.</Quote>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 28, gap: 12 }}>
        <Button variant="secondary" onClick={() => setCurrentStep(1)}>
          ← Back
        </Button>
        <Button onClick={() => setCurrentStep(3)} disabled={!selectedIdentity}>
          This is me →
        </Button>
      </div>
    </Card>
  );

  // Step 3: Make it Enjoyable
  const Step3 = () => {
    const toggleFunOption = (id) => {
      if (selectedFunOptions.includes(id)) {
        setSelectedFunOptions(selectedFunOptions.filter(o => o !== id));
      } else {
        setSelectedFunOptions([...selectedFunOptions, id]);
      }
    };

    return (
      <Card>
        <StepHeader step={3} title="What could we add that makes this habit more enjoyable for you?" subtitle="Pick what naturally energizes you and lifts your spirits." />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginBottom: 16 }}>
          {funOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => toggleFunOption(option.id)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 8,
                padding: '16px 12px',
                borderRadius: 12,
                border: `2px solid ${selectedFunOptions.includes(option.id) ? colors.primaryLight : colors.border}`,
                background: selectedFunOptions.includes(option.id) ? 'rgba(74, 124, 89, 0.08)' : colors.card,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                textAlign: 'center',
              }}
            >
              <span style={{ fontSize: 24 }}>{option.emoji}</span>
              <span style={{ fontFamily: fonts.body, fontSize: 12, color: colors.text, lineHeight: 1.3 }}>{option.label}</span>
            </button>
          ))}
        </div>

        {/* Custom input */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontFamily: fonts.body, fontSize: 13, fontWeight: 600, color: colors.textMuted, marginBottom: 8 }}>
            Or add your own:
          </label>
          <input
            type="text"
            value={customFun}
            onChange={(e) => setCustomFun(e.target.value)}
            placeholder="What makes things fun for you?"
            style={{
              width: '100%',
              padding: '14px 16px',
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

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 28 }}>
          <Button variant="secondary" onClick={() => setCurrentStep(2)}>
            ← Back
          </Button>
          <Button onClick={() => setCurrentStep(4)} disabled={selectedFunOptions.length === 0 && !customFun.trim()}>
            Continue →
          </Button>
        </div>
      </Card>
    );
  };

  // Step 4: Baseline Habit
  const Step4 = () => {
    return (
      <Card>
        <StepHeader step={4} title="What habit counts on low-energy days?" subtitle="" />

        <p style={{ fontFamily: fonts.body, fontSize: 14, color: colors.textMuted, marginBottom: 24, lineHeight: 1.6 }}>
          On busy or low-energy days, this is the smallest action that still means: "I'm this kind of person." It should be easy to start and easy to finish — something you could finish even on a hard day. (Think: 2-minute guideline, if possible)
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
          {baselineHabitOptions.map((option) => (
            <SelectableOption
              key={option.id}
              selected={baselineHabit === option.id && !customBaselineHabit}
              onClick={() => {
                setBaselineHabit(option.id);
                setCustomBaselineHabit('');
              }}
            >
              {option.label}
            </SelectableOption>
          ))}
        </div>

        {/* Custom input */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontFamily: fonts.body, fontSize: 13, fontWeight: 600, color: colors.textMuted, marginBottom: 8 }}>
            Or write your own:
          </label>
          <input
            type="text"
            value={customBaselineHabit}
            onChange={(e) => {
              setCustomBaselineHabit(e.target.value);
              if (e.target.value) setBaselineHabit('');
            }}
            placeholder="The smallest action that counts..."
            style={{
              width: '100%',
              padding: '14px 16px',
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

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 28 }}>
          <Button variant="secondary" onClick={() => setCurrentStep(3)}>
            ← Back
          </Button>
          <Button onClick={() => setCurrentStep(5)} disabled={!baselineHabit && !customBaselineHabit.trim()}>
            Continue →
          </Button>
        </div>
      </Card>
    );
  };

  // Step 5: Capacity Expression
  const Step5 = () => {
    return (
      <Card>
        <StepHeader step={5} title="When you have more energy, how might this habit show up?" subtitle="" />

        <p style={{ fontFamily: fonts.body, fontSize: 14, color: colors.textMuted, marginBottom: 24, lineHeight: 1.6 }}>
          This isn't a goal or expectation. It's just how the same identity can express itself when you have more capacity.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
          {capacityExpressionOptions.map((option) => (
            <SelectableOption
              key={option.id}
              selected={capacityExpression === option.id && !customCapacityExpression}
              onClick={() => {
                setCapacityExpression(option.id);
                setCustomCapacityExpression('');
              }}
            >
              {option.label}
            </SelectableOption>
          ))}
        </div>

        {/* Custom input */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontFamily: fonts.body, fontSize: 13, fontWeight: 600, color: colors.textMuted, marginBottom: 8 }}>
            Or write your own:
          </label>
          <input
            type="text"
            value={customCapacityExpression}
            onChange={(e) => {
              setCustomCapacityExpression(e.target.value);
              if (e.target.value) setCapacityExpression('');
            }}
            placeholder="When I have more energy, I..."
            style={{
              width: '100%',
              padding: '14px 16px',
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

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 28 }}>
          <Button variant="secondary" onClick={() => setCurrentStep(4)}>
            ← Back
          </Button>
          <Button onClick={() => setCurrentStep(6)} disabled={!capacityExpression && !customCapacityExpression.trim()}>
            Continue →
          </Button>
        </div>
      </Card>
    );
  };

  // Step 6: Habit Stacking
  const Step6 = () => {
    const selectedAnchorObj = anchorOptions.find((o) => o.id === selectedAnchor);
    const triggerText = customAnchor || (selectedAnchorObj ? selectedAnchorObj.label : '...');

    return (
      <Card>
        <StepHeader step={6} title="Habit Stacking — Attach it to your life" subtitle="Anchor it to something you already do." />

        <InfoBox color="blue">
          <strong>Why this helps:</strong> Attaching a new habit to something you already do gives it a natural place in your day — so you don't have to remember or rely on motivation.
        </InfoBox>

        {/* Habit stack formula */}
        <div
          style={{
            background: colors.text,
            borderRadius: 12,
            padding: 16,
            marginBottom: 20,
          }}
        >
          <p style={{ fontFamily: fonts.body, fontSize: 11, color: colors.textLight, textTransform: 'uppercase', letterSpacing: 0.5, margin: '0 0 8px 0' }}>
            The habit stack formula:
          </p>
          <p style={{ fontFamily: fonts.body, fontSize: 14, color: colors.card, margin: 0 }}>
            "When <span style={{ color: '#93C5FD' }}>[cue]</span>, I will <span style={{ color: '#86EFAC' }}>[new habit]</span>."
          </p>
        </div>

        <div style={{ marginBottom: 16 }}>
          <p style={{ fontFamily: fonts.body, fontSize: 14, fontWeight: 600, color: colors.text, marginBottom: 12 }}>
            Choose your cue:
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {anchorOptions.map((option) => (
              <SelectableOption
                key={option.id}
                selected={selectedAnchor === option.id && !customAnchor}
                onClick={() => {
                  setSelectedAnchor(option.id);
                  setCustomAnchor('');
                }}
                emoji={option.emoji}
              >
                {option.label}
              </SelectableOption>
            ))}
          </div>
        </div>

        {/* Custom input */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontFamily: fonts.body, fontSize: 13, fontWeight: 600, color: colors.textMuted, marginBottom: 8 }}>
            Or create your own cue:
          </label>
          <input
            type="text"
            value={customAnchor}
            onChange={(e) => {
              setCustomAnchor(e.target.value);
              if (e.target.value) setSelectedAnchor('');
            }}
            placeholder="After I..."
            style={{
              width: '100%',
              padding: '14px 16px',
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

        {/* Preview of habit stack */}
        {(selectedAnchor || customAnchor) && (
          <div
            style={{
              background: 'linear-gradient(135deg, #F0F7F4 0%, #E8F5E9 100%)',
              borderRadius: 12,
              padding: 20,
              textAlign: 'center',
              marginBottom: 20,
            }}
          >
            <p style={{ fontFamily: fonts.body, fontSize: 12, color: colors.primaryLight, margin: '0 0 10px 0' }}>Your habit stack</p>
            <p style={{ fontFamily: fonts.heading, fontSize: 16, color: colors.primary, margin: 0, lineHeight: 1.6 }}>
              "{triggerText}, I will show up for my body."
            </p>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 28 }}>
          <Button variant="secondary" onClick={() => setCurrentStep(5)}>
            ← Back
          </Button>
          <Button onClick={() => setCurrentStep(7)} disabled={!selectedAnchor && !customAnchor}>
            Lock in my cue →
          </Button>
        </div>
      </Card>
    );
  };

  // Step 7: Environment Design
  const Step7 = () => {
    const toggleEnvironment = (id) => {
      if (selectedEnvironment.includes(id)) {
        setSelectedEnvironment(selectedEnvironment.filter(e => e !== id));
      } else if (selectedEnvironment.length < 2) {
        setSelectedEnvironment([...selectedEnvironment, id]);
      }
    };

    const handleCustomEnvironmentChange = (e) => {
      setCustomEnvironment(e.target.value);
      // If user types custom, limit preset selections to 1
      if (e.target.value && selectedEnvironment.length > 1) {
        setSelectedEnvironment([selectedEnvironment[0]]);
      }
    };

    const maxPresetsAllowed = customEnvironment.trim() ? 1 : 2;

    return (
      <Card>
        <StepHeader step={7} title="Make It Obvious" subtitle="Design your environment. Make your habit the path of least resistance. Pick up to 2, or add your own." />

        <InfoBox color="primary">
          <strong>The secret:</strong> Environment design quietly does most of the work. You don't need motivation when the good choice is the easy choice.
        </InfoBox>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
          {environmentOptions.map((option) => {
            const isSelected = selectedEnvironment.includes(option.id);
            const isDisabled = !isSelected && selectedEnvironment.length >= maxPresetsAllowed;

            return (
              <button
                key={option.id}
                onClick={() => toggleEnvironment(option.id)}
                disabled={isDisabled}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  width: '100%',
                  padding: '16px 18px',
                  borderRadius: 12,
                  border: `2px solid ${isSelected ? colors.primaryLight : colors.border}`,
                  background: isSelected ? 'rgba(74, 124, 89, 0.08)' : colors.card,
                  cursor: isDisabled ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  textAlign: 'left',
                  opacity: isDisabled ? 0.5 : 1,
                }}
              >
                <span style={{ fontSize: 20 }}>{option.emoji}</span>
                <span style={{ fontFamily: fonts.body, fontSize: 14, fontWeight: 500, color: colors.text, flex: 1 }}>{option.label}</span>
                {isSelected && (
                  <span
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: '50%',
                      background: colors.primaryLight,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: 11,
                    }}
                  >
                    ✓
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Custom input */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontFamily: fonts.body, fontSize: 13, fontWeight: 600, color: colors.textMuted, marginBottom: 8 }}>
            Or add your own:
          </label>
          <input
            type="text"
            value={customEnvironment}
            onChange={handleCustomEnvironmentChange}
            placeholder="What would make it easier?"
            style={{
              width: '100%',
              padding: '14px 16px',
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

        <p style={{ fontFamily: fonts.body, fontSize: 11, color: colors.textLight, textAlign: 'center', marginBottom: 20 }}>
          You can add more later. Start simple.
        </p>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 28 }}>
          <Button variant="secondary" onClick={() => setCurrentStep(6)}>
            ← Back
          </Button>
          <Button onClick={() => setCurrentStep(8)} disabled={selectedEnvironment.length === 0 && !customEnvironment.trim()}>
            I'm ready →
          </Button>
        </div>
      </Card>
    );
  };

  // Step 8: Summary
  const Step8 = () => {
    const selectedIdentityObj = identityOptions.find((o) => o.id === selectedIdentity);
    const selectedAnchorObj = anchorOptions.find((o) => o.id === selectedAnchor);
    const triggerText = customAnchor || (selectedAnchorObj ? selectedAnchorObj.label : 'your chosen trigger');
    
    const baselineHabitObj = baselineHabitOptions.find((o) => o.id === baselineHabit);
    const baselineText = customBaselineHabit || (baselineHabitObj ? baselineHabitObj.label : '');
    
    const capacityObj = capacityExpressionOptions.find((o) => o.id === capacityExpression);
    const capacityText = customCapacityExpression || (capacityObj ? capacityObj.label : '');
    
    const envText = [...selectedEnvironment.map(id => environmentOptions.find(o => o.id === id)?.label), customEnvironment].filter(Boolean).join(', ');
    
    // Build enjoyment text
    const enjoymentParts = [];
    if (selectedFunOptions.includes('music')) enjoymentParts.push('music I love');
    if (selectedFunOptions.includes('share')) enjoymentParts.push('a quick share when done');
    if (selectedFunOptions.includes('movement')) enjoymentParts.push('movement that feels right');
    if (selectedFunOptions.includes('comfort')) enjoymentParts.push('my cozy setup');
    if (selectedFunOptions.includes('challenge')) enjoymentParts.push('a bit of challenge');
    if (selectedFunOptions.includes('aesthetic')) enjoymentParts.push('a look or vibe I like');
    if (customFun) enjoymentParts.push(customFun);
    
    const enjoymentText = enjoymentParts.length > 0 
      ? `With ${enjoymentParts.slice(0, 2).join(', and ')}`
      : 'With elements that bring you joy';

    const SummaryRow = ({ icon, label, value, bg }) => (
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            background: bg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 16,
            flexShrink: 0,
          }}
        >
          {icon}
        </div>
        <div>
          <p style={{ fontFamily: fonts.body, fontSize: 11, color: colors.textLight, margin: '0 0 3px 0', textTransform: 'uppercase', letterSpacing: 0.5 }}>
            {label}
          </p>
          <p style={{ fontFamily: fonts.body, fontSize: 14, fontWeight: 600, color: colors.text, margin: 0 }}>{value}</p>
        </div>
      </div>
    );

    return (
      <Card>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div
            style={{
              width: 68,
              height: 68,
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${colors.primaryLight} 0%, ${colors.primary} 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 18px',
              fontSize: 30,
              boxShadow: '0 8px 24px rgba(45, 90, 69, 0.3)',
            }}
          >
            ✨
          </div>
          <h2 style={{ fontFamily: fonts.heading, fontSize: 24, fontWeight: 600, color: colors.primary, margin: '0 0 6px 0' }}>Your Habit Plan</h2>
          <p style={{ fontFamily: fonts.body, fontSize: 14, color: colors.textMuted, margin: 0 }}>Here's everything we built together.</p>
        </div>

        <div style={{ background: colors.background, borderRadius: 16, padding: 22, marginBottom: 20 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <SummaryRow
              icon="🪪"
              label="The identity you're forming"
              value={`"${selectedIdentityObj?.statement || "I am someone who takes care of my body"}"`}
              bg="#E8F5E9"
            />
            <div style={{ height: 1, background: colors.border }} />
            <SummaryRow
              icon="🎯"
              label="Baseline habit"
              value={baselineText || "Pause and notice how my body feels"}
              bg="#FFF3CD"
            />
            <div style={{ height: 1, background: colors.border }} />
            <SummaryRow
              icon="⚡"
              label="When Circumstances Allow"
              value={capacityText || "45 minute pilates class"}
              bg="#E3F2FD"
            />
            <div style={{ height: 1, background: colors.border }} />
            <SummaryRow
              icon="🔗"
              label="Cue"
              value={triggerText}
              bg="#FCE4EC"
            />
            <div style={{ height: 1, background: colors.border }} />
            <SummaryRow
              icon="🎵"
              label="Enjoyment"
              value={enjoymentText}
              bg="#FFF9E6"
            />
            <div style={{ height: 1, background: colors.border }} />
            <SummaryRow
              icon="👁️"
              label="Environment Support"
              value={envText || 'Gym bag packed, Shoes visible'}
              bg="#F3E5F5"
            />
          </div>
        </div>

        <div style={{ background: colors.card, borderRadius: 10, padding: 16, border: `1px solid ${colors.border}`, marginBottom: 20 }}>
          <p style={{ fontFamily: fonts.body, fontSize: 13, fontWeight: 600, color: colors.text, margin: '0 0 10px 0' }}>When should we check in with you?</p>
          <select
            value={checkInTime}
            onChange={(e) => setCheckInTime(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 14px',
              borderRadius: 8,
              border: `2px solid ${colors.border}`,
              fontSize: 14,
              fontFamily: fonts.body,
              color: colors.text,
              background: colors.card,
              cursor: 'pointer',
            }}
          >
            {checkInTimeOptions.map((time) => (
              <option key={time} value={time}>{time}</option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button variant="secondary" onClick={() => setCurrentStep(7)}>
            ← Back
          </Button>
          <Button style={{ padding: '16px 36px', fontSize: 16 }}>Start My Journey →</Button>
        </div>
      </Card>
    );
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1 />;
      case 2:
        return <Step2 />;
      case 3:
        return <Step3 />;
      case 4:
        return <Step4 />;
      case 5:
        return <Step5 />;
      case 6:
        return <Step6 />;
      case 7:
        return <Step7 />;
      case 8:
        return <Step8 />;
      default:
        return <Step1 />;
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: `linear-gradient(180deg, ${colors.background} 0%, ${colors.backgroundDark} 100%)`,
        padding: '32px 16px',
        fontFamily: fonts.body,
      }}
    >
      <div style={{ maxWidth: 480, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 8,
                background: `linear-gradient(135deg, ${colors.primaryLight} 0%, ${colors.primary} 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 16,
              }}
            >
              🌱
            </div>
            <span style={{ fontFamily: fonts.heading, fontSize: 17, fontWeight: 600, color: colors.primary }}>Atomic</span>
          </div>

          {currentStep > 1 && (
            <button
              onClick={() => {
                setCurrentStep(1);
                setGoalInput('');
                setSelectedIdentity('');
                setSelectedFunOptions([]);
                setCustomFun('');
                setBaselineHabit('');
                setCustomBaselineHabit('');
                setCapacityExpression('');
                setCustomCapacityExpression('');
                setSelectedAnchor('');
                setCustomAnchor('');
                setSelectedEnvironment([]);
                setCustomEnvironment('');
              }}
              style={{
                background: 'transparent',
                border: 'none',
                fontFamily: fonts.body,
                fontSize: 13,
                color: colors.textLight,
                cursor: 'pointer',
              }}
            >
              Start over
            </button>
          )}
        </div>

        <ProgressBar currentStep={currentStep} totalSteps={totalSteps} />

        {renderStep()}
      </div>
    </div>
  );
};

export default Onboarding;
