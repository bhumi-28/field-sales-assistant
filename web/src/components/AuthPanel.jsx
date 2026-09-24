function AuthPanel({ variant = 'login' }) {
  const isRegister = variant === 'register';

  return (
    <div className="fsa-auth-visual">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700&display=swap');

        :root {
          --fsa-ink: #0a0c11;
          --fsa-panel: #10131a;
          --fsa-panel-raised: #161a23;
          --fsa-line: #242836;
          --fsa-fog: #838a9a;
          --fsa-paper: #e8eaee;
          --fsa-teal: #d6304f;
          --fsa-amber: #e0a63f;
          --fsa-coral: #e2635f;
          --fsa-display: 'Space Grotesk', 'Segoe UI', sans-serif;
          --fsa-body: 'Inter', 'Segoe UI', sans-serif;
        }

        .fsa-auth-shell {
          min-height: 100vh;
          display: grid;
          grid-template-columns: 1fr;
          background: var(--fsa-ink);
          font-family: var(--fsa-body);
          position: relative;
          overflow: hidden;
        }
        @media (min-width: 960px) {
          .fsa-auth-shell { grid-template-columns: 1.15fr 1fr; }
        }

        .fsa-auth-shell::before {
          content: "";
          position: absolute;
          inset: 0;
          z-index: 0;
          pointer-events: none;
          background:
            radial-gradient(560px circle at 85% 20%, rgba(214, 48, 79, 0.22), transparent 60%),
            radial-gradient(460px circle at 95% 85%, rgba(224, 166, 63, 0.14), transparent 62%),
            radial-gradient(600px circle at 60% 105%, rgba(214, 48, 79, 0.10), transparent 65%);
          animation: fsaAuthDrift 20s ease-in-out infinite alternate;
        }

        @keyframes fsaAuthDrift {
          0% { transform: translate(0, 0) scale(1); }
          100% { transform: translate(-28px, 20px) scale(1.06); }
        }

        .fsa-auth-visual {
          position: relative;
          z-index: 1;
          background: var(--fsa-panel);
          border-bottom: 1px solid var(--fsa-line);
          padding: 32px 28px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          gap: 28px;
        }
        @media (min-width: 960px) {
          .fsa-auth-visual {
            border-bottom: none;
            border-right: 1px solid var(--fsa-line);
            padding: 56px 60px;
          }
        }

        .fsa-auth-graphic { display: none; }
        @media (min-width: 960px) {
          .fsa-auth-graphic { display: block; }
        }

        .fsa-auth-form-side {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 24px 56px;
        }
        @media (min-width: 960px) {
          .fsa-auth-form-side { padding: 56px; }
        }

        .fsa-auth-form-inner { width: 100%; max-width: 380px; }

        .fsa-mark { display: flex; align-items: center; gap: 10px; }

        .fsa-headline {
          font-family: var(--fsa-display);
          font-weight: 600;
          font-size: clamp(26px, 3.4vw, 34px);
          line-height: 1.18;
          letter-spacing: -0.01em;
          color: var(--fsa-paper);
          margin: 0;
          max-width: 15ch;
        }

        .fsa-subhead {
          font-size: 15px;
          line-height: 1.55;
          color: var(--fsa-fog);
          margin: 12px 0 0;
          max-width: 34ch;
        }

        .fsa-flow { display: flex; flex-direction: column; }
        .fsa-flow-step { display: flex; gap: 12px; }
        .fsa-flow-node { display: flex; flex-direction: column; align-items: center; }
        .fsa-flow-dot { width: 8px; height: 8px; border-radius: 50%; margin-top: 4px; flex-shrink: 0; }
        .fsa-flow-line { width: 1px; flex: 1; background: var(--fsa-line); margin: 4px 0; }
        .fsa-flow-text { padding-bottom: 18px; }
        .fsa-flow-step:last-child .fsa-flow-text { padding-bottom: 0; }
        .fsa-flow-label { font-size: 13.5px; color: var(--fsa-paper); font-weight: 500; }
        .fsa-flow-sub { font-size: 12.5px; color: var(--fsa-fog); margin-top: 2px; }

        .fsa-insight-card {
          background: var(--fsa-panel-raised);
          border: 1px solid var(--fsa-line);
          border-radius: 10px;
          padding: 16px 18px;
          animation: fsaCardIn 0.6s ease-out;
        }
        @media (prefers-reduced-motion: reduce) {
          .fsa-insight-card { animation: none; }
        }
        @keyframes fsaCardIn {
          from { opacity: 0; transform: translateY(6px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .fsa-insight-note { font-size: 12.5px; color: var(--fsa-fog); margin-bottom: 10px; line-height: 1.5; }
        .fsa-insight-row {
          display: flex; align-items: center; justify-content: space-between;
          padding: 7px 0;
        }
        .fsa-insight-row + .fsa-insight-row { border-top: 1px solid var(--fsa-line); }
        .fsa-insight-label { font-size: 12.5px; color: var(--fsa-fog); }
        .fsa-insight-value { display: flex; align-items: center; gap: 6px; font-size: 13px; color: var(--fsa-paper); font-weight: 500; }
        .fsa-insight-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }

        .fsa-role-cards { display: flex; flex-direction: column; gap: 12px; }
        .fsa-role-card { background: var(--fsa-panel-raised); border: 1px solid var(--fsa-line); border-radius: 10px; padding: 16px 18px; }
        .fsa-role-title { font-size: 13.5px; font-weight: 600; color: var(--fsa-paper); }
        .fsa-role-desc { font-size: 12.5px; color: var(--fsa-fog); margin-top: 4px; line-height: 1.5; }

        .fsa-label { display: block; font-size: 13px; color: var(--fsa-fog); margin-bottom: 7px; font-weight: 500; }

        .fsa-input {
          width: 100%;
          padding: 11px 13px;
          background: var(--fsa-panel-raised);
          border: 1px solid var(--fsa-line);
          border-radius: 8px;
          color: var(--fsa-paper);
          font-family: var(--fsa-body);
          font-size: 14.5px;
          box-sizing: border-box;
          outline: none;
          transition: border-color 0.15s ease;
        }
        .fsa-input::placeholder { color: #565c6b; }
        .fsa-input:hover { border-color: #33384a; }
        .fsa-input:focus { border-color: var(--fsa-teal); }

        .fsa-toggle { display: flex; background: var(--fsa-panel-raised); border: 1px solid var(--fsa-line); border-radius: 8px; padding: 3px; gap: 3px; }
        .fsa-toggle-btn {
          flex: 1; padding: 8px 0; background: transparent; border: none; border-radius: 6px;
          font-family: var(--fsa-body); font-size: 13.5px; font-weight: 500; color: var(--fsa-fog);
          cursor: pointer; transition: background 0.15s ease, color 0.15s ease;
        }
        .fsa-toggle-btn[aria-pressed="true"] { background: var(--fsa-teal); color: #ffffff; }

        .fsa-btn-primary {
          width: 100%; padding: 12px 0; background: var(--fsa-teal); color: #ffffff; border: none;
          border-radius: 8px; font-family: var(--fsa-body); font-size: 14.5px; font-weight: 600;
          cursor: pointer; transition: opacity 0.15s ease;
        }
        .fsa-btn-primary:hover:not(:disabled) { opacity: 0.9; }
        .fsa-btn-primary:disabled { background: var(--fsa-line); color: var(--fsa-fog); cursor: not-allowed; }

        .fsa-link {
          color: var(--fsa-teal); cursor: pointer; font-weight: 600; background: none; border: none;
          padding: 0; font-family: var(--fsa-body); font-size: inherit;
        }

        .fsa-banner { margin-top: 14px; padding: 10px 13px; border-radius: 8px; font-size: 13px; line-height: 1.4; }
        .fsa-banner-error { background: rgba(226,99,95,0.12); color: var(--fsa-coral); }
        .fsa-banner-success { background: rgba(214,48,79,0.12); color: var(--fsa-teal); }

        .fsa-input:focus-visible, .fsa-btn-primary:focus-visible, .fsa-toggle-btn:focus-visible, .fsa-link:focus-visible {
          outline: 2px solid var(--fsa-teal);
          outline-offset: 2px;
        }
      `}</style>

      <div className="fsa-mark">
        <svg width="26" height="26" viewBox="0 0 28 28" fill="none" aria-hidden="true">
          <rect width="28" height="28" rx="7" fill="#3a151b" />
          <rect x="7" y="15" width="3.2" height="6" rx="1" fill="#d6304f" />
          <rect x="12.4" y="11" width="3.2" height="10" rx="1" fill="#d6304f" />
          <rect x="17.8" y="7" width="3.2" height="14" rx="1" fill="#d6304f" />
        </svg>
        <span style={{ fontFamily: 'var(--fsa-display)', fontWeight: 600, fontSize: 15, color: 'var(--fsa-paper)' }}>
          Field Sales Assistant
        </span>
      </div>

      <div>
        <h1 className="fsa-headline">
          {isRegister ? "Set up your team's workspace." : 'Every visit becomes a lead worth acting on.'}
        </h1>
        <p className="fsa-subhead">
          {isRegister
            ? 'Admins manage the pipeline. Reps work the field. Pick a role to get started.'
            : 'Log the conversation, and the AI agent tells you what to do next.'}
        </p>
      </div>

      <div className="fsa-auth-graphic">
        {isRegister ? (
          <div className="fsa-role-cards">
            <div className="fsa-role-card">
              <div className="fsa-role-title">Admin</div>
              <div className="fsa-role-desc">Manages customers and reps, and sees every visit and AI insight across the team.</div>
            </div>
            <div className="fsa-role-card">
              <div className="fsa-role-title">Sales Rep</div>
              <div className="fsa-role-desc">Logs visits from the field and gets an AI recommendation right after each one.</div>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div className="fsa-flow">
              <div className="fsa-flow-step">
                <div className="fsa-flow-node">
                  <span className="fsa-flow-dot" style={{ background: 'var(--fsa-teal)' }} />
                  <span className="fsa-flow-line" />
                </div>
                <div className="fsa-flow-text">
                  <div className="fsa-flow-label">Visit logged</div>
                  <div className="fsa-flow-sub">Discussion, product interest, competitor notes</div>
                </div>
              </div>
              <div className="fsa-flow-step">
                <div className="fsa-flow-node">
                  <span className="fsa-flow-dot" style={{ background: 'var(--fsa-amber)' }} />
                  <span className="fsa-flow-line" />
                </div>
                <div className="fsa-flow-text">
                  <div className="fsa-flow-label">AI insight</div>
                  <div className="fsa-flow-sub">Sentiment, opportunity, and a next step</div>
                </div>
              </div>
              <div className="fsa-flow-step">
                <div className="fsa-flow-node">
                  <span className="fsa-flow-dot" style={{ background: 'var(--fsa-coral)' }} />
                </div>
                <div className="fsa-flow-text">
                  <div className="fsa-flow-label">Follow-up task</div>
                  <div className="fsa-flow-sub">Assigned automatically, due on time</div>
                </div>
              </div>
            </div>

            <div className="fsa-insight-card">
              <div className="fsa-insight-note">"Evaluating our ERP suite, comparing rollout timeline with Competitor B."</div>
              <div className="fsa-insight-row">
                <span className="fsa-insight-label">Sentiment</span>
                <span className="fsa-insight-value">
                  <span className="fsa-insight-dot" style={{ background: 'var(--fsa-teal)' }} />
                  Positive
                </span>
              </div>
              <div className="fsa-insight-row">
                <span className="fsa-insight-label">Opportunity</span>
                <span className="fsa-insight-value">
                  <span className="fsa-insight-dot" style={{ background: 'var(--fsa-amber)' }} />
                  High
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AuthPanel;