import { useState, useEffect } from 'react'
import axios from 'axios'

const API_URL = `${import.meta.env.VITE_API_URL || ''}/invoke`

// CodeBlock component with Copy button
function CodeBlock({ language, code }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="code-block-container">
      <div className="code-block-header">
        <span className="code-block-lang">{language || 'code'}</span>
        <button className="code-block-copy-btn" onClick={handleCopy}>
          {copied ? (
            <>
              <svg className="w-3.5 h-3.5" width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>Copied!</span>
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
              </svg>
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="code-block-pre">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function App() {
  const [input, setInput] = useState('')
  const [history, setHistory] = useState([])
  const [currentBattleId, setCurrentBattleId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  // Theme state
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('arena_theme') || 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('arena_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  // Load history from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('battle_history')
      if (stored) {
        const parsed = JSON.parse(stored)
        setHistory(parsed)
        if (parsed.length > 0) {
          setCurrentBattleId(parsed[0].id)
        }
      }
    } catch (e) {
      console.error('Failed to load history', e)
    }
  }, [])

  const startBattle = async (promptText) => {
    if (!promptText || loading) return
    setLoading(true)
    setError('')
    setInput('')

    try {
      const { data } = await axios.post(API_URL, { input: promptText })
      
      const newBattle = {
        id: Date.now().toString(),
        prompt: promptText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        solution_1: data.result.solution_1,
        solution_2: data.result.solution_2,
        judge: data.result.judge
      }

      const updatedHistory = [newBattle, ...history]
      setHistory(updatedHistory)
      localStorage.setItem('battle_history', JSON.stringify(updatedHistory))
      setCurrentBattleId(newBattle.id)
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Request failed')
      setInput(promptText) // restore input in textarea on failure
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    startBattle(input.trim())
  }

  const handleExampleClick = (exampleText) => {
    if (loading) return
    startBattle(exampleText)
  }

  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear all battle history?')) {
      setHistory([])
      localStorage.removeItem('battle_history')
      setCurrentBattleId(null)
    }
  }

  const handleSelectBattle = (id) => {
    setCurrentBattleId(id)
  }

  const handleNewBattle = () => {
    setCurrentBattleId(null)
  }

  // Calculate dynamic stats
  let mistralWins = 0
  let cohereWins = 0
  let ties = 0

  history.forEach((battle) => {
    const s1 = battle.judge?.solution_1_score ?? 0
    const s2 = battle.judge?.solution_2_score ?? 0
    if (s1 > s2) {
      mistralWins++
    } else if (s2 > s1) {
      cohereWins++
    } else {
      ties++
    }
  })

  const totalBattles = history.length
  const mistralPercent = totalBattles > 0 ? (mistralWins / totalBattles) * 100 : 0
  const coherePercent = totalBattles > 0 ? (cohereWins / totalBattles) * 100 : 0
  const tiesPercent = totalBattles > 0 ? (ties / totalBattles) * 100 : 0

  // Find currently selected battle
  const currentBattle = history.find((b) => b.id === currentBattleId)

  // Determine winner for current battle
  let winner = null
  let score1 = 0
  let score2 = 0
  if (currentBattle) {
    score1 = currentBattle.judge?.solution_1_score ?? 0
    score2 = currentBattle.judge?.solution_2_score ?? 0
    if (score1 > score2) {
      winner = 'Mistral'
    } else if (score2 > score1) {
      winner = 'Cohere'
    } else {
      winner = 'Tie'
    }
  }

  // Helper to clean Math expressions
  const cleanMath = (math) => {
    let cleaned = math
      .replace(/\\begin\{align\*?\}/g, '')
      .replace(/\\end\{align\*?\}/g, '')
      .replace(/\\begin\{equation\*?\}/g, '')
      .replace(/\\end\{equation\*?\}/g, '')
      .replace(/&=/g, ' = ')
      .replace(/&/g, ' ')
      .replace(/\\left\(/g, '(')
      .replace(/\\right\)/g, ')')
      .replace(/\\left\[/g, '[')
      .replace(/\\right\]/g, ']')
      .replace(/\\left\\\{/g, '{')
      .replace(/\\right\\\}/g, '}')
      .replace(/\\left\b/g, '')
      .replace(/\\right\b/g, '')
      .replace(/\\\\/g, '<br/>')
      .replace(/\\times\b/g, '×')
      .replace(/\\div\b/g, '÷')
      .replace(/\\cdot\b/g, '·')
      .replace(/\\boxed\{(.*?)\}/g, '<span class="math-boxed">$1</span>')
      .replace(/\\frac\{(.*?)\}\{(.*?)\}/g, '<span class="math-frac">$1/$2</span>')
      .replace(/\\le\b/g, '≤')
      .replace(/\\ge\b/g, '≥')
      .replace(/\\ne\b/g, '≠')
      .replace(/\\pm\b/g, '±')
      .replace(/\\approx\b/g, '≈');
    return cleaned
  }

  // Robust content parser returning React elements
  const parseContent = (text) => {
    if (!text) return null

    // Split by code blocks: ```lang\ncode```
    const codeBlockRegex = /```(\w*)\n([\s\S]*?)```/g
    const parts = []
    let lastIndex = 0
    let match

    while ((match = codeBlockRegex.exec(text)) !== null) {
      const textBefore = text.substring(lastIndex, match.index)
      if (textBefore) {
        parts.push({ type: 'text', content: textBefore })
      }
      parts.push({
        type: 'code',
        language: match[1],
        content: match[2].trim()
      })
      lastIndex = codeBlockRegex.lastIndex
    }

    const textAfter = text.substring(lastIndex)
    if (textAfter) {
      parts.push({ type: 'text', content: textAfter })
    }

    // Helper to parse line formatting (bold, italic, inline code, inline math)
    const parseInline = (lineText) => {
      const inlineMathRegex = /\\\(([\s\S]*?)\\\)/g
      const segments = []
      let lIdx = 0
      let m

      while ((m = inlineMathRegex.exec(lineText)) !== null) {
        const textBefore = lineText.substring(lIdx, m.index)
        if (textBefore) {
          segments.push({ type: 'inline-text', content: textBefore })
        }
        segments.push({ type: 'inline-math', content: m[1] })
        lIdx = inlineMathRegex.lastIndex
      }

      const textAfter = lineText.substring(lIdx)
      if (textAfter) {
        segments.push({ type: 'inline-text', content: textAfter })
      }

      return segments.map((seg, idx) => {
        if (seg.type === 'inline-math') {
          return (
            <span 
              key={`im-${idx}`} 
              className="math-inline" 
              dangerouslySetInnerHTML={{ __html: cleanMath(seg.content) }} 
            />
          )
        } else {
          let html = seg.content
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<code class="inline-code">$1</code>')
          return <span key={`it-${idx}`} dangerouslySetInnerHTML={{ __html: html }} />
        }
      })
    }

    return parts.map((part, pIdx) => {
      if (part.type === 'code') {
        return <CodeBlock key={`code-${pIdx}`} language={part.language} code={part.content} />
      } else {
        // Split text by block math: \[ ... \]
        const blockMathRegex = /\\\[([\s\S]*?)\\\]/g
        const subParts = []
        let sIdx = 0
        let sm

        while ((sm = blockMathRegex.exec(part.content)) !== null) {
          const textBefore = part.content.substring(sIdx, sm.index)
          if (textBefore) {
            subParts.push({ type: 'text', content: textBefore })
          }
          subParts.push({ type: 'math-block', content: sm[1] })
          sIdx = blockMathRegex.lastIndex
        }

        const textAfter = part.content.substring(sIdx)
        if (textAfter) {
          subParts.push({ type: 'text', content: textAfter })
        }

        return subParts.map((sub, sIdx2) => {
          if (sub.type === 'math-block') {
            return (
              <div key={`mb-${pIdx}-${sIdx2}`} className="math-block" dangerouslySetInnerHTML={{ __html: cleanMath(sub.content.trim()) }} />
            )
          } else {
            const lines = sub.content.split('\n')
            return lines.map((line, lIdx) => {
              let trimmed = line.trim()
              if (!trimmed) {
                return <div key={`empty-${pIdx}-${sIdx2}-${lIdx}`} className="paragraph-spacing" />
              }

              const isBullet = trimmed.startsWith('- ') || trimmed.startsWith('* ')
              const isOrdered = /^\d+\.\s/.test(trimmed)

              if (isBullet) {
                trimmed = trimmed.replace(/^[-*]\s+/, '')
                return (
                  <li key={`line-${pIdx}-${sIdx2}-${lIdx}`} className="bullet-item">
                    {parseInline(trimmed)}
                  </li>
                )
              } else if (isOrdered) {
                trimmed = trimmed.replace(/^\d+\.\s+/, '')
                return (
                  <li key={`line-${pIdx}-${sIdx2}-${lIdx}`} className="ordered-item" style={{ listStyleType: 'decimal' }}>
                    {parseInline(trimmed)}
                  </li>
                )
              } else {
                return (
                  <p key={`line-${pIdx}-${sIdx2}-${lIdx}`} className="text-paragraph">
                    {parseInline(trimmed)}
                  </p>
                )
              }
            })
          }
        })
      }
    })
  }

  return (
    <main className="app-shell">
      {/* Sidebar Panel */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <span className="sidebar-brand">
            <svg className="w-5 h-5" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5" />
              <line x1="13" y1="19" x2="19" y2="13" />
              <line x1="16" y1="16" x2="20" y2="20" />
              <line x1="19" y1="21" x2="21" y2="19" />
            </svg>
            ⚔️ Arena Panel
          </span>
          <button className="btn-theme-toggle" onClick={toggleTheme} title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
            {theme === 'dark' ? (
              <svg className="w-4 h-4" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
              </svg>
            ) : (
              <svg className="w-4 h-4" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>
        </div>

        <button className="btn-new-battle" onClick={handleNewBattle}>
          <svg className="w-4 h-4" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          New Battle
        </button>

        {/* Scoreboard */}
        <div className="scoreboard">
          <div className="scoreboard-title">Total Wins Scoreboard</div>
          <div className="score-grid">
            <div className="score-card mistral">
              <div className="score-val">{mistralWins}</div>
              <div className="score-label">Mistral</div>
            </div>
            <div className="score-card cohere">
              <div className="score-val">{cohereWins}</div>
              <div className="score-label">Cohere</div>
            </div>
            <div className="score-card ties">
              <div className="score-val">{ties}</div>
              <div className="score-label">Ties</div>
            </div>
          </div>
          {totalBattles > 0 && (
            <div className="score-bar-container" title={`Mistral: ${Math.round(mistralPercent)}% | Cohere: ${Math.round(coherePercent)}% | Ties: ${Math.round(tiesPercent)}%`}>
              <div className="score-bar-segment mistral" style={{ width: `${mistralPercent}%` }} />
              <div className="score-bar-segment ties" style={{ width: `${tiesPercent}%` }} />
              <div className="score-bar-segment cohere" style={{ width: `${coherePercent}%` }} />
            </div>
          )}
        </div>

        {/* History List */}
        <div className="history-section">
          <div className="scoreboard-title">Battle History ({history.length})</div>
          {history.length === 0 ? (
            <div className="empty-history">No past battles yet</div>
          ) : (
            <div className="history-list">
              {history.map((battle) => {
                const s1 = battle.judge?.solution_1_score ?? 0
                const s2 = battle.judge?.solution_2_score ?? 0
                const bWinner = s1 > s2 ? 'Mistral' : s2 > s1 ? 'Cohere' : 'Tie'
                return (
                  <button
                    key={battle.id}
                    className={`history-item ${currentBattleId === battle.id ? 'active' : ''}`}
                    onClick={() => handleSelectBattle(battle.id)}
                  >
                    <span className="history-prompt">{battle.prompt}</span>
                    <div className="history-meta">
                      <span>{battle.timestamp}</span>
                      <span className={`history-winner-tag winner-${bWinner.toLowerCase()}`}>
                        {bWinner === 'Tie' ? 'Tie' : `${bWinner}`}
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {history.length > 0 && (
          <button className="btn-clear" onClick={handleClearHistory}>
            <svg className="w-3.5 h-3.5 inline mr-1" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
            Clear History
          </button>
        )}
      </aside>

      {/* Main Content Area */}
      <section className="main-content">
        <header className="main-header">
          <div className="arena-heading">
            <span>AI Battle Arena</span>
            <h1>Compare model answers side by side</h1>
          </div>
        </header>

        {/* Scrollable Workspace */}
        <div className="main-workspace">
          {/* Battle comparison output */}
          {!loading && currentBattle && (
            <div className="battle-container">
              <div className="battle-prompt-display">
                <svg className="prompt-icon w-5 h-5" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <div>
                  <strong style={{ display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>Prompt</strong>
                  <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>{currentBattle.prompt}</span>
                </div>
              </div>

              <section className="results">
                {/* Mistral Card */}
                <article className={winner === 'Mistral' ? 'winner-card' : ''}>
                  {winner === 'Mistral' && (
                    <div className="winner-badge">
                      👑 Winner
                    </div>
                  )}
                  {winner === 'Tie' && (
                    <div className="tie-badge">
                      🤝 Tie Match
                    </div>
                  )}
                  
                  <div className="card-header">
                    <div className="model-info">
                      <h2>Mistral AI</h2>
                      <div className="model-name-id">mistral-medium-latest</div>
                    </div>
                    <div className="card-score">
                      {score1} <span>/10</span>
                    </div>
                  </div>

                  <div className="solution-box">
                    {parseContent(currentBattle.solution_1)}
                  </div>

                  {currentBattle.judge?.solution_1_reasoning && (
                    <div className="reasoning-box">
                      <strong>
                        <svg className="w-3.5 h-3.5" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Judge Verdict
                      </strong>
                      <p>{currentBattle.judge.solution_1_reasoning}</p>
                    </div>
                  )}
                </article>

                {/* Cohere Card */}
                <article className={winner === 'Cohere' ? 'winner-card' : ''}>
                  {winner === 'Cohere' && (
                    <div className="winner-badge">
                      👑 Winner
                    </div>
                  )}
                  {winner === 'Tie' && (
                    <div className="tie-badge">
                      🤝 Tie Match
                    </div>
                  )}

                  <div className="card-header">
                    <div className="model-info">
                      <h2>Cohere</h2>
                      <div className="model-name-id">command-a-03-2025</div>
                    </div>
                    <div className="card-score">
                      {score2} <span>/10</span>
                    </div>
                  </div>

                  <div className="solution-box">
                    {parseContent(currentBattle.solution_2)}
                  </div>

                  {currentBattle.judge?.solution_2_reasoning && (
                    <div className="reasoning-box">
                      <strong>
                        <svg className="w-3.5 h-3.5" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Judge Verdict
                      </strong>
                      <p>{currentBattle.judge.solution_2_reasoning}</p>
                    </div>
                  )}
                </article>
              </section>

              <footer className="judge-footer">
                <svg className="w-4 h-4" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.952 11.952 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span>Evaluated by <strong>Gemini 2.5 Flash (gemini-2.5-flash)</strong> via LangGraph judgeNode pipeline.</span>
              </footer>
            </div>
          )}

          {/* Loading state with Orbit loader */}
          {loading && (
            <div className="loading-container">
              <div className="orbit-loader">
                <div className="orbit-center" />
                <div className="orbit-track inner">
                  <div className="orbit-node inner-node" />
                </div>
                <div className="orbit-track outer">
                  <div className="orbit-node outer-node" />
                </div>
              </div>
              <p>Asking Mistral and Cohere models, then submitting to Gemini 2.5 Flash for evaluation...</p>
            </div>
          )}

          {/* Welcome Screen */}
          {!loading && !currentBattle && (
            <div className="welcome-container">
              <div className="welcome-icon">⚔️</div>
              <h3>Enter a prompt below to start a model battle!</h3>
              <p>Or select one of the common coding / logical comparison scenarios below to test the models immediately.</p>
              
              <div className="welcome-examples">
                <button 
                  className="welcome-example-btn" 
                  onClick={() => handleExampleClick("Compare Python and JavaScript in 2 bullet points.")}
                >
                  <span>Compare Python and JavaScript</span>
                  <svg className="w-4 h-4" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </button>
                <button 
                  className="welcome-example-btn" 
                  onClick={() => handleExampleClick("Write a quicksort function in Python with O(n log n) explanation.")}
                >
                  <span>Quicksort algorithm in Python</span>
                  <svg className="w-4 h-4" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </button>
                <button 
                  className="welcome-example-btn" 
                  onClick={() => handleExampleClick("Explain the difference between SQL and NoSQL databases in simple terms.")}
                >
                  <span>SQL vs NoSQL Databases</span>
                  <svg className="w-4 h-4" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Sticky Bottom Form Wrapper */}
        <div className="prompt-container-sticky">
          {error && <p className="error-message">{error}</p>}
          <form className="prompt-form" onSubmit={handleSubmit}>
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask a problem for the models to solve..."
              disabled={loading}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
            <div className="prompt-form-actions">
              <span className="prompt-char-count">{input.length} characters</span>
              <button className="btn-submit-battle" type="submit" disabled={loading || !input.trim()}>
                {loading ? 'Running...' : (
                  <>
                    <svg className="w-4 h-4" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <line x1="22" y1="2" x2="11" y2="13" />
                      <polygon points="22 2 15 22 11 13 2 9 22 2" />
                    </svg>
                    <span>Start battle</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </section>
    </main>
  )
}

export default App
