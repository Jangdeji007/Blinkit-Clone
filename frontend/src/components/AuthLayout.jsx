export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <main className="auth-shell">
      <section className="auth-brand">
        <div className="auth-brand-content">
          <p className="auth-logo">blinkit</p>
          <p className="auth-tagline">India&apos;s last minute app</p>
          <p className="auth-brand-sub">Groceries delivered in minutes</p>
          <div className="auth-icons" aria-hidden="true">
            <span>🥛</span>
            <span>🍞</span>
            <span>🥬</span>
            <span>🍎</span>
            <span>🧃</span>
          </div>
        </div>
      </section>

      <section className="auth-panel">
        <div className="auth-card">
          <h1 className="auth-title">{title}</h1>
          {subtitle && <p className="auth-subtitle">{subtitle}</p>}
          {children}
          {footer && (
            <>
              <div className="auth-divider" />
              <div className="auth-footer">{footer}</div>
            </>
          )}
        </div>
      </section>
    </main>
  )
}
