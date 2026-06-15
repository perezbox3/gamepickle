export const questions = [
  {
    id: 'session',
    question: "How much time do you have?",
    emoji: '⏱️',
    options: [
      { label: 'Quick session', sub: '~30 min', value: 'short' },
      { label: 'A couple hours', sub: '1–3 hrs', value: 'medium' },
      { label: 'Going all in', sub: '3+ hrs', value: 'long' },
    ],
  },
  {
    id: 'vibe',
    question: "What's the vibe tonight?",
    emoji: '🎮',
    options: [
      { label: 'Chill & relaxed', sub: 'low effort', value: 'chill' },
      { label: 'Focused grind', sub: 'in the zone', value: 'grind' },
      { label: 'Hype & excited', sub: 'bring the energy', value: 'hype' },
    ],
  },
  {
    id: 'social',
    question: "Solo or squad?",
    emoji: '👥',
    options: [
      { label: 'Flying solo', sub: 'just me', value: 'solo' },
      { label: 'With friends', sub: 'multiplayer', value: 'multi' },
      { label: "Don't care", sub: 'either works', value: 'any' },
    ],
  },
  {
    id: 'genre',
    question: "What kind of game sounds good?",
    emoji: '🕹️',
    options: [
      { label: 'Action / Shooter', sub: 'fast-paced', value: 'action' },
      { label: 'Strategy / Builder', sub: 'use your brain', value: 'strategy' },
      { label: 'Story / Adventure', sub: 'narrative driven', value: 'story' },
      { label: 'Anything goes', sub: 'surprise me', value: 'any' },
    ],
  },
  {
    id: 'challenge',
    question: "How hard do you want it?",
    emoji: '💪',
    options: [
      { label: 'Easy mode', sub: 'just vibing', value: 'easy' },
      { label: 'A good challenge', sub: 'medium difficulty', value: 'medium' },
      { label: 'Maximum pain', sub: 'sweat session', value: 'hard' },
    ],
  },
]
