import { useCallback, useEffect, useState } from 'react'
import { checkGraphqlConnection } from './api/client'
import './App.css'

const STATUS = {
  checking: { label: 'Checking…', tone: 'pending' },
  online: { label: 'Connected', tone: 'ok' },
  offline: { label: 'Unreachable', tone: 'error' },
}

function App() {
  const [status, setStatus] = useState('checking')
  const [detail, setDetail] = useState('')

  // Every state update here lands after the await, so the initial probe does
  // not re-render synchronously from inside the effect below.
  const probeBackend = useCallback(async () => {
    try {
      const queryTypeName = await checkGraphqlConnection()
      setStatus('online')
      setDetail(`GraphQL root query type: ${queryTypeName}`)
    } catch (error) {
      setStatus('offline')
      setDetail(error.message)
    }
  }, [])

  const recheckBackend = useCallback(() => {
    setStatus('checking')
    setDetail('')
    probeBackend()
  }, [probeBackend])

  useEffect(() => {
    // Probing the backend is exactly the "synchronizing with an external
    // system" case the rule carves out, and every setState it does is awaited.
    // oxlint-disable-next-line react/set-state-in-effect
    probeBackend()
  }, [probeBackend])

  const { label, tone } = STATUS[status]

  return (
    <main className="shell">
      <header className="shell__header">
        <p className="eyebrow">AiSandbox</p>
        <h1 data-testid="app-title">SandboxSpaApp</h1>
        <p className="lede">
          React + Vite single page app, served by the SandboxApi Strapi backend
          from <code>public/app</code>.
        </p>
      </header>

      <section className="card" aria-labelledby="backend-heading">
        <h2 id="backend-heading">Backend</h2>
        <p className="status-row">
          <span
            className={`badge badge--${tone}`}
            data-testid="backend-status"
            data-status={status}
          >
            {label}
          </span>
          <button type="button" onClick={recheckBackend} data-testid="retry-backend">
            Re-check
          </button>
        </p>
        {detail ? (
          <p className="detail" data-testid="backend-detail">
            {detail}
          </p>
        ) : null}
      </section>

      <section className="card" aria-labelledby="links-heading">
        <h2 id="links-heading">Handy links</h2>
        <ul className="links">
          <li>
            <a href="/admin">Strapi admin</a>
          </li>
          <li>
            <a href="/graphql">GraphQL endpoint</a>
          </li>
          <li>
            <a href="/api">REST root</a>
          </li>
        </ul>
      </section>
    </main>
  )
}

export default App
