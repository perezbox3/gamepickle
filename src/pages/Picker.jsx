import { useState } from 'react'
import { ChevronRight, Shuffle, RotateCcw, Trophy } from 'lucide-react'
import { questions } from '../lib/questions'
import GameCard from '../components/GameCard'
import './Picker.css'

const DEMO_RESULTS = [
  { appid: 1245620, name: 'Elden Ring', playtime_forever: 9800, img_icon_url: null, installed: true, reason: 'Matches your vibe for a deep solo challenge session.' },
  { appid: 1091500, name: 'Cyberpunk 2077', playtime_forever: 4500, img_icon_url: null, installed: true, reason: 'Great story-driven experience for your available time.' },
  { appid: 730, name: 'CS2', playtime_forever: 8900, img_icon_url: null, installed: true, reason: 'Quick competitive games fit your session length perfectly.' },
]

export default function Picker() {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState({})
  const [results, setResults] = useState(null)
  const [randomResult, setRandomResult] = useState(null)

  const currentQ = questions[step]
  const progress = (step / questions.length) * 100

  function handleAnswer(value) {
    const newAnswers = { ...answers, [currentQ.id]: value }
    setAnswers(newAnswers)

    if (step + 1 >= questions.length) {
      setResults(DEMO_RESULTS)
    } else {
      setStep(step + 1)
    }
  }

  function handleRandom() {
    const randomIdx = Math.floor(Math.random() * DEMO_RESULTS.length)
    setRandomResult(DEMO_RESULTS[randomIdx])
    setResults(null)
    setStep(0)
    setAnswers({})
  }

  function handleReset() {
    setStep(0)
    setAnswers({})
    setResults(null)
    setRandomResult(null)
  }

  if (randomResult) {
    return (
      <div className="picker-page">
        <div className="container picker-container">
          <div className="picker-random-result">
            <div className="random-emoji">🎲</div>
            <h2>The dice have spoken.</h2>
            <p>You're playing:</p>
            <div className="random-game-card">
              <GameCard game={randomResult} />
            </div>
            <div className="result-actions">
              <button className="btn btn-pickle btn-lg" onClick={handleRandom}>
                <Shuffle size={16} />
                Roll Again
              </button>
              <button className="btn btn-ghost" onClick={handleReset}>
                <RotateCcw size={14} />
                Start over
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (results) {
    return (
      <div className="picker-page">
        <div className="container picker-container">
          <div className="results-header">
            <Trophy size={28} style={{ color: 'var(--accent)' }} />
            <h2>Your picks</h2>
            <p>Based on your answers, here are your top 3:</p>
          </div>

          <div className="results-grid">
            {results.map((game, i) => (
              <div key={game.appid} className="result-item">
                <GameCard game={game} rank={i + 1} />
                <p className="result-reason">{game.reason}</p>
              </div>
            ))}
          </div>

          <div className="result-actions">
            <button className="btn btn-pickle btn-lg" onClick={handleRandom}>
              <Shuffle size={16} />
              F*** around & find out
            </button>
            <button className="btn btn-ghost" onClick={handleReset}>
              <RotateCcw size={14} />
              Try again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="picker-page">
      <div className="container picker-container">
        <div className="picker-progress-wrap">
          <div className="picker-progress-bar">
            <div className="picker-progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <span className="picker-progress-label">{step + 1} / {questions.length}</span>
        </div>

        <div className="picker-question">
          <div className="question-emoji">{currentQ.emoji}</div>
          <h2 className="question-text">{currentQ.question}</h2>
        </div>

        <div className="picker-options">
          {currentQ.options.map(opt => (
            <button
              key={opt.value}
              className="picker-option"
              onClick={() => handleAnswer(opt.value)}
            >
              <div className="option-content">
                <span className="option-label">{opt.label}</span>
                <span className="option-sub">{opt.sub}</span>
              </div>
              <ChevronRight size={18} className="option-arrow" />
            </button>
          ))}
        </div>

        <div className="picker-footer">
          <button className="btn btn-pickle" onClick={handleRandom}>
            <Shuffle size={15} />
            F*** around & find out
          </button>
          {step > 0 && (
            <button className="btn btn-ghost btn-sm" onClick={() => setStep(step - 1)}>
              Back
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
