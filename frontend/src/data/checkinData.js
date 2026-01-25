// Static data for daily check-in

export const obstacleOptions = [
  { id: 'time', label: 'Time / schedule', emoji: '🕰️' },
  { id: 'mental', label: 'Mental load', emoji: '🧠' },
  { id: 'energy', label: 'Low energy', emoji: '😴' },
  { id: 'distraction', label: 'Distractions', emoji: '🌪️' },
  { id: 'setup', label: 'Setup wasn\'t ready', emoji: '🏠' },
  { id: 'other', label: 'Something else', emoji: '➕' },
];

export const helperOptions = [
  { id: 'music', label: 'Music / vibe', emoji: '🎶' },
  { id: 'environment', label: 'Environment', emoji: '👁️' },
  { id: 'cue', label: 'My cue', emoji: '🔗' },
  { id: 'someone', label: 'Someone else', emoji: '🤝' },
  { id: 'flow', label: 'It just flowed', emoji: '✨' },
  { id: 'other', label: 'Something else', emoji: '➕' },
];

// Default user data (would come from onboarding in real app)
export const defaultUserData = {
  identity: "I am someone who takes care of my body",
  baselineHabit: "Do one supportive action (stretch, hydrate, rest)",
  capacityHabit: "Staying longer and pushing a bit",
  anchor: { emoji: '☕', label: 'After my morning coffee' },
  funElements: ['Music I love', 'Movement that feels right'],
};
